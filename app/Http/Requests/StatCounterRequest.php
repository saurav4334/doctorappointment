<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StatCounterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['is_active' => $this->boolean('is_active')]);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'value' => ['required', 'integer', 'min:0'],
            'suffix' => ['nullable', 'string', 'max:10'],
            'icon' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
