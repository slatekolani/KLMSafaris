import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import Counter from '@/Components/Counter';
import Icon from '@/Components/Icon';
import StayCard, { type Stay } from '@/Components/StayCard';
import TripadvisorMark, { TripadvisorBubbles } from '@/Components/TripadvisorMark';
import Stars from '@/Components/Stars';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, fancy, formatDate, img, money, plain, splitLines, useOptions, useShared, useText } from '@/lib/utils';
import type { Category, Destination, Post, Slide, Stat, Testimonial } from '@/types';

type Cat = Category & { tours_count?: number; tours_min_price_from?: number | null };

type Props = {
    slides: (Slide & { video?: string | null; video_start?: number | string | null; video_end?: number | string | null; video_speed?: number | string | null })[];
    categories: Cat[];
    rows: Category[];
    destinations: Destination[];
    stats: Stat[];
    testimonials: Testimonial[];
    posts: Post[];
    counts: { tours: number; destinations: number; categories: number };
    allTours: Category["items"];
    stays: Stay[];
    staysTotal?: number;
};

export default function Home(props: Props) {
    const { settings } = useShared();
    const kili = props.rows.find((r) => r.slug === 'kilimanjaro');

    return (
        <SiteLayout title={settings.tagline}>
            <Hero slides={props.slides} />
            <TripFinder categories={props.categories} />
            <Packages rows={props.rows} categories={props.categories} allTours={props.allTours} total={props.counts?.tours} />
            {kili && <RouteIndex category={kili} />}
            <Stays stays={props.stays ?? []} total={props.staysTotal ?? 0} />
            <Reviews items={props.testimonials} />
            <Sustainability />
            <AboutStory />
            <Figures counts={props.counts} />
        </SiteLayout>
    );
}

/* ================================================================ Hero: cinematic reel */
function Hero({ slides }: { slides: Props['slides'] }) {
    const tx = useText();
    const [active, setActive] = useState(0);
    const [prev, setPrev] = useState<number | null>(null);
    const [playing, setPlaying] = useState(true);
    const videos = useRef<(HTMLVideoElement | null)[]>([]);
    const count = slides.length;
    const dense = count > 5;
    const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));
    const clip = (i: number) => {
        const sl = slides[i];
        return { start: num(sl?.video_start) ?? 0, end: num(sl?.video_end), speed: num(sl?.video_speed) || 1 };
    };
    const duration = slides[active]?.video ? 10000 : 7000;

    const go = (i: number) => {
        const next = (i + count) % count;
        if (next === active) return;
        setPrev(active);
        setActive(next);
    };

    useEffect(() => {
        if (count < 2 || !playing) return;
        const t = window.setTimeout(() => go(active + 1), duration);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, playing, count, duration]);

    useEffect(() => {
        videos.current.forEach((v, i) => {
            if (!v) return;
            if (i === active && playing) {
                const { start, speed } = clip(i);
                v.playbackRate = speed;
                if (v.currentTime < start || (clip(i).end !== null && v.currentTime >= (clip(i).end as number))) v.currentTime = start;
                v.play().catch(() => undefined);
            } else v.pause();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, playing]);

    // When a slide becomes active again, restart its clip from the trim point.
    useEffect(() => {
        const v = videos.current[active];
        if (v) v.currentTime = clip(active).start;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    // Depth: the photo drifts gently against the cursor.
    const stage = useRef<HTMLElement>(null);
    const onMove = (e: MouseEvent) => {
        const el = stage.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
        el.style.setProperty('--my', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
    };

    if (!count) return <div className="h-[70vh] bg-forest-900" />;
    const slide = slides[active];
    const pad = (n: number) => String(n).padStart(2, '0');
    const moves = ['kb-a', 'kb-b', 'kb-c', 'kb-d'];

    return (
        <section ref={stage} onMouseMove={onMove} onMouseLeave={() => stage.current?.style.setProperty('--mx', '0') || stage.current?.style.setProperty('--my', '0')}
            className="relative h-[82svh] min-h-[600px] overflow-hidden bg-forest-900 text-white md:h-[calc(100svh-150px)] md:min-h-[600px]">
            {/* Slides: the new one sweeps in like a curtain over the previous one */}
            {slides.map((s, i) => (
                <div key={s.id} aria-hidden={i !== active}
                    className={cn('absolute inset-0', i === active ? cn('z-20', prev !== null && 'hero-wipe') : i === prev ? 'z-10' : 'invisible z-0')}>
                    <div className="absolute -inset-6 transition-transform duration-[900ms] ease-out" style={{ transform: 'translate3d(calc(var(--mx, 0) * -22px), calc(var(--my, 0) * -14px), 0)' }}>
                    {s.video ? (
                        <video ref={(el) => (videos.current[i] = el)} src={s.video} poster={img(s.image, 1920)} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'} className={cn('h-full w-full object-cover', i === active && 'kb-video')}
                            onLoadedMetadata={(e) => { const { start, speed } = clip(i); e.currentTarget.playbackRate = speed; if (start) e.currentTarget.currentTime = start; }}
                            onRateChange={(e) => { const { speed } = clip(i); if (e.currentTarget.playbackRate !== speed) e.currentTarget.playbackRate = speed; }}
                            onTimeUpdate={(e) => { const { start, end } = clip(i); if (end !== null && e.currentTarget.currentTime >= end) e.currentTarget.currentTime = start; }} />
                    ) : (
                        <img src={img(s.image, 2200, 80)} alt="" className={cn('h-full w-full object-cover', (i === active || i === prev) && moves[i % moves.length])}
                            style={{ ['--kb' as string]: `${duration + 2500}ms` }} />
                    )}
                    </div>
                </div>
            ))}

            {/* Grade */}
            <div className="absolute inset-0 z-30 bg-gradient-to-t from-forest-900/80 via-forest-900/15 to-forest-900/25" />
            <div className="absolute inset-y-0 left-0 z-30 w-3/4 bg-gradient-to-r from-forest-900/55 via-forest-900/15 to-transparent" />

            <div className="container-site relative z-40 flex h-full items-end pb-10 md:pb-28 [@media(min-width:768px)_and_(max-height:760px)]:pb-20">
                <div className="grid w-full items-end gap-10 lg:grid-cols-12">
                    {/* Message */}
                    <div key={slide.id} className="min-w-0 lg:col-span-7 xl:col-span-7">
                        <p className="mask"><span style={{ animationDelay: '250ms' }} className="!inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/85">
                            <span className="h-px w-10 bg-gold-light" />{slide.eyebrow}
                        </span></p>
                        <h1 className="h-display fancy on-photo mt-5 uppercase !leading-[1.1]">
                            {splitLines(slide.title).map((line, i) => (
                                <span key={i} className="mask"><span style={{ animationDelay: `${350 + i * 120}ms` }}>{fancy(line)}</span></span>
                            ))}
                        </h1>
                        {slide.subtitle && <p className="mask mt-6 max-w-xl text-[17px] leading-relaxed text-white/85"><span style={{ animationDelay: '600ms' }}>{slide.subtitle}</span></p>}
                        <div className="mask mt-8"><span style={{ animationDelay: '720ms' }} className="!flex flex-wrap gap-3">
                            {slide.cta_label && <Link href={slide.cta_url || '/tours'} className="btn btn-light">{slide.cta_label} <Icon name="arrow" size={16} className="arrow" /></Link>}
                            <Link href="/plan-your-trip" className="btn btn-brand-outline">{tx('hero_plan')}</Link>
                        </span></div>

                        {/* Phones & tablets: compact progress */}
                        {count > 1 && (
                            <div className="mt-8 flex items-center gap-4 lg:hidden">
                                <div className={cn('flex', dense ? 'gap-1.5' : 'gap-2')}>
                                    {slides.map((s, i) => (
                                        <button key={s.id} onClick={() => go(i)} aria-label={`Show ${plain(s.title)}`} className="py-2">
                                            <span className={cn('relative block h-[2px] overflow-hidden bg-white/25', dense ? 'w-6' : 'w-9')}>
                                                {i === active && <span key={`${active}-${playing}`} className="slide-progress absolute inset-0 bg-white" style={{ ['--dur' as string]: `${duration}ms`, animationPlayState: playing ? 'running' : 'paused' }} />}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[12px] font-semibold tabular-nums text-white/75">{pad(active + 1)} / {pad(count)}</span>
                            </div>
                        )}
                    </div>

                    {/* Side navigation: photo slide cards (compact once there are more than five) */}
                    {count > 1 && (
                        <div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
                            <div className={cn('mb-4 flex items-end justify-between', dense && '[@media(max-height:760px)]:mb-2.5')}>
                                <p className={cn('font-display text-[2.6rem] font-semibold leading-none tabular-nums', dense && '[@media(max-height:760px)]:text-[2rem]')}>{pad(active + 1)}<span className="text-[1.1rem] text-white/50"> / {pad(count)}</span></p>
                                <div className="flex gap-2">
                                    <button onClick={() => go(active - 1)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center border border-white/30 transition hover:bg-white hover:text-ink"><Icon name="arrowLeft" size={16} /></button>
                                    <button onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} className="flex h-10 w-10 items-center justify-center border border-white/30 transition hover:bg-white hover:text-ink"><Icon name={playing ? 'pause' : 'play'} size={13} /></button>
                                    <button onClick={() => go(active + 1)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center border border-white/30 transition hover:bg-white hover:text-ink"><Icon name="arrow" size={16} /></button>
                                </div>
                            </div>
                            <ol className={dense ? 'space-y-1.5' : 'space-y-2'}>
                                {slides.map((s, i) => {
                                    const on = i === active;
                                    return (
                                        <li key={s.id}>
                                            <button onClick={() => go(i)} aria-current={on}
                                                className={cn('group relative flex w-full items-center overflow-hidden text-left', dense ? 'gap-3 p-1.5 pr-3' : 'gap-4 p-2 pr-4', 'transition-all duration-500',
                                                    on ? 'translate-x-0 bg-white text-ink shadow-[0_20px_40px_-20px_rgba(0,0,0,.6)]' : 'translate-x-3 bg-forest-900/35 text-white backdrop-blur-md hover:translate-x-0 hover:bg-forest-900/55')}>
                                                <span className={cn('relative shrink-0 overflow-hidden bg-white/10', dense ? 'h-10 w-14 [@media(max-height:760px)]:h-8 [@media(max-height:760px)]:w-11' : 'h-14 w-20')}>
                                                    <img src={img(s.image, 240)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    {s.video && <span className="absolute inset-0 flex items-center justify-center bg-forest-900/25"><Icon name="play" size={12} className="text-white" /></span>}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className={cn('block font-semibold uppercase tracking-[0.16em]', dense ? 'text-[10px]' : 'text-[11px]', on ? 'text-gold-dark' : 'text-white/55', dense && !on && '[@media(max-height:760px)]:hidden')}>{pad(i + 1)} · {(s.eyebrow || '').split('·')[0].trim()}</span>
                                                    <span className={cn('block truncate font-display font-semibold leading-tight', dense ? 'mt-0.5 text-[15px]' : 'mt-1 text-[17px]')}>{plain(s.title)}</span>
                                                </span>
                                                {on && (
                                                    <span className="absolute inset-x-0 bottom-0 h-[3px] bg-ink/10">
                                                        <span key={`${active}-${playing}`} className="slide-progress absolute inset-0 bg-gold" style={{ ['--dur' as string]: `${duration}ms`, animationPlayState: playing ? 'running' : 'paused' }} />
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Accommodation */
/** Where guests stay: cover-image cards from CMS → Accommodation, or a "coming soon" panel until some are added. */
const STAY_TYPES = ['Tented camp', 'Lodge', 'Luxury', 'Hotel', 'Beach resort', 'Camping'];

function Stays({ stays, total }: { stays: Stay[]; total: number }) {
    const { settings } = useShared();
    const tx = useText();
    // Type tabs (tented camp, luxury…): each shows its first 8 (two rows of four), "View all" opens /accommodation on the same tab.
    const types = [...new Set(stays.map((s) => s.type))].sort((a, b) => (STAY_TYPES.indexOf(a) + 99) % 99 - (STAY_TYPES.indexOf(b) + 99) % 99);
    const [type, setType] = useState('');
    const matching = stays.filter((s) => !type || s.type === type);

    return (
        <section id="accommodation" className="scroll-mt-24 py-14 lg:py-20">
            <div className="container-site">
                <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <p data-reveal className="eyebrow">{settings.home_stays_eyebrow}</p>
                        <h2 data-reveal className="h-section fancy mt-4 text-balance">{fancy(settings.home_stays_title)}</h2>
                    </div>
                </div>

                {stays.length === 0 ? (
                    <div data-reveal className="relative mt-10 overflow-hidden bg-forest-900 text-white">
                        <div className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/8]">
                            {settings.home_stays_image && <img src={img(settings.home_stays_image, 2000)} alt="" loading="lazy" className="kb-b h-full w-full object-cover" style={{ ['--kb' as string]: '18s' }} />}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/35 to-forest-900/10 sm:bg-gradient-to-r sm:from-forest-900/80 sm:via-forest-900/40 sm:to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:max-w-xl sm:justify-center sm:p-12">
                            <span className="self-start bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">{settings.home_stays_soon_title}</span>
                            <p className="mt-5 text-[16px] leading-[1.7] text-white/85 md:text-[17px]">{settings.home_stays_soon_text}</p>
                            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/70">
                                {tx('stays_types').split(',').map((x) => x.trim()).filter(Boolean).map((t) => <span key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-gold" />{t}</span>)}
                            </div>
                            <Link href={tx('stays_ask_url') || '/contact'} className="btn btn-light mt-8 self-start">{tx('stays_ask')} <Icon name="arrow" size={16} className="arrow" /></Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {types.length > 1 && (
                            <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 sm:mx-0 sm:px-0">
                                {['', ...types].map((t) => (
                                    <button key={t || 'all'} onClick={() => setType(t)}
                                        className={cn('shrink-0 border px-5 py-2 text-[13px] font-semibold transition', type === t ? 'border-gold bg-gold text-white' : 'border-ink/10 bg-white text-ink/70 hover:border-gold hover:text-gold')}>
                                        {t || tx('stays_all')} <span className={cn('ml-1 tabular-nums', type === t ? 'text-white/70' : 'text-ink/35')}>{t ? stays.filter((s) => s.type === t).length : total}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {matching.slice(0, 8).map((s) => <StayCard key={s.id} stay={s} />)}
                        </div>
                        {total > 0 && (
                            <div className="mt-10 flex justify-center">
                                <Link href={type ? `/accommodation?type=${encodeURIComponent(type)}` : '/accommodation'} className="btn btn-brand-outline">{tx('stays_view_all', { count: type ? matching.length : total })} <Icon name="arrow" size={16} className="arrow" /></Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

/* ================================================================ Trip finder */
function TripFinder({ categories }: { categories: Category[] }) {
    const { settings } = useShared();
    const tx = useText();
    const durations = useOptions('finder_durations');
    const budgets = useOptions('finder_budgets');
    const [f, setF] = useState({ category: '', duration: '', budget: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/tours', Object.fromEntries(Object.entries(f).filter(([, v]) => v)));
    };
    return (
        <section className="relative z-40 border-b border-ink/10 bg-white">
            {/* Desktop: classic booking widget floating over the hero's edge */}
            <div className="container-site hidden md:block">
                <form onSubmit={submit} className="-mt-[60px] grid grid-cols-[auto_1fr_1fr_1fr_auto] items-stretch bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.45)] ring-1 ring-ink/5">
                    <div className="flex flex-col justify-center border-r border-ink/10 bg-white px-7 text-forest-900">
                        <Icon name="compass" size={20} className="text-gold" />
                        <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.16em]">{tx('finder_title')}</p>
                    </div>
                    <Select label={tx('finder_experience')} value={f.category} onChange={(v) => setF({ ...f, category: v })} options={[['', tx('finder_all_exp')], ...categories.map((c) => [c.slug, c.name] as [string, string])]} />
                    <Select label={tx('finder_duration')} value={f.duration} onChange={(v) => setF({ ...f, duration: v })} options={durations} />
                    <Select label={tx('finder_budget')} value={f.budget} onChange={(v) => setF({ ...f, budget: v })} options={budgets} />
                    <div className="flex items-center p-4"><button className="btn btn-gold !h-[60px] !px-8">{tx('finder_button')} <Icon name="arrow" size={16} className="arrow" /></button></div>
                </form>
            </div>

            {/* Phones: the same finder as a card: pick an experience by photo, then length and budget */}
            <div className="container-site relative pb-8 pt-0 md:hidden">
                <form onSubmit={submit} className="-mt-5 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.45)] ring-1 ring-ink/5">
                    <div className="flex items-center justify-between gap-3 border-b border-ink/10 bg-white px-5 py-4 text-forest-900">
                        <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.16em]"><Icon name="compass" size={18} className="text-gold" />{tx('finder_title')}</p>
                        <Link href="/tours" className="flex items-center gap-1.5 text-[13px] font-semibold text-gold">{tx('finder_all_tours')} <Icon name="arrow" size={13} /></Link>
                    </div>
                    <p className="px-5 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{tx('finder_experience')}</p>
                    <div className="grid grid-cols-2 gap-2 px-4 pt-2.5">
                        {categories.map((c) => {
                            const on = f.category === c.slug;
                            const count = (c as Cat).tours_count;
                            return (
                                <button key={c.id} type="button" aria-pressed={on} onClick={() => setF({ ...f, category: on ? '' : c.slug })}
                                    className={cn('relative block aspect-[16/11] overflow-hidden text-left outline-none transition', on ? 'ring-[3px] ring-gold ring-offset-2' : 'ring-1 ring-ink/10')}>
                                    <img src={img(c.image, 400)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                                    <span className="absolute inset-0 bg-gradient-to-t from-forest-900/75 via-forest-900/15 to-transparent" />
                                    {on && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-white"><Icon name="check" size={14} strokeWidth={2.5} /></span>}
                                    <span className="absolute inset-x-3 bottom-2.5">
                                        <span className="block font-display text-[15px] font-bold leading-tight text-white">{c.name}</span>
                                        {!!count && <span className="block text-[12px] text-white/75">{tx('finder_tours_count', { count })}</span>}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-2 grid grid-cols-2 px-5 [&>label]:py-3.5 [&>label+label]:border-l [&>label+label]:pl-4">
                        <Select label={tx('finder_duration')} value={f.duration} onChange={(v) => setF({ ...f, duration: v })} options={durations} />
                        <Select label={tx('finder_budget')} value={f.budget} onChange={(v) => setF({ ...f, budget: v })} options={budgets} />
                    </div>
                    <button className="btn btn-gold !h-14 w-full !rounded-none">{tx('finder_button')} <Icon name="arrow" size={16} className="arrow" /></button>
                </form>
            </div>
        </section>
    );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
    return (
        <label className="relative flex cursor-pointer flex-col justify-center border-b border-ink/10 py-4 md:border-b-0 md:border-l md:px-6">
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45" title={label}>{label}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full cursor-pointer appearance-none bg-transparent pr-6 text-[16px] font-medium text-ink outline-none">
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <Icon name="chevronDown" size={16} className="pointer-events-none absolute bottom-5 right-0 text-ink/40 md:right-6" />
        </label>
    );
}

/* ================================================================ Popular packages: tabbed by category */
function Packages({ rows, categories, allTours, total }: { rows: Category[]; categories: Cat[]; allTours: Category['items']; total?: number }) {
    const { settings } = useShared();
    const tx = useText();
    // "All tours" comes first and is open by default; each experience follows as its own tab.
    const all = { id: 0, slug: 'all', name: settings.home_all_tab, home_title: settings.home_all_title, items: allTours ?? [] } as unknown as Category;
    const tabs = (allTours?.length ? [all, ...rows] : rows);
    const [tab, setTab] = useState(tabs[0]?.slug ?? '');
    if (!tabs.length) return null;
    const current = tabs.find((r) => r.slug === tab) ?? tabs[0];
    const isAll = current.slug === 'all';
    const countOf = (slug: string) => (slug === 'all' ? total : categories.find((c) => c.slug === slug)?.tours_count);
    const count = countOf(current.slug);

    return (
        <section id="packages" className="scroll-mt-24 py-14 lg:py-20">
            <div className="container-site">
                <div>
                    <p data-reveal className="eyebrow">{tx('packages_label')}</p>
                    <h2 data-reveal className="h-section fancy mt-4">{fancy(current.home_title || current.name)}</h2>
                </div>

                <div role="tablist" className="no-scrollbar -mx-5 mt-10 flex gap-8 overflow-x-auto overflow-y-hidden overscroll-x-contain border-b border-ink/15 px-5 sm:mx-0 sm:px-0">
                    {tabs.map((r) => {
                        const on = r.slug === current.slug;
                        const n = countOf(r.slug);
                        return (
                            <button key={r.id} role="tab" aria-selected={on} onClick={() => setTab(r.slug)}
                                className={cn('relative shrink-0 pb-4 text-[16px] font-semibold transition-colors', on ? 'text-ink' : 'text-ink/45 hover:text-ink')}>
                                {r.name}{n ? <sup className="ml-1 text-[11px] font-medium text-ink/40">{n}</sup> : null}
                                <span className={cn('absolute inset-x-0 -bottom-px h-[2px] origin-left bg-gold transition-transform duration-500', on ? 'scale-x-100' : 'scale-x-0')} />
                            </button>
                        );
                    })}
                </div>

                <PackageCarousel key={current.slug} items={current.items ?? []} />

                <div className="mt-12 flex flex-col gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={isAll ? '/tours' : `/experiences/${current.slug}`} className="btn btn-dark">{isAll ? tx('packages_view_all', { count: count ?? '' }) : tx('packages_view_cat', { count: count ?? '', name: current.name.toLowerCase() })} <Icon name="arrow" size={16} className="arrow" /></Link>
                    <p className="text-[15px] text-ink/60">{tx('packages_more')} <Link href="/plan-your-trip" className="link-arrow ml-1">{tx('packages_more_link')}</Link></p>
                </div>
            </div>
        </section>
    );
}

/** Horizontal trip row with classic indicators: one bar per trip (visible ones highlighted), counter and arrows. */
function PackageCarousel({ items }: { items: Category['items'] & object }) {
    const track = useRef<HTMLDivElement>(null);
    const [view, setView] = useState({ first: 0, visible: 1, start: true, end: false });
    const pad = (n: number) => String(n).padStart(2, '0');

    const measure = () => {
        const el = track.current;
        const card = el?.firstElementChild as HTMLElement | null;
        if (!el || !card) return { step: 1, gap: 0 };
        const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
        return { step: card.offsetWidth + gap, gap };
    };
    const frame = useRef(0);
    const update = () => {
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
        const el = track.current;
        if (!el) return;
        const { step, gap } = measure();
        const next = {
            first: Math.min(items.length - 1, Math.round(el.scrollLeft / step)),
            visible: Math.max(1, Math.floor((el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft || '0') + gap + 8) / step)),
            start: el.scrollLeft < 4,
            end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
        };
        // Only re-render when something visible actually changed.
        setView((v) => (v.first === next.first && v.visible === next.visible && v.start === next.start && v.end === next.end ? v : next));
        });
    };
    useEffect(() => {
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const go = (i: number) => track.current?.scrollTo({ left: Math.max(0, i) * measure().step, behavior: 'smooth' });
    const last = Math.min(items.length, view.first + view.visible);
    if (!items.length) return null;

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-1.5" aria-label="Trips">
                    {items.map((t, i) => {
                        const on = i >= view.first && i < last;
                        return (
                            <button key={t.id} onClick={() => go(i)} aria-label={`Show ${t.title}`} aria-current={on}
                                className="group flex h-6 items-center">
                                <span className={cn('block h-[3px] transition-all duration-500', on ? 'w-7 bg-forest-900' : 'w-3 bg-ink/20 group-hover:bg-forest-900/45')} />
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden text-[13px] font-semibold tabular-nums text-ink/55 sm:inline">
                        {pad(view.first + 1)}{last > view.first + 1 ? `-${pad(last)}` : ''} <span className="text-ink/30">/ {pad(items.length)}</span>
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => go(view.first - view.visible)} disabled={view.start} aria-label="Previous trips"
                            className="flex h-11 w-11 items-center justify-center border border-ink/20 transition hover:bg-forest-900 hover:text-white disabled:pointer-events-none disabled:opacity-30"><Icon name="arrowLeft" size={18} /></button>
                        <button onClick={() => go(view.first + view.visible)} disabled={view.end} aria-label="More trips"
                            className="flex h-11 w-11 items-center justify-center border border-ink/20 transition hover:bg-forest-900 hover:text-white disabled:pointer-events-none disabled:opacity-30"><Icon name="arrow" size={18} /></button>
                    </div>
                </div>
            </div>

            <div ref={track} onScroll={update}
                className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-pl-5 px-5 sm:mx-0 sm:gap-5 sm:px-0 sm:scroll-pl-0">
                {items.map((t, i) => (
                    <TourCard key={t.id} tour={t} delay={Math.min(i, 3) * 60}
                        className="w-[70vw] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]" />
                ))}
            </div>
        </div>
    );
}

/* ================================================================ Kilimanjaro: route index with cursor preview */
function RouteIndex({ category }: { category: Category }) {
    const { settings } = useShared();
    const tx = useText();
    const tours = (category.items ?? []).slice(0, 8);
    const [active, setActive] = useState(0);
    const [hovering, setHovering] = useState(false);
    const current = tours[active];
    const name = (title: string) => title.replace(/^Kilimanjaro\s*[\u2013\u2014-]?\s*/i, '') // also strips the long dash that older tour titles have;
    if (!tours.length) return null;
    const [lead, ...rest] = tours;

    return (
        <section className="bg-forest-900 py-14 text-white lg:py-20">
            <div className="container-site">
                {/* Header row */}
                <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <p data-reveal className="eyebrow eyebrow-light">{settings.home_kili_eyebrow || category.tagline}</p>
                        <h2 data-reveal className="h-section fancy mt-4 text-balance">{fancy(category.home_title || settings.home_kili_title)}</h2>
                    </div>
                </div>

                {/* ---------- Desktop: sticky photo stage beside the route index ---------- */}
                <div className="mt-14 hidden gap-12 lg:grid lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <Link href={`/tours/${current.slug}`} className="group sticky top-24 block h-[min(620px,calc(100vh-8rem))] overflow-hidden bg-white/5">
                            {tours.map((t, i) => (
                                <img key={t.id} src={img(t.image, 1000)} alt="" loading="lazy"
                                    className={cn('absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]', i === active ? 'scale-100 opacity-100' : 'scale-110 opacity-0')} />
                            ))}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/25 to-forest-900/30" />
                            <span className="absolute left-5 top-5 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">{tx('routes_badge')}</span>
                            <span className="absolute right-5 top-5 text-[13px] font-semibold tabular-nums text-white/80">
                                {String(active + 1).padStart(2, '0')}<span className="text-white/40"> / {String(tours.length).padStart(2, '0')}</span>
                            </span>
                            <div key={current.id} className="absolute inset-x-0 bottom-0 p-7">
                                <p className="mask"><span><span className="inline-block bg-gold px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white">{current.group_name}</span></span></p>
                                <p className="mask mt-2"><span style={{ animationDelay: '60ms' }} className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight">{name(current.title)}</span></p>
                                <div className="mask mt-5"><span style={{ animationDelay: '120ms' }} className="flex items-center gap-6 whitespace-nowrap border-t border-white/20 pt-4 text-[14px]">
                                    <span><span className="text-white/50">{tx('label_duration')} </span><span className="font-semibold">{current.duration_days} {tx('label_days')}</span></span>
                                    <span><span className="text-white/50">{tx('label_from')} </span><span className="font-semibold">{money(current.price_from)}</span></span>
                                    <span className="ml-auto flex h-10 w-10 items-center justify-center bg-white text-ink transition-transform group-hover:translate-x-1"><Icon name="arrow" size={16} /></span>
                                </span></div>
                            </div>
                        </Link>
                    </div>

                    <div className="lg:col-span-7" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
                        <div className="grid grid-cols-[3rem_1fr_6rem_7rem_3rem] gap-4 border-b border-white/15 px-4 pb-3 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/40">
                            <span>{tx('routes_no')}</span><span>{tx('routes_route')}</span><span>{tx('label_duration')}</span><span className="text-right">{tx('label_from')}</span><span />
                        </div>
                        <ul>
                            {tours.map((t, i) => {
                                const on = active === i && hovering;
                                return (
                                    <li key={t.id}>
                                        <Link href={`/tours/${t.slug}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
                                            className={cn('relative grid grid-cols-[3rem_1fr_6rem_7rem_3rem] items-center gap-4 overflow-hidden border-b border-white/15 px-4 py-7 transition-opacity duration-500', hovering && active !== i ? 'opacity-35' : 'opacity-100')}>
                                            <span aria-hidden className={cn('absolute inset-0 origin-left bg-gold transition-transform duration-[600ms] ease-[cubic-bezier(.7,0,.2,1)]', on ? 'scale-x-100' : 'scale-x-0')} />
                                            <span className={cn('relative text-[13px] font-semibold tabular-nums transition-colors', on ? 'text-white' : 'text-white/40')}>{String(i + 1).padStart(2, '0')}</span>
                                            <span className="relative">
                                                <span className={cn('font-display block text-[1.6rem] font-semibold leading-tight tracking-tight transition-transform duration-500', on && 'translate-x-2')}>{name(t.title)}</span>
                                                <span className={cn('mt-1 block text-[13px] transition-colors', on ? 'text-white/80' : 'text-white/45')}>{t.group_name}{t.difficulty ? ` · ${t.difficulty}` : ''}</span>
                                            </span>
                                            <span className="relative text-[15px]">{t.duration_days} days</span>
                                            <span className="relative text-right text-[16px] font-semibold">{money(t.price_from)}</span>
                                            <span className={cn('relative flex h-10 w-10 items-center justify-center justify-self-end border transition-all duration-500', on ? 'border-white bg-white text-gold-dark' : 'border-white/20 text-white/60')}>
                                                <Icon name="arrowUpRight" size={18} className={cn('transition-transform duration-500', on && 'rotate-45')} />
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* ---------- Phones & tablets: featured photo card + photo rows ---------- */}
                <div className="mt-10 lg:hidden">
                    <Link href={`/tours/${lead.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-white/5 sm:aspect-[16/10]">
                        <img src={img(lead.image, 900)} alt={lead.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/20 to-forest-900/30" />
                        <span className="absolute left-4 top-4 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink">{tx('routes_popular')}</span>
                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <p className="inline-block bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">01 · {lead.group_name}</p>
                            <p className="font-display mt-2 text-[1.5rem] font-semibold leading-tight tracking-tight">{name(lead.title)}</p>
                            <div className="mt-4 flex items-center gap-5 border-t border-white/20 pt-4 text-[14px]">
                                <span><span className="text-white/55">{tx('label_duration')} </span><span className="font-semibold">{lead.duration_days} {tx('label_days')}</span></span>
                                <span><span className="text-white/55">{tx('label_from')} </span><span className="font-semibold">{money(lead.price_from)}</span></span>
                                <span className="ml-auto flex h-10 w-10 items-center justify-center bg-gold text-white"><Icon name="arrow" size={16} /></span>
                            </div>
                        </div>
                    </Link>

                    <ul className="mt-2 sm:grid sm:grid-cols-2 sm:gap-x-6">
                        {rest.map((t, i) => (
                            <li key={t.id}>
                                <Link href={`/tours/${t.slug}`} className="flex items-center gap-4 border-b border-white/15 py-4 active:bg-white/5">
                                    <span className="relative h-24 w-24 shrink-0 overflow-hidden bg-white/5">
                                        <img src={img(t.image, 240)} alt="" loading="lazy" className="h-full w-full object-cover" />
                                        <span className="absolute left-0 top-0 bg-forest-900/80 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums">{String(i + 2).padStart(2, '0')}</span>
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-light">{t.group_name}</span>
                                        <span className="font-display mt-1 block text-[1.05rem] font-semibold leading-snug tracking-tight">{name(t.title)}</span>
                                        <span className="mt-1.5 block text-[13px] text-white/55">{t.duration_days} {tx('label_days')} · <span className="font-semibold text-white">{money(t.price_from)}</span></span>
                                    </span>
                                    <Icon name="chevronRight" size={18} className="shrink-0 text-white/40" />
                                </Link>
                            </li>
                        ))}
                    </ul>

                </div>
            </div>
        </section>
    );
}

/** Words light up one by one as the paragraph scrolls through the viewport. */
function ScrollText({ text }: { text: string }) {
    const ref = useRef<HTMLParagraphElement>(null);
    const [progress, setProgress] = useState(0);
    const words = (text || '').split(/\s+/).filter(Boolean);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setProgress(1); return; }
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const r = el.getBoundingClientRect();
                const vh = window.innerHeight;
                const start = vh * 0.85;
                const end = vh * 0.35;
                setProgress(Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.6))));
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
    }, []);

    const lit = Math.round(progress * words.length);
    return (
        <p ref={ref} className="font-display text-[clamp(1.2rem,1.8vw,1.5rem)] font-medium leading-[1.45] tracking-tight">
            {words.map((w, i) => (
                <span key={i} className="transition-colors duration-300" style={{ color: i < lit ? 'rgb(var(--c-ink))' : 'rgb(var(--c-ink) / 0.14)' }}>{w} </span>
            ))}
        </p>
    );
}

/* ================================================================ About */
function AboutStory() {
    const { settings } = useShared();
    const tx = useText();
    return (
        <section className="border-t border-ink/10 pb-10 pt-14 lg:pb-12 lg:pt-20">
            <div className="container-site grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-3">
                    <p data-reveal className="eyebrow">{settings.home_intro_eyebrow}</p>
                    <h2 data-reveal className="h-section mt-4">{plain(settings.home_intro_title)}</h2>
                </div>
                <div className="lg:col-span-9">
                    <ScrollText text={settings.home_intro_text} />
                    <div data-reveal className="mt-10 flex flex-wrap gap-3">
                        <Link href={tx('about_button_url')} className="btn btn-dark">{tx('about_button')} <Icon name="arrow" size={16} className="arrow" /></Link>
                        {tx('about_button2') && tx('about_button2_url') && <Link href={tx('about_button2_url')} className="btn btn-outline">{tx('about_button2')}</Link>}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Numbers */
function Figures({ counts }: { counts: Props['counts'] }) {
    const { settings } = useShared();
    const tx = useText();
    const reviews = (settings.rating_count || '').match(/\d+/)?.[0];
    // [number, label, button text, button link]: the buttons (CMS → Site text → Figures) lead to the matching section
    const figures = [
        [String(counts.tours), tx('figure_tours'), tx('figure_tours_link'), tx('figure_tours_url'), 'compass'],
        [String(counts.destinations), tx('figure_destinations'), tx('figure_destinations_link'), tx('figure_destinations_url'), 'map'],
        ...(reviews ? [[reviews, tx('figure_reviews', { source: settings.rating_source }), tx('figure_reviews_link'), settings.tripadvisor || '', 'tripadvisor']] : []),
        [tx('figure_treks_value'), tx('figure_treks'), tx('figure_treks_link'), tx('figure_treks_url'), 'mountain'],
    ] as [string, string, string, string, string][];
    return (
        <section className="pb-14 lg:pb-20">
            <div className="container-site">
                <dl className="grid grid-cols-2 border-y border-ink/15 md:grid-cols-4 md:divide-x md:divide-ink/15">
                    {figures.map(([n, label, more, url, icon], i) => (
                        <div key={label} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}
                            className={cn('px-1 py-8 sm:px-6 lg:py-10', i % 2 === 1 && 'border-l border-ink/15 md:border-l-0', i >= 2 && 'border-t border-ink/15 md:border-t-0', i === 0 && 'md:pl-0')}>
                            <span aria-hidden className="mb-4 flex h-11 w-11 items-center justify-center bg-gold/10 text-gold"><Icon name={icon as Parameters<typeof Icon>[0]['name']} size={20} /></span>
                            <dt className="font-display text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-none tracking-tight"><Counter value={n} /></dt>
                            <dd className="mt-3 text-[14px] text-ink/55">{label}</dd>
                            {more && url && (
                                <dd className="mt-4">
                                    {/^https?:/.test(url)
                                        ? <a href={url} target="_blank" rel="noreferrer" className="link-arrow !text-[13px]">{more} <Icon name="arrow" size={14} /></a>
                                        : <Link href={url} className="link-arrow !text-[13px]">{more} <Icon name="arrow" size={14} /></Link>}
                                </dd>
                            )}
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}

/* ================================================================ Reviews */
function Reviews({ items }: { items: Testimonial[] }) {
    const { settings } = useShared();
    const tx = useText();
    const [i, setI] = useState(0);
    const [open, setOpen] = useState(false); // "Read more" unfolds the review inside the same fixed-height box
    const [long, setLong] = useState(false);
    const quote = useRef<HTMLParagraphElement>(null);
    useEffect(() => { setOpen(false); }, [i]);
    useEffect(() => {
        const el = quote.current;
        if (el && !open) setLong(el.scrollHeight > el.clientHeight + 2);
    }, [i, open, items]);
    useEffect(() => {
        if (items.length < 2 || open) return;
        const t = window.setTimeout(() => setI((n) => (n + 1) % items.length), 9000);
        return () => window.clearTimeout(t);
    }, [i, open, items.length]);
    if (!items.length) return null;
    const r = items[i];

    return (
        <section className="border-t border-ink/10 bg-sand-100 py-14 lg:py-20">
            <div className="container-site">
                {/* Heading */}
                <div>
                    <p data-reveal className="eyebrow">{tx('reviews_label')}</p>
                    <h2 data-reveal className="h-section fancy mt-4">{fancy(settings.home_reviews_title)}</h2>
                </div>

                {/* One line under the heading: Tripadvisor rating on the left, carousel controls on the right */}
                <div className="flex flex-wrap items-center justify-between gap-6 border-y border-ink/15 py-5 mt-8">
                    {settings.rating_count ? (
                        <a href={settings.tripadvisor || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-4">
                            <TripadvisorMark size={48} />
                            <span>
                                <TripadvisorBubbles size={13} />
                                <span className="mt-1 block text-[15px] font-semibold">{settings.rating_count}</span>
                                <span className="link-arrow mt-0.5 !text-[13px]">{tx('reviews_read_on', { source: settings.rating_source })}</span>
                            </span>
                        </a>
                    ) : <span />}
                    <div className="flex items-center gap-4">
                        <span className="text-[13px] tabular-nums text-ink/50">{String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setI((i - 1 + items.length) % items.length)} aria-label="Previous review" className="flex h-12 w-12 items-center justify-center border border-ink/20 transition hover:bg-forest-900 hover:text-white"><Icon name="arrowLeft" size={18} /></button>
                            <button onClick={() => setI((i + 1) % items.length)} aria-label="Next review" className="flex h-12 w-12 items-center justify-center border border-ink/20 transition hover:bg-forest-900 hover:text-white"><Icon name="arrow" size={18} /></button>
                        </div>
                    </div>
                </div>

                {/* The review: fixed height, so long reviews never push the page around */}
                <figure key={r.id} className="mt-8 flex h-[400px] max-w-4xl flex-col sm:h-[300px]">
                    <Stars count={r.rating} size={16} className="text-gold" />
                    {r.title && <p className="font-display mt-5 line-clamp-1 text-[1.2rem] font-semibold tracking-tight">{r.title}</p>}
                    <blockquote className="mt-4 min-h-0 flex-1">
                        <p ref={quote} className={cn('h-full pr-2 font-display text-[1.1rem] font-medium leading-[1.5] tracking-tight text-ink sm:text-[1.25rem]', open ? 'overflow-y-auto' : 'overflow-hidden', long && !open && '[mask-image:linear-gradient(to_bottom,#000_75%,transparent)]')}>“{r.quote}”</p>
                    </blockquote>
                    {(long || open) && (
                        <button onClick={() => setOpen(!open)} className="link-arrow mt-3 self-start !text-[13px]">{tx(open ? 'reviews_less' : 'reviews_read_more')}</button>
                    )}
                    <figcaption className="mt-5 text-[14px]"><span className="font-semibold">{r.name}</span><span className="text-ink/50"> · {[r.trip, r.source].filter(Boolean).join(' · ')}</span></figcaption>
                </figure>
            </div>
        </section>
    );
}

const PILLAR_ICONS = ['users', 'pin', 'leaf', 'globe'];

/* ================================================================ Sustainability */
/** KLM's sustainability commitment (CMS → Site settings → Homepage), where the partner logos used to sit. */
function Sustainability() {
    const { settings } = useShared();
    const tx = useText();
    if (!settings.footer_sustain_title) return null;
    const pillars: { title: string; text: string }[] = (settings.footer_sustain_pillars ?? []).filter((p: { title?: string }) => p.title);
    const milestones: { value: string; label: string }[] = (settings.footer_sustain_milestones ?? []).filter((m: { value?: string }) => m.value).slice(0, 2);
    const links: { label: string; url: string }[] = (settings.footer_sustain_links ?? []).filter((l: { label?: string; url?: string }) => l.label && l.url);

    return (
        <section id="sustainability" className="border-t border-ink/10 bg-white py-14 lg:py-20">
            <div className="container-site">
                {/* Heading */}
                <div className="max-w-3xl">
                    <p data-reveal className="eyebrow"><Icon name="leaf" size={15} className="text-gold" /> {settings.footer_sustain_eyebrow}</p>
                    <h2 data-reveal className="h-section fancy mt-4 text-balance">{fancy(settings.footer_sustain_title)}</h2>
                </div>

                {/* Feature row: photo with our commitment on it, beside the four pillars */}
                <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-12 md:gap-5">
                    {settings.footer_sustain_image && (
                        <figure data-reveal className="img-zoom group relative min-h-[340px] overflow-hidden bg-forest-900 md:col-span-5 md:min-h-[460px]">
                            <img src={img(settings.footer_sustain_image, 1400)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: settings.footer_sustain_image_focus || '50% 50%' }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/20 to-transparent" />
                            {/* Milestones (CMS → Footer & newsletter → Sustainability section: milestones) */}
                            {!!milestones.length && (
                                <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                                    <span className="inline-flex items-center gap-2 bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"><Icon name="leaf" size={13} /> {tx('sustain_badge')}</span>
                                    <div className={cn('mt-4 grid gap-6', milestones.length > 1 && 'grid-cols-2')}>
                                        {milestones.map((m) => (
                                            <p key={m.value + m.label} className={cn(milestones.length > 1 && 'border-l border-white/30 pl-4 first:border-l-0 first:pl-0')}>
                                                <span className="block font-display text-[clamp(2.2rem,3.6vw,3rem)] font-bold leading-none tracking-tight"><Counter value={m.value} /></span>
                                                {m.label && <span className="mt-2 block text-[13.5px] leading-snug text-white/85">{m.label}</span>}
                                            </p>
                                        ))}
                                    </div>
                                </figcaption>
                            )}
                        </figure>
                    )}

                    {!!pillars.length && (
                        <ul className={cn('grid gap-4 sm:grid-cols-2 md:gap-5', settings.footer_sustain_image ? 'md:col-span-7' : 'md:col-span-12 lg:grid-cols-4')}>
                            {pillars.map((p, i) => (
                                <li key={p.title} data-reveal style={{ ['--d' as string]: `${i * 90}ms` }}
                                    className={cn('relative flex flex-col overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(29,68,104,.45)] lg:p-7',
                                        i === 0 ? 'bg-forest-900 text-white' : 'bg-white text-ink ring-1 ring-ink/10')}>
                                    <span aria-hidden className={cn('absolute right-5 top-3 font-display text-[54px] font-bold leading-none tabular-nums', i === 0 ? 'text-white/10' : 'text-ink/[0.06]')}>{String(i + 1).padStart(2, '0')}</span>
                                    <span className={cn('flex h-11 w-11 items-center justify-center', i === 0 ? 'bg-gold text-white' : 'bg-gold/10 text-gold')}><Icon name={PILLAR_ICONS[i % PILLAR_ICONS.length]} size={20} /></span>
                                    <p className="mt-auto pt-8 font-display text-[18px] font-bold leading-snug">{p.title}</p>
                                    {p.text && <p className={cn('mt-2 text-[14px] leading-relaxed', i === 0 ? 'text-white/75' : 'text-ink/65')}>{p.text}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Calls to action, bottom left */}
                {!!links.length && (
                    <div data-reveal className="mt-8 flex flex-wrap gap-3 md:mt-10">
                        {links.map((l, n) => <Link key={l.url} href={l.url} className={cn('btn', n ? 'btn-brand-outline' : 'btn-brand')}>{l.label} <Icon name="arrow" size={15} className="arrow" /></Link>)}
                    </div>
                )}
            </div>
        </section>
    );
}

