<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\NilaiSiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NilaiSiswaController extends Controller
{
    public function index()
    {
        $nilaiSiswas = NilaiSiswa::with('siswa', 'kriteria')->get();
        return response()->json($nilaiSiswas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'siswa_id' => 'required|exists:siswa,id',
            'kriteria_id' => 'required|exists:kriteria,id',
            'nilai' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();
        $nilaiSiswa = NilaiSiswa::updateOrCreate(
            [
                'siswa_id' => $data['siswa_id'],
                'kriteria_id' => $data['kriteria_id'],
            ],
            ['nilai' => $data['nilai']]
        );
        $nilaiSiswa->load('siswa', 'kriteria');

        return response()->json($nilaiSiswa, 201);
    }

    public function show($id)
    {
        $nilaiSiswa = NilaiSiswa::with('siswa', 'kriteria')->find($id);
        if (!$nilaiSiswa) {
            return response()->json(['message' => 'Nilai Siswa not found'], 404);
        }
        return response()->json($nilaiSiswa);
    }

    public function update(Request $request, $id)
    {
        $nilaiSiswa = NilaiSiswa::find($id);
        if (!$nilaiSiswa) {
            return response()->json(['message' => 'Nilai Siswa not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'siswa_id' => 'required|exists:siswa,id',
            'kriteria_id' => 'required|exists:kriteria,id',
            'nilai' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $nilaiSiswa->update($validator->validated());
        return response()->json($nilaiSiswa);
    }

    public function destroy($id)
    {
        $nilaiSiswa = NilaiSiswa::find($id);
        if (!$nilaiSiswa) {
            return response()->json(['message' => 'Nilai Siswa not found'], 404);
        }
        $nilaiSiswa->delete();
        return response()->json(['message' => 'Nilai Siswa deleted']);
    }
}
