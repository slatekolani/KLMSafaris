<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Subscriber extends Model
{
    protected $guarded = ['id'];

    protected $casts = [];

    protected static function booted(): void
    {
        static::creating(fn (Subscriber $s) => $s->token ??= Str::random(40));
    }

    public function unsubscribeUrl(): string
    {
        return route('unsubscribe', $this->token);
    }
}
