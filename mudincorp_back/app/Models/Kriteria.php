<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kriteria extends Model
{
    protected $table    = 'kriteria';
    protected $fillable = ['kode', 'nama', 'tipe', 'bobot', 'sumber_data', 'is_active', 'urutan'];
    protected $casts    = ['is_active' => 'boolean', 'bobot' => 'float'];

    public function nilaiSiswa()        { return $this->hasMany(NilaiSiswa::class); }
    public function matriksKeputusan()  { return $this->hasMany(MatriksKeputusan::class); }
    public function matriksNormalisasi(){ return $this->hasMany(MatriksNormalisasi::class); }

    public function scopeAktif($query)  { return $query->where('is_active', true)->orderBy('urutan'); }
}