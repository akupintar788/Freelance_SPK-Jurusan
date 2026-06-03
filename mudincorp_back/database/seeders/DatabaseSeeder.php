<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\GuruBk;
use App\Models\Siswa;
use App\Models\Kriteria;
use App\Models\Alternatif;
use App\Models\Fakultas;
use App\Models\Jurusan;
use App\Models\SoalSurvei;
use App\Models\MajorCriteria;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ──────────────────────────────────────────────
        // 1. Buat Akun Administrator
        // ──────────────────────────────────────────────
        $admin = User::updateOrCreate(['nip' => '1234567890'], [
            'name' => 'Admin Mudin Corp',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // ──────────────────────────────────────────────
        // 2. Buat Akun Guru BK
        // ──────────────────────────────────────────────
        $guruBkUser = User::updateOrCreate(['nip' => '1234567891'], [
            'name' => 'Ibu Rahma (Guru BK)',
            'password' => Hash::make('password123'),
            'role' => 'guru_bk',
        ]);

        GuruBk::updateOrCreate(['user_id' => $guruBkUser->id], [
            'user_id' => $guruBkUser->id,
            'nama' => 'Ibu Rahma',
            'nip' => '1234567891',
        ]);

        // ──────────────────────────────────────────────
        // 3. Buat Akun Siswa
        // ──────────────────────────────────────────────
        $siswaUser = User::updateOrCreate(['nip' => '1234567892'], [
            'name' => 'Budi Santoso',
            'password' => Hash::make('password123'),
            'role' => 'siswa',
        ]);

        $siswa = Siswa::updateOrCreate(['user_id' => $siswaUser->id], [
            'user_id' => $siswaUser->id,
            'nama' => 'Budi Santoso',
            'kelas' => 'XII-RPL',
            'jurusan' => null,
        ]);

        // ──────────────────────────────────────────────
        // 4. Buat Fakultas dan Jurusan
        // ──────────────────────────────────────────────
        $fikFakultas = Fakultas::updateOrCreate(['kode_fakultas' => 'FIK'], [
            'nama_fakultas' => 'Fakultas Ilmu Komputer',
        ]);

        $febFakultas = Fakultas::updateOrCreate(['kode_fakultas' => 'FEB'], [
            'nama_fakultas' => 'Fakultas Ekonomi & Bisnis',
        ]);

        $fsdFakultas = Fakultas::updateOrCreate(['kode_fakultas' => 'FSD'], [
            'nama_fakultas' => 'Fakultas Seni & Desain',
        ]);

        $jurusanTi = Jurusan::updateOrCreate(['kode_jurusan' => 'TI'], [
            'fakultas_id' => $fikFakultas->id,
            'nama_jurusan' => 'Teknik Informatika',
        ]);

        $jurusanSi = Jurusan::updateOrCreate(['kode_jurusan' => 'SI'], [
            'fakultas_id' => $fikFakultas->id,
            'nama_jurusan' => 'Sistem Informasi',
        ]);

        $jurusanDkv = Jurusan::updateOrCreate(['kode_jurusan' => 'DKV'], [
            'fakultas_id' => $fsdFakultas->id,
            'nama_jurusan' => 'Desain Komunikasi Visual',
        ]);

        $jurusanMb = Jurusan::updateOrCreate(['kode_jurusan' => 'MB'], [
            'fakultas_id' => $febFakultas->id,
            'nama_jurusan' => 'Manajemen Bisnis',
        ]);

        // ──────────────────────────────────────────────
        // 5. Buat Kriteria (9 kriteria detail)
        // ──────────────────────────────────────────────
        $kriteriaData = [
            // Akademik
            ['nama_kriteria' => 'Matematika',     'kategori_penilaian' => 'Akademik', 'jenis_kriteria' => 'benefit', 'bobot' => 0.15],
            ['nama_kriteria' => 'Bahasa Inggris', 'kategori_penilaian' => 'Akademik', 'jenis_kriteria' => 'benefit', 'bobot' => 0.10],
            ['nama_kriteria' => 'Seni',           'kategori_penilaian' => 'Akademik', 'jenis_kriteria' => 'benefit', 'bobot' => 0.08],

            // Bakat
            ['nama_kriteria' => 'Logika',         'kategori_penilaian' => 'Bakat',    'jenis_kriteria' => 'benefit', 'bobot' => 0.12],
            ['nama_kriteria' => 'Kreativitas',    'kategori_penilaian' => 'Bakat',    'jenis_kriteria' => 'benefit', 'bobot' => 0.10],
            ['nama_kriteria' => 'Komunikasi',     'kategori_penilaian' => 'Bakat',    'jenis_kriteria' => 'benefit', 'bobot' => 0.10],

            // Minat
            ['nama_kriteria' => 'Minat Coding',   'kategori_penilaian' => 'Minat',    'jenis_kriteria' => 'benefit', 'bobot' => 0.12],
            ['nama_kriteria' => 'Minat Desain',   'kategori_penilaian' => 'Minat',    'jenis_kriteria' => 'benefit', 'bobot' => 0.12],
            ['nama_kriteria' => 'Minat Bisnis',   'kategori_penilaian' => 'Minat',    'jenis_kriteria' => 'benefit', 'bobot' => 0.11],
        ];

        $kriteriaModels = [];
        foreach ($kriteriaData as $item) {
            $kriteriaModels[$item['nama_kriteria']] = Kriteria::updateOrCreate(
                ['nama_kriteria' => $item['nama_kriteria']],
                [
                    ...$item,
                    // Sync legacy columns
                    'kategori' => $item['kategori_penilaian'],
                    'tipe' => $item['jenis_kriteria'],
                ]
            );
        }

        // ──────────────────────────────────────────────
        // 6. Buat Alternatif (Program Studi)
        // ──────────────────────────────────────────────
        $altTi = Alternatif::updateOrCreate(['kode_prodi' => 'TI'], [
            'kode_prodi' => 'TI',
            'nama_prodi' => 'Teknik Informatika',
            'biaya' => 8000000,
            'jurusan_id' => $jurusanTi->id,
        ]);

        $altSi = Alternatif::updateOrCreate(['kode_prodi' => 'SI'], [
            'kode_prodi' => 'SI',
            'nama_prodi' => 'Sistem Informasi',
            'biaya' => 7000000,
            'jurusan_id' => $jurusanSi->id,
        ]);

        $altDkv = Alternatif::updateOrCreate(['kode_prodi' => 'DKV'], [
            'kode_prodi' => 'DKV',
            'nama_prodi' => 'Desain Komunikasi Visual',
            'biaya' => 7500000,
            'jurusan_id' => $jurusanDkv->id,
        ]);

        $altMb = Alternatif::updateOrCreate(['kode_prodi' => 'MB'], [
            'kode_prodi' => 'MB',
            'nama_prodi' => 'Manajemen Bisnis',
            'biaya' => 6500000,
            'jurusan_id' => $jurusanMb->id,
        ]);

        // ──────────────────────────────────────────────
        // 7. Buat Bobot Jurusan (MajorCriteria)
        //    Setiap jurusan punya bobot berbeda per kriteria
        // ──────────────────────────────────────────────
        $bobotJurusan = [
            // Teknik Informatika: butuh Matematika tinggi, Logika tinggi, Minat Coding tinggi
            'Teknik Informatika' => [
                'Matematika' => 0.30, 'Bahasa Inggris' => 0.05, 'Seni' => 0.00,
                'Logika' => 0.25, 'Kreativitas' => 0.05, 'Komunikasi' => 0.05,
                'Minat Coding' => 0.25, 'Minat Desain' => 0.00, 'Minat Bisnis' => 0.05,
            ],
            // Sistem Informasi: Matematika, Logika, Komunikasi, Minat Coding dan Bisnis
            'Sistem Informasi' => [
                'Matematika' => 0.20, 'Bahasa Inggris' => 0.10, 'Seni' => 0.00,
                'Logika' => 0.20, 'Kreativitas' => 0.05, 'Komunikasi' => 0.15,
                'Minat Coding' => 0.15, 'Minat Desain' => 0.00, 'Minat Bisnis' => 0.15,
            ],
            // DKV: Seni tinggi, Kreativitas tinggi, Minat Desain tinggi
            'Desain Komunikasi Visual' => [
                'Matematika' => 0.00, 'Bahasa Inggris' => 0.05, 'Seni' => 0.30,
                'Logika' => 0.05, 'Kreativitas' => 0.25, 'Komunikasi' => 0.05,
                'Minat Coding' => 0.00, 'Minat Desain' => 0.25, 'Minat Bisnis' => 0.05,
            ],
            // Manajemen Bisnis: Komunikasi, Bahasa Inggris, Minat Bisnis
            'Manajemen Bisnis' => [
                'Matematika' => 0.10, 'Bahasa Inggris' => 0.15, 'Seni' => 0.05,
                'Logika' => 0.10, 'Kreativitas' => 0.05, 'Komunikasi' => 0.20,
                'Minat Coding' => 0.00, 'Minat Desain' => 0.05, 'Minat Bisnis' => 0.30,
            ],
        ];

        $jurusanMap = [
            'Teknik Informatika' => $jurusanTi->id,
            'Sistem Informasi' => $jurusanSi->id,
            'Desain Komunikasi Visual' => $jurusanDkv->id,
            'Manajemen Bisnis' => $jurusanMb->id,
        ];

        foreach ($bobotJurusan as $namaJurusan => $bobots) {
            foreach ($bobots as $namaKriteria => $nilai) {
                if ($nilai > 0 && isset($kriteriaModels[$namaKriteria])) {
                    MajorCriteria::updateOrCreate(
                        [
                            'jurusan_id' => $jurusanMap[$namaJurusan],
                            'kriteria_id' => $kriteriaModels[$namaKriteria]->id,
                        ],
                        ['nilai' => $nilai]
                    );
                }
            }
        }

        // ──────────────────────────────────────────────
        // 8. Buat Soal Survei (terhubung ke kriteria SAW)
        // ──────────────────────────────────────────────
        $soalData = [
            // Bakat - Logika
            ['pertanyaan' => 'Saya mudah memahami logika dan pola pemecahan masalah.', 'kategori' => 'Bakat', 'jurusan_id' => $jurusanTi->id, 'kriteria' => 'Logika'],
            ['pertanyaan' => 'Saya menikmati teka-teki logika dan permainan strategi.', 'kategori' => 'Bakat', 'jurusan_id' => $jurusanSi->id, 'kriteria' => 'Logika'],

            // Bakat - Kreativitas
            ['pertanyaan' => 'Saya senang membuat ide visual atau desain yang kreatif.', 'kategori' => 'Bakat', 'jurusan_id' => $jurusanDkv->id, 'kriteria' => 'Kreativitas'],
            ['pertanyaan' => 'Saya sering menemukan solusi unik untuk masalah sehari-hari.', 'kategori' => 'Bakat', 'jurusan_id' => $jurusanTi->id, 'kriteria' => 'Kreativitas'],

            // Bakat - Komunikasi
            ['pertanyaan' => 'Saya merasa percaya diri berbicara di depan orang banyak.', 'kategori' => 'Bakat', 'jurusan_id' => $jurusanMb->id, 'kriteria' => 'Komunikasi'],
            ['pertanyaan' => 'Saya senang berdiskusi dan mempresentasikan ide kepada orang lain.', 'kategori' => 'Bakat', 'jurusan_id' => $jurusanSi->id, 'kriteria' => 'Komunikasi'],

            // Minat - Coding
            ['pertanyaan' => 'Seberapa besar minat Anda terhadap programming?', 'kategori' => 'Minat', 'jurusan_id' => $jurusanTi->id, 'kriteria' => 'Minat Coding'],
            ['pertanyaan' => 'Saya tertarik untuk membuat aplikasi atau website sendiri.', 'kategori' => 'Minat', 'jurusan_id' => $jurusanSi->id, 'kriteria' => 'Minat Coding'],

            // Minat - Desain
            ['pertanyaan' => 'Saya tertarik belajar desain grafis atau karya visual digital.', 'kategori' => 'Minat', 'jurusan_id' => $jurusanDkv->id, 'kriteria' => 'Minat Desain'],
            ['pertanyaan' => 'Saya suka menggambar, mengedit foto, atau membuat ilustrasi.', 'kategori' => 'Minat', 'jurusan_id' => $jurusanDkv->id, 'kriteria' => 'Minat Desain'],

            // Minat - Bisnis
            ['pertanyaan' => 'Saya tertarik mempelajari manajemen dan kewirausahaan.', 'kategori' => 'Minat', 'jurusan_id' => $jurusanMb->id, 'kriteria' => 'Minat Bisnis'],
            ['pertanyaan' => 'Saya senang menganalisis peluang usaha dan strategi pasar.', 'kategori' => 'Minat', 'jurusan_id' => $jurusanMb->id, 'kriteria' => 'Minat Bisnis'],
        ];

        foreach ($soalData as $soal) {
            $kriteriaId = $kriteriaModels[$soal['kriteria']]->id ?? null;
            SoalSurvei::updateOrCreate(
                ['pertanyaan' => $soal['pertanyaan']],
                [
                    'pertanyaan' => $soal['pertanyaan'],
                    'kategori' => $soal['kategori'],
                    'jurusan_id' => $soal['jurusan_id'],
                    'kriteria_id' => $kriteriaId,
                ]
            );
        }
    }
}
