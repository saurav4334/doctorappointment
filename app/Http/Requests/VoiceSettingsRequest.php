<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VoiceSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'enabled' => $this->boolean('enabled'),
            'dtmf_enabled' => $this->boolean('dtmf_enabled'),
        ]);
    }

    public function rules(): array
    {
        return [
            'api_endpoint' => ['required', 'url', 'max:255'],
            'api_token' => ['nullable', 'string', 'max:500'],   // blank = keep existing
            'sender_number' => ['nullable', 'string', 'max:20'],
            'voice_type' => ['required', Rule::in(['male', 'female'])],
            'language_code' => ['required', Rule::in(['bn', 'en'])],
            'test_number' => ['nullable', 'string', 'max:20'],
            'enabled' => ['boolean'],
            'dtmf_enabled' => ['boolean'],
        ];
    }
}
