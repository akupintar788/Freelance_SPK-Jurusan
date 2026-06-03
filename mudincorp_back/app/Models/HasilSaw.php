<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HasilSaw extends Model
{
    use HasFactory;

    protected $table = 'hasil_saw';

    protected $fillable = [
        'siswa_id',
        'jurusan_id',
        'nilai_akhir',
        'ranking',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }

    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class);
    }
}