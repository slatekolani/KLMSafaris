<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['is_consultant' => 'boolean'];
}
