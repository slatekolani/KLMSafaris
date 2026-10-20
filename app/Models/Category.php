<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['show_in_menu' => 'boolean', 'show_on_home' => 'boolean'];

    public function tours()
    {
        return $this->hasMany(Tour::class)->where('is_published', true)->orderBy('sort_order');
    }
}
