@php $blue = \App\Models\Setting::allValues()['color_primary'] ?? '#468BC2'; @endphp
<x-emails-layout title="New newsletter subscriber" :preheader="$subscriber->email.' joined the newsletter'">
    <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:{{ $blue }};">Newsletter</p>
    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#000;">New subscriber</h1>
    <p style="margin:0 0 6px;"><a href="mailto:{{ $subscriber->email }}" style="color:{{ $blue }};">{{ $subscriber->email }}</a> joined the newsletter on {{ $subscriber->created_at->timezone('Africa/Dar_es_Salaam')->format('j M Y, H:i') }} (Moshi time).</p>
    <p style="margin:0 0 20px;color:#555;">You now have {{ \App\Models\Subscriber::count() }} subscribers.</p>
    <a href="{{ url('/admin/subscribers') }}" style="display:inline-block;background:{{ $blue }};color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;">View subscribers in the CMS</a>
</x-emails-layout>
