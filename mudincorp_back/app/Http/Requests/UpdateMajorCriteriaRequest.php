<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMajorCriteriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jurusan_id' => 'sometimes|required|exists:jurusan,id',
            'kriteria_id' => 'sometimes|required|exists:kriteria,id',
            'nilai' => 'sometimes|required|numeric|min:0',
        ];
    }
}
