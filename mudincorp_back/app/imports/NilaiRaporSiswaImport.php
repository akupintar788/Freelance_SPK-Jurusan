<?php

namespace App\Imports;

use App\Models\NilaiRapor;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class NilaiRaporSiswaImport implements ToCollection, WithHeadingRow
{
    protected $siswaId;

    public function __construct(int $siswaId)
    {
        $this->siswaId = $siswaId;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            if (!isset($row['mata_pelajaran']) || !isset($row['nilai'])) {
                continue;
            }

            // Update jika matpel, semester, dan tahun ajaran sudah ada, jika belum buat baru
            NilaiRapor::updateOrCreate(
                [
                    'siswa_id'       => $this->siswaId,
                    'mata_pelajaran' => $row['mata_pelajaran'],
                    'semester'       => $row['semester'] ?? 1,
                    'tahun_ajaran'   => $row['tahun_ajaran'] ?? '2024/2025',
                ],
                [
                    'nilai' => $row['nilai']
                ]
            );
        }
    }
}
