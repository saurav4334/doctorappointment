<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdvertisementRequest extends FormRequest
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
        $imageRule = $this->isMethod('post') ? ['required'] : ['nullable'];

        return [
            'title' => ['required', 'string', 'max:255'],
            'sponsor_name' => ['nullable', 'string', 'max:255'],
            'image' => [...$imageRule, 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'redirect_url' => ['nullable', 'string', 'max:500'],
            'placement' => ['required', Rule::in(['hero_bottom', 'mid_homepage', 'sidebar', 'footer_banner'])],
            'is_active' => ['boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
