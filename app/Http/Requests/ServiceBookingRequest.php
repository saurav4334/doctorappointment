<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_name' => ['required', 'string', 'max:255', "regex:/^[\p{L}\.\s'-]+$/u"],
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s()]{6,20}$/'],
            'address' => ['nullable', 'string', 'max:255'],
            'preferred_date' => ['nullable', 'date', 'after_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_name.regex' => 'Please enter a valid name.',
            'phone.regex' => 'Please enter a valid phone number.',
        ];
    }
}
