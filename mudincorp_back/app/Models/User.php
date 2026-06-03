<?php

namespace App\Models;
 
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
 
class User extends Authenticatable
{
    use HasApiTokens;
 
    protected $fillable = ['name', 'nip', 'password', 'role'];
 
    protected $hidden = ['password'];
 
    // Satu user → satu siswa (jika role = siswa)
    public function siswa()
    {
        return $this->hasOne(Siswa::class);
    }
}
