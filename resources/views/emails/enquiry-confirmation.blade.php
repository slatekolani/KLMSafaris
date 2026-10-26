@php
    $e = $enquiry;
    $s = \App\Models\Setting::allValues();
    $blue = $s['color_primary'] ?? '#468BC2';
    $first = \Illuminate\Support\Str::before($e->name, ' ') ?: $e->name;
    $text = $e->source === 'planner' ? $s['email_plan_text'] : $s['email_confirm_text'];
@endphp
<x-emails-layout :title="$s['site_name'] ?? 'KLM Safaris'" :preheader="$text">
    <h1 style="margin:8px 0 12px;font-size:24px;line-height:1.3;color:#000;">{{ str_replace('{name}', $first, $s['email_confirm_title']) }}</h1>
    <p style="margin:0 0 8px;">{{ $text }}</p>
    @include('emails.partials.enquiry-details', ['e' => $e])
    <p style="margin:22px 0 6px;">{!! str_replace('{phone}', '<a href="tel:'.e($s['phone']).'" style="color:'.$blue.';">'.e($s['phone']).'</a>', e($s['email_help_line'])) !!}</p>
    <p style="margin:22px 0 0;white-space:pre-line;">{{ $s['email_sign_off'] }}</p>
</x-emails-layout>
