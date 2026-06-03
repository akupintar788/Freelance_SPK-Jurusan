<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fakultas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FakultasController extends Controller
{
    public function index()
    {
        $fakultas = Fakultas::with('jurusan')->get();
        return response()->json($fakultas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode_fakultas' => 'required|string|unique:fakultas',
            'nama_fakultas' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $fakultas = Fakultas::create($request->all());
        return response()->json($fakultas, 201);
    }

    public function show($id)
    {
        $fakultas = Fakultas::with('jurusan')->find($id);
        if (!$fakultas) {
            return response()->json(['message' => 'Fakultas not found'], 404);
        }
        return response()->json($fakultas);
    }

    public function update(Request $request, $id)
    {
        $fakultas = Fakultas::find($id);
        if (!$fakultas) {
            return response()->json(['message' => 'Fakultas not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'kode_fakultas' => 'required|string|unique:fakultas,kode_fakultas,' . $id,
            'nama_fakultas' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $fakultas->update($request->all());
        return response()->json($fakultas);
    }

    public function destroy($id)
    {
        $fakultas = Fakultas::find($id);
        if (!$fakultas) {
            return response()->json(['message' => 'Fakultas not found'], 404);
        }
        $fakultas->delete();
        return response()->json(['message' => 'Fakultas deleted']);
    }
}
