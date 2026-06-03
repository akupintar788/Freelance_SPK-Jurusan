<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JawabanSurvei extends Model
{
    use HasFactory;

    protected $table = 'jawaban_survei';

    // FIX: Sesuaikan dengan nama kolom baru di database & controller kamu
    protected $fillable = [
        'siswa_id',
        'pertanyaan_id', // Menggantikan soal_survei_id
        'skor',          // Menggantikan nilai
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    // FIX: Ubah nama method dan definisikan foreign key secara eksplisit ke PertanyaanSurvei
    public function pertanyaanSurvei()
    {
        return $this->belongsTo(PertanyaanSurvei::class, 'pertanyaan_id');
    }
}