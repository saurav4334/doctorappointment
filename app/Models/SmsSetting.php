<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsSetting extends Model
{
    protected $fillable = [
        'api_base_url', 'api_key', 'sender_id', 'sms_type',
        'default_country_code', 'enabled', 'admin_phone', 'test_number',
    ];

    protected $casts = [
        'api_key' => 'encrypted',   // never stored/exposed in plain text
        'enabled' => 'boolean',
    ];

    /** The single settings row (created on first access). */
    public static function current(): self
    {
        return static::query()->firstOrCreate([]);
    }

    /** Masked key for display, e.g. "••••••1234". */
    public function maskedApiKey(): ?string
    {
        if (! $this->api_key) {
            return null;
        }

        return str_repeat('•', 6).substr($this->api_key, -4);
    }
}
