<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmbulanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_name',
        'phone',
        'pickup_location',
        'destination',
        'ambulance_type',
        'emergency_level',
        'status',
        'notes',
    ];
}
