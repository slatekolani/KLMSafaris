@php
    $s = \App\Models\Setting::allValues();
    $blue = $s['color_primary'] ?? '#468BC2';
    $site = preg_replace('#^https?://#', '', url('/'));
    $note = 'You’re receiving this because '.e($subscriber->email).' subscribed at '.e($site).'. '
        .'<a href="'.e($subscriber->unsubscribeUrl()).'" style="color:#8d949a;">Unsubscribe</a>';
@endphp
<x-emails-layout :title="$s['email_newsletter_subject']" :preheader="$s['email_newsletter_text']" :footer-note="$note">
    <h1 style="margin:8px 0 12px;font-size:24px;line-height:1.3;color:#000;">{{ $s['email_newsletter_title'] }}</h1>
    <p style="margin:0 0 20px;">{{ $s['email_newsletter_text'] }}</p>
    <p style="margin:0 0 24px;">
        <a href="{{ url('/tours') }}" style="display:inline-block;background:{{ $blue }};color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;">Explore our trips</a>
        &nbsp; <a href="{{ url('/plan-your-trip') }}" style="color:{{ $blue }};font-size:14px;">Plan your trip →</a>
    </p>
    <p style="margin:0;white-space:pre-line;">{{ $s['email_sign_off'] }}</p>
</x-emails-layout>
