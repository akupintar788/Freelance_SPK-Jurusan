<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    use HasFactory;
    protected $table = 'siswa';
 
    protected $fillable = ['user_id', 'nama', 'kelas', 'jurusan'];
 
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function nilaiRapor()
    {
        return $this->hasMany(NilaiRapor::class);
    }
 
    public function nilaiSiswa()
    {
        return $this->hasMany(NilaiSiswa::class);
    }
 
    public function jawabanSurvei()
    {
        return $this->hasMany(JawabanSurvei::class);
    }
 
    public function skorSurvei()
    {
        return $this->hasMany(SkorSurvei::class);
    }
 
    public function matriksKeputusan()
    {
        return $this->hasMany(MatriksKeputusan::class);
    }
 
    public function matriksNormalisasi()
    {
        return $this->hasMany(MatriksNormalisasi::class);
    }
 
    public function hasilSaw()
    {
        return $this->hasOne(HasilSaw::class);
    }
}