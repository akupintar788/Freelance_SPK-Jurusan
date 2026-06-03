<?php

namespace App\Http\Controllers\API\Siswa;

use App\Http\Controllers\Controller;
use App\Models\JawabanSurvei;
use App\Models\PertanyaanSurvei;
use App\Services\SawService; // ✅ FIX: Pastikan penulisan nama class konsisten (SawService)
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
        $query = PertanyaanSurvei::with(['jurusan'])
            ->when($request->tipe, fn($q) => $q->where('tipe', $request->tipe))
            ->orderBy('jurusan_id')
            ->orderBy('id');

        return response()->json([
            'data' => $query->get()
        ]);
    }

    /**
     * Simpan jawaban survei dari siswa.
     */
    public function store(Request $request)
    {
        // 1. Validasi request dari React
        $validator = Validator::make($request->all(), [
            'jawaban' => 'required|array',
            'jawaban.*.pertanyaan_id' => 'required|exists:pertanyaan_survei,id',
            'jawaban.*.skor' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Ambil data siswa berdasarkan user yang sedang login (Auth Sanctum)
        $siswa = DB::table('siswa')->where('user_id', $request->user()->id)->first();

        if (!$siswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data profil siswa tidak ditemukan untuk akun ini.'
            ], 404);
        }

        try {
            // 3. Simpan seluruh jawaban survei ke database
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

            // =================================================================
            // 🚀 JALAN KELUAR UTAMA: Hitung Rekomendasi SAW dengan ID Siswa Nyata
            // =================================================================
            // Memastikan nilai ID dilempar sebagai integer murni, bukan null
            $siswaId = (int) $siswa->id;
            
            // Instansiasi objek secara manual menggunakan penulisan class yang benar
            $sawService = new SawService($siswaId);
            
            // Eksekusi kalkulasi algoritma SPK SAW
            $sawService->hitungRekomendasi();

            return response()->json([
                'status' => 'success',
                'message' => 'Survei berhasil disimpan dan rekomendasi jurusan telah diperbarui!'
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
        // Ambil data lewat query builder agar konsisten dengan store()
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
            ->groupBy(fn (JawabanSurvei $jawaban) => strtolower(trim((string)($jawaban->pertanyaanSurvei?->tipe ?? ''))))
            ->map
            ->count();

        return [
            'bakat' => $summary->get('bakat', 0),
            'minat' => $summary->get('minat', 0),
        ];
    }
}