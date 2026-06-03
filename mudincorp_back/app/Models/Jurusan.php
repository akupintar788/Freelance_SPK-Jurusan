<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jurusan extends Model
{
    use HasFactory;
    protected $table = 'jurusan';
 
    protected $fillable = ['fakultas_id', 'kode_jurusan', 'nama_jurusan', 'deskripsi', 'is_active'];
 
    protected $casts = ['is_active' => 'boolean'];
 
    public function fakultas()
    {
        return $this->belongsTo(Fakultas::class);
    }
 
    public function pertanyaanSurvei()
    {
        return $this->hasMany(PertanyaanSurvei::class);
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
 
    // Scope helper — jurusan aktif saja
    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }
}
