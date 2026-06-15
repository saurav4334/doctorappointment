<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorOffDay extends Model
{
    protected $fillable = ['doctor_id', 'date', 'reason'];

    protected $casts = ['date' => 'date'];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
