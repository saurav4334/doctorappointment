<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route is already protected by role middleware
    }

    /**
     * Normalize comma-separated multi-value inputs into arrays before validation.
     */
    protected function prepareForValidation(): void
    {
        $toArray = fn ($v) => is_array($v)
            ? $v
            : collect(explode(',', (string) $v))->map(fn ($s) => trim($s))->filter()->values()->all();

        $this->merge([
            'specializations' => $toArray($this->input('specializations')),
            'qualifications' => $toArray($this->input('qualifications')),
            'is_featured' => $this->boolean('is_featured'),
            'is_active' => $this->boolean('is_active'),
        ]);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:100'],
            'specializations' => ['nullable', 'array'],
            'specializations.*' => ['string', 'max:100'],
            'qualifications' => ['nullable', 'array'],
            'qualifications.*' => ['string', 'max:100'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'hospital_name' => ['nullable', 'string', 'max:150'],
            'hospital_id' => ['nullable', 'exists:hospitals,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:80'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'bio' => ['nullable', 'string'],
            'is_featured' => ['boolean'],
            'featured_priority' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
