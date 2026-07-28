<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kriteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class KriteriaController extends Controller
{
    public function index()
    {
        try {
            $kriterias = Kriteria::orderBy('kode')->get();
            return response()->json([
                'success' => true,
                'data' => $kriterias
            ]);
        } catch (\Exception $e) {
            Log::error('Kriteria Index Error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal mengambil data kriteria'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Tambahkan unique check untuk mencegah kode ganda sejak di layer validasi
            'kode' => 'required|string|max:50|unique:kriteria,kode',
            'nama' => 'required|string|max:100',
            'sumber_data' => 'required|in:akademik,survei',
            'tipe' => 'required|in:benefit,cost',
            'bobot' => 'required|numeric|min:0|max:1',
        ], [
            'kode.unique' => 'Kode kriteria sudah digunakan, silakan gunakan kode lain.'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $data = $validator->validated();
            
            $data['is_active'] = 1; 
            
            $maxUrutan = Kriteria::max('urutan') ?? 0;
            $data['urutan'] = $maxUrutan + 1;
            $totalBobot = Kriteria::where('is_active', 1)
            ->sum('bobot');

            $totalBaru = $totalBobot + $data['bobot'];

            if ($totalBaru > 1) {
            return response()->json([
            'success' => false,
            'message' => "Total bobot tidak boleh melebihi 1. Total saat ini: {$totalBobot}"
            ], 422);
            }
            $kriteria = Kriteria::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Kriteria berhasil ditambahkan',
                'data' => $kriteria
            ], 201);
        } catch (\Exception $e) {
            Log::error('Kriteria Store Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal menyimpan ke database.',
                'debug_error' => $e->getMessage() 
            ], 500);
        }
    }

    public function show($id)
    {
        $kriteria = Kriteria::find($id);
        if (!$kriteria) {
            return response()->json(['message' => 'Kriteria tidak ditemukan'], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $kriteria
        ]);
    }

    public function update(Request $request, $id)
    {
        $kriteria = Kriteria::find($id);
        if (!$kriteria) {
            return response()->json(['message' => 'Kriteria tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            // KUNCI PERBAIKAN: Kecualikan ID saat ini dari pengecekan unique kode
            'kode' => 'required|string|max:50|unique:kriteria,kode,' . $id,
            'nama' => 'required|string|max:100',
            'sumber_data' => 'required|in:akademik,survei',
            'tipe' => 'required|in:benefit,cost',
            'bobot' => 'required|numeric|min:0|max:1',
        ], [
            'kode.unique' => 'Kode kriteria sudah digunakan, silakan gunakan kode lain.'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $data = $validator->validated();
            
            $data['is_active'] = $kriteria->is_active ?? 1;
            $data['urutan'] = $kriteria->urutan ?? 1;
         $totalBobot = Kriteria::where('id', '!=', $kriteria->id)
    ->where('is_active', 1)
    ->sum('bobot');

$totalBaru = $totalBobot + $data['bobot'];

if ($totalBaru > 1) {
    return response()->json([
        'success' => false,
        'message' => "Total bobot melebihi 1. Total akan menjadi {$totalBaru}"
    ], 422);
}
            $kriteria->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Kriteria berhasil diperbarui',
                'data' => $kriteria
            ]);
        } catch (\Exception $e) {
            Log::error('Kriteria Update Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memperbarui database.',
                'debug_error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $kriteria = Kriteria::find($id);
            if (!$kriteria) {
                return response()->json(['message' => 'Kriteria tidak ditemukan'], 404);
            }
            $kriteria->delete();
            return response()->json(['message' => 'Kriteria berhasil dihapus']);
        } catch (\Exception $e) {
            Log::error('Kriteria Delete Error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal menghapus data kriteria'], 500);
        }
    }
}