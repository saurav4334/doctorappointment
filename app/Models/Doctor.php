<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'slug',
        'title',
        'specializations',
        'qualifications',
        'gender',
        'hospital_name',
        'hospital_id',
        'department_id',
        'experience_years',
        'consultation_fee',
        'photo',
        'rating',
        'total_reviews',
        'bio',
        'is_featured',
        'featured_priority',
        'is_active',
    ];

    protected $casts = [
        'specializations' => 'array',
        'qualifications' => 'array',
        'consultation_fee' => 'decimal:2',
        'rating' => 'decimal:1',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'experience_years' => 'integer',
        'featured_priority' => 'integer',
        'total_reviews' => 'integer',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(DoctorSchedule::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Best available hospital label: the free-text field, falling back to the relation.
     */
    public function getHospitalLabelAttribute(): ?string
    {
        return $this->hospital_name ?: $this->hospital?->name;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Top Rated Doctors ordering: featured first, then admin priority, then rating.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true)
            ->orderByDesc('featured_priority')
            ->orderByDesc('rating');
    }
}
