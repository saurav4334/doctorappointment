<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'patient_name' => ['required', 'string', 'max:255', "regex:/^[\p{L}\.\s'-]+$/u"],
            'patient_phone' => ['required', 'string', 'regex:/^[0-9+\-\s()]{6,20}$/'],
            'patient_email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'appointment_date.after_or_equal' => 'You cannot book an appointment in the past.',
            'patient_name.regex' => 'Please enter a valid name (letters only).',
            'patient_phone.regex' => 'Please enter a valid phone number.',
        ];
    }
}
