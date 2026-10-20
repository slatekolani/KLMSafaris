<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\SettingsSchema;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function edit()
    {
        $groups = [];
        foreach (SettingsSchema::groups() as $key => $group) {
            $fields = [];
            foreach ($group['fields'] as $name => $field) {
                unset($field['default']);
                $fields[] = ['name' => $name] + $field;
            }
            $groups[] = ['key' => $key, 'label' => $group['label'], 'fields' => $fields];
        }

        return Inertia::render('Admin/Settings', [
            'groups' => $groups,
            'values' => Setting::allValues(),
        ]);
    }

    public function update(Request $request)
    {
        $allowed = array_keys(SettingsSchema::fields());
        Setting::put($request->only($allowed));

        return back()->with('success', 'Settings saved.');
    }
}
