<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\Subscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnquiryController extends Controller
{
    public const STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'booked', 'closed'];

    public function index(Request $request)
    {
        $enquiries = Enquiry::with('tour:id,title,slug')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('q'), fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$request->q}%")
                ->orWhere('email', 'like', "%{$request->q}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $counts = Enquiry::selectRaw('status, count(*) as c')->groupBy('status')->pluck('c', 'status');

        return Inertia::render('Admin/Enquiries', [
            'enquiries' => $enquiries,
            'statuses' => self::STATUSES,
            'counts' => $counts,
            'filters' => $request->only('status', 'q'),
        ]);
    }

    public function update(Request $request, Enquiry $enquiry)
    {
        // Status buttons save on their own (only "status" is sent); the notes box saves both.
        $data = $request->validate([
            'status' => 'required|in:'.implode(',', self::STATUSES),
            'notes' => 'sometimes|nullable|string',
        ]);
        // Remember who moved it and when, so the whole team sees the same progress.
        if ($data['status'] !== $enquiry->status) {
            $data['status_changed_by'] = $request->user()?->name;
            $data['status_changed_at'] = now();
        }
        $enquiry->update($data);

        return back()->with('success', 'Enquiry marked "'.$enquiry->status.'".');
    }

    public function destroy(Enquiry $enquiry)
    {
        $enquiry->delete();

        return back()->with('success', 'Enquiry deleted.');
    }

    public function subscribers()
    {
        return Inertia::render('Admin/Subscribers', [
            'subscribers' => Subscriber::latest()->paginate(50),
        ]);
    }

    public function exportSubscribers()
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['email', 'subscribed_at']);
            Subscriber::orderBy('id')->each(fn ($s) => fputcsv($out, [$s->email, $s->created_at]));
            fclose($out);
        }, 'subscribers.csv', ['Content-Type' => 'text/csv']);
    }

    public function destroySubscriber(Subscriber $subscriber)
    {
        $subscriber->delete();

        return back()->with('success', 'Subscriber removed.');
    }
}
