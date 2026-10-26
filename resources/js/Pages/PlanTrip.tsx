import { Link, useForm } from '@inertiajs/react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import CountrySelect from '@/Components/CountrySelect';
import Icon from '@/Components/Icon';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, img, initials, money, useShared, whatsappLink } from '@/lib/utils';
import type { TeamMember } from '@/types';

/* ---------------------------------------------------------------- Types */
type Pkg = { id: number; title: string; slug: string; image: string | null; days: number; price: number | null; popular?: boolean };
type Rate = [number, number] | null;
type Planner = {
    images: Record<string, string | null>;
    climbs: { route: string; options: Pkg[] }[];
    parks: { slug: string; name: string; image: string | null; planner_days: number }[];
    safari: Record<Style, { rate: Rate; tours: Pkg[] }>;
    beach: Record<'standard' | 'luxury', { rate: Rate; tours: Pkg[] }>;
    dayTrips: Pkg[];
};
type Copy = Record<string, any>;
type Props = {
    planner: Planner;
    copy: Copy;
    tour: { id: number; title: string; slug: string; group_name: string | null; duration_days: number; difficulty: string | null; category: { slug: string } | null } | null;
    consultant: TeamMember | null;
};
type Part = 'climb' | 'safari' | 'beach' | 'daytrips';
type Style = 'Camping' | 'Lodge' | 'Luxury';
type Range = [number, number];
type Leg = { days: Range; title: string; sub: string; part: Part | 'travel'; pending?: boolean };
type Line = { label: string; range: Range | null };
type Season = { title?: string; safari?: string; safari_caution?: string; climb?: string; climb_caution?: string; beach?: string; beach_caution?: string };

const PART_KEYS: Part[] = ['climb', 'safari', 'beach', 'daytrips'];
const PART_IMAGE: Record<Part, string> = { climb: 'kilimanjaro', safari: 'safari', beach: 'zanzibar', daytrips: 'day-tours' };
const CATEGORY_PART: Record<string, Part> = { kilimanjaro: 'climb', safari: 'safari', zanzibar: 'beach', 'day-tours': 'daytrips' };

const r10 = (n: number) => Math.round(n / 10) * 10;
const fmt = (r: Range) => (r[0] === r[1] ? money(r[0]) : `${money(r[0])} – ${money(r[1])}`);
const span = (r: Range) => (r[0] === r[1] ? `${r[0]}` : `${r[0]}–${r[1]}`);
const closest = (list: Pkg[], days: number) => [...list].sort((a, b) => Math.abs(a.days - days) - Math.abs(b.days - days))[0];
const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) && String(v) !== '' ? Number(v) : fallback);

/* ================================================================ Page */
export default function PlanTrip({ planner, copy, tour, consultant }: Props) {
    const { settings } = useShared();

    /* ---------- CMS copy helpers ---------- */
    const c = (key: string) => String(copy[key] ?? '');
    const t = (key: string, vars: Record<string, string | number> = {}) => c(key).replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ''));
    const unit = (n: number | Range, one: string, many: string) => {
        const r: Range = Array.isArray(n) ? n : [n, n];
        return `${span(r)} ${r[1] === 1 ? c(one) : c(many)}`;
    };
    const days = (n: number | Range) => unit(n, 'plan_word_day', 'plan_word_days');
    const nights = (n: number | Range) => unit(n, 'plan_word_night', 'plan_word_nights');

    const rules = {
        minAge: num(copy.plan_climb_min_age, 16),
        seats: num(copy.plan_vehicle_seats, 6),
        safariDefault: num(copy.plan_default_safari_days, 4),
        beachDefault: num(copy.plan_default_beach_nights, 4),
        beachMin: num(copy.plan_min_beach_nights, 2),
        max: num(copy.plan_max_days, 14),
        meru: c('plan_meru_route') || 'Mount Meru',
    };
    const seasons: Season[] = Array.isArray(copy.plan_seasons) ? copy.plan_seasons : [];
    const routeNotes: { title: string; note: string }[] = Array.isArray(copy.plan_route_notes) ? copy.plan_route_notes : [];
    const parties: { title: string; icon: string; adults: string; children: string }[] = Array.isArray(copy.plan_parties) ? copy.plan_parties : [];
    const parkDays = (slug: string) => planner.parks.find((p) => p.slug === slug)?.planner_days ?? 1;

    // KLM's Kilimanjaro packages (not Meru): the honest range before a package is chosen.
    const kili = planner.climbs.filter((r) => r.route !== rules.meru).flatMap((r) => r.options);
    const kiliDays: Range = kili.length ? [Math.min(...kili.map((o) => o.days)), Math.max(...kili.map((o) => o.days))] : [6, 9];
    const kiliPrices = kili.map((o) => o.price ?? 0).filter(Boolean);

    /* ---------- Arriving from an experience, destination or tour page ---------- */
    const preset = useMemo(() => {
        const q = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const out = { parts: [] as Part[], parks: [] as string[], climb: null as number | 'help' | null, safariDays: null as number | null, beachNights: null as number | null, style: '' as Style | '', dayTrips: [] as number[] };
        const add = (p: Part) => { if (!out.parts.includes(p)) out.parts.push(p); };
        const cat = q.get('category'); if (cat && CATEGORY_PART[cat]) add(CATEGORY_PART[cat]);
        const dest = q.get('destination');
        if (dest === 'kilimanjaro') add('climb');
        else if (dest === 'zanzibar') add('beach');
        else if (dest) { add('safari'); if (planner.parks.some((p) => p.slug === dest)) out.parks.push(dest); }
        const p = tour?.category ? CATEGORY_PART[tour.category.slug] : undefined;
        if (tour && p) {
            add(p);
            if (p === 'climb' && kili.concat(planner.climbs.flatMap((r) => r.options)).some((o) => o.id === tour.id)) out.climb = tour.id;
            if (p === 'safari') { out.safariDays = Math.max(2, tour.duration_days - 1); if (['Camping', 'Lodge', 'Luxury'].includes(tour.difficulty ?? '')) out.style = tour.difficulty as Style; }
            if (p === 'beach') out.beachNights = Math.max(rules.beachMin, tour.duration_days - 1);
            if (p === 'daytrips') out.dayTrips = [tour.id];
        }
        return out;
    }, [tour]); // eslint-disable-line react-hooks/exhaustive-deps

    const [parts, setParts] = useState<Part[]>(preset.parts);
    const [climb, setClimb] = useState<number | 'help' | null>(preset.climb); // null = not decided yet
    const [parks, setParks] = useState<string[]>(preset.parks);
    const [safariOverride, setSafariOverride] = useState<number | null>(preset.safariDays);
    const [beachNights, setBeachNights] = useState(preset.beachNights ?? rules.beachDefault);
    const [dayTrips, setDayTrips] = useState<number[]>(preset.dayTrips);
    const [month, setMonth] = useState(''); // 'flexible' | 'YYYY-MM-01' | exact date
    const [exact, setExact] = useState(false);
    const [party, setParty] = useState('');
    const [style, setStyle] = useState<Style | ''>(preset.style);
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);

    const has = (p: Part) => parts.includes(p);
    /* ---------- Guided flow: after a choice, move the visitor on ---------- */
    const continueRef = useRef<HTMLDivElement>(null);
    const [nudge, setNudge] = useState(false);
    const [prompt, setPrompt] = useState<{ item: string; done: () => void } | null>(null);
    const toContinue = () => {
        setPrompt(null);
        window.setTimeout(() => {
            continueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setNudge(true);
            window.setTimeout(() => setNudge(false), 1800);
        }, 80);
    };
    // On "Shape it", finishing one part leads to the next part on the page; after the last one, to Continue.
    const nextAfter = (part: Part) => {
        setPrompt(null);
        const following = PART_KEYS.filter((p) => parts.includes(p) && PART_KEYS.indexOf(p) > PART_KEYS.indexOf(part));
        const el = following.length ? document.getElementById(`block-${following[0]}`) : null;
        if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
        else toContinue();
    };
    // Multi-choice: offer to add another, or carry on.
    const askMore = (item: string, done: () => void) => setPrompt({ item, done });

    const togglePart = (p: Part) => {
        const adding = !parts.includes(p);
        setParts((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
        if (adding) askMore(c(`plan_part_${p}_title`), toContinue); else setPrompt(null);
    };

    /* ---------- Steps only ask what this trip needs ---------- */
    const needsStyle = has('safari') || has('beach');
    const steps = (['trip', 'shape', 'when', 'who', ...(needsStyle ? ['style'] : []), 'review'] as const).map((key) => ({ key, label: c(`plan_step_${key}_label`) }));
    const current = steps[Math.min(step, steps.length - 1)].key;
    const shaping = step >= 1; // lengths are only shown once the visitor has started shaping the parts

    /* ---------- What has been decided ---------- */
    const climbRoute = planner.climbs.find((r) => r.options.some((o) => o.id === climb));
    const climbPkg = climbRoute?.options.find((o) => o.id === climb) ?? null;
    const isMeru = climbRoute?.route === rules.meru;
    const recommendedSafari = parks.length ? Math.max(2, parks.reduce((n, p) => n + parkDays(p), 0)) : rules.safariDefault;
    const safariDays = safariOverride ?? recommendedSafari;
    const chosenTrips = planner.dayTrips.filter((x) => dayTrips.includes(x.id));

    /* ---------- The itinerary: arrival → day trips → climb → safari → beach → home ---------- */
    const legs = useMemo(() => {
        const out: Leg[] = [];
        const town = has('climb') || has('daytrips') ? c('plan_town_moshi') : c('plan_town_arusha');
        out.push({ days: [1, 1], title: c('plan_leg_arrive'), sub: t('plan_leg_arrive_text', { town }), part: 'travel' });
        chosenTrips.forEach((x) => out.push({ days: [1, 1], title: x.title, sub: has('climb') ? c('plan_leg_daytrip_climb') : c('plan_leg_daytrip'), part: 'daytrips' }));
        if (has('daytrips') && !chosenTrips.length) out.push({ days: [0, 0], title: c('plan_part_daytrips_title'), sub: c('plan_pending_daytrips'), part: 'daytrips', pending: true });
        if (has('climb')) {
            if (climbPkg && climbRoute) {
                out.push({ days: [climbPkg.days, climbPkg.days], title: `${isMeru ? c('plan_leg_meru') : c('plan_leg_climb')} · ${climbRoute.route}`, sub: t('plan_leg_climb_text', { days: days(climbPkg.days), peak: isMeru ? c('plan_peak_meru') : c('plan_peak_kili') }), part: 'climb' });
            } else if (climb === 'help') {
                out.push({ days: kiliDays, title: c('plan_leg_climb_undecided'), sub: t('plan_leg_climb_undecided_text', { days: days(kiliDays) }), part: 'climb' });
            } else {
                out.push({ days: [0, 0], title: c('plan_part_climb_title'), sub: c('plan_pending_climb'), part: 'climb', pending: true });
            }
        }
        if (has('safari')) {
            const chosen = planner.parks.filter((p) => parks.includes(p.slug));
            if (!chosen.length) {
                out.push({ days: [safariDays, safariDays], title: c('plan_classic_circuit'), sub: c('plan_classic_circuit_text'), part: 'safari' });
            } else {
                // One day per park first; spare days go to the park that needs the most time.
                const alloc = chosen.map(() => 1);
                const big = chosen.reduce((best, p, i) => (p.planner_days > chosen[best].planner_days ? i : best), 0);
                alloc[big] += Math.max(0, safariDays - chosen.length);
                chosen.forEach((p, i) => out.push({ days: [alloc[i], alloc[i]], title: `${c('plan_leg_safari')} · ${p.name}`, sub: i === 0 ? c('plan_leg_safari_first') : c('plan_leg_safari_text'), part: 'safari' }));
            }
        }
        if (has('beach')) out.push({ days: [beachNights, beachNights], title: c('plan_leg_beach'), sub: t('plan_leg_beach_text', { nights: nights(beachNights) }), part: 'beach' });
        out.push({ days: [1, 1], title: c('plan_leg_home'), sub: has('beach') ? c('plan_leg_home_beach') : c('plan_leg_home_text'), part: 'travel' });
        return out;
    }, [parts, chosenTrips, climb, climbPkg, climbRoute, isMeru, parks, safariDays, beachNights, copy]); // eslint-disable-line react-hooks/exhaustive-deps

    // Everything the trip needs is decided once each chosen part has a length.
    const pending = PART_KEYS.filter((p) => has(p) && ((p === 'climb' && climb === null) || (p === 'daytrips' && !chosenTrips.length)));
    const fixed = !pending.length && legs.every((l) => l.days[0] === l.days[1]);
    const totalDays: Range = [legs.reduce((n, l) => n + l.days[0], 0), legs.reduce((n, l) => n + l.days[1], 0)]; // placeholders count 0
    const numbered = useMemo(() => {
        let d = 1;
        return legs.map((l) => { const from = d; d += l.days[0]; return { ...l, from, to: d - 1 }; });
    }, [legs]);

    /* ---------- Price guide, per person, from KLM's published packages ---------- */
    const lines: Line[] = [];
    if (has('climb') && climb !== null) lines.push({ label: climbPkg ? `${climbRoute?.route}, ${days(climbPkg.days)}` : c('plan_leg_climb'), range: climbPkg?.price ? [climbPkg.price, climbPkg.price] : kiliPrices.length ? [Math.min(...kiliPrices), Math.max(...kiliPrices)] : null });
    if (has('safari')) {
        const rate = style ? planner.safari[style]?.rate : null;
        lines.push({ label: `${c('plan_rate_safari')}, ${days(safariDays)}${style ? ` · ${style.toLowerCase()}` : ''}`, range: rate ? [r10(rate[0] * safariDays), r10(rate[1] * safariDays)] : null });
    }
    if (has('beach')) {
        const rate = style ? planner.beach[style === 'Luxury' ? 'luxury' : 'standard']?.rate : null;
        lines.push({ label: `${c('plan_rate_beach')}, ${nights(beachNights)}`, range: rate ? [r10(rate[0] * beachNights), r10(rate[1] * beachNights)] : null });
    }
    if (chosenTrips.length) { const sum = chosenTrips.reduce((n, x) => n + (x.price ?? 0), 0); lines.push({ label: c('plan_block_daytrips'), range: [sum, sum] }); }
    const priced = lines.filter((l) => l.range);
    const total: Range | null = priced.length ? [priced.reduce((n, l) => n + l.range![0], 0), priced.reduce((n, l) => n + l.range![1], 0)] : null;
    const complete = !pending.length && lines.length > 0 && priced.length === lines.length;

    /* ---------- The KLM packages this plan is built from ---------- */
    const basedOn: Pkg[] = [];
    if (has('climb') && climbPkg) basedOn.push(climbPkg);
    if (has('safari') && style && planner.safari[style]?.tours.length) basedOn.push(closest(planner.safari[style].tours, safariDays + 1));
    if (has('beach') && style) { const b = planner.beach[style === 'Luxury' ? 'luxury' : 'standard']?.tours ?? []; if (b.length) basedOn.push(closest(b, beachNights + 1)); }

    /* ---------- Dates ---------- */
    const months = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
            return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`, label: d.toLocaleDateString('en-GB', { month: 'short' }), year: d.getFullYear(), m: d.getMonth() };
        });
    }, []);
    const monthIndex = month && month !== 'flexible' ? new Date(`${month}T12:00:00`).getMonth() : null;
    const primary = (['climb', 'safari', 'beach'] as const).find((k) => has(k)) ?? null;
    const seasonFor = (k: 'climb' | 'safari' | 'beach', m: number) => ({ note: seasons[m]?.[k] ?? '', warn: !!seasons[m]?.[`${k}_caution`] });
    const when = !month ? '' : month === 'flexible' ? c('plan_flexible_label')
        : new Date(`${month}T12:00:00`).toLocaleDateString('en-GB', exact ? { day: 'numeric', month: 'short', year: 'numeric' } : { month: 'long', year: 'numeric' });

    /* ---------- Group ---------- */
    const form = useForm({ name: '', email: '', phone: '', country: '', message: '', adults: 2, children: 0 });
    const { data, setData } = form;
    const travellers = data.adults + data.children;
    const chooseParty = (p: (typeof parties)[number]) => {
        setParty(p.title);
        setData((d) => ({ ...d, adults: num(p.adults, d.adults), children: num(p.children, d.children) }));
    };

    /* ---------- Name of the plan ---------- */
    const short: Record<Part, string> = { climb: isMeru ? c('plan_short_meru') : c('plan_short_climb'), safari: c('plan_short_safari'), beach: c('plan_short_beach'), daytrips: c('plan_short_daytrips') };
    const partsLabel = parts.length ? PART_KEYS.filter(has).map((p) => short[p]).join(' + ') : c('plan_trip_name_empty');
    const tripName = shaping && !pending.length ? t('plan_trip_name', { days: span(totalDays), parts: partsLabel }) : t('plan_trip_name_pending', { parts: partsLabel });

    const canNext: Record<string, boolean> = {
        trip: parts.length > 0,
        shape: !pending.length,
        when: !!month,
        who: !!party && data.adults >= 1,
        style: !!style,
        review: !!data.name && /\S+@\S+\.\S+/.test(data.email),
    };
    const go = (s: number) => { setPrompt(null); setStep(Math.max(0, Math.min(s, steps.length - 1))); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const dayLabel = (l: (typeof numbered)[number]) => (l.pending || (!fixed && l.part === 'travel') ? '' : fixed ? `${c('plan_word_day_label')} ${l.from}${l.to > l.from ? `–${l.to}` : ''}` : days(l.days));

    const submit = () => {
        const plan = [
            `— ${tripName} —`,
            ...numbered.map((l) => `${dayLabel(l)}: ${l.title}`),
            `${c('plan_fact_when')}: ${when} · ${c('plan_fact_group')}: ${party}, ${data.adults} + ${data.children}${style ? ` · ${c('plan_fact_style')}: ${style}` : ''}`,
            ...lines.map((l) => `${l.label}: ${l.range ? fmt(l.range) : '—'}`),
            total ? `${c('plan_price_title')}: ${fmt(total)}` : '',
        ].filter(Boolean).join('\n');
        form.transform((d) => ({
            ...d,
            travel_date: month && month !== 'flexible' ? month : null,
            nights: totalDays[1] - 1,
            budget: total ? (style ? `${style} · ${fmt(total)} pp` : `Guide price ${fmt(total)} pp`).slice(0, 60) : style || null,
            interests: [
                ...PART_KEYS.filter(has).map((p) => c(`plan_part_${p}_title`)),
                ...(climbRoute ? [`Route: ${climbRoute.route}`] : climb === 'help' ? ['Route: help me choose'] : []),
                ...planner.parks.filter((p) => parks.includes(p.slug)).map((p) => `Park: ${p.name}`),
                ...chosenTrips.map((x) => `Day trip: ${x.title}`),
            ],
            tour_id: climbPkg?.id ?? tour?.id ?? null,
            source: 'planner',
            message: [d.message, plan].filter(Boolean).join('\n\n'),
        }));
        form.post('/enquire', { preserveScroll: true, onSuccess: () => { setDone(true); window.scrollTo({ top: 0 }); } });
    };

    const lastPart = parts[parts.length - 1];
    const heroImage = lastPart ? c(`plan_part_${lastPart}_image`) || planner.images[PART_IMAGE[lastPart]] : c('plan_image');

    if (done) {
        const who = consultant?.name || c('plan_done_consultant');
        const nextSteps = (Array.isArray(copy.plan_done_steps) ? copy.plan_done_steps : []).map((s: { title: string; text: string }) => ({ title: s.title, text: (s.text ?? '').replace('{consultant}', who) }));
        return <Confirmation c={c} t={t} name={data.name} email={data.email} tripName={tripName} legs={numbered.map((l) => ({ label: dayLabel(l), title: l.title }))} when={when} nextSteps={nextSteps} whatsapp={settings.whatsapp} />;
    }

    const summary = (
        <div className="bg-white shadow-[0_40px_80px_-50px_rgba(0,0,0,.45)] ring-1 ring-ink/5">
            <div className="relative h-36 overflow-hidden bg-ink">
                {heroImage && <img key={heroImage} src={img(heroImage, 900)} alt="" className="hero-in h-full w-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-light">{c('plan_summary_kicker')}</p>
                        <p className="font-display mt-1 text-[1.25rem] font-semibold leading-tight tracking-tight">{parts.length ? tripName : c('plan_summary_empty')}</p>
                    </div>
                    {shaping && !pending.length && <p className="shrink-0 text-right"><span className="block font-display text-[1.9rem] font-semibold leading-none tabular-nums">{span(totalDays)}</span><span className="text-[11px] uppercase tracking-[0.14em] text-white/60">{c('plan_summary_days')}</span></p>}
                </div>
            </div>

            {parts.length > 0 && !shaping && (
                <div className="px-5 py-4">
                    <ul className="space-y-3">
                        {PART_KEYS.filter(has).map((p) => (
                            <li key={p} className="flex items-start gap-3">
                                <span className="mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full bg-gold" />
                                <span><span className="block text-[14px] font-semibold">{c(`plan_part_${p}_title`)}</span><span className="text-[12.5px] text-ink/50">{c(`plan_pending_${p}`)}</span></span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 border-t border-ink/10 pt-3 text-[12.5px] text-ink/55">{c('plan_pending_title')}</p>
                </div>
            )}

            {shaping && parts.length > 0 && (
                <>
                    <ol className="px-5 pt-4">
                        {numbered.map((l, i) => (
                            <li key={i} className="relative flex gap-4 pb-3 last:pb-0">
                                {i < numbered.length - 1 && <span className="absolute bottom-0 left-[5px] top-4 w-px bg-ink/10" />}
                                <span className={cn('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full', l.pending ? 'border-2 border-dashed border-gold bg-white' : l.part === 'travel' ? 'bg-ink/30' : 'bg-gold')} />
                                <div className={cn('min-w-0 flex-1', l.pending && 'text-ink/45')}>
                                    {dayLabel(l) && <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">{dayLabel(l)}</p>}
                                    <p className="text-[14px] font-semibold leading-snug">{l.title}</p>
                                    <p className={cn('text-[12.5px]', l.pending ? 'font-semibold text-clay' : 'text-ink/50')}>{l.sub}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <dl className="mt-4 grid grid-cols-3 border-y border-ink/10 text-[13px]">
                        <Fact icon="calendar" label={c('plan_fact_when')} value={when || '—'} />
                        <Fact icon="users" label={c('plan_fact_group')} value={`${travellers} ${travellers === 1 ? c('plan_word_person') : c('plan_word_people')}`} />
                        <Fact icon="bed" label={c('plan_fact_style')} value={style || '—'} />
                    </dl>

                    <div className="px-5 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">{c('plan_price_title')}</p>
                        <ul className="mt-2 space-y-1 text-[13px]">
                            {lines.map((l) => <li key={l.label} className="flex justify-between gap-3"><span className="text-ink/60">{l.label}</span><span className={l.range ? 'font-semibold' : 'text-ink/40'}>{l.range ? fmt(l.range) : c('plan_price_pending')}</span></li>)}
                        </ul>
                        {total && (
                            <p className="mt-3 flex items-baseline justify-between gap-3 border-t border-ink/10 pt-3">
                                <span className="text-[13px] font-semibold">{complete ? c('plan_price_total') : c('plan_price_sofar')}</span>
                                <span className="font-display text-[1.25rem] font-semibold tracking-tight">{fmt(total)}</span>
                            </p>
                        )}
                        <p className="mt-2 text-[11.5px] leading-snug text-ink/45">{c('plan_price_note')}</p>
                    </div>

                    {basedOn.length > 0 && (
                        <div className="border-t border-ink/10 px-5 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">{c('plan_built_from')}</p>
                            <ul className="mt-2 space-y-2">
                                {basedOn.map((x) => (
                                    <li key={x.id}>
                                        <Link href={`/tours/${x.slug}`} className="group flex items-center gap-3">
                                            <img src={img(x.image, 160)} alt="" className="h-10 w-14 shrink-0 object-cover" />
                                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold group-hover:text-gold-dark">{x.title}</span>
                                            <Icon name="arrowUpRight" size={14} className="shrink-0 text-ink/40" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const caution = monthIndex !== null && (['climb', 'safari', 'beach'] as const).some((k) => has(k) && seasonFor(k, monthIndex).warn);

    return (
        <SiteLayout solidHeader mobileBar={false} title={c('plan_kicker')}>
            <section className="bg-sand-50">
                {/* Progress */}
                <div className="border-b border-ink/10 bg-white">
                    <div className="container-site flex items-center gap-6 py-4">
                        <p className="hidden shrink-0 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/50 md:block">{c('plan_kicker')}</p>
                        <ol className="no-scrollbar flex flex-1 gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain">
                            {steps.map((s, i) => (
                                <li key={s.key} className="flex-1">
                                    <button onClick={() => i < step && go(i)} disabled={i > step} className="group flex w-full min-w-[6.5rem] flex-col gap-2 text-left">
                                        <span className={cn('h-1 w-full transition-colors duration-500', i <= step ? 'bg-gold' : 'bg-ink/10')} />
                                        <span className={cn('flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em]', i === step ? 'text-ink' : i < step ? 'text-ink/60 group-hover:text-ink' : 'text-ink/35')}>
                                            {i < step ? <Icon name="check" size={13} className="text-gold" /> : <span className="tabular-nums">0{i + 1}</span>}{s.label}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className="container-site grid gap-10 py-10 lg:grid-cols-12 lg:gap-14 lg:py-14">
                    <div className="min-w-0 lg:col-span-7">
                        <div key={current} className="hero-in">
                            {/* 1 — What the trip is made of */}
                            {current === 'trip' && (
                                <Step title={c('plan_step_trip_title')} hint={c('plan_step_trip_hint')}>
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        {PART_KEYS.map((p) => (
                                            <PickCard key={p} active={has(p)} onClick={() => togglePart(p)} image={c(`plan_part_${p}_image`) || planner.images[PART_IMAGE[p]]} title={c(`plan_part_${p}_title`)} text={c(`plan_part_${p}_text`)} />
                                        ))}
                                    </div>
                                </Step>
                            )}

                            {/* 2 — The decisions that set each part's length */}
                            {current === 'shape' && (
                                <Step title={c('plan_step_shape_title')} hint={c('plan_step_shape_hint')}>
                                    <div className="space-y-12">
                                        {has('climb') && (
                                            <Block id="block-climb" icon="mountain" title={c('plan_block_climb')} tip={c('plan_tip_climb')}>
                                                <div className="divide-y divide-ink/10 bg-white ring-1 ring-ink/10">
                                                    {planner.climbs.map((r) => (
                                                        <div key={r.route} className={cn('p-4 transition-colors sm:p-5', climbRoute?.route === r.route && 'bg-sand-50')}>
                                                            <p className="font-display text-[16px] font-semibold tracking-tight">{r.route}</p>
                                                            <p className="mt-0.5 text-[13px] text-ink/55">{routeNotes.find((n) => n.title === r.route)?.note ?? ''}</p>
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {r.options.map((o) => (
                                                                    <button key={o.id} onClick={() => { setClimb(o.id); nextAfter('climb'); }} className={cn('relative px-3.5 py-2 text-[13px] font-semibold ring-1 transition', climb === o.id ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/15 hover:ring-ink')}>
                                                                        {days(o.days)} · {money(o.price)}
                                                                        {o.popular && <span className={cn('ml-2 text-[10.5px] uppercase tracking-[0.12em]', climb === o.id ? 'text-gold-light' : 'text-gold-dark')}>{c('plan_popular')}</span>}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <RouteRow active={climb === 'help'} onClick={() => { setClimb('help'); nextAfter('climb'); }} title={c('plan_route_help_title')} note={c('plan_route_help_text')} />
                                                </div>
                                                {climb === null && <p className="text-[13px] font-semibold text-clay">{c('plan_climb_required')}</p>}
                                            </Block>
                                        )}

                                        {has('safari') && (
                                            <Block id="block-safari" icon="binoculars" title={c('plan_block_safari')} tip={c('plan_tip_safari')}>
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    {planner.parks.map((p) => (
                                                        <PickCard key={p.slug} small active={parks.includes(p.slug)} onClick={() => { const adding = !parks.includes(p.slug); setParks((cur) => (cur.includes(p.slug) ? cur.filter((x) => x !== p.slug) : [...cur, p.slug])); if (adding) askMore(p.name, () => nextAfter('safari')); else setPrompt(null); }} image={p.image} title={p.name} text={t('plan_park_days', { days: days(p.planner_days) })} />
                                                    ))}
                                                </div>
                                                <Counter label={c('plan_safari_days_label')} note={t('plan_safari_days_note', { days: days(recommendedSafari) })} value={safariDays} min={Math.max(1, parks.length)} max={rules.max} onChange={setSafariOverride} />
                                                {parks.length > 0 && safariDays < recommendedSafari && <Notice tone="warn">{t('plan_note_short_safari', { days: days(recommendedSafari) })}</Notice>}
                                            </Block>
                                        )}

                                        {has('beach') && (
                                            <Block id="block-beach" icon="sun" title={c('plan_block_beach')} tip={c('plan_tip_beach')}>
                                                <Counter label={c('plan_beach_nights_label')} note={c('plan_beach_nights_note')} value={beachNights} min={rules.beachMin} max={rules.max} onChange={setBeachNights} />
                                            </Block>
                                        )}

                                        {has('daytrips') && (
                                            <Block id="block-daytrips" icon="compass" title={c('plan_block_daytrips')} tip={has('climb') ? c('plan_tip_daytrips_climb') : c('plan_tip_daytrips')}>
                                                <div className="divide-y divide-ink/10 bg-white ring-1 ring-ink/10">
                                                    {planner.dayTrips.map((x) => {
                                                        const on = dayTrips.includes(x.id);
                                                        return (
                                                            <button key={x.id} onClick={() => { setDayTrips((cur) => (on ? cur.filter((y) => y !== x.id) : [...cur, x.id])); if (!on) askMore(x.title, () => nextAfter('daytrips')); else setPrompt(null); }} className={cn('flex w-full items-center gap-4 p-3 text-left transition-colors', on ? 'bg-sand-50' : 'hover:bg-sand-50/60')}>
                                                                <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center border-2', on ? 'border-gold bg-gold text-white' : 'border-ink/25 text-transparent')}><Icon name="check" size={12} /></span>
                                                                <img src={img(x.image, 160)} alt="" className="h-11 w-14 shrink-0 object-cover" />
                                                                <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug">{x.title}</span>
                                                                <span className="shrink-0 text-[13px] text-ink/60">{money(x.price)}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {!chosenTrips.length && <p className="text-[13px] font-semibold text-clay">{c('plan_daytrips_required')}</p>}
                                            </Block>
                                        )}
                                    </div>
                                </Step>
                            )}

                            {/* 3 — When, with what each month means for this trip */}
                            {current === 'when' && (
                                <Step title={c('plan_step_when_title')} hint={t('plan_step_when_hint', { part: primary ? c(`plan_part_word_${primary}`) : '' })}>
                                    <div className="flex items-center justify-between gap-4">
                                        <button onClick={() => { const on = month !== 'flexible'; setMonth(on ? 'flexible' : ''); if (on) toContinue(); }} className={cn('px-4 py-2 text-[13px] font-semibold ring-1 transition', month === 'flexible' ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/15 hover:ring-ink')}>{c('plan_flexible')}</button>
                                        <button onClick={() => { setExact(!exact); setMonth(''); }} className="text-[13px] font-semibold text-gold-dark underline underline-offset-4">{exact ? c('plan_pick_month') : c('plan_exact')}</button>
                                    </div>
                                    {exact ? (
                                        <input type="date" min={new Date().toISOString().slice(0, 10)} className="field mt-4 max-w-xs" value={month === 'flexible' ? '' : month} onChange={(e) => { setMonth(e.target.value); if (e.target.value) toContinue(); }} />
                                    ) : (
                                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                                            {months.map((m) => {
                                                const on = month === m.value;
                                                const s = primary ? seasonFor(primary, m.m) : null;
                                                return (
                                                    <button key={m.value} onClick={() => { setMonth(on ? '' : m.value); if (!on) toContinue(); }} className={cn('p-3 text-left ring-1 transition-all duration-300', on ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/10 hover:ring-gold')}>
                                                        <span className="font-display block text-[17px] font-semibold tracking-tight">{m.label} <span className={cn('text-[13px] font-normal', on ? 'text-white/55' : 'text-ink/40')}>{m.year}</span></span>
                                                        {s?.note && <span className={cn('mt-1 flex items-start gap-1 text-[11.5px] leading-snug', on ? 'text-gold-light' : s.warn ? 'text-clay' : 'text-ink/50')}>{s.warn && <Icon name="help" size={12} className="mt-px shrink-0" />}{s.note}</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {monthIndex !== null && (
                                        <div className="mt-6 bg-white p-5 ring-1 ring-ink/10">
                                            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/50">{t('plan_expect_title', { month: seasons[monthIndex]?.title ?? '' })}</p>
                                            <ul className="mt-3 space-y-2 text-[14px]">
                                                {(['climb', 'safari', 'beach'] as const).filter((k) => has(k)).map((k) => {
                                                    const s = seasonFor(k, monthIndex);
                                                    return <li key={k} className="flex gap-3"><span className="w-24 shrink-0 font-semibold">{k === 'climb' && isMeru ? c('plan_short_meru') : c(`plan_season_${k}`)}</span><span className={s.warn ? 'text-clay' : 'text-ink/70'}>{s.note}</span></li>;
                                                })}
                                                {primary === null && <li className="text-ink/70">{c('plan_season_daytrips')}</li>}
                                            </ul>
                                            {caution && <p className="mt-3 text-[13px] text-ink/55">{c('plan_rain_advice')}</p>}
                                        </div>
                                    )}
                                </Step>
                            )}

                            {/* 4 — Who is travelling */}
                            {current === 'who' && (
                                <Step title={c('plan_step_who_title')} hint={c('plan_step_who_hint')}>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                        {parties.map((p) => (
                                            <button key={p.title} onClick={() => { chooseParty(p); toContinue(); }} className={cn('flex flex-col items-start gap-3 p-4 text-left ring-1 transition', party === p.title ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/10 hover:ring-gold')}>
                                                <Icon name={p.icon || 'users'} size={20} className={party === p.title ? 'text-gold-light' : 'text-gold-dark'} />
                                                <span className="text-[15px] font-semibold">{p.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <Counter label={c('plan_adults_label')} note={t('plan_adults_note', { age: rules.minAge })} value={data.adults} min={1} max={30} onChange={(v) => setData('adults', v)} />
                                        <Counter label={c('plan_children_label')} note={t('plan_children_note', { age: rules.minAge })} value={data.children} min={0} max={20} onChange={(v) => setData('children', v)} />
                                    </div>
                                    <div className="mt-5 space-y-3">
                                        {has('climb') && data.children > 0 && <Notice tone="warn">{t('plan_note_climb_age', { age: rules.minAge })}</Notice>}
                                        {party === parties.find((p) => /family/i.test(p.title))?.title && has('safari') && <Notice>{c('plan_note_family')}</Notice>}
                                        {party === parties.find((p) => /honeymoon/i.test(p.title))?.title && <Notice>{c('plan_note_honeymoon')}</Notice>}
                                        {has('safari') && travellers > rules.seats && <Notice>{t('plan_note_group', { seats: rules.seats })}</Notice>}
                                    </div>
                                </Step>
                            )}

                            {/* 5 — Comfort level (only when there is accommodation to choose) */}
                            {current === 'style' && (
                                <Step title={c('plan_step_style_title')} hint={c('plan_step_style_hint')}>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {(has('safari') ? (['Camping', 'Lodge', 'Luxury'] as Style[]) : (['Lodge', 'Luxury'] as Style[])).map((s) => {
                                            const on = style === s;
                                            const safariRate = planner.safari[s]?.rate;
                                            const beachRate = planner.beach[s === 'Luxury' ? 'luxury' : 'standard']?.rate;
                                            const beachOnly = !has('safari');
                                            const name = beachOnly && s === 'Lodge' ? c('plan_style_beach_name') : s;
                                            const text = beachOnly && s === 'Lodge' ? c('plan_style_beach_text') : c(`plan_style_${s.toLowerCase()}`);
                                            return (
                                                <button key={s} onClick={() => { setStyle(s); toContinue(); }} className={cn('flex flex-col p-5 text-left ring-1 transition-all duration-300', on ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/10 hover:ring-gold')}>
                                                    <span className="flex items-center justify-between"><span className="font-display text-[1.35rem] font-semibold tracking-tight">{name}</span><span className={cn('flex h-5 w-5 items-center justify-center border-2', on ? 'border-gold bg-gold text-white' : 'border-ink/20 text-transparent')}><Icon name="check" size={12} /></span></span>
                                                    <span className={cn('mt-2 text-[13px]', on ? 'text-white/65' : 'text-ink/55')}>{text}</span>
                                                    <span className={cn('mt-4 space-y-1 border-t pt-3 text-[13px]', on ? 'border-white/15' : 'border-ink/10')}>
                                                        {has('safari') && safariRate && <span className="flex justify-between gap-2"><span className={on ? 'text-white/55' : 'text-ink/50'}>{c('plan_rate_safari')}</span><span className="font-semibold">{fmt(safariRate)}{c('plan_per_day')}</span></span>}
                                                        {has('beach') && beachRate && s !== 'Camping' && <span className="flex justify-between gap-2"><span className={on ? 'text-white/55' : 'text-ink/50'}>{c('plan_rate_beach')}</span><span className="font-semibold">{fmt(beachRate)}{c('plan_per_night')}</span></span>}
                                                        {has('beach') && s === 'Camping' && <span className={cn('block', on ? 'text-white/55' : 'text-ink/50')}>{c('plan_style_camping_beach')}</span>}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Step>
                            )}

                            {/* 6 — Review and send */}
                            {current === 'review' && (
                                <Step title={c('plan_step_review_title')} hint={c('plan_step_review_hint')}>
                                    <div className="mb-8 lg:hidden">{summary}</div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label={c('plan_field_name')} error={form.errors.name}><input className="field" value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" /></Field>
                                        <Field label={c('plan_field_email')} error={form.errors.email}><input type="email" className="field" value={data.email} onChange={(e) => setData('email', e.target.value)} autoComplete="email" /></Field>
                                        <Field label={c('plan_field_phone')}><input type="tel" className="field" value={data.phone} onChange={(e) => setData('phone', e.target.value)} autoComplete="tel" /></Field>
                                        <Field label={c('plan_field_country')}><CountrySelect className="field cursor-pointer" value={data.country} onChange={(v) => setData('country', v)} /></Field>
                                        <div className="sm:col-span-2"><Field label={c('plan_message_label')}><textarea rows={4} className="field" value={data.message} onChange={(e) => setData('message', e.target.value)} /></Field></div>
                                    </div>
                                </Step>
                            )}
                        </div>

                        {/* Phone: a compact view of the plan while answering */}
                        {current !== 'review' && parts.length > 0 && (
                            <div className="mt-8 flex items-center justify-between gap-4 bg-ink p-4 text-white lg:hidden">
                                <div className="min-w-0">
                                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold-light">{c('plan_mobile_kicker')}</p>
                                    <p className="mt-0.5 text-[15px] font-semibold">{tripName}</p>
                                </div>
                                {shaping && total && <p className="shrink-0 text-right text-[13px]"><span className="block text-white/55">{c('plan_from')}</span><span className="font-semibold">{money(total[0])}</span></p>}
                            </div>
                        )}

                        <div ref={continueRef} className="mt-10 flex scroll-mt-32 items-center justify-between gap-4 border-t border-ink/10 pt-6">
                            <button onClick={() => go(step - 1)} disabled={step === 0} className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink/60 hover:text-ink disabled:opacity-0"><Icon name="arrowLeft" size={16} /> {c('plan_back')}</button>
                            {current !== 'review' ? (
                                <button onClick={() => go(step + 1)} disabled={!canNext[current]} className={cn('btn btn-dark transition-shadow duration-500 disabled:opacity-40', nudge && canNext[current] && 'shadow-[0_0_0_6px_rgb(var(--c-primary)/0.25)]')}>{c('plan_continue')} <Icon name="arrow" size={16} className="arrow" /></button>
                            ) : (
                                <button onClick={submit} disabled={!canNext.review || form.processing} className="btn btn-gold disabled:opacity-40">{form.processing ? c('plan_sending') : c('plan_send')} <Icon name="send" size={16} /></button>
                            )}
                        </div>
                        <p className="mt-4 text-[13px] text-ink/45">{t('plan_free_note', { phone: settings.phone })}</p>
                    </div>

                    {/* Desktop: the plan building up beside the questions */}
                    <aside className="hidden lg:col-span-5 lg:block">
                        <div className="sticky overflow-y-auto overscroll-contain transition-[top] duration-500 ease-lux" style={{ top: 'calc(var(--nav-h, 0px) + 1.5rem)', maxHeight: 'calc(100vh - var(--nav-h, 0px) - 3rem)' }}>
                            {summary}
                            {consultant && (
                                <div className="mt-3 flex items-center gap-3 bg-white px-5 py-4 ring-1 ring-ink/5">
                                    {consultant.photo ? <img src={img(consultant.photo, 120)} alt="" className="h-10 w-10 object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-sm font-semibold text-white">{initials(consultant.name)}</span>}
                                    <p className="text-[13px] text-ink/60">{t('plan_consultant_note', { name: consultant.name })}</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>

                {/* "Add another?" after picking in a multi-choice step */}
                <div className={cn('fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 transition-all duration-500', prompt ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')} role="dialog" aria-live="polite">
                    <div className="flex w-full max-w-xl flex-col gap-3 bg-ink p-4 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)] sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                        <p className="flex flex-1 items-start gap-3 text-[15px] leading-snug"><Icon name="check" size={18} className="mt-0.5 shrink-0 text-gold-light" />{prompt ? t('plan_more_prompt', { item: prompt.item }) : ''}</p>
                        <div className="flex shrink-0 gap-2">
                            <button onClick={() => setPrompt(null)} className="btn btn-brand-outline !h-11 flex-1 !px-4">{c('plan_more_add')}</button>
                            <button onClick={() => prompt?.done()} className="btn btn-brand !h-11 flex-1 !px-4">{c('plan_more_done')} <Icon name="arrow" size={15} className="arrow" /></button>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}

/* ================================================================ Confirmation */
function Confirmation({ c, t, name, email, tripName, legs, when, nextSteps, whatsapp }: {
    c: (k: string) => string; t: (k: string, v?: Record<string, string | number>) => string;
    name: string; email: string; tripName: string; legs: { label: string; title: string }[]; when: string; nextSteps: { title: string; text: string }[]; whatsapp: string;
}) {
    return (
        <SiteLayout solidHeader mobileBar={false} title={c('plan_kicker')}>
            <section className="container-site grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
                <div className="lg:col-span-7">
                    <span className="flex h-14 w-14 items-center justify-center bg-gold text-white"><Icon name="check" size={26} /></span>
                    <h1 className="font-display mt-8 text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-tight">{t('plan_done_title', { name: name.split(' ')[0] })}</h1>
                    <p className="mt-5 max-w-xl text-lg text-ink/60">{t('plan_done_text', { trip: tripName, when: when || c('plan_flexible_label') })}</p>
                    {c('plan_done_email') && <p className="mt-3 flex items-center gap-2 text-[15px] text-ink/70"><Icon name="mail" size={16} className="text-gold" />{t('plan_done_email', { email })}</p>}
                    <ol className="mt-10 space-y-6">
                        {nextSteps.map((s, i) => (
                            <li key={i} className="flex gap-5">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/15 text-[14px] font-semibold tabular-nums">0{i + 1}</span>
                                <div><p className="font-display text-[17px] font-semibold tracking-tight">{s.title}</p><p className="mt-1 text-ink/55">{s.text}</p></div>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-10 flex flex-wrap gap-3">
                        <a href={whatsappLink(whatsapp)} target="_blank" rel="noreferrer" className="btn btn-gold"><Icon name="whatsapp" size={17} /> {c('plan_done_whatsapp')}</a>
                        <Link href="/tours" className="btn btn-outline">{c('plan_done_browse')}</Link>
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <div className="bg-ink p-7 text-white">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-light">{c('plan_done_route')}</p>
                        <ol className="mt-4 space-y-3">
                            {legs.map((l, i) => <li key={i} className="flex gap-4 text-[15px]"><span className="w-20 shrink-0 text-white/45">{l.label}</span>{l.title}</li>)}
                        </ol>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}

/* ================================================================ Small pieces */
function Step({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
    return (
        <>
            <h1 className="font-display fancy text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight"><span className="mask"><span>{title.split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : p))}</span></span></h1>
            <p className="mt-4 max-w-xl text-[16px] text-ink/60">{hint}</p>
            <div className="mt-8">{children}</div>
        </>
    );
}

function Block({ id, icon, title, tip, children }: { id?: string; icon: string; title: string; tip: string; children: ReactNode }) {
    return (
        <div id={id} className="scroll-mt-28 space-y-4">
            <div>
                <p className="font-display flex items-center gap-2 text-[18px] font-semibold tracking-tight"><Icon name={icon} size={18} className="text-gold-dark" />{title}</p>
                <p className="mt-1 text-[13.5px] text-ink/55">{tip}</p>
            </div>
            {children}
        </div>
    );
}

function RouteRow({ active, onClick, title, note }: { active: boolean; onClick: () => void; title: string; note: string }) {
    return (
        <button onClick={onClick} className={cn('flex w-full items-center gap-4 p-4 text-left transition-colors sm:p-5', active ? 'bg-sand-50' : 'hover:bg-sand-50/60')}>
            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-gold bg-gold' : 'border-ink/25')}>{active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span>
            <span><span className="font-display block text-[16px] font-semibold tracking-tight">{title}</span><span className="text-[13px] text-ink/55">{note}</span></span>
        </button>
    );
}

function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
    return <p className={cn('flex gap-3 p-4 text-[13.5px] leading-relaxed', tone === 'warn' ? 'bg-clay/10 text-ink' : 'bg-gold/10 text-ink')}><Icon name={tone === 'warn' ? 'help' : 'sparkle'} size={16} className={cn('mt-0.5 shrink-0', tone === 'warn' ? 'text-clay' : 'text-gold-dark')} />{children}</p>;
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="min-w-0 border-r border-ink/10 px-4 py-3 last:border-r-0">
            <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-ink/45"><Icon name={icon} size={13} />{label}</dt>
            <dd className="mt-1 truncate font-semibold">{value}</dd>
        </div>
    );
}

function PickCard({ active, onClick, image, title, text, small }: { active: boolean; onClick: () => void; image: string | null | undefined; title: string; text?: string | null; small?: boolean }) {
    return (
        <button onClick={onClick} aria-pressed={active} className={cn('img-zoom group relative overflow-hidden text-left outline-none ring-2 ring-offset-2 ring-offset-sand-50 transition-all duration-500', small ? 'h-32 sm:h-36' : 'h-44 sm:h-56', active ? 'ring-gold' : 'ring-transparent')}>
            {image && <img src={img(image, 600)} alt="" className="h-full w-full object-cover" />}
            <div className={cn('absolute inset-0 transition-colors duration-500', active ? 'bg-ink/55' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent')} />
            <span className={cn('absolute right-3 top-3 flex h-7 w-7 items-center justify-center border-2 transition-all duration-500', active ? 'border-gold bg-gold text-white' : 'border-white/80 text-transparent')}><Icon name="check" size={15} /></span>
            <div className="absolute bottom-0 p-4 text-white sm:p-5">
                <p className={cn('font-display font-semibold leading-tight tracking-tight', small ? 'text-[16px]' : 'text-[1.3rem]')}>{title}</p>
                {text && <p className="mt-1 line-clamp-2 text-[12px] text-white/75">{text}</p>}
            </div>
        </button>
    );
}

function Counter({ label, note, value, min, max, onChange }: { label: string; note: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center justify-between gap-4 bg-white p-4 ring-1 ring-ink/10">
            <span><span className="font-display block text-[16px] font-semibold tracking-tight">{label}</span><span className="text-[12.5px] text-ink/50">{note}</span></span>
            <div className="flex shrink-0 items-center gap-3">
                <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="flex h-10 w-10 items-center justify-center ring-1 ring-ink/15 hover:bg-ink hover:text-white disabled:opacity-30" aria-label={`− ${label}`}><Icon name="minus" size={16} /></button>
                <span className="w-7 text-center text-lg font-semibold tabular-nums">{value}</span>
                <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="flex h-10 w-10 items-center justify-center ring-1 ring-ink/15 hover:bg-ink hover:text-white disabled:opacity-30" aria-label={`+ ${label}`}><Icon name="plus" size={16} /></button>
            </div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return <div><label className="field-label">{label}</label>{children}{error && <p className="mt-1 text-xs text-clay">{error}</p>}</div>;
}
