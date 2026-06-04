<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
// AUTH CONTROLLER
use App\Http\Controllers\API\Auth\AuthController;
// DASHBOARD
use App\Http\Controllers\API\Admin\DashboardController;
// SAW
use App\Http\Controllers\API\SawController;
// ADMIN
use App\Http\Controllers\API\Admin\FakultasController as AdminFakultasController;
use App\Http\Controllers\API\Admin\JurusanController as AdminJurusanController;
use App\Http\Controllers\API\Admin\NilaiRaporController as AdminNilaiRaporController;
use App\Http\Controllers\API\Admin\UserController as AdminUserController;
use App\Http\Controllers\API\Admin\KriteriaController;
use App\Http\Controllers\API\Admin\PertanyaanSurveiController;
use App\Http\Controllers\API\Admin\LaporanController;
// GURU BK
use App\Http\Controllers\API\Admin\SiswaController as GuruBKSiswaController;
use App\Http\Controllers\API\Admin\NilaiSiswaController as GuruBKNilaiSiswaController;
// SISWA
use App\Http\Controllers\API\Siswa\SurveiController;
use App\Http\Controllers\API\Siswa\HasilPerhitunganController;
use App\Http\Controllers\API\Siswa\HasilRekomendasiController;
use App\Http\Controllers\API\Admin\NilaiRaporController;
use App\Http\Controllers\API\Siswa\SiswaDashboardController;
// ======================================================
// AUTH
// ======================================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
// ======================================================
// PROTECTED ROUTES
// ======================================================
Route::middleware('auth:sanctum')->group(function () {
    // ==================================================
    // USER AUTH
    // ==================================================
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [AuthController::class, 'user']);
    // ==================================================
    // DASHBOARD
    // ==================================================
    Route::get('/dashboard', [SiswaDashboardController::class, 'index']);
    // =================================================
    // SAW GLOBAL
    // ==================================================
    Route::post('/saw/{siswa_id}/hitung', [SawController::class, 'hitung']);
    Route::get('/saw/{siswa_id}/hasil', [SawController::class, 'lihatHasil']);
    // ==================================================
    // ADMIN + GURU BK
    // ==================================================

    Route::middleware('role:admin,guru_bk')

        ->prefix('admin')

        ->group(function () {
            // MASTER
            Route::apiResource('fakultas', AdminFakultasController::class);
            Route::apiResource('jurusan', AdminJurusanController::class);
            Route::apiResource('nilai-rapor', AdminNilaiRaporController::class);
            Route::apiResource('users', AdminUserController::class);
            Route::apiResource('siswa', GuruBKSiswaController::class);
            Route::apiResource('nilai-siswa', GuruBKNilaiSiswaController::class);
            // =================================================
            // KRITERIA
            // ==================================================
            Route::get('/kriteria', [KriteriaController::class, 'index']);
            Route::post('/kriteria', [KriteriaController::class, 'store']);
            Route::get('/kriteria/{id}', [KriteriaController::class, 'show']);
            Route::put('/kriteria/{id}', [KriteriaController::class, 'update']);
            Route::delete('/kriteria/{id}', [KriteriaController::class, 'destroy']);
            Route::post('/kriteria/reorder', [KriteriaController::class, 'reorder']);
            Route::post('/kriteria/validate-bobot', [KriteriaController::class, 'validateBobot']);
            Route::get('/dashboard/statistik',[DashboardController::class, 'statistik']);
            Route::get('/dashboard/distribusi-jurusan',[DashboardController::class, 'distribusiJurusan']);
            Route::get('/dashboard/progress-siswa',[DashboardController::class, 'progressSiswa']);
            // ==================================================

            // PERTANYAAN SURVEI

            // ==================================================
            Route::get('/pertanyaan-survei', [PertanyaanSurveiController::class, 'index']);
            Route::post('/pertanyaan-survei', [PertanyaanSurveiController::class, 'store']);
            Route::get('/pertanyaan-survei/{id}', [PertanyaanSurveiController::class, 'show']);
            Route::put('/pertanyaan-survei/{id}', [PertanyaanSurveiController::class, 'update']);
            Route::delete('/pertanyaan-survei/{id}', [PertanyaanSurveiController::class, 'destroy']);
            Route::post('/pertanyaan-survei/bulk-delete', [PertanyaanSurveiController::class, 'bulkDelete']);
            // Tambahkan di bagian // ADMIN + GURU BK
            Route::get('/laporan', [LaporanController::class, 'index']);
            Route::get('/laporan/filter-options', [LaporanController::class, 'filterOptions']);
            Route::get('/laporan/export-pdf', [LaporanController::class,'exportPdf']);
            // ==================================================
            // SAW ADMIN
            // ==================================================
            // TAMBAHKAN DUA BARIS INI UNTUK MENGATASI 404
            Route::get('/saw/results', [SawController::class, 'getAllResults']);
            Route::post('/saw/calculate', [SawController::class, 'calculateAll']);
            // Ini route bawaan kamu sebelumnya (biarkan saja)
            Route::post('/saw/hitung/{siswa_id}', [SawController::class, 'hitung']);
            Route::get('/saw/hasil/{siswa_id}', [SawController::class, 'lihatHasil']);
            Route::post('/saw/hitung/{siswa_id}', [SawController::class, 'hitung']);
            Route::get('/saw/hasil/{siswa_id}', [SawController::class, 'lihatHasil']);
Route::get('/nilai-rapor/siswa/{siswa_id}/export-excel',[NilaiRaporController::class, 'exportExcelSiswa']);
Route::get('/nilai-rapor/siswa/{siswa_id}/export-pdf',[NilaiRaporController::class, 'exportPdfSiswa']);
Route::post('/nilai-rapor/siswa/{siswa_id}/import-excel',[NilaiRaporController::class, 'importExcelSiswa']);
        });

    Route::middleware('role:siswa')

        ->prefix('siswa')

        ->group(function () {
            // =========================
            // SURVEI
            // =========================
            // Mengambil daftar pertanyaan survei (Bakat / Minat)
            Route::get('/pertanyaan-survei', [SurveiController::class, 'index']);
            // Menyimpan jawaban survei siswa (Mengatasi Error POST 404)
            Route::post('/jawaban-survei', [SurveiController::class, 'store']);
            // Cek status pengisian survei siswa
            Route::get('/survei-status', [SurveiController::class, 'status']);
            // Fallback / Route cadangan jika komponen lama masih memanggil /survei
            Route::get('/survei', [SurveiController::class, 'index']);
            Route::post('/survei', [SurveiController::class, 'store']);
            // =========================
            // HASIL REKOMENDASI
            // =========================
            Route::get('/kesiapan-data', [HasilRekomendasiController::class, 'kesiapanData']);
            Route::post('/hitung-rekomendasi', [HasilRekomendasiController::class, 'hitungSendiri']);
            // Mengambil hasil akhir rekomendasi SAW (Mengatasi Error GET 404)
            // Diarahkan ke 'lihatHasilSendiri' atau 'index' sesuai isi controllermu
            Route::get('/hasil-rekomendasi', [HasilRekomendasiController::class, 'lihatHasilSendiri']);

        });

});