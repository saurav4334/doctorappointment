<?php

namespace App\Services\Sms;

class SmsTemplateRenderer
{
    /** Replace {placeholder} tokens with context values (unknown tokens are stripped). */
    public function render(string $body, array $params): string
    {
        $rendered = preg_replace_callback('/\{(\w+)\}/', function ($m) use ($params) {
            return array_key_exists($m[1], $params) ? (string) $params[$m[1]] : '';
        }, $body);

        return trim($rendered);
    }
}
