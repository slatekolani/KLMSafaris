<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A lodge, camp or hotel KLM uses on its trips (CMS → Accommodation). */
class Accommodation extends Model
{
    public const TYPES = ['Camping', 'Tented camp', 'Lodge', 'Luxury lodge', 'Hotel', 'Beach resort'];

    protected $guarded = ['id'];

    protected $casts = ['gallery' => 'array', 'is_published' => 'boolean'];

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
