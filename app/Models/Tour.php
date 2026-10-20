<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['gallery' => 'array', 'highlights' => 'array', 'itinerary' => 'array', 'includes' => 'array', 'excludes' => 'array', 'pricing' => 'array', 'is_featured' => 'boolean', 'is_published' => 'boolean', 'price_from' => 'float'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function destinations()
    {
        return $this->belongsToMany(Destination::class);
    }

    public function enquiries()
    {
        return $this->hasMany(Enquiry::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
