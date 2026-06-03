<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration FINAL — satu file, semua tabel, urutan FK aman.
 *
 * Perubahan dari versi sebelumnya:
 * - Tabel jurusan: tambah kolom `deskripsi` (text, nullable) dan `is_active` (boolean)
 *   karena dibutuhkan oleh SawService, HasilRekomendasiController, DashboardController.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ===================================================================
        // 1. TABEL MASTER UTAMA
        // ===================================================================

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('nip')->unique()->nullable();
            $table->string('password');
            $table->string('role')->default('siswa'); // admin | guru_bk | siswa
            $table->timestamps();
        });

        Schema::create('siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nama');
            $table->string('kelas');
            $table->string('jurusan')->default('-');
            $table->timestamps();
        });

        Schema::create('fakultas', function (Blueprint $table) {
            $table->id();
            $table->string('kode_fakultas')->unique();
            $table->string('nama_fakultas');
            $table->timestamps();
        });

        Schema::create('jurusan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fakultas_id')->constrained('fakultas')->onDelete('cascade');
            $table->string('kode_jurusan')->unique();
            $table->string('nama_jurusan');
            // ✅ TAMBAHAN: dibutuhkan SawService (filter jurusan aktif)
            //              dan HasilRekomendasiController (tampil deskripsi ke siswa)
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('kriteria', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 10)->unique();  // C1, C2, C3 ...
            $table->string('nama');
            $table->enum('tipe', ['benefit', 'cost']);
            $table->float('bobot');                // 0.0 - 1.0, total semua = 1.0
            $table->string('sumber_data');         // 'akademik' | 'survei'
            $table->boolean('is_active')->default(true);
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // ===================================================================
        // 2. TABEL INPUT DATA & NILAI
        // ===================================================================

        Schema::create('nilai_rapor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->string('mata_pelajaran');
            $table->float('nilai');           // 0 - 100
            $table->integer('semester');      // 1 - 6
            $table->string('tahun_ajaran', 20); // contoh: 2024/2025
            $table->timestamps();

            $table->unique(
                ['siswa_id', 'mata_pelajaran', 'semester', 'tahun_ajaran'],
                'uq_nilai_rapor'
            );
        });

        Schema::create('nilai_siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->foreignId('kriteria_id')->constrained('kriteria')->onDelete('cascade');
            $table->float('nilai'); // Nilai final per kriteria → bahan matriks SAW
            $table->timestamps();

            $table->unique(['siswa_id', 'kriteria_id']);
        });

        Schema::create('pertanyaan_survei', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jurusan_id')->constrained('jurusan')->onDelete('cascade');
            $table->enum('tipe', ['bakat', 'minat']);
            $table->text('pertanyaan');
            $table->integer('skor_min')->default(1);
            $table->integer('skor_max')->default(5);
            $table->timestamps();
        });

        Schema::create('jawaban_survei', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->foreignId('pertanyaan_id')
                  ->references('id')->on('pertanyaan_survei')->onDelete('cascade');
            $table->integer('skor'); // 1 - 5
            $table->timestamps();

            // Satu siswa tidak boleh jawab soal yang sama dua kali
            $table->unique(['siswa_id', 'pertanyaan_id'], 'uq_jawaban_survei');
        });

        Schema::create('skor_survei', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->foreignId('jurusan_id')->constrained('jurusan')->onDelete('cascade');
            $table->enum('tipe', ['bakat', 'minat']);
            $table->float('skor_rata');
            $table->timestamps();

            // Satu siswa, satu jurusan, satu tipe = satu baris
            $table->unique(['siswa_id', 'jurusan_id', 'tipe'], 'uq_skor_survei');
        });

        // ===================================================================
        // 3. TABEL SISTEM PERHITUNGAN SAW
        // ===================================================================

        Schema::create('matriks_keputusan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->foreignId('jurusan_id')->constrained('jurusan')->onDelete('cascade');
            $table->foreignId('kriteria_id')->constrained('kriteria')->onDelete('cascade');
            $table->float('nilai'); // Nilai mentah X[i][j]
            $table->timestamps();

            $table->unique(['siswa_id', 'jurusan_id', 'kriteria_id'], 'uq_matriks_keputusan');
        });

        Schema::create('matriks_normalisasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->foreignId('jurusan_id')->constrained('jurusan')->onDelete('cascade');
            $table->foreignId('kriteria_id')->constrained('kriteria')->onDelete('cascade');
            $table->float('nilai_normalisasi'); // R[i][j]
            $table->float('nilai_terbobot');    // R[i][j] × bobot
            $table->timestamps();
        });

        // ===================================================================
        // 4. TABEL HASIL & REKOMENDASI AKHIR
        // ===================================================================

        Schema::create('hasil_saw', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->unique()->constrained('siswa')->onDelete('cascade');
            $table->foreignId('jurusan_rekomendasi_id')->constrained('jurusan')->onDelete('cascade');
            $table->float('skor_tertinggi');
            $table->timestamp('dihitung_pada');
            $table->timestamps();
        });

        Schema::create('detail_hasil_saw', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hasil_saw_id')->constrained('hasil_saw')->onDelete('cascade');
            $table->foreignId('jurusan_id')->constrained('jurusan')->onDelete('cascade');
            $table->float('skor_akhir'); // V[i] total nilai terbobot
            $table->integer('ranking');
            $table->timestamps();
        });
        Schema::create('personal_access_tokens', function (Blueprint $table) {
    $table->id();
    $table->morphs('tokenable');
    $table->string('name');
    $table->string('token', 64)->unique();
    $table->text('abilities')->nullable();
   $table->timestamp('last_used_at')->nullable();
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
});

    }

    public function down(): void
    {
        Schema::dropIfExists('detail_hasil_saw');
        Schema::dropIfExists('hasil_saw');
        Schema::dropIfExists('matriks_normalisasi');
        Schema::dropIfExists('matriks_keputusan');
        Schema::dropIfExists('skor_survei');
        Schema::dropIfExists('jawaban_survei');
        Schema::dropIfExists('pertanyaan_survei');
        Schema::dropIfExists('nilai_siswa');
        Schema::dropIfExists('nilai_rapor');
        Schema::dropIfExists('kriteria');
        Schema::dropIfExists('jurusan');
        Schema::dropIfExists('fakultas');
        Schema::dropIfExists('siswa');
        Schema::dropIfExists('users');
        Schema::dropIfExists('personal_access_tokens');
    }
    
};