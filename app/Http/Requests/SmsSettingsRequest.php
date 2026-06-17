<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SmsSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['enabled' => $this->boolean('enabled')]);
    }

    public function rules(): array
    {
        return [
            'api_base_url' => ['required', 'url', 'max:255'],
            'api_key' => ['nullable', 'string', 'max:255'],     // blank = keep existing
            'sender_id' => ['nullable', 'string', 'max:50'],
            'sms_type' => ['required', Rule::in(['text', 'unicode'])],
            'default_country_code' => ['required', 'string', 'max:5'],
            'admin_phone' => ['nullable', 'string', 'max:20'],
            'test_number' => ['nullable', 'string', 'max:20'],
            'enabled' => ['boolean'],
        ];
    }
}
