<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

/**
 * Export class untuk Maatwebsite Excel.
 * Install: composer require maatwebsite/excel
 */
class RekomendasiExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
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
                $row->nama_siswa,
                $row->kelas,
                $row->rekomendasi_1 ?? '-',
                $row->skor_1        ?? 0,
                $row->rekomendasi_2 ?? '-',
                $row->skor_2        ?? 0,
                $row->rekomendasi_3 ?? '-',
                $row->skor_3        ?? 0,
                $row->dihitung_pada,
            ];
        });
    }

    public function headings(): array
    {
        return $this->headers;
    }

    public function styles(Worksheet $sheet)
    {
        // Style baris header: background hijau tua, teks putih, bold
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF1B5E20'],
                ],
            ],
        ];
    }
}