<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->string('nisn')->unique()->nullable()->after('id');
            $table->string('no_telp', 15)->nullable()->after('jurusan');
            $table->string('foto')->nullable()->after('no_telp');
            $table->string('email')->unique()->nullable()->after('foto');
            $table->text('alamat')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn(['nisn', 'no_telp', 'foto', 'email', 'alamat']);
        });
    }
};