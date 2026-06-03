<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SkorSurvei extends Model
{
    use HasFactory;
    protected $table = 'skor_survei';
 
    protected $fillable = ['siswa_id', 'jurusan_id', 'tipe', 'skor_rata'];
 
    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }
 
    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class);
    }
}
