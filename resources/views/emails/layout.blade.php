@php
    $s = \App\Models\Setting::allValues();
    $blue = $s['color_primary'] ?? '#468BC2';
    $logo = !empty($s['logo']) ? url($s['logo']) : null;
@endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? ($s['site_name'] ?? 'KLM Safaris') }}</title>
</head>
<body style="margin:0;padding:0;background:#f2f4f6;font-family:Helvetica,Arial,sans-serif;color:#111;">
    @isset($preheader)<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{ $preheader }}</div>@endisset
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f6;padding:24px 12px;">
        <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
                <tr><td style="height:6px;background:{{ $blue }};font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr><td style="padding:24px 32px 8px;">
                    @if($logo)
                        <img src="{{ $logo }}" alt="{{ $s['site_name'] ?? 'KLM Safaris' }}" width="56" height="56" style="display:block;border:0;">
                    @else
                        <p style="margin:0;font-size:20px;font-weight:bold;color:{{ $blue }};">{{ $s['site_name'] ?? 'KLM Safaris' }}</p>
                    @endif
                </td></tr>
                <tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.65;color:#222;">
                    {{ $slot }}
                </td></tr>
                <tr><td style="background:#000000;padding:22px 32px;font-size:12.5px;line-height:1.7;color:#cfd3d6;">
                    <strong style="color:#ffffff;">{{ $s['site_name'] ?? 'KLM Safaris' }}</strong><br>
                    {!! nl2br(e($s['address'] ?? '')) !!}<br>
                    <a href="tel:{{ $s['phone'] ?? '' }}" style="color:#cfd3d6;text-decoration:none;">{{ $s['phone'] ?? '' }}</a>
                    &nbsp;·&nbsp; <a href="mailto:{{ $s['email'] ?? '' }}" style="color:#cfd3d6;text-decoration:none;">{{ $s['email'] ?? '' }}</a>
                    &nbsp;·&nbsp; <a href="{{ url('/') }}" style="color:{{ $blue }};text-decoration:none;">{{ preg_replace('#^https?://#', '', url('/')) }}</a>
                    @isset($footerNote)<br><span style="color:#8d949a;">{!! $footerNote !!}</span>@endisset
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>
