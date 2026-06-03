<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatriksNormalisasi extends Model
{
    use HasFactory;
    protected $table = 'matriks_normalisasi';
 
    protected $fillable = ['siswa_id', 'jurusan_id', 'kriteria_id', 'nilai_normalisasi', 'nilai_terbobot'];
 
    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }
 
    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class);
    }
 
    public function kriteria()
    {
        return $this->belongsTo(Kriteria::class);
    }
}
