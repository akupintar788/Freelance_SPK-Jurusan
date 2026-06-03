<?php

namespace Database\Seeders;

use App\Models\Kriteria;
use Illuminate\Database\Seeder;

class KriteriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kriteria = [
            // Akademik
            [
                'kategori_penilaian' => 'Akademik',
                'nama_kriteria' => 'Matematika',
                'bobot' => 0.15,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            [
                'kategori_penilaian' => 'Akademik',
                'nama_kriteria' => 'Bahasa Inggris',
                'bobot' => 0.12,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            [
                'kategori_penilaian' => 'Akademik',
                'nama_kriteria' => 'Seni',
                'bobot' => 0.10,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            [
                'kategori_penilaian' => 'Akademik',
                'nama_kriteria' => 'IPA',
                'bobot' => 0.13,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            [
                'kategori_penilaian' => 'Akademik',
                'nama_kriteria' => 'IPS',
                'bobot' => 0.13,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            // Bakat
            [
                'kategori_penilaian' => 'Bakat',
                'nama_kriteria' => 'Logika',
                'bobot' => 0.10,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            [
                'kategori_penilaian' => 'Bakat',
                'nama_kriteria' => 'Kreativitas',
                'bobot' => 0.08,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            [
                'kategori_penilaian' => 'Bakat',
                'nama_kriteria' => 'Komunikasi',
                'bobot' => 0.07,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            // Minat
            [
                'kategori_penilaian' => 'Minat',
                'nama_kriteria' => 'Minat Coding',
                'bobot' => 0.06,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            [
                'kategori_penilaian' => 'Minat',
                'nama_kriteria' => 'Minat Desain',
                'bobot' => 0.04,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
            [
                'kategori_penilaian' => 'Minat',
                'nama_kriteria' => 'Minat Bisnis',
                'bobot' => 0.02,
                'tipe' => 'benefit',
                'jenis_kriteria' => 'benefit',
            ],
        ];

        foreach ($kriteria as $k) {
            Kriteria::updateOrCreate(
                [
                    'nama_kriteria' => $k['nama_kriteria'],
                    'kategori_penilaian' => $k['kategori_penilaian'],
                ],
                $k
            );
        }
    }
}
