<?php

namespace App\Services\VoiceCall;

class VoiceTemplateRenderer
{
    /** Replace {placeholder} tokens with context values (unknown tokens stripped). */
    public function render(?string $text, array $params): string
    {
        if (! $text) {
            return '';
        }

        return trim(preg_replace_callback('/\{(\w+)\}/', function ($m) use ($params) {
            return array_key_exists($m[1], $params) ? (string) $params[$m[1]] : '';
        }, $text));
    }
}
