<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A photo on the public Gallery page (CMS → Gallery). */
class GalleryPhoto extends Model
{
    public const CATEGORIES = ['Kilimanjaro & treks', 'Safari & wildlife', 'Day trips', 'Zanzibar', 'Culture & people', 'Lodges & camps', 'Volunteering & community'];

    protected $guarded = ['id'];

    protected $casts = ['is_published' => 'boolean'];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
