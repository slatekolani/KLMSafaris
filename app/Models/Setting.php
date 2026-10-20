<?php

namespace App\Models;

use App\Support\SettingsSchema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $guarded = ['id'];

    /** All settings merged over schema defaults, with JSON fields decoded. */
    public static function allValues(): array
    {
        return Cache::rememberForever('settings', function () {
            $stored = static::pluck('value', 'key')->all();
            $values = [];
            foreach (SettingsSchema::fields() as $key => $field) {
                $raw = $stored[$key] ?? null;
                if (in_array($field['type'], ['repeater', 'list', 'gallery'])) {
                    $values[$key] = $raw !== null ? (json_decode($raw, true) ?: []) : ($field['default'] ?? []);
                } else {
                    $values[$key] = $raw ?? ($field['default'] ?? '');
                }
            }

            return $values;
        });
    }

    public static function put(array $values): void
    {
        foreach ($values as $key => $value) {
            static::updateOrCreate(['key' => $key], ['value' => is_array($value) ? json_encode($value) : $value]);
        }
        Cache::forget('settings');
    }
}
