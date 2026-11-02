<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['gallery' => 'array', 'highlights' => 'array', 'itinerary' => 'array', 'includes' => 'array', 'excludes' => 'array', 'pricing' => 'array', 'is_featured' => 'boolean', 'is_published' => 'boolean', 'price_from' => 'float'];

    /** A tour saved without its own includes/excludes starts from its category's lists (CMS → Categories), then stays editable. */
    protected static function booted(): void
    {
        static::saving(function (Tour $tour) {
            if (! $tour->category_id || (! empty($tour->includes) && ! empty($tour->excludes))) {
                return;
            }
            $category = Category::find($tour->category_id);
            if (empty($tour->includes) && ! empty($category?->includes)) {
                $tour->includes = $category->includes;
            }
            if (empty($tour->excludes) && ! empty($category?->excludes)) {
                $tour->excludes = $category->excludes;
            }
        });
    }

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
