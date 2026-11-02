<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['interests' => 'array', 'travel_date' => 'date:Y-m-d', 'status_changed_at' => 'datetime'];

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }
}
