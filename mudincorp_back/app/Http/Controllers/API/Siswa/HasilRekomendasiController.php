<?php

namespace App\Http\Controllers\API\Siswa;

use App\Http\Controllers\Controller;
use App\Services\SawService; // ✅ FIX: Pastikan S kecil, S besar sesuai nama file sawService.js / SawService.php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Modul 8 — Hasil & Rekomendasi
 * Output rekomendasi jurusan untuk siswa yang sedang login.
 */
class HasilRekomendasiController extends Controller
{
    // ─── SISWA ──────────────────────────────────────────────────────────────

    /**
     * Cek apakah semua data siswa sudah lengkap sebelum bisa hitung SAW.
     */
    public function kesiapanData()
    {
        /** @var \App\Models\User $user */
        $user  = Auth::user();
        $siswa = $user->siswa;

        if (!$siswa) {
            return response()->json(['message' => 'Data siswa tidak ditemukan.'], 404);
        }

        // ✅ FIX: Hubungkan jawaban_survei ke pertanyaan_survei untuk memfilter tipe (bakat/minat) sesuai gambar database phpMyAdmin Anda
        $surveiBakat = DB::table('jawaban_survei')
            ->join('pertanyaan_survei', 'jawaban_survei.pertanyaan_id', '=', 'pertanyaan_survei.id')
            ->where('jawaban_survei.siswa_id', $siswa->id)
            ->where('pertanyaan_survei.tipe', 'bakat')
            ->exists();

        $surveiMinat = DB::table('jawaban_survei')
            ->join('pertanyaan_survei', 'jawaban_survei.pertanyaan_id', '=', 'pertanyaan_survei.id')
            ->where('jawaban_survei.siswa_id', $siswa->id)
            ->where('pertanyaan_survei.tipe', 'minat')
            ->exists();

        $punyaNilai = DB::table('nilai_rapor')
            ->where('siswa_id', $siswa->id)->exists();

        $bobotValid = abs(
            DB::table('kriteria')->where('is_active', true)->sum('bobot') - 1.0
        ) < 0.0001;

        $siap = $surveiBakat && $surveiMinat && $punyaNilai && $bobotValid;

        return response()->json([
            'siap'          => $siap,
            'survei_bakat'  => $surveiBakat,
            'survei_minat'  => $surveiMinat,
            'nilai_rapor'   => $punyaNilai,
            'bobot_valid'   => $bobotValid,
            'pesan'         => $siap
                ? 'Semua data lengkap. Kamu bisa menghitung rekomendasi jurusan.'
                : 'Data belum lengkap. Lengkapi survei bakat, minat, dan nilai rapor terlebih dahulu.',
        ]);
    }

    /**
     * Siswa meminta kalkulasi SAW untuk dirinya sendiri.
     */
    public function hitungSendiri()
    {
        /** @var \App\Models\User $user */
        $user  = Auth::user();
        $siswa = $user->siswa;

        if (!$siswa) {
            return response()->json(['message' => 'Data siswa tidak ditemukan.'], 404);
        }

        return $this->jalankanSAW((int) $siswa->id);
    }

    /**
     * Siswa melihat hasil rekomendasi milik dirinya sendiri.
     */
    public function lihatHasilSendiri()
    {
        /** @var \App\Models\User $user */
        $user  = Auth::user();
        $siswa = $user->siswa;

        if (!$siswa) {
            return response()->json(['message' => 'Data siswa tidak ditemukan.'], 404);
        }

        return $this->ambilHasil((int) $siswa->id);
    }

    // ─── GURU BK ────────────────────────────────────────────────────────────

    /**
     * Guru BK melihat hasil rekomendasi siswa tertentu.
     */
    public function lihatHasilSiswa($siswa_id)
    {
        $siswa = DB::table('siswa')->where('id', $siswa_id)->first();
        if (!$siswa) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        return $this->ambilHasil((int) $siswa_id);
    }

    /**
     * Guru BK men-trigger kalkulasi SAW untuk siswa tertentu.
     */
    public function hitungUntukSiswa($siswa_id)
    {
        $siswa = DB::table('siswa')->where('id', $siswa_id)->first();
        if (!$siswa) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        return $this->jalankanSAW((int) $siswa_id);
    }

    // ─── Private Helpers ────────────────────────────────────────────────────

    private function jalankanSAW(int $siswaId)
    {
        try {
            // ✅ FIX: Instansiasi manual dengan melempar ID siswa murni ke constructor SawService
            $saw = new SawService($siswaId);
            $saw->hitungRekomendasi();

            return response()->json([
                'status'  => 'success',
                'message' => 'Rekomendasi jurusan berhasil dikalkulasi.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal memproses SAW: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function ambilHasil(int $siswaId)
    {
        $hasil = DB::table('hasil_saw')
            ->join('siswa', 'hasil_saw.siswa_id', '=', 'siswa.id')
            ->join('jurusan', 'hasil_saw.jurusan_rekomendasi_id', '=', 'jurusan.id')
            ->leftJoin('fakultas', 'jurusan.fakultas_id', '=', 'fakultas.id')
            ->select(
                'hasil_saw.*',
                'siswa.nama as nama_siswa',
                'siswa.kelas',
                'jurusan.nama_jurusan as jurusan_rekomendasi',
                'jurusan.kode_jurusan',
                'jurusan.deskripsi as deskripsi_jurusan',
                'fakultas.nama_fakultas'
            )
            ->where('hasil_saw.siswa_id', $siswaId)
            ->first();

        // ✅ FIX: Kembalikan status 'belum_dihitung' dengan status code 200 agar ditangkap dengan mulus oleh handler baru di React (getHasilRekomendasi)
        if (!$hasil) {
            return response()->json([
                'status'  => 'belum_dihitung',
                'message' => 'Rekomendasi belum dihitung. Lengkapi data dan jalankan kalkulasi.',
            ], 200);
        }

        // Semua pilihan jurusan diurutkan berdasarkan ranking
        $detailRanking = DB::table('detail_hasil_saw')
            ->join('jurusan', 'detail_hasil_saw.jurusan_id', '=', 'jurusan.id')
            ->leftJoin('fakultas', 'jurusan.fakultas_id', '=', 'fakultas.id')
            ->select(
                'detail_hasil_saw.ranking',
                'detail_hasil_saw.skor_akhir',
                'jurusan.nama_jurusan',
                'jurusan.kode_jurusan',
                'jurusan.deskripsi',
                'fakultas.nama_fakultas'
            )
            ->where('detail_hasil_saw.hasil_saw_id', $hasil->id)
            ->orderBy('ranking')
            ->get();

        // Matriks normalisasi untuk transparansi perhitungan
        $matriks = DB::table('matriks_normalisasi')
            ->join('kriteria', 'matriks_normalisasi.kriteria_id', '=', 'kriteria.id')
            ->join('jurusan', 'matriks_normalisasi.jurusan_id', '=', 'jurusan.id')
            ->select(
                'jurusan.nama_jurusan',
                'kriteria.kode as kode_kriteria',
                'kriteria.nama as nama_kriteria',
                'kriteria.bobot',
                'kriteria.tipe as tipe_kriteria',
                DB::raw('ROUND(matriks_normalisasi.nilai_normalisasi, 4) as nilai_normalisasi'),
                DB::raw('ROUND(matriks_normalisasi.nilai_terbobot, 4) as nilai_terbobot')
            )
            ->where('matriks_normalisasi.siswa_id', $siswaId)
            ->orderBy('jurusan.nama_jurusan')
            ->orderBy('kriteria.urutan')
            ->get();
// Matriks normalisasi untuk transparansi perhitungan
        $matriks = DB::table('matriks_normalisasi')
            ->join('kriteria', 'matriks_normalisasi.kriteria_id', '=', 'kriteria.id')
            ->join('jurusan', 'matriks_normalisasi.jurusan_id', '=', 'jurusan.id')
            ->select(
                'jurusan.nama_jurusan',
                'kriteria.kode as kode_kriteria',
                'kriteria.nama as nama_kriteria',
                'kriteria.bobot',
                'kriteria.tipe as tipe_kriteria',
                DB::raw('ROUND(matriks_normalisasi.nilai_normalisasi, 4) as nilai_normalisasi'),
                DB::raw('ROUND(matriks_normalisasi.nilai_terbobot, 4) as nilai_terbobot')
            )
            ->where('matriks_normalisasi.siswa_id', $siswaId)
            ->orderBy('jurusan.nama_jurusan')
            ->orderBy('kriteria.urutan')
            ->get();

        // ✅ TAMBAHAN: Matriks Keputusan (Nilai Mentah) agar siswa tahu nilai aslinya
        $matriksKeputusan = DB::table('matriks_keputusan')
            ->join('kriteria', 'matriks_keputusan.kriteria_id', '=', 'kriteria.id')
            ->join('jurusan', 'matriks_keputusan.jurusan_id', '=', 'jurusan.id')
            ->select(
                'jurusan.nama_jurusan',
                'kriteria.kode as kode_kriteria',
                'kriteria.nama as nama_kriteria',
                'matriks_keputusan.nilai as nilai_mentah'
            )
            ->where('matriks_keputusan.siswa_id', $siswaId)
            ->orderBy('jurusan.nama_jurusan')
            ->orderBy('kriteria.urutan')
            ->get();

        return response()->json([
            'rekomendasi_utama'   => $hasil,
            'semua_ranking'       => $detailRanking,
            'matriks_keputusan'   => $matriksKeputusan->groupBy('nama_jurusan'), // Masuk ke response
            'matriks_perhitungan' => $matriks->groupBy('nama_jurusan'),
        ], 200);
        return response()->json([
            'rekomendasi_utama'  => $hasil,
            'semua_ranking'      => $detailRanking,
            'matriks_perhitungan'=> $matriks->groupBy('nama_jurusan'),
        ], 200);
    }
}