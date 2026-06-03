<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SawService
{
    protected $siswaId;

    public function __construct($siswaId = null)
    {
        $this->siswaId = $siswaId;
    }

    public function setSiswaId($siswaId)
    {
        $this->siswaId = $siswaId;
        return $this;
    }

    public function hitungRekomendasi()
    {
        if (!$this->siswaId) {
            throw new \Exception("Gagal menghitung rekomendasi: ID Siswa belum ditentukan.");
        }

        return DB::transaction(function () {

            // Bersihkan normalisasi & hasil lama
            DB::table('matriks_normalisasi')->where('siswa_id', $this->siswaId)->delete();
            $oldHasil = DB::table('hasil_saw')->where('siswa_id', $this->siswaId)->first();
            if ($oldHasil) {
                DB::table('detail_hasil_saw')->where('hasil_saw_id', $oldHasil->id)->delete();
                DB::table('hasil_saw')->where('id', $oldHasil->id)->delete();
            }

            // Ambil Kriteria Aktif dan Semua Jurusan
            $kriterias = DB::table('kriteria')->where('is_active', true)->orderBy('urutan')->get();
            $jurusans  = DB::table('jurusan')->where('is_active', true)->get();

            if ($kriterias->isEmpty() || $jurusans->isEmpty()) {
                throw new \Exception("Kriteria atau Jurusan masih kosong/tidak aktif.");
            }

            // ─────────────────────────────────────────────────────────────────
            // STEP 2 — PEMBENTUKAN MATRIKS KEPUTUSAN (X)
            // ─────────────────────────────────────────────────────────────────
            foreach ($jurusans as $jurusan) {
                foreach ($kriterias as $kriteria) {
                    $nilaiMentah = 0;

                    if ($kriteria->sumber_data === 'akademik') {
                        // ✅ FIX: Ambil rata-rata nilai rapor khusus yang berkaitan dengan jurusan tersebut (jika ada kolom mata_pelajaran/mapel di tabel rapor kamu)
                        // Jika struktur tabel rapor kamu menggunakan mapel, sesuaikan query mapel pendukung di bawah ini
                        $namaJurusanLower = strtolower($jurusan->nama_jurusan);
                        
                        $queryRapor = DB::table('nilai_rapor')->where('siswa_id', $this->siswaId);

                        if (str_contains($namaJurusanLower, 'informatika') || str_contains($namaJurusanLower, 'sistem')) {
                            $queryRapor->whereIn('mata_pelajaran', ['Matematika', 'Informatika', 'Fisika']);
                        } elseif (str_contains($namaJurusanLower, 'akuntansi') || str_contains($namaJurusanLower, 'ekonomi')) {
                            $queryRapor->whereIn('mata_pelajaran', ['Matematika', 'Ekonomi', 'Akuntansi']);
                        } elseif (str_contains($namaJurusanLower, 'kedokteran')) {
                            $queryRapor->whereIn('mata_pelajaran', ['Biologi', 'Kimia']);
                        }

                        $nilaiMentah = $queryRapor->avg('nilai') ?? DB::table('nilai_rapor')->where('siswa_id', $this->siswaId)->avg('nilai') ?? 0;

                    } elseif ($kriteria->sumber_data === 'survei') {
                        $namaLower = strtolower($kriteria->nama);
                        if (str_contains($namaLower, 'bakat')) {
                            $tipeSurvei = 'bakat';
                        } elseif (str_contains($namaLower, 'minat')) {
                            $tipeSurvei = 'minat';
                        } else {
                            continue;
                        }

                        // Ambil skor dari tabel skor_survei
                        $skorSurvei = DB::table('skor_survei')
                            ->where('siswa_id', $this->siswaId)
                            ->where('jurusan_id', $jurusan->id)
                            ->where('tipe', $tipeSurvei)
                            ->value('skor_rata');

                        // ✅ FIX FALLBACK: Jika skor_survei kosong/0 karena kuesioner belum dipetakan per jurusan di DB,
                        // kita hitung rata-rata alternatif langsung dari jawaban_survei yang join ke pertanyaan_survei
                        if (!$skorSurvei || $skorSurvei == 0) {
                            $skorSurvei = DB::table('jawaban_survei')
                                ->join('pertanyaan_survei', 'jawaban_survei.pertanyaan_id', '=', 'pertanyaan_survei.id')
                                ->where('jawaban_survei.siswa_id', $this->siswaId)
                                ->where('pertanyaan_survei.tipe', $tipeSurvei)
                                ->where('pertanyaan_survei.jurusan_id', $jurusan->id) // Pastikan kolom ini ada di pertanyaan_survei
                                ->avg('jawaban_survei.skor') ?? 0;
                        }

                        $nilaiMentah = $skorSurvei;
                    }

                    DB::table('matriks_keputusan')->updateOrInsert(
                        [
                            'siswa_id'    => $this->siswaId,
                            'jurusan_id'  => $jurusan->id,
                            'kriteria_id' => $kriteria->id,
                        ],
                        [
                            'nilai'      => $nilaiMentah,
                            'updated_at' => now(),
                            'created_at' => now(),
                        ]
                    );
                }
            }

            // ─────────────────────────────────────────────────────────────────
            // STEP 3 — NORMALISASI (R) & NILAI TERBOBOT (V = R × W)
            // ─────────────────────────────────────────────────────────────────
            $matriksX = DB::table('matriks_keputusan')
                ->where('siswa_id', $this->siswaId)
                ->get();

            foreach ($matriksX as $item) {
                $kriteria = $kriterias->firstWhere('id', $item->kriteria_id);
                if (!$kriteria) continue;

                // ✅ FIX LOGIKA PEMBAGI: Cari nilai max/min khusus untuk kriteria ini saja
                $maxX = DB::table('matriks_keputusan')
                    ->where('kriteria_id', $item->kriteria_id)
                    ->max('nilai') ?: 1;

                $minX = DB::table('matriks_keputusan')
                    ->where('kriteria_id', $item->kriteria_id)
                    ->min('nilai') ?: 1;

                // Rumus Normalisasi SAW
                if ($kriteria->tipe === 'benefit') {
                    $r = $maxX > 0 ? ($item->nilai / $maxX) : 0;
                } else { // cost
                    $r = $item->nilai > 0 ? ($minX / $item->nilai) : 0;
                }

                $v = $r * $kriteria->bobot;

                DB::table('matriks_normalisasi')->insert([
                    'siswa_id'          => $this->siswaId,
                    'jurusan_id'        => $item->jurusan_id,
                    'kriteria_id'       => $item->kriteria_id,
                    'nilai_normalisasi' => $r,
                    'nilai_terbobot'    => $v,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]);
            }

            // ─────────────────────────────────────────────────────────────────
            // STEP 4 — PERANGKINGAN (V)
            // ─────────────────────────────────────────────────────────────────
            $skorAkhirJurusan = DB::table('matriks_normalisasi')
                ->select('jurusan_id', DB::raw('SUM(nilai_terbobot) as total_skor'))
                ->where('siswa_id', $this->siswaId)
                ->groupBy('jurusan_id')
                ->orderBy('total_skor', 'desc')
                ->get();

            if ($skorAkhirJurusan->isEmpty()) {
                throw new \Exception("Gagal menghitung preferensi ranking.");
            }

            $rankUtama  = $skorAkhirJurusan->first();
            $hasilSawId = DB::table('hasil_saw')->insertGetId([
                'siswa_id'               => $this->siswaId,
                'jurusan_rekomendasi_id' => $rankUtama->jurusan_id,
                'skor_tertinggi'         => $rankUtama->total_skor,
                'dihitung_pada'          => Carbon::now(),
                'created_at'             => now(),
                'updated_at'             => now(),
            ]);

            foreach ($skorAkhirJurusan as $index => $rank) {
                DB::table('detail_hasil_saw')->insert([
                    'hasil_saw_id' => $hasilSawId,
                    'jurusan_id'   => $rank->jurusan_id,
                    'skor_akhir'   => $rank->total_skor,
                    'ranking'      => $index + 1,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }

            return true;
        });
    }
}