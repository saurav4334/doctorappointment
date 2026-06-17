<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoiceCallTemplate extends Model
{
    protected $fillable = [
        'event', 'title', 'start_text', 'question_text', 'end_text',
        'dtmf1_text', 'dtmf2_text', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public static function activeFor(string $event): ?self
    {
        return static::where('event', $event)->where('is_active', true)->first();
    }
}
