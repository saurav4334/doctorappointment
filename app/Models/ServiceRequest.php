<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    protected $fillable = [
        'home_service_id', 'patient_name', 'phone', 'address', 'preferred_date', 'notes', 'status',
    ];

    protected $casts = ['preferred_date' => 'date'];

    public function service(): BelongsTo
    {
        return $this->belongsTo(HomeService::class, 'home_service_id');
    }
}
