<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

/**
 * Modul 9 — Dashboard & Laporan
 * Statistik admin + export data rekomendasi ke PDF/Excel.
 */
class DashboardController extends Controller
{
    /**
     * Statistik ringkasan untuk kartu di halaman dashboard.
     */
    public function statistik()
    {
        // 1. Total Siswa (Hanya yang rolenya 'siswa')
        $totalSiswa = DB::table('siswa')
            ->join('users', 'siswa.user_id', '=', 'users.id')
            ->where('users.role', 'siswa')
            ->count();

        $totalJurusan  = DB::table('jurusan')->where('is_active', true)->count();
        $totalKriteria = DB::table('kriteria')->where('is_active', true)->count();

        // 2. Sudah Dihitung (Hanya siswa dengan role 'siswa')
        $sudahDihitung = DB::table('hasil_saw')
            ->join('siswa', 'hasil_saw.siswa_id', '=', 'siswa.id')
            ->join('users', 'siswa.user_id', '=', 'users.id')
            ->where('users.role', 'siswa')
            ->distinct()
            ->count('hasil_saw.siswa_id');

        $belumDihitung = $totalSiswa - $sudahDihitung;

        // Cek validitas bobot
        $totalBobot = DB::table('kriteria')->where('is_active', true)->sum('bobot');
        $bobotValid = abs($totalBobot - 1.0) < 0.0001;

        // 3. Siswa yang sudah isi survei bakat (Hanya role 'siswa')
        $sudahSurveiBakat = DB::table('skor_survei')
            ->join('siswa', 'skor_survei.siswa_id', '=', 'siswa.id')
            ->join('users', 'siswa.user_id', '=', 'users.id')
            ->where('users.role', 'siswa')
            ->where('skor_survei.tipe', 'bakat')
            ->distinct()
            ->count('skor_survei.siswa_id');

        // 4. Siswa yang sudah isi survei minat (Hanya role 'siswa')
        $sudahSurveiMinat = DB::table('skor_survei')
            ->join('siswa', 'skor_survei.siswa_id', '=', 'siswa.id')
            ->join('users', 'siswa.user_id', '=', 'users.id')
            ->where('users.role', 'siswa')
            ->where('skor_survei.tipe', 'minat')
            ->distinct()
            ->count('skor_survei.siswa_id');

        return response()->json([
            'total_siswa'         => $totalSiswa,
            'total_jurusan_aktif' => $totalJurusan,
            'total_kriteria_aktif'=> $totalKriteria,
            'sudah_dihitung'      => $sudahDihitung,
            'belum_dihitung'      => $belumDihitung,
            'sudah_survei_bakat'  => $sudahSurveiBakat,
            'sudah_survei_minat'  => $sudahSurveiMinat,
            'bobot_valid'         => $bobotValid,
            'total_bobot'         => round($totalBobot, 4),
        ]);
    }

    /**
     * Distribusi rekomendasi jurusan — berapa siswa direkomendasikan ke tiap jurusan.
     */
    public function distribusiJurusan()
    {
        $distribusi = DB::table('hasil_saw')
            ->join('jurusan', 'hasil_saw.jurusan_rekomendasi_id', '=', 'jurusan.id')
            ->join('siswa', 'hasil_saw.siswa_id', '=', 'siswa.id')
            ->join('users', 'siswa.user_id', '=', 'users.id')
            ->where('users.role', 'siswa')
            ->select(
                'jurusan.nama_jurusan',
                'jurusan.kode_jurusan',
                DB::raw('COUNT(hasil_saw.id) as jumlah_siswa'),
                DB::raw('ROUND(AVG(hasil_saw.skor_tertinggi), 4) as rata_skor')
            )
            ->groupBy('jurusan.id', 'jurusan.nama_jurusan', 'jurusan.kode_jurusan')
            ->orderBy('jumlah_siswa', 'desc')
            ->get();

        $totalSiswaHasil = $distribusi->sum('jumlah_siswa');

        // Tambahkan persentase per jurusan
        $distribusi = $distribusi->map(function ($item) use ($totalSiswaHasil) {
            $item->persentase = $totalSiswaHasil > 0
                ? round(($item->jumlah_siswa / $totalSiswaHasil) * 100, 2)
                : 0;
            return $item;
        });

        return response()->json([
            'data'            => $distribusi,
            'total_terhitung' => $totalSiswaHasil,
        ]);
    }

    /**
     * Progress kelengkapan data tiap siswa.
     */
    public function progressSiswa(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $search  = $request->get('search', '');

        $siswaQuery = DB::table('siswa')
            ->join('users', 'siswa.user_id', '=', 'users.id')
            ->where('users.role', 'siswa')
            ->select('siswa.id', 'siswa.nama', 'siswa.kelas');

        if ($search) {
            $siswaQuery->where(function($query) use ($search) {
                $query->where('siswa.nama', 'like', "%{$search}%")
                      ->orWhere('siswa.kelas', 'like', "%{$search}%");
            });
        }

        $siswaList = $siswaQuery->paginate($perPage);
        $siswaIds = collect($siswaList->items())->pluck('id')->toArray();

        // Batch query
        $surveiBakat = DB::table('skor_survei')
            ->whereIn('siswa_id', $siswaIds)->where('tipe', 'bakat')
            ->pluck('siswa_id')->toArray();

        $surveiMinat = DB::table('skor_survei')
            ->whereIn('siswa_id', $siswaIds)->where('tipe', 'minat')
            ->pluck('siswa_id')->toArray();

        $punyaNilai = DB::table('nilai_rapor')
            ->whereIn('siswa_id', $siswaIds)
            ->distinct()
            ->pluck('siswa_id')->toArray();

        $sudahHitung = DB::table('hasil_saw')
            ->whereIn('siswa_id', $siswaIds)
            ->pluck('siswa_id')->toArray();

        $items = collect($siswaList->items())->map(function ($siswa) use (
            $surveiBakat, $surveiMinat, $punyaNilai, $sudahHitung
        ) {
            $siswa->survei_bakat   = in_array($siswa->id, $surveiBakat);
            $siswa->survei_minat   = in_array($siswa->id, $surveiMinat);
            $siswa->punya_nilai    = in_array($siswa->id, $punyaNilai);
            $siswa->sudah_dihitung = in_array($siswa->id, $sudahHitung);

            $lengkap = array_sum([
                $siswa->survei_bakat,
                $siswa->survei_minat,
                $siswa->punya_nilai,
                $siswa->sudah_dihitung,
            ]);
            $siswa->kelengkapan_persen = round(($lengkap / 4) * 100);

            return $siswa;
        });

        return response()->json([
            'data'          => $items,
            'current_page'  => $siswaList->currentPage(),
            'last_page'     => $siswaList->lastPage(),
            'total'         => $siswaList->total(),
        ]);
    }

    /**
     * Export laporan rekomendasi ke Excel atau PDF.
     */
    public function export(Request $request)
    {
        $format = strtolower($request->get('format', 'excel'));

        if (!in_array($format, ['excel', 'pdf'])) {
            return response()->json(['message' => 'Format tidak valid. Gunakan excel atau pdf.'], 422);
        }

        $data = DB::table('hasil_saw')
            ->join('siswa', 'hasil_saw.siswa_id', '=', 'siswa.id')
            ->join('users', 'siswa.user_id', '=', 'users.id')
            ->where('users.role', 'siswa')
            ->join('jurusan', 'hasil_saw.jurusan_rekomendasi_id', '=', 'jurusan.id')
            ->leftJoin('detail_hasil_saw as d2', function ($join) {
                $join->on('d2.hasil_saw_id', '=', 'hasil_saw.id')
                     ->where('d2.ranking', '=', 2);
            })
            ->leftJoin('jurusan as j2', 'd2.jurusan_id', '=', 'j2.id')
            ->leftJoin('detail_hasil_saw as d3', function ($join) {
                $join->on('d3.hasil_saw_id', '=', 'hasil_saw.id')
                     ->where('d3.ranking', '=', 3);
            })
            ->leftJoin('jurusan as j3', 'd3.jurusan_id', '=', 'j3.id')
            ->select(
                'siswa.nama as nama_siswa',
                'siswa.kelas',
                'jurusan.nama_jurusan as rekomendasi_1',
                DB::raw('ROUND(hasil_saw.skor_tertinggi, 4) as skor_1'),
                'j2.nama_jurusan as rekomendasi_2',
                DB::raw('ROUND(d2.skor_akhir, 4) as skor_2'),
                'j3.nama_jurusan as rekomendasi_3',
                DB::raw('ROUND(d3.skor_akhir, 4) as skor_3'),
                'hasil_saw.dihitung_pada'
            )
            ->orderBy('siswa.nama')
            ->get();

        if ($format === 'excel') {
            return $this->exportExcel($data);
        }

        return $this->exportPdf($data);
    }

    // ─── Private Helpers ────────────────────────────────────────────────────

    private function exportExcel($data)
    {
        $filename  = 'laporan_rekomendasi_jurusan_' . date('Ymd_His') . '.xlsx';
        $headers   = [
            'Nama Siswa', 'Kelas',
            'Rekomendasi 1', 'Skor 1',
            'Rekomendasi 2', 'Skor 2',
            'Rekomendasi 3', 'Skor 3',
            'Dihitung Pada',
        ];

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\RekomendasiExport($data, $headers),
            $filename
        );
    }

    private function exportPdf($data)
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView(
            'exports.laporan_rekomendasi_pdf',
            [
                'data'       => $data,
                'generated'  => now()->format('d/m/Y H:i'),
            ]
        );

        $pdf->setPaper('a4', 'landscape');
        $filename = 'laporan_rekomendasi_jurusan_' . date('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }
}