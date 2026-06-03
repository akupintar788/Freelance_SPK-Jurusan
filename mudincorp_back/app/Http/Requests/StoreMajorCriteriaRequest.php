<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMajorCriteriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jurusan_id' => 'required|exists:jurusan,id',
            'kriteria_id' => 'required|exists:kriteria,id',
            'nilai' => 'required|numeric|min:0',
        ];
    }
}
