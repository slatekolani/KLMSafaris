<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin login comes from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
        $email = env('ADMIN_EMAIL', 'admin@klmsafaris.com');
        User::updateOrCreate(['email' => $email], [
            'name' => 'KLM Admin',
            'password' => Hash::make(env('ADMIN_PASSWORD') ?: Str::random(20)),
        ]);

        $this->call(ContentSeeder::class);
    }
}
