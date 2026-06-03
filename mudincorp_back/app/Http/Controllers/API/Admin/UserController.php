<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Siswa; // 👈 TAMBAHKAN INI (Untuk mengenali model Siswa)
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB; // 👈 TAMBAHKAN INI (Untuk mengenali fitur DB Transaction)

class UserController extends Controller
{
        public function index()
    {
        // Mengambil semua data user dari database
        $users = User::all();

        // Mengembalikan data dalam bentuk JSON untuk API frontend
        return response()->json([
            'success' => true,
            'message' => 'Daftar data user berhasil diambil',
            'data' => $users
        ], 200);
    }

    // Anda bisa menambahkan fungsi store, show, update, delete di bawah sini nanti...
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'nip' => 'required|numeric|unique:users,nip',
            'password' => 'required|string|min:8',
            'role' => 'required|in:guru_bk,siswa', // Dikunci: Admin cuma bisa pilih guru_bk atau siswa
            'kelas' => 'required_if:role,siswa|string', // Wajib diisi jika role-nya siswa
            'jurusan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Gunakan transaksi database agar aman ganda
        $user = DB::transaction(function () use ($request) {
            $u = User::create([
                'name' => $request->name,
                'nip' => $request->nip,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            // Jika admin memilih membuat siswa, isi juga tabel siswanya
            if ($request->role === 'siswa') {
                Siswa::create([
                    'user_id' => $u->id,
                    'nama' => $u->name,
                    'kelas' => $request->kelas,
                    'jurusan' => $request->jurusan ?? '-',
                ]);
            }

            return $u;
        });

        return response()->json($user, 201);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        DB::transaction(function () use ($user) { // 👈 Tanda \ di depan DB sudah dihapus karena sudah di-import di atas
            // Jika yang dihapus kebetulan adalah siswa, hapus juga baris di tabel siswa
            if ($user->role === 'siswa' && $user->siswa) {
                $user->siswa->delete();
            }
            $user->delete();
        });

        return response()->json(['message' => 'User berhasil dihapus']);
    }
}