<?php

namespace App\Http\Controllers\API\Admin; // 👈 Sesuaikan dengan folder kamu

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator; // 👈 TAMBAHAN: Biar gak error class not found

class SiswaController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'nip' => 'required|numeric|unique:users,nip', // NIP/NISN untuk login siswa nanti
            'password' => 'required|string|min:8',
            'kelas' => 'required|string',
            'jurusan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $siswa = DB::transaction(function () use ($request) {
            // 1. Buat user login dengan role 'siswa' secara otomatis
            $user = User::create([
                'name' => $request->name,
                'nip' => $request->nip,
                'password' => Hash::make($request->password),
                'role' => 'siswa',
            ]);

            // 2. Buat profil detail siswa
            return Siswa::create([
                'user_id' => $user->id,
                'nama' => $user->name,
                'kelas' => $request->kelas,
                'jurusan' => $request->jurusan ?? '-',
            ]);
        });

        return response()->json($siswa->load('user'), 201);
    }

    public function destroy($id)
    {
        // 👈 PERBAIKAN LOGIKA: Cari dulu datanya di tabel siswa berdasarkan ID siswa
        $siswa = Siswa::find($id);
        if (!$siswa) {
            return response()->json(['message' => 'Siswa not found'], 404);
        }

        DB::transaction(function () use ($siswa) {
            // 1. Hapus akun login-nya dulu di tabel users via relasi
            if ($siswa->user) {
                $siswa->user()->delete();
            }
            // 2. Baru hapus data profil siswanya
            $siswa->delete();
        });

        return response()->json(['message' => 'Data Siswa dan akun login berhasil dihapus']);
    }
    public function index()
    {
        $siswa = Siswa::with('user')
            ->whereHas('user', function ($query) {
                $query->where('role', 'siswa');
            })
            ->get();

        return response()->json(
            $siswa->map(function ($item) {
                return [
                    'id' => $item->id,
                    'user_id' => $item->user_id,
                    'nama' => $item->user?->name,
                    'nisn' => $item->user?->nip,
                    'kelas' => $item->kelas,
                    'jurusan' => $item->jurusan,
                    'role' => $item->user?->role, // optional
                ];
            })
        );
    }

    public function show($id)
    {
        try {

            $siswa = User::where('role', 'siswa')
                ->find($id);

            if (!$siswa) {
                return response()->json([
                    'message' => 'Siswa tidak ditemukan'
                ], 404);
            }

            return response()->json($siswa);
        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Terjadi kesalahan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
