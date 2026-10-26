@php
    $blue = \App\Models\Setting::allValues()['color_primary'] ?? '#468BC2';
    $source = ['planner' => 'Trip planner', 'tour' => 'Tour enquiry', 'contact' => 'Contact form'][$e->source] ?? ucfirst((string) $e->source);
    $travellers = trim(($e->adults ? $e->adults.' adult'.($e->adults > 1 ? 's' : '') : '').($e->children ? ', '.$e->children.' child'.($e->children > 1 ? 'ren' : '') : ''));
    $rows = array_filter([
        'Name' => e($e->name),
        'Email' => '<a href="mailto:'.e($e->email).'" style="color:'.$blue.';">'.e($e->email).'</a>',
        'Phone / WhatsApp' => $e->phone ? e($e->phone) : null,
        'Country' => $e->country ? e($e->country) : null,
        'Trip' => $e->tour ? '<a href="'.url('/tours/'.$e->tour->slug).'" style="color:'.$blue.';">'.e($e->tour->title).'</a>' : null,
        'Travel date' => $e->travel_date ? e($e->travel_date->format('j M Y')) : null,
        'Travellers' => $travellers ? e($travellers) : null,
        'Trip length' => $e->nights ? e(($e->nights + 1).' days · '.$e->nights.' nights') : null,
        'Style / budget' => $e->budget ? e($e->budget) : null,
        'Interests' => $e->interests ? e(implode(' · ', $e->interests)) : null,
        'Sent from' => ($showSource ?? false) ? e($source) : null,
    ]);
@endphp
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;font-size:14px;">
    @foreach($rows as $label => $value)
        <tr>
            <td style="padding:9px 12px 9px 0;border-bottom:1px solid #eceef0;color:#6b7278;width:34%;vertical-align:top;">{{ $label }}</td>
            <td style="padding:9px 0;border-bottom:1px solid #eceef0;color:#111;vertical-align:top;">{!! $value !!}</td>
        </tr>
    @endforeach
</table>
@if($e->message)
    <p style="margin:18px 0 6px;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:#6b7278;">Message{{ $e->source === 'planner' ? ' & trip plan' : '' }}</p>
    <div style="background:#f5f7f9;border-left:3px solid {{ $blue }};padding:14px 16px;font-size:14px;line-height:1.65;color:#222;">{!! nl2br(e($e->message)) !!}</div>
@endif
