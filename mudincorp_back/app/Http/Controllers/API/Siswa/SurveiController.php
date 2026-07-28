<?php

namespace App\Http\Controllers\API\Siswa;

use App\Http\Controllers\Controller;
use App\Models\JawabanSurvei;
use App\Models\PertanyaanSurvei;
use App\Services\SawService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SurveiController extends Controller
{
    /**
     * Tampilkan soal survei dengan filter tipe (bakat/minat) untuk siswa.
     */
    public function index(Request $request)
    {
        $siswa = DB::table('siswa')
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan.'
            ], 404);
        }

        $punyaNilaiRapor = DB::table('nilai_rapor')
            ->where('siswa_id', $siswa->id)
            ->exists();

        if (!$punyaNilaiRapor) {
            return response()->json([
                'success' => false,
                'message' => 'Nilai rapor Anda belum diinput oleh Admin/Guru BK. Silakan lapor terlebih dahulu.'
            ], 403);
        }

        $query = PertanyaanSurvei::with(['jurusan'])
            ->when($request->tipe, fn($q) => $q->where('tipe', $request->tipe))
            ->orderBy('jurusan_id')
            ->orderBy('id');

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    /**
     * Simpan jawaban survei dari siswa.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tipe' => 'nullable|string|in:bakat,minat',
            'jawaban' => 'required|array',
            'jawaban.*.pertanyaan_id' => 'required|exists:pertanyaan_survei,id',
            'jawaban.*.skor' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $siswa = DB::table('siswa')->where('user_id', $request->user()->id)->first();

        if (!$siswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data profil siswa tidak ditemukan untuk akun ini.'
            ], 404);
        }

        $punyaNilaiRapor = DB::table('nilai_rapor')
            ->where('siswa_id', $siswa->id)
            ->exists();

        if (!$punyaNilaiRapor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nilai rapor Anda belum diinput oleh Admin/Guru BK. Silakan lapor terlebih dahulu.'
            ], 403);
        }

        try {
            DB::transaction(function () use ($request, $siswa) {
                foreach ($request->jawaban as $jawab) {
                    JawabanSurvei::updateOrCreate(
                        [
                            'siswa_id' => $siswa->id,
                            'pertanyaan_id' => $jawab['pertanyaan_id'],
                        ],
                        [
                            'skor' => $jawab['skor'],
                        ]
                    );
                }
            });

            $siswaId = (int) $siswa->id;
            $hasBakat = DB::table('jawaban_survei')
                ->join('pertanyaan_survei', 'jawaban_survei.pertanyaan_id', '=', 'pertanyaan_survei.id')
                ->where('jawaban_survei.siswa_id', $siswaId)
                ->where('pertanyaan_survei.tipe', 'bakat')
                ->exists();

            $hasMinat = DB::table('jawaban_survei')
                ->join('pertanyaan_survei', 'jawaban_survei.pertanyaan_id', '=', 'pertanyaan_survei.id')
                ->where('jawaban_survei.siswa_id', $siswaId)
                ->where('pertanyaan_survei.tipe', 'minat')
                ->exists();

            if ($hasBakat && $hasMinat) {
                $sawService = new SawService($siswaId);
                $sawService->hitungRekomendasi();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Survei bakat dan minat berhasil disimpan serta rekomendasi jurusan telah diperbarui.'
                ], 201);
            }

            $tipe = $request->input('tipe');
            $message = $tipe === 'bakat'
                ? 'Survei bakat berhasil disimpan. Lanjutkan survei minat untuk melihat hasil rekomendasi.'
                : 'Survei berhasil disimpan. Lanjutkan bagian survei lainnya untuk melihat hasil rekomendasi.';

            return response()->json([
                'status' => 'success',
                'message' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cek status survei: apakah siswa sudah mengisi atau belum.
     */
    public function status(Request $request)
    {
        $siswa = DB::table('siswa')->where('user_id', $request->user()->id)->first();

        if (!$siswa) {
            return response()->json([
                'filled' => false,
                'count' => 0,
                'bakat_count' => 0,
                'minat_count' => 0,
                'filled_bakat' => false,
                'filled_minat' => false,
            ]);
        }

        $count = JawabanSurvei::where('siswa_id', $siswa->id)->count();
        $summary = $this->countAnswersByTipe((int)$siswa->id);

        return response()->json([
            'filled' => $count > 0,
            'count' => $count,
            'bakat_count' => $summary['bakat'],
            'minat_count' => $summary['minat'],
            'filled_bakat' => $summary['bakat'] > 0,
            'filled_minat' => $summary['minat'] > 0,
        ]);
    }

    /**
     * Helper internal menghitung jumlah jawaban berdasarkan tipe kriteria
     */
    private function countAnswersByTipe(int $siswaId): array
    {
        $summary = JawabanSurvei::with('pertanyaanSurvei')
            ->where('siswa_id', $siswaId)
            ->get()
            ->groupBy(fn(JawabanSurvei $jawaban) => strtolower(trim((string)($jawaban->pertanyaanSurvei?->tipe ?? ''))))
            ->map(fn($group) => $group->count());

        return [
            'bakat' => (int) $summary->get('bakat', 0),
            'minat' => (int) $summary->get('minat', 0),
        ];
    }
}
