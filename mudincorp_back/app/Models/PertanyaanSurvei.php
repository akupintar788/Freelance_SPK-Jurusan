<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PertanyaanSurvei extends Model
{
    use HasFactory;
    protected $table = 'pertanyaan_survei';
 
    protected $fillable = ['jurusan_id', 'tipe', 'pertanyaan', 'skor_min', 'skor_max'];
 
    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class);
    }
 
    public function jawabanSurvei()
    {
        return $this->hasMany(JawabanSurvei::class, 'pertanyaan_id');
    }
}
