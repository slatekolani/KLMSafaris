<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['gallery' => 'array', 'highlights' => 'array', 'is_featured' => 'boolean'];

    public function tours()
    {
        return $this->belongsToMany(Tour::class)->where('is_published', true);
    }
}
