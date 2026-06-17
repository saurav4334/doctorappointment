<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoiceCallLog extends Model
{
    protected $fillable = [
        'appointment_id', 'recipient_number', 'request_id', 'event_type', 'provider',
        'payload', 'response', 'status', 'error_message', 'dtmf_response', 'sent_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'response' => 'array',
        'sent_at' => 'datetime',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
