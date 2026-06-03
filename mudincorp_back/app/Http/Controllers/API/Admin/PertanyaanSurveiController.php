<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\PertanyaanSurvei;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
/**
 * Modul 3 & 4 — Survey Bakat & Survey Minat
 * Admin/Guru BK mengelola soal-soal survei per jurusan.
 *
 * Routes:
 *   GET    /api/admin/pertanyaan-survei              ← semua soal
 *   GET    /api/admin/pertanyaan-survei?tipe=bakat   ← filter tipe
 *   GET    /api/admin/pertanyaan-survei?jurusan_id=1 ← filter jurusan
 *   POST   /api/admin/pertanyaan-survei
 *   GET    /api/admin/pertanyaan-survei/{id}
 *   PUT    /api/admin/pertanyaan-survei/{id}
 *   DELETE /api/admin/pertanyaan-survei/{id}
 *   POST   /api/admin/pertanyaan-survei/bulk-delete  ← hapus banyak sekaligus
 */
class PertanyaanSurveiController extends Controller
{
    /**
     * Daftar pertanyaan dengan filter opsional (tipe & jurusan).
     */
    public function index(Request $request)
    {
        $query = PertanyaanSurvei::with('jurusan')
            ->when($request->tipe,       fn($q) => $q->where('tipe', $request->tipe))
            ->when($request->jurusan_id, fn($q) => $q->where('jurusan_id', $request->jurusan_id))
            ->orderBy('jurusan_id')
            ->orderBy('tipe')
            ->orderBy('id');

        // Ringkasan jumlah soal per tipe & jurusan
        $summary = PertanyaanSurvei::selectRaw('tipe, jurusan_id, COUNT(*) as jumlah')
            ->with('jurusan:id,nama_jurusan')
            ->groupBy('tipe', 'jurusan_id')
            ->get();

        return response()->json([
            'data'    => $query->get(),
            'summary' => $summary,
        ]);
    }

    /**
     * Tambah soal survei baru.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jurusan_id'  => 'required|exists:jurusan,id',
            'tipe'        => 'required|in:bakat,minat',
            'pertanyaan'  => 'required|string',
            'skor_min'    => 'integer|min:1',
            'skor_max'    => 'integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Pastikan skor_max > skor_min
        if ($request->filled('skor_min') && $request->filled('skor_max')) {
            if ($request->skor_max <= $request->skor_min) {
                return response()->json([
                    'skor_max' => ['skor_max harus lebih besar dari skor_min.'],
                ], 422);
            }
        }

        $pertanyaan = PertanyaanSurvei::create([
            'jurusan_id' => $request->jurusan_id,
            'tipe'       => $request->tipe,
            'pertanyaan' => $request->pertanyaan,
            'skor_min'   => $request->skor_min ?? 1,
            'skor_max'   => $request->skor_max ?? 5,
        ]);

        return response()->json([
            'message' => 'Pertanyaan survei ' . $request->tipe . ' berhasil ditambahkan.',
            'data'    => $pertanyaan->load('jurusan'),
        ], 201);
    }

    /**
     * Detail satu pertanyaan.
     */
    public function show($id)
    {
        $pertanyaan = PertanyaanSurvei::with('jurusan')->find($id);
        if (!$pertanyaan) {
            return response()->json(['message' => 'Pertanyaan tidak ditemukan.'], 404);
        }
        return response()->json($pertanyaan);
    }

    /**
     * Update pertanyaan.
     */
    public function update(Request $request, $id)
    {
        $pertanyaan = PertanyaanSurvei::find($id);
        if (!$pertanyaan) {
            return response()->json(['message' => 'Pertanyaan tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'jurusan_id' => 'required|exists:jurusan,id',
            'tipe'       => 'required|in:bakat,minat',
            'pertanyaan' => 'required|string',
            'skor_min'   => 'integer|min:1',
            'skor_max'   => 'integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $pertanyaan->update([
            'jurusan_id' => $request->jurusan_id,
            'tipe'       => $request->tipe,
            'pertanyaan' => $request->pertanyaan,
            'skor_min'   => $request->skor_min ?? $pertanyaan->skor_min,
            'skor_max'   => $request->skor_max ?? $pertanyaan->skor_max,
        ]);

        return response()->json([
            'message' => 'Pertanyaan berhasil diperbarui.',
            'data'    => $pertanyaan->load('jurusan'),
        ]);
    }

    /**
     * Hapus satu pertanyaan.
     * Ditolak jika sudah ada jawaban siswa yang mengacu ke soal ini.
     */
    public function destroy($id)
    {
        $pertanyaan = PertanyaanSurvei::find($id);
        if (!$pertanyaan) {
            return response()->json(['message' => 'Pertanyaan tidak ditemukan.'], 404);
        }

        $adaJawaban =DB::table('jawaban_survei')
            ->where('pertanyaan_id', $id)
            ->exists();

        if ($adaJawaban) {
            return response()->json([
                'message' => 'Pertanyaan tidak bisa dihapus karena sudah ada siswa yang menjawab.',
            ], 409);
        }

        $pertanyaan->delete();
        return response()->json(['message' => 'Pertanyaan berhasil dihapus.']);
    }

    /**
     * Hapus banyak pertanyaan sekaligus (yang belum ada jawabannya).
     * Body: { "ids": [1, 2, 3] }
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids'   => 'required|array',
            'ids.*' => 'required|integer|exists:pertanyaan_survei,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Filter: hanya hapus yang belum ada jawabannya
        $sudahDijawab = DB::table('jawaban_survei')
            ->whereIn('pertanyaan_id', $request->ids)
            ->pluck('pertanyaan_id')
            ->unique()
            ->toArray();

        $bisaHapus = array_diff($request->ids, $sudahDijawab);

        if (!empty($bisaHapus)) {
            PertanyaanSurvei::whereIn('id', $bisaHapus)->delete();
        }

        return response()->json([
            'message'          => count($bisaHapus) . ' pertanyaan berhasil dihapus.',
            'dihapus'          => count($bisaHapus),
            'dilewati'         => count($sudahDijawab),
            'dilewati_ids'     => $sudahDijawab,
        ]);
    }
}