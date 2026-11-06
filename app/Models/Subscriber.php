<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Subscriber extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['confirmed_at' => 'datetime'];

    protected static function booted(): void
    {
        static::creating(function (Subscriber $subscriber) {
            $subscriber->token ??= Str::random(40);
            $subscriber->confirmation_token ??= Str::random(64);
        });
    }

    public function unsubscribeUrl(): string
    {
        return route('unsubscribe', $this->token);
    }

    public function confirmationUrl(): string
    {
        return route('subscribe.confirm', $this->confirmation_token);
    }

    public function refreshConfirmationToken(): void
    {
        $this->confirmation_token = Str::random(64);
    }

    public function scopeConfirmed($query)
    {
        return $query->whereNotNull('confirmed_at');
    }
}
