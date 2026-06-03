<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NilaiRapor extends Model
{
    use HasFactory;
    protected $table = 'nilai_rapor';
 
    protected $fillable = ['siswa_id', 'mata_pelajaran', 'nilai', 'semester', 'tahun_ajaran'];
 
    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }
}
