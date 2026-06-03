<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class NilaiRaporSiswaExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    protected $data;
    protected $headers;

    public function __construct($data, array $headers)
    {
        $this->data    = $data;
        $this->headers = $headers;
    }

    public function collection()
    {
        return collect($this->data)->map(function ($row) {
            return [
                $row->mata_pelajaran,
                $row->nilai,
                $row->semester,
                $row->tahun_ajaran,
            ];
        });
    }

    public function headings(): array
    {
        return $this->headers;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF1E3A8A'], // Warna Navy Blue untuk membedakan
                ],
            ],
        ];
    }
}