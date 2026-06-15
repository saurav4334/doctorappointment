<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportMap extends Model
{
    protected $fillable = ['source_table', 'source_id', 'target_id'];
}
