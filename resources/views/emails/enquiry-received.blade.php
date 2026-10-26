@php
    $e = $enquiry;
    $blue = \App\Models\Setting::allValues()['color_primary'] ?? '#468BC2';
    $kind = ['planner' => 'trip plan', 'tour' => 'tour enquiry', 'contact' => 'contact message'][$e->source] ?? 'enquiry';
@endphp
<x-emails-layout :title="'New '.$kind" :preheader="$e->name.' — '.$kind">
    <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:{{ $blue }};">New {{ $kind }}</p>
    <h1 style="margin:0 0 6px;font-size:22px;line-height:1.3;color:#000;">{{ $e->name }}{{ $e->tour ? ' — '.$e->tour->title : '' }}</h1>
    <p style="margin:0 0 4px;color:#555;">Received {{ $e->created_at->timezone('Africa/Dar_es_Salaam')->format('l j M Y, H:i') }} (Moshi time). Reply to this email to answer {{ \Illuminate\Support\Str::before($e->name, ' ') }} directly.</p>
    @include('emails.partials.enquiry-details', ['e' => $e, 'showSource' => true])
    <p style="margin:24px 0 0;">
        <a href="mailto:{{ $e->email }}?subject={{ rawurlencode('Re: your KLM Safaris '.$kind) }}" style="display:inline-block;background:{{ $blue }};color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;">Reply to {{ \Illuminate\Support\Str::before($e->name, ' ') }}</a>
        &nbsp; <a href="{{ url('/admin/enquiries') }}" style="color:{{ $blue }};font-size:14px;">Open in the CMS →</a>
    </p>
</x-emails-layout>
