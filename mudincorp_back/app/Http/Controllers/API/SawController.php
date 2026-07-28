<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\SawService;
use Illuminate\Support\Facades\DB;

class SawController extends Controller
{
    /**
     * Eksekusi kalkulasi SAW untuk satu siswa.
     */
    public function hitung($siswa_id)
    {
        $siswa = DB::table('siswa')->where('id', $siswa_id)->first();
        if (!$siswa) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }
        $totalBobot = DB::table('kriteria')
        ->where('is_active', true)
        ->sum('bobot');

        if (abs($totalBobot - 1) > 0.0001) {
        return response()->json([
        'success' => false,
        'message' => "Perhitungan tidak dapat dilakukan. Total bobot saat ini {$totalBobot}. Total bobot harus tepat 1."
        ], 422);
        }
        try {
            $saw = new SawService($siswa_id);
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

    /**
     * Mengambil hasil HANYA untuk role 'siswa'
     */
    public function getAllResults()
    {
        try {
            // Join dengan tabel users untuk memastikan hanya role = 'siswa'
            $results = DB::table('siswa')
                ->join('users', 'siswa.user_id', '=', 'users.id')
                ->leftJoin('hasil_saw', 'siswa.id', '=', 'hasil_saw.siswa_id')
                ->leftJoin('jurusan', 'hasil_saw.jurusan_rekomendasi_id', '=', 'jurusan.id')
                ->where('users.role', 'siswa') // FILTER ROLE SISWA
                ->select(
                    'siswa.id as siswa_id',
                    'siswa.nama as siswa_nama',
                    'jurusan.nama_jurusan as jurusan_nama',
                    'hasil_saw.skor_tertinggi as nilai_akhir'
                )
                ->get();

            $formattedResults = $results->map(function ($item) {
                return [
                    'siswa_id'    => $item->siswa_id,
                    'siswa_nama'  => $item->siswa_nama,
                    'jurusan_nama'=> $item->jurusan_nama,
                    'nilai_akhir' => $item->nilai_akhir,
                    'ranking'     => $item->nilai_akhir ? 1 : null
                ];
            });

            return response()->json($formattedResults, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mengeksekusi perhitungan massal HANYA untuk role 'siswa'
     */
public function calculateAll()
{
    try {

        // VALIDASI TOTAL BOBOT
        $totalBobot = DB::table('kriteria')
            ->where('is_active', true)
            ->sum('bobot');

        if (abs($totalBobot - 1) > 0.0001) {
            return response()->json([
                'success' => false,
                'message' => "Perhitungan tidak dapat dilakukan. Total bobot saat ini {$totalBobot}. Total bobot harus tepat 1."
            ], 422);
        }

        // VALIDASI KRITERIA
        $jumlahKriteria = DB::table('kriteria')
            ->where('is_active', true)
            ->count();

        if ($jumlahKriteria == 0) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada kriteria aktif.'
            ], 422);
        }

        // AMBIL SISWA
        $siswas = DB::table('siswa')
            ->join('users', 'siswa.user_id', '=', 'users.id')
            ->where('users.role', 'siswa')
            ->pluck('siswa.id');

        $berhasil = 0;
        $gagal = 0;

        foreach ($siswas as $siswa_id) {

            try {

                $saw = new SawService($siswa_id);
                $saw->hitungRekomendasi();

                $berhasil++;

            } catch (\Exception $e) {

                $gagal++;

            }
        }

        return response()->json([
            'success' => true,
            'message' => "Perhitungan selesai. {$berhasil} siswa berhasil dihitung, {$gagal} gagal dihitung."
        ], 200);

    } catch (\Exception $e) {

        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan: ' . $e->getMessage()
        ], 500);

    }
}

    /**
     * Menampilkan hasil detail untuk Modal (Sudah diperbaiki dari error 500)
     */
    public function lihatHasil($siswa_id)
    {
        $hasil = DB::table('hasil_saw')
            ->join('siswa', 'hasil_saw.siswa_id', '=', 'siswa.id')
            ->join('jurusan', 'hasil_saw.jurusan_rekomendasi_id', '=', 'jurusan.id')
            ->select(
                'hasil_saw.*',
                'siswa.nama as nama_siswa',
                'jurusan.nama_jurusan as jurusan_rekomendasi',
                'jurusan.deskripsi as nama_fakultas'
            )
            ->where('hasil_saw.siswa_id', $siswa_id)
            ->first();

        if (!$hasil) {
            return response()->json([
                'status'  => 'belum_dihitung',
                'message' => 'Rekomendasi untuk siswa ini belum dihitung.',
            ], 404);
        }

        // --- MATRIKS NORMALISASI (Hapus select kode_kriteria yang bikin error) ---
        $matriksNormalisasi = DB::table('matriks_normalisasi')
            ->join('kriteria', 'matriks_normalisasi.kriteria_id', '=', 'kriteria.id')
            ->join('jurusan', 'matriks_normalisasi.jurusan_id', '=', 'jurusan.id')
            ->select(
                'matriks_normalisasi.*',
                'kriteria.nama as nama_kriteria',
                'kriteria.bobot',
                'kriteria.tipe as tipe_kriteria',
                'jurusan.nama_jurusan as nama_jurusan'
            )
            ->where('matriks_normalisasi.siswa_id', $siswa_id)
            ->get();

        $groupedNormalisasi = [];
        foreach ($matriksNormalisasi as $item) {
            $groupedNormalisasi[$item->nama_jurusan][] = [
                'kode_kriteria'     => 'K' . $item->kriteria_id, // Otomatis K1, K2 dst
                'nama_kriteria'     => $item->nama_kriteria,
                'bobot'             => $item->bobot,
                'tipe_kriteria'     => $item->tipe_kriteria ?? 'Benefit',
                'nilai_normalisasi' => $item->nilai_normalisasi,
                'nilai_terbobot'    => $item->nilai_terbobot,
            ];
        }

        // --- MATRIKS KEPUTUSAN / NILAI MENTAH ---
        $matriksKeputusan = DB::table('matriks_keputusan')
            ->join('kriteria', 'matriks_keputusan.kriteria_id', '=', 'kriteria.id')
            ->join('jurusan', 'matriks_keputusan.jurusan_id', '=', 'jurusan.id')
            ->select(
                'matriks_keputusan.*',
                'jurusan.nama_jurusan as nama_jurusan'
            )
            ->where('matriks_keputusan.siswa_id', $siswa_id)
            ->get();

        $groupedKeputusan = [];
        foreach ($matriksKeputusan as $item) {
            $groupedKeputusan[$item->nama_jurusan][] = [
                'kode_kriteria' => 'K' . $item->kriteria_id,
                'nilai_mentah'  => $item->nilai,
            ];
        }

        return response()->json([
            'status'                => 'success',
            'rekomendasi_utama'     => $hasil,
            'matriks_perhitungan'   => $groupedNormalisasi,
            'matriks_keputusan'     => $groupedKeputusan,
        ], 200);
    }
}