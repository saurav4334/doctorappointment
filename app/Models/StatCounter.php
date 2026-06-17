<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatCounter extends Model
{
    protected $fillable = ['title', 'value', 'suffix', 'icon', 'sort_order', 'is_active'];

    protected $casts = [
        'value' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
