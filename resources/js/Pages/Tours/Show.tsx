import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import EnquiryForm from '@/Components/EnquiryForm';
import Icon from '@/Components/Icon';
import Lightbox from '@/Components/Lightbox';
import Stars from '@/Components/Stars';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, img, initials, money, useShared, whatsappLink } from '@/lib/utils';
import type { ItineraryDay, TeamMember, Testimonial, Tour, TourCard as TC } from '@/types';

type Props = { tour: Tour; related: TC[]; testimonials: Testimonial[]; consultant: TeamMember | null };

const SECTIONS = [
    ['overview', 'Overview'],
    ['itinerary', 'Itinerary'],
    ['inclusions', 'What’s included'],
    ['pricing', 'Pricing'],
    ['gallery', 'Gallery'],
    ['enquire', 'Enquire'],
] as const;

export default function TourShow({ tour, related, testimonials, consultant }: Props) {
    const { settings } = useShared();
    const [lightbox, setLightbox] = useState<number | null>(null);
    const [current, setCurrent] = useState('overview');
    const gallery = useMemo(() => [tour.image, ...(tour.gallery ?? [])].filter((x, i, a): x is string => !!x && a.indexOf(x) === i), [tour]);

    useEffect(() => {
        const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)), { rootMargin: '-40% 0px -55% 0px' });
        SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
        return () => io.disconnect();
    }, []);

    const facts = [
        ['clock', 'Duration', `${tour.duration_days} ${tour.duration_days === 1 ? 'day' : 'days'}`],
        ['sun', 'Season', tour.season],
        ['compass', 'Style', tour.difficulty],
        ['users', 'Group', tour.group_size],
        ['heart', 'Age', tour.min_age],
        ['pin', 'Departure', tour.departure],
    ].filter(([, , v]) => v) as [string, string, string][];

    return (
        <SiteLayout title={tour.meta_title || tour.title} description={tour.meta_description || tour.excerpt} image={tour.image}>
            {/* Hero */}
            <section className="grain relative flex min-h-[92vh] items-end overflow-hidden bg-forest-900 text-white">
                <img src={img(tour.image, 2200, 78)} alt="" className="kenburns absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/40 to-forest-900/30" />
                <div className="container-site relative z-10 pb-12 pt-40">
                    <nav className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                        <Link href="/" className="hover:text-white">Home</Link><Icon name="chevronRight" size={12} />
                        <Link href="/tours" className="hover:text-white">Journeys</Link><Icon name="chevronRight" size={12} />
                        {tour.category && <><Link href={`/experiences/${tour.category.slug}`} className="hover:text-white">{tour.category.name}</Link><Icon name="chevronRight" size={12} /></>}
                        <span className="text-white/90">{tour.title}</span>
                    </nav>
                    <div className="mb-5 flex flex-wrap gap-2">
                        {tour.group_name && <span className="rounded-none bg-white/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] backdrop-blur">{tour.group_name}</span>}
                        {tour.badge && <span className="rounded-none bg-gold px-4 py-1.5 text-[11px] uppercase tracking-[0.18em]">{tour.badge}</span>}
                    </div>
                    <h1 className="h-display max-w-5xl text-balance !text-[clamp(2.2rem,4.6vw,4.4rem)]"><span className="mask"><span>{tour.title}</span></span></h1>
                    {tour.subtitle && <p className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-white/80 sm:text-3xl">{tour.subtitle}</p>}

                    <div className="glass mt-10 grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-3 lg:grid-cols-6">
                        {facts.map(([icon, label, value]) => (
                            <div key={label} className="flex items-center gap-3 p-5">
                                <Icon name={icon} size={22} className="shrink-0 text-gold-light" />
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">{label}</p>
                                    <p className="truncate text-[15px]">{value}</p>
                                </div>
                            </div>
                        ))}
                        <div className="col-span-2 flex items-center justify-between gap-3 bg-white/10 p-5 sm:col-span-3 lg:col-span-1 lg:flex-col lg:items-start lg:justify-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">From</p>
                                <p className="font-display text-3xl leading-none text-gold-light">{money(tour.price_from)}</p>
                            </div>
                            {tour.price_note && <p className="text-xs text-white/55">{tour.price_note}</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section nav */}
            <div className="sticky top-0 z-30 border-b border-ink/5 bg-sand-50/90 backdrop-blur-xl">
                <div className="container-site flex items-center justify-between gap-6">
                    <nav className="no-scrollbar -mx-5 flex overflow-x-auto px-5">
                        {SECTIONS.filter(([id]) => id !== 'pricing' || !!tour.pricing?.length).map(([id, label]) => (
                            <a key={id} href={`#${id}`} className={cn('relative shrink-0 px-4 py-5 text-[13px] font-medium uppercase tracking-[0.12em] transition-colors', current === id ? 'text-ink' : 'text-ink/45 hover:text-ink')}>
                                {label}
                                <span className={cn('absolute inset-x-4 bottom-0 h-0.5 origin-left bg-gold transition-transform duration-500', current === id ? 'scale-x-100' : 'scale-x-0')} />
                            </a>
                        ))}
                    </nav>
                    <a href="#enquire" className="btn btn-gold hidden !py-2.5 lg:inline-flex">Enquire now</a>
                </div>
            </div>

            <div className="container-site grid gap-14 py-20 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    {/* Overview */}
                    <section id="overview" className="scroll-mt-28">
                        <span className="eyebrow">Overview</span>
                        <div className="prose-lux mt-6" dangerouslySetInnerHTML={{ __html: tour.overview ?? '' }} />
                        {!!tour.highlights?.length && (
                            <div className="mt-12 bg-white p-8 ring-1 ring-ink/5">
                                <p className="font-display text-3xl">Journey highlights</p>
                                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {tour.highlights.map((h) => (
                                        <li key={h} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-gold/15 text-gold-dark"><Icon name="check" size={14} /></span><span className="text-ink/75">{h}</span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {[tour.departure, tour.departure_time, tour.return_time, tour.dress_code].some(Boolean) && (
                            <dl className="mt-10 grid gap-px overflow-hidden bg-ink/[0.07] ring-1 ring-ink/5 sm:grid-cols-2">
                                {([['pin', 'Departure', tour.departure], ['clock', 'Departure time', tour.departure_time], ['calendar', 'Return time', tour.return_time], ['users', 'Dress code', tour.dress_code]] as [string, string, string | null][])
                                    .filter(([, , v]) => v).map(([icon, label, value]) => (
                                        <div key={label} className="flex gap-4 bg-white p-6">
                                            <Icon name={icon} size={20} className="mt-0.5 shrink-0 text-gold" />
                                            <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{label}</dt><dd className="mt-1 text-[15px] leading-relaxed text-ink/80">{value}</dd></div>
                                        </div>
                                    ))}
                            </dl>
                        )}
                        {!!tour.destinations?.length && (
                            <div className="mt-10 flex flex-wrap items-center gap-3">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-ink/45">Destinations</span>
                                {tour.destinations.map((d) => (
                                    <Link key={d.id} href={`/destinations/${d.slug}`} className="flex items-center gap-2 rounded-none bg-white py-1.5 pl-1.5 pr-4 text-sm ring-1 ring-ink/10 transition hover:ring-gold">
                                        <img src={img(d.image, 80)} alt="" className="h-7 w-7 rounded-none object-cover" />{d.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Itinerary */}
                    {!!tour.itinerary?.length && <Itinerary days={tour.itinerary} />}

                    {/* Inclusions */}
                    <section id="inclusions" className="mt-24 scroll-mt-28">
                        <span className="eyebrow">The details</span>
                        <h2 className="mt-4 text-5xl font-semibold tracking-tight">What’s included</h2>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2">
                            <div className=" bg-white p-8 ring-1 ring-ink/5">
                                <p className="flex items-center gap-3 text-2xl font-semibold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-none bg-acacia/15 text-acacia"><Icon name="check" size={18} /></span>Included</p>
                                <ul className="mt-6 space-y-3.5">{(tour.includes ?? []).map((x) => <li key={x} className="flex gap-3 text-[15px] text-ink/75"><Icon name="check" size={16} className="mt-1 shrink-0 text-acacia" />{x}</li>)}</ul>
                            </div>
                            <div className=" bg-white p-8 ring-1 ring-ink/5">
                                <p className="flex items-center gap-3 text-2xl font-semibold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-none bg-clay/10 text-clay"><Icon name="x" size={18} /></span>Not included</p>
                                <ul className="mt-6 space-y-3.5">{(tour.excludes ?? []).map((x) => <li key={x} className="flex gap-3 text-[15px] text-ink/75"><Icon name="x" size={16} className="mt-1 shrink-0 text-clay" />{x}</li>)}</ul>
                            </div>
                        </div>
                    </section>

                    {/* Pricing by group size */}
                    {!!tour.pricing?.length && (
                        <section id="pricing" className="mt-24 scroll-mt-28">
                            <span className="eyebrow">Pricing</span>
                            <h2 className="mt-4 text-5xl font-semibold tracking-tight">Price per person</h2>
                            <p className="mt-3 text-ink/60">The more of you travel together, the less each person pays. Prices in USD{tour.price_note ? `, ${tour.price_note}` : ''}.</p>
                            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {tour.pricing.map((row, i) => (
                                    <div key={i} className={cn(' p-5 ring-1 transition', i === 0 ? 'bg-forest-900 text-white ring-forest-900' : 'bg-white ring-ink/[0.07] hover:ring-gold')}>
                                        <p className={cn('flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]', i === 0 ? 'text-white/60' : 'text-ink/45')}><Icon name="users" size={14} />{row.people} {row.people === '1' ? 'person' : 'people'}</p>
                                        <p className={cn('mt-2 text-3xl font-semibold tracking-tight', i === 0 ? 'text-gold-light' : 'text-ink')}>${row.price.replace(/^\$/, '')}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Gallery */}
                    <section id="gallery" className="mt-24 scroll-mt-28">
                        <span className="eyebrow">Gallery</span>
                        <h2 className="mt-4 text-5xl font-semibold tracking-tight">Moments from the journey</h2>
                        <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-3">
                            {gallery.map((g, i) => (
                                <button key={g} onClick={() => setLightbox(i)} className={cn('img-zoom group relative overflow-hidden', i === 0 && 'col-span-2 row-span-2')}>
                                    <img src={img(g, i === 0 ? 1200 : 600)} alt="" loading="lazy" className="h-full w-full object-cover" />
                                    <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/30 group-hover:opacity-100"><Icon name="plus" size={28} /></span>
                                </button>
                            ))}
                        </div>
                        {tour.route_map && <img src={img(tour.route_map, 1400)} alt="Route map" className="mt-6 w-full ring-1 ring-ink/5" />}
                    </section>

                    {/* Reviews */}
                    {!!testimonials.length && (
                        <section className="mt-24">
                            <span className="eyebrow">Guest stories</span>
                            <div className="mt-8 grid gap-5 sm:grid-cols-2">
                                {testimonials.slice(0, 4).map((r) => (
                                    <figure key={r.id} className=" bg-white p-7 ring-1 ring-ink/5">
                                        <Stars count={r.rating} />
                                        <blockquote className="mt-4 font-display text-xl leading-snug">“{r.quote}”</blockquote>
                                        <figcaption className="mt-5 flex items-center gap-3 text-sm">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-none bg-forest font-display text-gold-light">{initials(r.name)}</span>
                                            <span><span className="block font-medium">{r.name}</span><span className="text-ink/50">{r.country}</span></span>
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sticky booking card */}
                <aside className="hidden lg:col-span-4 lg:block">
                    <div className="sticky top-28 space-y-5">
                        <div className="overflow-hidden bg-forest-900 text-white shadow-[0_40px_80px_-40px_rgba(18,20,15,.6)]">
                            <div className="p-8">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Starting from</p>
                                <p className="mt-1 text-6xl font-semibold tracking-tight leading-none text-gold-light">{money(tour.price_from)}</p>
                                {tour.price_note && <p className="mt-2 text-sm text-white/55">{tour.price_note}</p>}
                                <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-white/75">
                                    {facts.slice(0, 3).map(([icon, label, value]) => <p key={label} className="flex items-center gap-3"><Icon name={icon} size={16} className="text-gold-light" /><span className="text-white/45">{label}</span><span className="ml-auto text-right">{value}</span></p>)}
                                </div>
                                <a href="#enquire" className="btn btn-gold mt-8 w-full">Enquire about this trip</a>
                                <Link href={`/plan-your-trip?tour=${tour.slug}`} className="btn btn-ghost mt-3 w-full">Customise it</Link>
                            </div>
                            <a href={whatsappLink(settings.whatsapp, `Hello KLM Safaris! I'm interested in "${tour.title}".`)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white/5 py-4 text-sm text-white/80 transition hover:bg-[#25D366] hover:text-white">
                                <Icon name="phone" size={15} /> Ask on WhatsApp
                            </a>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-5 ring-1 ring-ink/5">
                            <Icon name="shield" size={28} className="shrink-0 text-gold" />
                            <p className="text-sm text-ink/65">Private departures, flexible dates and 100% locally operated.</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Enquire */}
            <section id="enquire" className="scroll-mt-20 px-3 sm:px-5">
                <div className="grain relative overflow-hidden bg-forest-900 text-white">
                    <div className="container-site relative grid gap-14 py-20 lg:grid-cols-12 lg:py-28">
                        <div className="lg:col-span-5">
                            <span className="eyebrow eyebrow-light">Start the conversation</span>
                            <h2 className="mt-5 text-5xl font-semibold tracking-tight leading-tight sm:text-6xl">Make this journey <em className="text-gold-light">yours</em></h2>
                            <p className="mt-6 text-white/65">Share a few details and a Tanzania specialist will reply within 24 hours with availability, honest advice and a tailored quote for “{tour.title}”.</p>
                            {consultant && (
                                <div className="mt-10 flex items-center gap-4 bg-white/5 p-5">
                                    {consultant.photo ? <img src={img(consultant.photo, 160)} alt="" className="h-16 w-16 rounded-none object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-none bg-gold text-2xl font-semibold tracking-tight">{initials(consultant.name)}</span>}
                                    <div>
                                        <p className="font-display text-xl">{consultant.name}</p>
                                        <p className="text-sm text-white/55">{consultant.role}</p>
                                        <a href={`tel:${settings.phone}`} className="mt-1 inline-flex items-center gap-2 text-sm text-gold-light"><Icon name="phone" size={14} />{settings.phone}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-7">
                            <EnquiryForm tourId={tour.id} source="tour" dark />
                        </div>
                    </div>
                </div>
            </section>

            {!!related.length && (
                <section className="container-site py-24">
                    <div className="flex items-end justify-between gap-6">
                        <div>
                            <span className="eyebrow">You may also love</span>
                            <h2 className="mt-4 text-5xl font-semibold tracking-tight">Similar journeys</h2>
                        </div>
                        {tour.category && <Link href={`/experiences/${tour.category.slug}`} className="btn btn-outline hidden sm:inline-flex">All {tour.category.name}</Link>}
                    </div>
                    <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{related.map((t, i) => <TourCard key={t.id} tour={t} delay={i * 80} />)}</div>
                </section>
            )}

            {/* Mobile booking bar */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-ink/10 bg-sand-50/95 px-5 py-3 pr-24 backdrop-blur-xl lg:hidden">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-ink/50">From</p>
                    <p className="font-display text-2xl leading-none">{money(tour.price_from)}</p>
                </div>
                <a href="#enquire" className="btn btn-gold !px-5 !py-3">Enquire</a>
            </div>

            <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
        </SiteLayout>
    );
}

function Itinerary({ days }: { days: ItineraryDay[] }) {
    const [open, setOpen] = useState<number[]>([0]);
    const all = open.length === days.length;
    const altitudes = days.map((d) => parseInt((d.altitude || '').replace(/[^\d]/g, ''), 10)).filter((n) => !Number.isNaN(n));
    const showProfile = altitudes.length === days.length && altitudes.length > 2;

    return (
        <section id="itinerary" className="mt-24 scroll-mt-28">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <span className="eyebrow">Day by day</span>
                    <h2 className="mt-4 text-5xl font-semibold tracking-tight">The itinerary</h2>
                </div>
                <button onClick={() => setOpen(all ? [] : days.map((_, i) => i))} className="text-sm text-gold-dark underline-offset-4 hover:underline">{all ? 'Collapse all' : 'Expand all'}</button>
            </div>

            {showProfile && <AltitudeProfile days={days} values={altitudes} />}

            <ol className="relative mt-10">
                <span aria-hidden className="absolute bottom-6 left-[27px] top-6 w-px bg-gradient-to-b from-gold via-gold/40 to-transparent" />
                {days.map((d, i) => {
                    const isOpen = open.includes(i);
                    return (
                        <li key={i} className="relative pl-20">
                            <span className={cn('absolute left-0 top-3 flex h-14 w-14 flex-col items-center justify-center rounded-none border font-display leading-none transition-all duration-500', isOpen ? 'border-gold bg-gold text-white' : 'border-ink/15 bg-sand-50 text-ink')}>
                                <span className="text-[9px] font-sans uppercase tracking-[0.15em] opacity-70">Day</span>
                                <span className="text-xl">{i + 1}</span>
                            </span>
                            <button onClick={() => setOpen(isOpen ? open.filter((n) => n !== i) : [...open, i])} className="flex w-full items-center justify-between gap-4 border-b border-ink/[0.08] py-7 text-left">
                                <span className="font-display text-[1.65rem] leading-tight">{d.title}</span>
                                <Icon name="plus" size={20} className={cn('shrink-0 text-gold transition-transform duration-500', isOpen && 'rotate-45')} />
                            </button>
                            <div className={cn('grid transition-all duration-700 ease-lux', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                                <div className="overflow-hidden">
                                    <p className="pt-5 text-[16px] leading-relaxed text-ink/70">{d.description}</p>
                                    <div className="flex flex-wrap gap-2 pb-8 pt-5">
                                        {d.accommodation && d.accommodation !== '—' && <Chip icon="bed">{d.accommodation}</Chip>}
                                        {d.meals && d.meals !== '—' && <Chip icon="utensils">{d.meals}</Chip>}
                                        {d.altitude && <Chip icon="mountain">{d.altitude}</Chip>}
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

function Chip({ icon, children }: { icon: string; children: React.ReactNode }) {
    return <span className="inline-flex items-center gap-2 rounded-none bg-white px-3.5 py-1.5 text-[13px] text-ink/70 ring-1 ring-ink/10"><Icon name={icon} size={14} className="text-gold-dark" />{children}</span>;
}

/** Real altitude chart built from the itinerary's per-day altitude values. */
function AltitudeProfile({ days, values }: { days: ItineraryDay[]; values: number[] }) {
    const W = 800, H = 220, P = 30;
    const max = Math.max(...values) * 1.06, min = Math.min(...values) * 0.7;
    const x = (i: number) => P + (i * (W - P * 2)) / (values.length - 1);
    const y = (v: number) => H - P - ((v - min) / (max - min)) * (H - P * 2);
    const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ');
    const peak = values.indexOf(Math.max(...values));

    return (
        <div className="mt-10 bg-forest-900 p-6 text-white sm:p-8">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
                <span>Altitude profile</span><span>Peak {values[peak].toLocaleString()} m</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="Altitude by day">
                <defs><linearGradient id="alt" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#dcbc85" stopOpacity=".45" /><stop offset="1" stopColor="#dcbc85" stopOpacity="0" /></linearGradient></defs>
                {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={P} x2={W - P} y1={P + f * (H - P * 2)} y2={P + f * (H - P * 2)} stroke="white" strokeOpacity=".07" />)}
                <path d={`${line} L${x(values.length - 1)} ${H - P} L${x(0)} ${H - P}Z`} fill="url(#alt)" />
                <path d={line} fill="none" stroke="#dcbc85" strokeWidth="2" strokeLinejoin="round" />
                {values.map((v, i) => (
                    <g key={i}>
                        <circle cx={x(i)} cy={y(v)} r={i === peak ? 6 : 4} fill={i === peak ? '#c39a5b' : '#111a15'} stroke="#dcbc85" strokeWidth="2" />
                        <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="white" fillOpacity=".5">D{i + 1}</text>
                        <text x={x(i)} y={y(v) - 12} textAnchor="middle" fontSize="11" fill="white" fillOpacity={i === peak ? 1 : 0.65}>{v.toLocaleString()}</text>
                    </g>
                ))}
            </svg>
            <p className="sr-only">{days.map((d, i) => `Day ${i + 1}: ${d.altitude}`).join(', ')}</p>
        </div>
    );
}
