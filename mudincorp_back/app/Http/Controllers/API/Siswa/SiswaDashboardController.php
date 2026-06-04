<?php

namespace App\Http\Controllers\API\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class SiswaDashboardController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil data user token yang sedang login
        $user = $request->user();

        // 2. Cari data profile siswa yang berelasi dengan user_id ini
        $siswa = DB::table('siswa')->where('user_id', $user->id)->first();

        // Antisipasi jika data profile siswa belum dibuat di database
        if (!$siswa) {
            return response()->json([
                'progress' => [
                    'persentase'         => 0,
                    'has_nilai_rapor'    => false,
                    'has_survei'         => false,
                    'has_hasil'          => false,
                    'rata_rata'          => 0.00,
                    'nilai_rapor_count'  => 0,
                    'jurusan_utama'      => 'Profil Belum Lengkap'
                ]
            ]);
        }

        // 3. Cek Kelengkapan Nilai Rapor
        $nilaiRaporCount = DB::table('nilai_rapor')->where('siswa_id', $siswa->id)->count();
        $hasNilaiRapor   = $nilaiRaporCount > 0;
        
        // Hitung rata-rata nilai rapor siswa
        $rataRata = $hasNilaiRapor 
            ? (float) DB::table('nilai_rapor')->where('siswa_id', $siswa->id)->avg('nilai') 
            : 0.00;

        // 4. Cek Kelengkapan Survei (Harus sudah isi Bakat DAN Minat)
        $hasBakat = DB::table('skor_survei')->where('siswa_id', $siswa->id)->where('tipe', 'bakat')->exists();
        $hasMinat = DB::table('skor_survei')->where('siswa_id', $siswa->id)->where('tipe', 'minat')->exists();
        $hasSurvei = $hasBakat && $hasMinat;

        // 5. Cek Apakah Hasil Rekomendasi SAW Sudah Dihitung oleh BK/Sistem
        $hasilSaw = DB::table('hasil_saw')
            ->join('jurusan', 'hasil_saw.jurusan_rekomendasi_id', '=', 'jurusan.id')
            ->where('hasil_saw.siswa_id', $siswa->id)
            ->select('jurusan.nama_jurusan')
            ->first();

        $hasHasil = !is_null($hasilSaw);
        $jurusanUtama = $hasHasil ? $hasilSaw->nama_jurusan : 'Belum Tersedia';

        // 6. Hitung Persentase Progress Kelengkapan (Ada 3 Tahap)
        $tahapSelesai = 0;
        if ($hasNilaiRapor) $tahapSelesai++;
        if ($hasSurvei)     $tahapSelesai++;
        if ($hasHasil)      $tahapSelesai++;

        // Konversi ke persentase (0%, 33%, 66%, atau 100%)
        $persentase = round(($tahapSelesai / 3) * 100);

        // 7. Kembalikan response sesuai struktur objek yang diminta React frontend
        return response()->json([
            'progress' => [
                'persentase'         => $persentase,
                'has_nilai_rapor'    => $hasNilaiRapor,
                'has_survei'         => $hasSurvei,
                'has_hasil'          => $hasHasil,
                'rata_rata'          => $rataRata,
                'nilai_rapor_count'  => $nilaiRaporCount,
                'jurusan_utama'      => $jurusanUtama
            ]
        ]);
    }
}