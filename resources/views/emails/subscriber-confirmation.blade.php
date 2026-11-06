@php
    $s = \App\Models\Setting::allValues();
    $blue = $s['color_primary'] ?? '#468BC2';
@endphp
<x-emails-layout title="Confirm your subscription" preheader="Confirm that you would like to receive KLM Safaris emails.">
    <h1 style="margin:8px 0 12px;font-size:24px;line-height:1.3;color:#000;">Confirm your subscription</h1>
    <p style="margin:0 0 20px;">Please confirm that <strong>{{ $subscriber->email }}</strong> should receive occasional Tanzania travel news, safari and Kilimanjaro tips from KLM Safaris.</p>
    <p style="margin:0 0 24px;">
        <a href="{{ $subscriber->confirmationUrl() }}" style="display:inline-block;background:{{ $blue }};color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;">Confirm subscription</a>
    </p>
    <p style="margin:0;color:#555;">If you did not request this, you can safely ignore this email. You will not be subscribed.</p>
</x-emails-layout>
