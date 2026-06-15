<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    protected $fillable = ['event', 'channel', 'subject', 'body', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public static function for(string $event, string $channel): ?self
    {
        return static::where('event', $event)
            ->where('channel', $channel)
            ->where('is_active', true)
            ->first();
    }
}
