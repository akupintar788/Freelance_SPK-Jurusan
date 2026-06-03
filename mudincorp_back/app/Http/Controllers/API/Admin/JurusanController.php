<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jurusan;
use App\Models\Fakultas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JurusanController extends Controller
{
    public function index()
    {
        $jurusan = Jurusan::with('fakultas')->get();
        return response()->json($jurusan);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fakultas_id' => 'required|exists:fakultas,id',
            'kode_jurusan' => 'required|string|unique:jurusan',
            'nama_jurusan' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $jurusan = Jurusan::create($request->all());
        return response()->json($jurusan, 201);
    }

    public function show($id)
    {
        $jurusan = Jurusan::with('fakultas')->find($id);
        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan not found'], 404);
        }
        return response()->json($jurusan);
    }

    public function update(Request $request, $id)
    {
        $jurusan = Jurusan::find($id);
        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'fakultas_id' => 'required|exists:fakultas,id',
            'kode_jurusan' => 'required|string|unique:jurusan,kode_jurusan,' . $id,
            'nama_jurusan' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $jurusan->update($request->all());
        return response()->json($jurusan);
    }

    public function destroy($id)
    {
        $jurusan = Jurusan::find($id);
        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan not found'], 404);
        }
        $jurusan->delete();
        return response()->json(['message' => 'Jurusan deleted']);
    }
}
