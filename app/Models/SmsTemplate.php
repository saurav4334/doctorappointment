<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsTemplate extends Model
{
    protected $fillable = ['event', 'title', 'body', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public static function activeFor(string $event): ?self
    {
        return static::where('event', $event)->where('is_active', true)->first();
    }
}
