<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
class LaporanController extends Controller
{
    public function index(Request $request)
    {
      $query = DB::table('siswa')
    ->join('users', 'siswa.user_id', '=', 'users.id')
    ->leftJoin('hasil_saw', 'siswa.id', '=', 'hasil_saw.siswa_id')
    ->leftJoin('jurusan', 'hasil_saw.jurusan_rekomendasi_id', '=', 'jurusan.id')
    ->where('users.role', 'siswa')
    ->select(
        'siswa.id',
        'siswa.nama as nama_siswa',
        'siswa.kelas',
        'jurusan.nama_jurusan as rekomendasi',
        'hasil_saw.skor_tertinggi as skor'
    );

        // Filter kelas
        if ($request->filled('kelas') && $request->kelas !== 'Semua') {
            $query->where('siswa.kelas', $request->kelas);
        }

        // Filter status
        if ($request->status === 'Sudah') {
            $query->whereNotNull('hasil_saw.id');
        }

        if ($request->status === 'Belum') {
            $query->whereNull('hasil_saw.id');
        }

        $data = $query
            ->orderByDesc('hasil_saw.skor_tertinggi')
            ->get();

$totalSiswa = DB::table('siswa')
    ->join('users', 'siswa.user_id', '=', 'users.id')
    ->where('users.role', 'siswa')
    ->count();

$sudahDiproses = DB::table('siswa')
    ->join('users', 'siswa.user_id', '=', 'users.id')
    ->join('hasil_saw', 'siswa.id', '=', 'hasil_saw.siswa_id')
    ->where('users.role', 'siswa')
    ->distinct()
    ->count('siswa.id');

$stats = [
    'total_siswa' => $totalSiswa,
    'sudah_diproses' => $sudahDiproses,
    'belum_diproses' => $totalSiswa - $sudahDiproses,
];

        return response()->json([
            'stats' => $stats,
            'data' => $data
        ]);
    }

    public function filterOptions()
    {
        return response()->json([
            'kelas' => DB::table('siswa')
                ->select('kelas')
                ->distinct()
                ->orderBy('kelas')
                ->pluck('kelas')
        ]);
    }
    public function exportPdf()
{
    $data = DB::table('siswa')
        ->join('users', 'siswa.user_id', '=', 'users.id')
        ->leftJoin('hasil_saw', 'siswa.id', '=', 'hasil_saw.siswa_id')
        ->leftJoin('jurusan', 'hasil_saw.jurusan_rekomendasi_id', '=', 'jurusan.id')
        ->where('users.role', 'siswa')
        ->select(
            'siswa.nama as nama_siswa',
            'siswa.kelas',
            'jurusan.nama_jurusan as rekomendasi',
            'hasil_saw.skor_tertinggi as skor'
        )
        ->orderByDesc('hasil_saw.skor_tertinggi')
        ->get();

    $pdf = Pdf::loadView(
        'exports.laporan_hasil_pdf',
        compact('data')
    );

    return $pdf->download(
        'laporan_hasil_rekomendasi.pdf'
    );
}
}