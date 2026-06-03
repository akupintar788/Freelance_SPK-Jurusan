<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\NilaiRapor;
use App\Models\Siswa;
use App\Models\NilaiSiswa;
use Illuminate\Http\Request;
use App\Exports\NilaiRaporSiswaExport;
use App\Imports\NilaiRaporSiswaImport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class NilaiRaporController extends Controller
{
    /**
     * Menampilkan semua data nilai rapor + relasi siswa
     */
    public function index()
    {
        try {
            $nilaiRapor = NilaiRapor::with('siswa')->get();
            return response()->json($nilaiRapor, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memuat data nilai rapor.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Menyimpan data nilai rapor baru secara manual
     */
    public function store(Request $request)
    {
        $request->validate([
            'siswa_id'       => 'required|exists:siswa,id',
            'mata_pelajaran' => 'required|string',
            'nilai'          => 'required|numeric|min:0|max:100',
            'semester'       => 'required|integer|min:1|max:6',
            'tahun_ajaran'   => 'required|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            $nilaiRapor = NilaiRapor::create([
                'siswa_id'       => $request->siswa_id,
                'mata_pelajaran' => $request->mata_pelajaran,
                'nilai'          => $request->nilai,
                'semester'       => (int) $request->semester,
                'tahun_ajaran'   => $request->tahun_ajaran,
            ]);

            // Jalankan sinkronisasi otomatis ke matriks SAW C1 Anda
            $this->syncNilaiAkademikSAW($request->siswa_id);

            DB::commit();

            return response()->json($nilaiRapor->load('siswa'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan nilai.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan detail nilai rapor berdasarkan ID
     */
    public function show($id)
    {
        $nilaiRapor = NilaiRapor::with('siswa')->find($id);
        if (!$nilaiRapor) {
            return response()->json(['message' => 'Nilai Rapor tidak ditemukan'], 404);
        }
        return response()->json($nilaiRapor, 200);
    }

    /**
     * Memperbarui data nilai rapor
     */
    public function update(Request $request, $id)
    {
        $nilaiRapor = NilaiRapor::find($id);
        if (!$nilaiRapor) {
            return response()->json(['message' => 'Nilai Rapor tidak ditemukan'], 404);
        }

        $request->validate([
            'siswa_id'       => 'required|exists:siswa,id',
            'mata_pelajaran' => 'required|string',
            'nilai'          => 'required|numeric|min:0|max:100',
            'semester'       => 'required|integer|min:1|max:6',
            'tahun_ajaran'   => 'required|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            $nilaiRapor->update([
                'siswa_id'       => $request->siswa_id,
                'mata_pelajaran' => $request->mata_pelajaran,
                'nilai'          => $request->nilai,
                'semester'       => (int) $request->semester,
                'tahun_ajaran'   => $request->tahun_ajaran,
            ]);

            $this->syncNilaiAkademikSAW($nilaiRapor->siswa_id);

            DB::commit();

            return response()->json($nilaiRapor, 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui nilai.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Menghapus satu data nilai mata pelajaran siswa
     */
    public function destroy($id)
    {
        $nilaiRapor = NilaiRapor::find($id);
        if (!$nilaiRapor) {
            return response()->json(['message' => 'Nilai Rapor tidak ditemukan'], 404);
        }

        try {
            DB::beginTransaction();

            $siswaId = $nilaiRapor->siswa_id;
            $nilaiRapor->delete();

            // Hitung ulang rata-rata kriteria SAW setelah dihapus
            $this->syncNilaiAkademikSAW($siswaId);

            DB::commit();

            return response()->json(['message' => 'Nilai Rapor berhasil dihapus'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus nilai.', 'error' => $e->getMessage()], 500);
        }
    }

    /* =========================================================================
     * FITUR BARU: INDIVIDU EXPORT, IMPORT, & PDF PER SISWA
     * ========================================================================= */

    public function exportExcelSiswa($siswaId)
    {
        try {
            $siswa = Siswa::findOrFail($siswaId);
            $data = NilaiRapor::where('siswa_id', $siswaId)->get();
            
            $headers = ['Mata Pelajaran', 'Nilai', 'Semester', 'Tahun Ajaran'];
            $filename = 'Format_Nilai_' . str_replace(' ', '_', $siswa->nama) . '.xlsx';

            return Excel::download(new NilaiRaporSiswaExport($data, $headers), $filename);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengekspor data Excel.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Import nilai mata pelajaran dari Excel khusus ke satu siswa terpilih
     */
    public function importExcelSiswa(Request $request, $siswaId)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048'
        ]);

        try {
            DB::beginTransaction();

            Siswa::findOrFail($siswaId);

            // Eksekusi import dengan mengunci target siswa_id ke class import baru Anda
            Excel::import(new NilaiRaporSiswaImport($siswaId), $request->file('file'));

            // Perbarui nilai kriteria akademik pada matriks SAW secara otomatis
            $this->syncNilaiAkademikSAW($siswaId);

            DB::commit();

            return response()->json(['message' => 'Data nilai rapor berhasil diimport melalui Excel!'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memproses file Excel.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mengunduh / Cetak Dokumen PDF Nilai Rapor Siswa Individu
     */
    public function exportPdfSiswa($siswaId)
    {
        try {
            $siswa = Siswa::findOrFail($siswaId);
            $nilai = NilaiRapor::where('siswa_id', $siswaId)->get();
            $rataRata = $nilai->avg('nilai') ?? 0;

            // Memuat file view blade (buat file ini di resources/views/exports/nilai_siswa_pdf.blade.php)
            $pdf = Pdf::loadView('exports.nilai_siswa_pdf', [
                'siswa'     => $siswa,
                'nilai'     => $nilai,
                'rata_rata' => number_format($rataRata, 2)
            ]);

            return $pdf->download('Rapor_' . str_replace(' ', '_', $siswa->nama) . '.pdf');
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mencetak PDF.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * LOGIKA ASLI ANDA: Sinkronisasi Nilai Rata-rata Rapor ke Kriteria Akademik (SAW)
     */
    private function syncNilaiAkademikSAW(int $siswaId): void
    {
        // Hitung rata-rata nilai raport siswa dari tabel nilai_rapor
        $rataRata = NilaiRapor::where('siswa_id', $siswaId)->avg('nilai') ?? 0;

        // Otomatis update Kriteria Akademik (C1, id=1) di tabel nilai_siswa sebagai bahan hitung SAW
        NilaiSiswa::updateOrCreate(
            [
                'siswa_id'    => $siswaId,
                'kriteria_id' => 1, // C1 = Nilai Akademik
            ],
            ['nilai' => $rataRata]
        );
    }
}