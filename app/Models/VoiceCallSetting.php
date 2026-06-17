<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoiceCallSetting extends Model
{
    protected $fillable = [
        'enabled', 'api_endpoint', 'api_token', 'sender_number',
        'voice_type', 'language_code', 'dtmf_enabled', 'test_number',
    ];

    protected $casts = [
        'api_token' => 'encrypted',
        'enabled' => 'boolean',
        'dtmf_enabled' => 'boolean',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([]);
    }

    public function maskedApiToken(): ?string
    {
        if (! $this->api_token) {
            return null;
        }

        return str_repeat('•', 6).substr($this->api_token, -4);
    }
}
