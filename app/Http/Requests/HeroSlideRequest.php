<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HeroSlideRequest extends FormRequest
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
            'subtitle' => ['nullable', 'string', 'max:500'],
            // 'file' (not 'image') so animated GIF / WebP validate reliably across
            // servers without getimagesize() quirks; stored as-is to keep animation.
            'image' => [...$imageRule, 'file', 'mimes:jpeg,jpg,png,webp,gif', 'max:5120'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'button_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
