<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $files = $this->files();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($files);
        }

        return Inertia::render('Admin/Media', ['files' => $files]);
    }

    public function store(Request $request)
    {
        $request->validate(['files' => 'required|array', 'files.*' => 'file|mimes:jpg,jpeg,png,webp,gif,svg,avif,mp4,webm|max:81920']);

        $urls = [];
        foreach ($request->file('files') as $file) {
            $path = $file->store('uploads/'.now()->format('Y/m'), 'public');
            $urls[] = '/storage/'.$path;
        }

        if ($request->header('X-Inertia')) {
            return back()->with('success', count($urls).' file(s) uploaded.');
        }

        return response()->json(['urls' => $urls]);
    }

    public function destroy(Request $request)
    {
        $path = $request->validate(['path' => 'required|string'])['path'];
        abort_unless(str_starts_with($path, 'uploads/') && ! str_contains($path, '..'), 403);
        Storage::disk('public')->delete($path);

        return back()->with('success', 'File deleted.');
    }

    private function files(): array
    {
        $disk = Storage::disk('public');

        return collect($disk->allFiles('uploads'))
            ->filter(fn ($p) => ! str_starts_with(basename($p), '.'))
            ->map(fn ($p) => [
                'path' => $p,
                'url' => '/storage/'.$p,
                'name' => basename($p),
                'size' => $disk->size($p),
                'modified' => $disk->lastModified($p),
            ])
            ->sortByDesc('modified')
            ->values()
            ->all();
    }
}
