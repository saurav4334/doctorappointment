<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsLog extends Model
{
    protected $fillable = [
        'recipient_number', 'message', 'event_type', 'provider',
        'status', 'response_body', 'error_message', 'sent_at', 'appointment_id', 'user_id',
    ];

    protected $casts = ['sent_at' => 'datetime'];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
