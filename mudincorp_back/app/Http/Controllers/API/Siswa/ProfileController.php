<?php

namespace App\Http\Controllers\API\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $siswa = $request->user()->siswa;

        if (!$siswa) {
            return response()->json(['message' => 'Data siswa tidak ditemukan'], 404);
        }
        $siswa->nisn = $request->user()->nip;
        return response()->json([
            'success' => true,
            'data'    => $siswa
        ]);
    }

    public function update(Request $request)
    {
        $siswa = $request->user()->siswa;

        if (!$siswa) {
            return response()->json(['message' => 'Data siswa tidak ditemukan'], 404);
        }

        $request->validate([
            'nama'    => 'required|string|max:255',
            'no_telp' => 'nullable|string|max:15',
            'email'   => 'nullable|email|unique:siswa,email,' . $siswa->id,
            'alamat'  => 'nullable|string',
            'foto'    => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = [
            'nama'    => $request->nama,
            'no_telp' => $request->no_telp,
            'email'   => $request->email,
            'alamat'  => $request->alamat,
        ];

        if ($request->hasFile('foto')) {
            if ($siswa->foto && Storage::disk('public')->exists($siswa->foto)) {
                Storage::disk('public')->delete($siswa->foto);
            }
            $data['foto'] = $request->file('foto')->store('foto_siswa', 'public');
        }

        $siswa->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data'    => $siswa
        ]);
    }
}