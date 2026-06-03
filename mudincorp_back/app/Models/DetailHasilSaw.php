<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailHasilSaw extends Model
{
    use HasFactory;
    protected $table = 'detail_hasil_saw';
 
    protected $fillable = ['hasil_saw_id', 'jurusan_id', 'skor_akhir', 'ranking'];
 
    public function hasilSaw()
    {
        return $this->belongsTo(HasilSaw::class);
    }
 
    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class);
    }
}
