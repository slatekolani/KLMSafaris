import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import EnquiryForm from '@/Components/EnquiryForm';
import Icon from '@/Components/Icon';
import HeroMedia from '@/Components/HeroMedia';
import Lightbox from '@/Components/Lightbox';
import Stars from '@/Components/Stars';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, fancy, img, initials, money, useShared, useText, whatsappLink } from '@/lib/utils';
import type { ItineraryDay, TeamMember, Testimonial, Tour, TourCard as TC } from '@/types';

type Props = { tour: Tour; related: TC[]; testimonials: Testimonial[]; consultant: TeamMember | null };

const SECTIONS = [
    ['overview', 'tour_nav_overview'],
    ['itinerary', 'tour_nav_itinerary'],
    ['inclusions', 'tour_nav_included'],
    ['pricing', 'tour_nav_pricing'],
    ['gallery', 'tour_nav_gallery'],
    ['enquire', 'tour_nav_enquire'],
] as const;

export default function TourShow({ tour, related, testimonials, consultant }: Props) {
    const { settings } = useShared();
    const tx = useText();
    const [lightbox, setLightbox] = useState<number | null>(null);
    const [current, setCurrent] = useState('overview');
    const gallery = useMemo(() => [tour.image, ...(tour.gallery ?? [])].filter((x, i, a): x is string => !!x && a.indexOf(x) === i), [tour]);

    useEffect(() => {
        const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)), { rootMargin: '-40% 0px -55% 0px' });
        SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
        return () => io.disconnect();
    }, []);

    const facts = [
        ['clock', tx('tour_fact_duration'), `${tour.duration_days} ${tour.duration_days === 1 ? tx('tour_fact_day') : tx('label_days')}`],
        ['sun', tx('tour_fact_season'), tour.season],
        ['compass', tx('tour_fact_style'), tour.difficulty],
        ['users', tx('tour_fact_group'), tour.group_size],
        ['heart', tx('tour_fact_age'), tour.min_age],
        ['pin', tx('tour_fact_departure'), tour.departure],
    ].filter(([, , v]) => v) as [string, string, string][];

    return (
        <SiteLayout mobileBar={false} title={tour.meta_title || tour.title} description={tour.meta_description || tour.excerpt} image={tour.image}>
            {/* Hero */}
            <section className="relative isolate flex min-h-[80svh] items-end overflow-hidden bg-ink text-white md:min-h-[calc(100svh-120px)]">
                {tour.image && <HeroMedia src={tour.image} />}
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-black/0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/25" />
                <div className="container-site relative z-10 pb-12 pt-24">
                    <nav className="hero-in mb-6 flex flex-wrap sm:mb-8 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                        <Link href="/" className="hover:text-white">{tx('crumb_home')}</Link><Icon name="chevronRight" size={12} />
                        <Link href="/tours" className="hover:text-white">{tx('tour_crumb')}</Link><Icon name="chevronRight" size={12} />
                        {tour.category && <><Link href={`/experiences/${tour.category.slug}`} className="hover:text-white">{tour.category.name}</Link><Icon name="chevronRight" size={12} /></>}
                        <span className="text-white/90">{tour.title}</span>
                    </nav>
                    <div className="hero-in mb-5 flex flex-wrap gap-2" style={{ ['--d' as string]: '80ms' }}>
                        {tour.group_name && <span className="bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">{tour.group_name}</span>}
                        {tour.badge && <span className="bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">{tour.badge}</span>}
                    </div>
                    <h1 className="h-display on-photo max-w-5xl text-balance"><span className="mask"><span style={{ animationDelay: '120ms' }}>{tour.title}</span></span></h1>
                    {tour.subtitle && <p style={{ ['--d' as string]: '300ms' }} className="font-display hero-in mt-4 max-w-2xl text-lg font-semibold tracking-tight text-white/80 sm:mt-5 sm:text-3xl">{tour.subtitle}</p>}

                    <div style={{ ['--d' as string]: '420ms' }} className="glass hero-in mt-7 grid grid-cols-2 gap-px overflow-hidden sm:mt-10 sm:grid-cols-3 lg:grid-cols-6">
                        {facts.map(([icon, label, value]) => (
                            <div key={label} className="flex items-center gap-2.5 p-3.5 sm:gap-3 sm:p-5">
                                <Icon name={icon} size={20} className="shrink-0 text-gold-light" />
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">{label}</p>
                                    <p className="truncate text-[15px]">{value}</p>
                                </div>
                            </div>
                        ))}
                        <div className="col-span-2 hidden items-center justify-between gap-3 bg-white/10 p-5 sm:col-span-3 sm:flex lg:col-span-1 lg:flex-col lg:items-start lg:justify-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">{tx('label_from')}</p>
                                <p className="font-display text-3xl leading-none text-gold-light">{money(tour.price_from)}</p>
                            </div>
                            {tour.price_note && <p className="text-xs text-white/55">{tour.price_note}</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section nav */}
            <div className="below-nav sticky z-30 border-b border-ink/5 bg-sand-50/90 backdrop-blur-xl">
                <div className="container-site flex items-center justify-between gap-6">
                    <nav className="no-scrollbar -mx-5 flex overflow-x-auto overflow-y-hidden overscroll-x-contain px-5">
                        {SECTIONS.filter(([id]) => id !== 'pricing' || !!tour.pricing?.length).map(([id, label]) => (
                            <a key={id} href={`#${id}`} className={cn('relative shrink-0 px-4 py-5 text-[13px] font-medium uppercase tracking-[0.12em] transition-colors', current === id ? 'text-ink' : 'text-ink/45 hover:text-ink')}>
                                {tx(label)}
                                <span className={cn('absolute inset-x-4 bottom-0 h-0.5 origin-left bg-gold transition-transform duration-500', current === id ? 'scale-x-100' : 'scale-x-0')} />
                            </a>
                        ))}
                    </nav>
                    <a href="#enquire" className="btn btn-gold hidden !py-2.5 lg:inline-flex">{tx('tour_enquire_now')}</a>
                </div>
            </div>

            <div className="container-site grid gap-14 py-12 sm:py-20 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    {/* Overview */}
                    <section id="overview" className="scroll-mt-28">
                        <span className="eyebrow">{tx('tour_overview')}</span>
                        <div className="prose-lux mt-6" dangerouslySetInnerHTML={{ __html: tour.overview ?? '' }} />
                        {!!tour.highlights?.length && (
                            <div className="mt-10 bg-white p-6 ring-1 ring-ink/5 sm:mt-12 sm:p-8">
                                <p className="font-display text-2xl sm:text-3xl">{tx('tour_highlights')}</p>
                                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {tour.highlights.map((h) => (
                                        <li key={h} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-gold/15 text-gold-dark"><Icon name="check" size={14} /></span><span className="text-ink/75">{h}</span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {[tour.departure, tour.departure_time, tour.return_time, tour.dress_code].some(Boolean) && (
                            <dl className="mt-10 grid gap-px overflow-hidden bg-ink/[0.07] ring-1 ring-ink/5 sm:grid-cols-2">
                                {([['pin', tx('tour_fact_departure'), tour.departure], ['clock', tx('tour_departure_time'), tour.departure_time], ['calendar', tx('tour_return_time'), tour.return_time], ['users', tx('tour_dress_code'), tour.dress_code]] as [string, string, string | null][])
                                    .filter(([, , v]) => v).map(([icon, label, value]) => (
                                        <div key={label} className="flex gap-4 bg-white p-4 sm:p-6">
                                            <Icon name={icon} size={20} className="mt-0.5 shrink-0 text-gold" />
                                            <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{label}</dt><dd className="mt-1 text-[15px] leading-relaxed text-ink/80">{value}</dd></div>
                                        </div>
                                    ))}
                            </dl>
                        )}
                        {!!tour.destinations?.length && (
                            <div className="mt-10 flex flex-wrap items-center gap-3">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-ink/45">{tx('tour_destinations')}</span>
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
                    <section id="inclusions" className="mt-16 scroll-mt-28 sm:mt-24">
                        <span className="eyebrow">{tx('tour_details')}</span>
                        <h2 className="h-section mt-4">{tx('tour_included_title')}</h2>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2">
                            <div className=" bg-white p-8 ring-1 ring-ink/5">
                                <p className="font-display flex items-center gap-3 text-2xl font-semibold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-none bg-gold/15 text-gold-dark"><Icon name="check" size={18} /></span>{tx('tour_included')}</p>
                                <ul className="mt-6 space-y-3.5">{(tour.includes ?? []).map((x) => <li key={x} className="flex gap-3 text-[15px] text-ink/75"><Icon name="check" size={16} className="mt-1 shrink-0 text-acacia" />{x}</li>)}</ul>
                            </div>
                            <div className=" bg-white p-8 ring-1 ring-ink/5">
                                <p className="font-display flex items-center gap-3 text-2xl font-semibold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-none bg-clay/10 text-clay"><Icon name="x" size={18} /></span>{tx('tour_excluded')}</p>
                                <ul className="mt-6 space-y-3.5">{(tour.excludes ?? []).map((x) => <li key={x} className="flex gap-3 text-[15px] text-ink/75"><Icon name="x" size={16} className="mt-1 shrink-0 text-clay" />{x}</li>)}</ul>
                            </div>
                        </div>
                    </section>

                    {/* Pricing by group size */}
                    {!!tour.pricing?.length && (
                        <section id="pricing" className="mt-16 scroll-mt-28 sm:mt-24">
                            <span className="eyebrow">{tx('tour_pricing')}</span>
                            <h2 className="h-section mt-4">{tx('tour_price_pp')}</h2>
                            <p className="mt-3 text-ink/60">{tx('tour_price_intro')}{tour.price_note ? ` (${tour.price_note})` : ''}</p>
                            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {tour.pricing.map((row, i) => (
                                    <div key={i} className={cn(' p-5 ring-1 transition', i === 0 ? 'bg-forest-900 text-white ring-forest-900' : 'bg-white ring-ink/[0.07] hover:ring-gold')}>
                                        <p className={cn('flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]', i === 0 ? 'text-white/60' : 'text-ink/45')}><Icon name="users" size={14} />{row.people} {row.people === '1' ? 'person' : 'people'}</p>
                                        <p className={cn('font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl', i === 0 ? 'text-gold-light' : 'text-ink')}>{row.price && /\d/.test(String(row.price)) ? `$${String(row.price).replace(/^\$/, '')}` : <span className="text-xl">{tx('price_request')}</span>}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Gallery */}
                    <section id="gallery" className="mt-16 scroll-mt-28 sm:mt-24">
                        <span className="eyebrow">{tx('tour_gallery')}</span>
                        <h2 className="h-section mt-4">{tx('tour_gallery_title')}</h2>
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
                        <section className="mt-16 sm:mt-24">
                            <span className="eyebrow">{tx('tour_stories')}</span>
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
                    <div className="sticky space-y-5 transition-[top] duration-500 ease-lux" style={{ top: 'calc(var(--nav-h, 0px) + 5rem)' }}>
                        <div className="overflow-hidden bg-forest-900 text-white shadow-[0_40px_80px_-40px_rgba(18,20,15,.6)]">
                            <div className="p-8">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">{tx('tour_starting')}</p>
                                <p className="font-display mt-1 text-6xl font-semibold tracking-tight leading-none text-gold-light">{money(tour.price_from)}</p>
                                {tour.price_note && <p className="mt-2 text-sm text-white/55">{tour.price_note}</p>}
                                <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-white/75">
                                    {facts.slice(0, 3).map(([icon, label, value]) => <p key={label} className="flex items-center gap-3"><Icon name={icon} size={16} className="text-gold-light" /><span className="text-white/45">{label}</span><span className="ml-auto text-right">{value}</span></p>)}
                                </div>
                                <a href="#enquire" className="btn btn-gold mt-8 w-full">{tx('tour_enquire')}</a>
                            </div>
                            <a href={whatsappLink(settings.whatsapp, tx('tour_whatsapp', { tour: tour.title }))} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white/5 py-4 text-sm text-white/80 transition hover:bg-[#25D366] hover:text-white">
                                <Icon name="phone" size={15} /> {tx('tour_whatsapp_button')}
                            </a>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-5 ring-1 ring-ink/5">
                            <Icon name="shield" size={28} className="shrink-0 text-gold" />
                            <p className="text-sm text-ink/65">{tx('tour_note')}</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Enquire */}
            <section id="enquire" className="scroll-mt-20 px-3 sm:px-5">
                <div className="grain relative overflow-hidden bg-forest-900 text-white">
                    <div className="container-site relative grid gap-14 py-20 lg:grid-cols-12 lg:py-28">
                        <div className="lg:col-span-5">
                            <span className="eyebrow eyebrow-light">{tx('tour_enq_label')}</span>
                            <h2 className="fancy font-display mt-5 text-[2.1rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">{fancy(tx('tour_enq_title'))}</h2>
                            <p className="mt-6 text-white/65">{tx('tour_enq_text', { tour: tour.title })}</p>
                            {consultant && (
                                <div className="mt-10 flex items-center gap-4 bg-white/5 p-5">
                                    {consultant.photo ? <img src={img(consultant.photo, 160)} alt="" className="h-16 w-16 rounded-none object-cover" /> : <span className="font-display flex h-16 w-16 items-center justify-center rounded-none bg-gold text-2xl font-semibold tracking-tight">{initials(consultant.name)}</span>}
                                    <div>
                                        <p className="font-display text-xl">{consultant.name}</p>
                                        <p className="text-sm text-white/55">{consultant.role}</p>
                                        <a href={`tel:${settings.phone}`} className="mt-1 inline-flex items-center gap-2 text-sm text-gold-light"><Icon name="phone" size={14} />{settings.phone}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-7">
                            <EnquiryForm tourId={tour.id} tour={tour} source="tour" dark />
                        </div>
                    </div>
                </div>
            </section>

            {!!related.length && (
                <section className="container-site py-16 sm:py-24">
                    <div className="flex items-end justify-between gap-6">
                        <div>
                            <span className="eyebrow">{tx('tour_similar_label')}</span>
                            <h2 className="h-section mt-4">{tx('tour_similar')}</h2>
                        </div>
                        {tour.category && <Link href={`/experiences/${tour.category.slug}`} className="btn btn-outline hidden sm:inline-flex">{tx('tour_all_in', { name: tour.category.name })}</Link>}
                    </div>
                    <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{related.map((t, i) => <TourCard key={t.id} tour={t} delay={i * 80} />)}</div>
                </section>
            )}

            {/* Mobile booking bar */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-ink/10 bg-sand-50/95 px-5 py-3 backdrop-blur-xl lg:hidden">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-ink/50">{tx('label_from')}</p>
                    <p className="font-display text-2xl leading-none">{money(tour.price_from)}</p>
                </div>
                <a href="#enquire" className="btn btn-gold !px-5 !py-3">{tx('tour_mobile_enquire')}</a>
            </div>

            <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
        </SiteLayout>
    );
}

function Itinerary({ days }: { days: ItineraryDay[] }) {
    const tx = useText();
    const [open, setOpen] = useState<number[]>([0]);
    const all = open.length === days.length;
    const altitudes = days.map((d) => parseInt((d.altitude || '').replace(/[^\d]/g, ''), 10)).filter((n) => !Number.isNaN(n));
    const showProfile = altitudes.length === days.length && altitudes.length > 2;

    return (
        <section id="itinerary" className="mt-16 scroll-mt-28 sm:mt-24">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <span className="eyebrow">{tx('tour_itinerary_label')}</span>
                    <h2 className="h-section mt-4">{tx('tour_itinerary')}</h2>
                </div>
                <button onClick={() => setOpen(all ? [] : days.map((_, i) => i))} className="text-sm text-gold-dark underline-offset-4 hover:underline">{all ? tx('tour_collapse') : tx('tour_expand')}</button>
            </div>

            {showProfile && <AltitudeProfile days={days} values={altitudes} />}

            <ol className="relative mt-10">
                <span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-px sm:left-[27px] bg-gradient-to-b from-gold via-gold/40 to-transparent" />
                {days.map((d, i) => {
                    const isOpen = open.includes(i);
                    return (
                        <li key={i} className="relative pl-14 sm:pl-20">
                            <span className={cn('absolute left-0 top-3 flex h-11 w-11 flex-col sm:h-14 sm:w-14 items-center justify-center rounded-none border font-display leading-none transition-all duration-500', isOpen ? 'border-gold bg-gold text-white' : 'border-ink/15 bg-sand-50 text-ink')}>
                                <span className="text-[8px] font-sans uppercase tracking-[0.15em] opacity-70 sm:text-[9px]">{tx('tour_day')}</span>
                                <span className="text-lg sm:text-xl">{i + 1}</span>
                            </span>
                            <button onClick={() => setOpen(isOpen ? open.filter((n) => n !== i) : [...open, i])} className="flex w-full items-center justify-between gap-4 border-b border-ink/[0.08] py-5 text-left sm:py-7">
                                <span className="font-display text-[1.15rem] font-semibold leading-snug sm:text-[1.65rem] sm:font-normal sm:leading-tight">{d.title}</span>
                                <Icon name="plus" size={20} className={cn('shrink-0 text-gold transition-transform duration-500', isOpen && 'rotate-45')} />
                            </button>
                            <div className={cn('grid transition-all duration-700 ease-lux', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                                <div className="overflow-hidden">
                                    <p className="pt-4 text-[15px] leading-relaxed text-ink/70 sm:pt-5 sm:text-[16px]">{d.description}</p>
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
    const tx = useText();
    // Drawn at the box's real width so labels keep a readable size on phones (a scaled 800-wide chart made them ~4px).
    const box = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(800);
    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setWidth(Math.max(260, Math.round(e.contentRect.width))));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const W = width, H = width < 500 ? 190 : 220, P = width < 500 ? 22 : 30;
    const roomy = (W - P * 2) / Math.max(1, values.length - 1) >= 48; // room for every height label?
    const max = Math.max(...values) * 1.06, min = Math.min(...values) * 0.7;
    const x = (i: number) => P + (i * (W - P * 2)) / (values.length - 1);
    const y = (v: number) => H - P - ((v - min) / (max - min)) * (H - P * 2);
    const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ');
    const peak = values.indexOf(Math.max(...values));

    return (
        <div className="mt-10 bg-forest-900 p-6 text-white sm:p-8">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
                <span>{tx('tour_altitude')}</span><span>{tx('tour_peak', { value: values[peak].toLocaleString() })}</span>
            </div>
            <div ref={box} className="mt-4">
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block" role="img" aria-label="Altitude by day">
                <defs><linearGradient id="alt" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgb(var(--c-primary))" stopOpacity=".45" /><stop offset="1" stopColor="rgb(var(--c-primary))" stopOpacity="0" /></linearGradient></defs>
                {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={P} x2={W - P} y1={P + f * (H - P * 2)} y2={P + f * (H - P * 2)} stroke="white" strokeOpacity=".07" />)}
                <path d={`${line} L${x(values.length - 1)} ${H - P} L${x(0)} ${H - P}Z`} fill="url(#alt)" />
                <path d={line} fill="none" stroke="rgb(var(--c-primary))" strokeWidth="2" strokeLinejoin="round" />
                {values.map((v, i) => (
                    <g key={i}>
                        <circle cx={x(i)} cy={y(v)} r={i === peak ? 6 : 4} fill={i === peak ? 'rgb(var(--c-primary))' : 'rgb(var(--c-dark-900))'} stroke="rgb(var(--c-primary))" strokeWidth="2" />
                        <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="white" fillOpacity=".5">D{i + 1}</text>
                        {(roomy || i === peak || i === 0 || i === values.length - 1) && <text x={x(i)} y={y(v) - 12} textAnchor="middle" fontSize="11" fill="white" fillOpacity={i === peak ? 1 : 0.65}>{v.toLocaleString()}</text>}
                    </g>
                ))}
            </svg>
            </div>
            <p className="sr-only">{days.map((d, i) => `Day ${i + 1}: ${d.altitude}`).join(', ')}</p>
        </div>
    );
}
