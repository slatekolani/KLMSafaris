import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import Counter from '@/Components/Counter';
import Icon from '@/Components/Icon';
import StayCard, { type Stay } from '@/Components/StayCard';
import TripadvisorMark, { TripadvisorBubbles } from '@/Components/TripadvisorMark';
import SectionHeading from '@/Components/SectionHeading';
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
            <AboutStory />
            <Figures counts={props.counts} />
            <Reviews items={props.testimonials} />
            <WhyUs />
            <Sustainability />
        </SiteLayout>
    );
}

/* ================================================================ Hero — cinematic reel */
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

    if (!count) return <div className="h-[70vh] bg-ink" />;
    const slide = slides[active];
    const pad = (n: number) => String(n).padStart(2, '0');
    const moves = ['kb-a', 'kb-b', 'kb-c', 'kb-d'];

    return (
        <section ref={stage} onMouseMove={onMove} onMouseLeave={() => stage.current?.style.setProperty('--mx', '0') || stage.current?.style.setProperty('--my', '0')}
            className="relative h-[82svh] min-h-[600px] overflow-hidden bg-ink text-white md:h-[calc(100svh-150px)] md:min-h-[600px]">
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
            <div className="absolute inset-0 z-30 bg-gradient-to-t from-black/80 via-black/15 to-black/25" />
            <div className="absolute inset-y-0 left-0 z-30 w-3/4 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />

            <div className="container-site relative z-40 flex h-full items-end pb-10 md:pb-28">
                <div className="grid w-full items-end gap-10 lg:grid-cols-12">
                    {/* Message */}
                    <div key={slide.id} className="min-w-0 lg:col-span-7 xl:col-span-7">
                        <p className="mask"><span style={{ animationDelay: '250ms' }} className="!inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/85">
                            <span className="h-px w-10 bg-gold-light" />{slide.eyebrow}
                        </span></p>
                        <h1 className="fancy on-photo mt-5 font-display text-[clamp(2.3rem,min(5.4vw,9.5vh),5.25rem)] font-extrabold uppercase leading-[1]">
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
                            <div className={cn('mb-4 flex items-end justify-between', dense && '[@media(max-height:760px)]:hidden')}>
                                <p className="font-display text-[2.6rem] font-semibold leading-none tabular-nums">{pad(active + 1)}<span className="text-[1.1rem] text-white/50"> / {pad(count)}</span></p>
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
                                                    on ? 'translate-x-0 bg-white text-ink shadow-[0_20px_40px_-20px_rgba(0,0,0,.6)]' : 'translate-x-3 bg-black/35 text-white backdrop-blur-md hover:translate-x-0 hover:bg-black/55')}>
                                                <span className={cn('relative shrink-0 overflow-hidden bg-white/10', dense ? 'h-10 w-14' : 'h-14 w-20')}>
                                                    <img src={img(s.image, 240)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    {s.video && <span className="absolute inset-0 flex items-center justify-center bg-black/25"><Icon name="play" size={12} className="text-white" /></span>}
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
/** Where guests stay — cover-image cards from CMS → Accommodation, or a "coming soon" panel until some are added. */
function Stays({ stays, total }: { stays: Stay[]; total: number }) {
    const { settings } = useShared();
    const tx = useText();
    const ORDER = ['Camping', 'Tented camp', 'Lodge', 'Luxury lodge', 'Hotel', 'Beach resort'];
    const types = [...new Set(stays.map((s) => s.type))].sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99);
    const [type, setType] = useState('');
    const shown = stays.filter((s) => !type || s.type === type);

    return (
        <section id="accommodation" className="scroll-mt-24 py-20 lg:py-28">
            <div className="container-site">
                <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <p data-reveal className="eyebrow"><span className="text-gold">03</span> {settings.home_stays_eyebrow}</p>
                        <h2 data-reveal className="h-section fancy mt-4 text-balance">{fancy(settings.home_stays_title)}</h2>
                    </div>
                </div>

                {stays.length === 0 ? (
                    <div data-reveal className="relative mt-10 overflow-hidden bg-ink text-white">
                        <div className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/8]">
                            {settings.home_stays_image && <img src={img(settings.home_stays_image, 2000)} alt="" loading="lazy" className="kb-b h-full w-full object-cover" style={{ ['--kb' as string]: '18s' }} />}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent" />
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
                            <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 sm:mx-0 sm:px-0">
                                {['', ...types].map((t) => (
                                    <button key={t || 'all'} onClick={() => setType(t)} className={cn('shrink-0 px-4 py-2 text-[14px] font-semibold ring-1 transition', type === t ? 'bg-ink text-white ring-ink' : 'bg-white text-ink/70 ring-ink/15 hover:text-ink')}>{t || tx('stays_all')}</button>
                                ))}
                            </div>
                        )}
                        <div className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                            {shown.map((s) => <StayCard key={s.id} stay={s} className="w-[78%] shrink-0 snap-start sm:w-auto" />)}
                        </div>
                        {total > stays.length && (
                            <div className="mt-10 flex justify-center">
                                <Link href="/accommodation" className="btn btn-brand-outline">{tx('stays_view_all', { count: total })} <Icon name="arrow" size={16} className="arrow" /></Link>
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
                    <div className="flex flex-col justify-center bg-ink px-7 text-white">
                        <Icon name="compass" size={20} className="text-gold-light" />
                        <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.16em]">{tx('finder_title')}</p>
                    </div>
                    <Select label={tx('finder_experience')} value={f.category} onChange={(v) => setF({ ...f, category: v })} options={[['', tx('finder_all_exp')], ...categories.map((c) => [c.slug, c.name] as [string, string])]} />
                    <Select label={tx('finder_duration')} value={f.duration} onChange={(v) => setF({ ...f, duration: v })} options={durations} />
                    <Select label={tx('finder_budget')} value={f.budget} onChange={(v) => setF({ ...f, budget: v })} options={budgets} />
                    <div className="flex items-center p-4"><button className="btn btn-gold !h-[60px] !px-8">{tx('finder_button')} <Icon name="arrow" size={16} className="arrow" /></button></div>
                </form>
            </div>

            {/* Phones: the same finder as a card — pick an experience by photo, then length and budget */}
            <div className="container-site relative pb-8 pt-0 md:hidden">
                <form onSubmit={submit} className="-mt-5 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.45)] ring-1 ring-ink/5">
                    <div className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-white">
                        <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.16em]"><Icon name="compass" size={18} className="text-gold-light" />{tx('finder_title')}</p>
                        <Link href="/tours" className="flex items-center gap-1.5 text-[13px] font-semibold text-white/80">{tx('finder_all_tours')} <Icon name="arrow" size={13} /></Link>
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
                                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
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

/* ================================================================ Popular packages — tabbed by category */
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
        <section id="packages" className="scroll-mt-24 py-20 lg:py-28">
            <div className="container-site">
                <div>
                    <p data-reveal className="eyebrow"><span className="text-gold">01</span> {tx('packages_label')}</p>
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
                                <span className={cn('block h-[3px] transition-all duration-500', on ? 'w-7 bg-ink' : 'w-3 bg-ink/20 group-hover:bg-ink/45')} />
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden text-[13px] font-semibold tabular-nums text-ink/55 sm:inline">
                        {pad(view.first + 1)}{last > view.first + 1 ? `–${pad(last)}` : ''} <span className="text-ink/30">/ {pad(items.length)}</span>
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => go(view.first - view.visible)} disabled={view.start} aria-label="Previous trips"
                            className="flex h-11 w-11 items-center justify-center border border-ink/20 transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"><Icon name="arrowLeft" size={18} /></button>
                        <button onClick={() => go(view.first + view.visible)} disabled={view.end} aria-label="More trips"
                            className="flex h-11 w-11 items-center justify-center border border-ink/20 transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"><Icon name="arrow" size={18} /></button>
                    </div>
                </div>
            </div>

            <div ref={track} onScroll={update}
                className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-pl-5 px-5 sm:mx-0 sm:gap-6 sm:px-0 sm:scroll-pl-0">
                {items.map((t, i) => (
                    <TourCard key={t.id} tour={t} delay={Math.min(i, 3) * 60}
                        className="w-[76vw] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]" />
                ))}
            </div>
        </div>
    );
}

/* ================================================================ Kilimanjaro — route index with cursor preview */
function RouteIndex({ category }: { category: Category }) {
    const { settings } = useShared();
    const tx = useText();
    const tours = (category.items ?? []).slice(0, 8);
    const [active, setActive] = useState(0);
    const [hovering, setHovering] = useState(false);
    const current = tours[active];
    const name = (title: string) => title.replace(/^Kilimanjaro\s*[–-]?\s*/i, '');
    if (!tours.length) return null;
    const [lead, ...rest] = tours;

    return (
        <section className="bg-ink py-20 text-white lg:py-32">
            <div className="container-site">
                {/* Header row */}
                <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <p data-reveal className="eyebrow eyebrow-light"><span className="text-gold">02</span> {settings.home_kili_eyebrow || category.tagline}</p>
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
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30" />
                            <span className="absolute left-5 top-5 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">{tx('routes_badge')}</span>
                            <span className="absolute right-5 top-5 text-[13px] font-semibold tabular-nums text-white/80">
                                {String(active + 1).padStart(2, '0')}<span className="text-white/40"> / {String(tours.length).padStart(2, '0')}</span>
                            </span>
                            <div key={current.id} className="absolute inset-x-0 bottom-0 p-7">
                                <p className="mask"><span><span className="inline-block bg-gold px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white">{current.group_name}</span></span></p>
                                <p className="mask mt-2"><span style={{ animationDelay: '60ms' }} className="font-display text-[2.1rem] font-semibold leading-tight tracking-tight">{name(current.title)}</span></p>
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
                        <span className="absolute left-4 top-4 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink">{tx('routes_popular')}</span>
                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <p className="inline-block bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">01 · {lead.group_name}</p>
                            <p className="font-display mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight">{name(lead.title)}</p>
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
                                        <span className="absolute left-0 top-0 bg-ink/80 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums">{String(i + 2).padStart(2, '0')}</span>
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
        <p ref={ref} className="font-display text-[clamp(1.55rem,3vw,2.75rem)] font-medium leading-[1.25] tracking-tight">
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
        <section className="pb-16 pt-24 lg:pb-20 lg:pt-32">
            <div className="container-site grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-3">
                    <p data-reveal className="eyebrow"><span className="text-gold">04</span> {settings.home_intro_eyebrow}</p>
                    <h2 data-reveal className="font-display mt-4 text-[1.5rem] font-semibold leading-tight tracking-tight">{plain(settings.home_intro_title)}</h2>
                </div>
                <div className="lg:col-span-9">
                    <ScrollText text={settings.home_intro_text} />
                    <div data-reveal className="mt-10 flex flex-wrap gap-3">
                        <Link href={tx('about_button_url')} className="btn btn-dark">{tx('about_button')} <Icon name="arrow" size={16} className="arrow" /></Link>
                        <Link href={tx('about_button2_url')} className="btn btn-outline">{tx('about_button2')}</Link>
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
    const figures = [
        [String(counts.tours), tx('figure_tours')],
        [String(counts.destinations), tx('figure_destinations')],
        ...(reviews ? [[reviews, tx('figure_reviews', { source: settings.rating_source })]] : []),
        [tx('figure_peak_value'), tx('figure_peak')],
    ] as [string, string][];
    return (
        <section className="pb-24 lg:pb-32">
            <div className="container-site">
                <dl className="grid grid-cols-2 border-y border-ink/15 lg:grid-cols-4">
                    {figures.map(([n, label], i) => (
                        <div key={label} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}
                            className={cn('px-1 py-8 sm:px-6 lg:py-12', i % 2 === 1 && 'border-l border-ink/15', i >= 2 && 'border-t border-ink/15 lg:border-t-0', i > 0 && 'lg:border-l lg:border-ink/15', i === 0 && 'sm:pl-0 lg:pl-0')}>
                            <dt className="font-display text-[clamp(2.6rem,5vw,4.5rem)] font-semibold leading-none tracking-tight"><Counter value={n} /></dt>
                            <dd className="mt-3 text-[14px] text-ink/55">{label}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}

/* ================================================================ Why travel with us */
function WhyUs() {
    const { settings } = useShared();
    const tx = useText();
    const points: { title: string; text: string }[] = settings.home_advice_points ?? [];
    const icons = ['home', 'compass', 'leaf', 'shield'];
    if (!points.length) return null;
    return (
        <section className="py-24 lg:py-32">
            <div className="container-site">
                <SectionHeading index="06" eyebrow={tx('why_label')} title={settings.home_advice_eyebrow} text={settings.home_advice_text}
                    action={<Link href={tx('about_button2_url')} className="link-arrow">{tx('why_more')} <Icon name="arrow" size={16} /></Link>} />
                <ol className="mt-12 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
                    {points.map((p, i) => (
                        <li key={i} data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}
                            className="group relative bg-sand-50 p-7 transition-colors duration-500 hover:bg-ink hover:text-white lg:p-8">
                            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
                            <div className="flex items-center justify-between">
                                <span className="flex h-12 w-12 items-center justify-center border border-ink/15 text-gold transition-colors group-hover:border-white/20 group-hover:text-gold-light">
                                    <Icon name={icons[i % icons.length]} size={22} />
                                </span>
                                <span className="text-[13px] font-semibold tabular-nums text-ink/35 transition-colors group-hover:text-white/40">{String(i + 1).padStart(2, '0')}</span>
                            </div>
                            <h3 className="font-display mt-8 text-[1.2rem] font-semibold tracking-tight">{p.title}</h3>
                            <p className="mt-3 text-[15px] leading-relaxed text-ink/60 transition-colors group-hover:text-white/65">{p.text}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

/* ================================================================ Reviews */
function Reviews({ items }: { items: Testimonial[] }) {
    const { settings } = useShared();
    const tx = useText();
    const [i, setI] = useState(0);
    useEffect(() => {
        if (items.length < 2) return;
        const t = window.setTimeout(() => setI((n) => (n + 1) % items.length), 9000);
        return () => window.clearTimeout(t);
    }, [i, items.length]);
    if (!items.length) return null;
    const r = items[i];

    return (
        <section className="bg-sand-100 py-24 lg:py-36">
            <div className="container-site grid gap-14 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <p data-reveal className="eyebrow"><span className="text-gold">05</span> {tx('reviews_label')}</p>
                    <h2 data-reveal className="h-section fancy mt-4">{fancy(settings.home_reviews_title)}</h2>
                    {settings.rating_count && (
                        <a href={settings.tripadvisor || '#'} target="_blank" rel="noreferrer" data-reveal className="mt-10 flex items-center gap-5 border-t border-ink/15 pt-6">
                            <TripadvisorMark size={56} />
                            <span>
                                <TripadvisorBubbles size={14} />
                                <span className="mt-1 block text-[15px] font-semibold">{settings.rating_count}</span>
                                <span className="link-arrow mt-1 !text-[13px]">Read them on {settings.rating_source}</span>
                            </span>
                        </a>
                    )}
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                    <figure key={r.id} className="min-h-[340px]">
                        <Stars count={r.rating} size={16} className="text-gold" />
                        {r.title && <p className="font-display mask mt-6 text-[1.2rem] font-semibold tracking-tight"><span>{r.title}</span></p>}
                        <blockquote className="mask mt-4"><span style={{ animationDelay: '100ms' }} className={cn('line-clamp-[7] font-display font-medium leading-[1.35] tracking-tight text-ink', r.quote.length > 280 ? 'text-[1.2rem] sm:text-[1.45rem]' : 'text-2xl sm:text-[2rem]')}>“{r.quote}”</span></blockquote>
                        <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]"><span><span className="font-semibold">{r.name}</span><span className="text-ink/50"> · {[r.trip, r.source].filter(Boolean).join(' · ')}</span></span>{r.quote.length > 280 && settings.tripadvisor && <a href={settings.tripadvisor} target="_blank" rel="noreferrer" className="link-arrow !text-[13px]">{tx('reviews_more')}</a>}</figcaption>
                    </figure>
                    <div className="mt-10 flex items-center justify-between border-t border-ink/15 pt-6">
                        <span className="text-[13px] tabular-nums text-ink/50">{String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setI((i - 1 + items.length) % items.length)} aria-label="Previous review" className="flex h-12 w-12 items-center justify-center border border-ink/20 transition hover:bg-ink hover:text-white"><Icon name="arrowLeft" size={18} /></button>
                            <button onClick={() => setI((i + 1) % items.length)} aria-label="Next review" className="flex h-12 w-12 items-center justify-center border border-ink/20 transition hover:bg-ink hover:text-white"><Icon name="arrow" size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const PILLAR_ICONS = ['users', 'pin', 'leaf', 'globe'];

/* ================================================================ Sustainability */
/** KLM's sustainability commitment (CMS → Site settings → Homepage), where the partner logos used to sit. */
function Sustainability() {
    const { settings } = useShared();
    const bg = useParallax(0.12);
    if (!settings.footer_sustain_title) return null;
    const pillars: { title: string; text: string }[] = (settings.footer_sustain_pillars ?? []).filter((p: { title?: string }) => p.title);
    const links: { label: string; url: string }[] = (settings.footer_sustain_links ?? []).filter((l: { label?: string; url?: string }) => l.label && l.url);

    return (
        <section id="sustainability" className="relative isolate overflow-hidden py-20 text-white lg:py-32">
            {/* Photo background (CMS → Homepage → Sustainability section – background photo), shaded for legible text */}
            {settings.footer_sustain_image && (
                <div ref={bg} className="absolute inset-x-0 -inset-y-[12%] -z-20">
                    <img src={img(settings.footer_sustain_image, 2000)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/55 to-black/75 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/55 lg:to-black/35" />

            <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
                <div className="lg:col-span-5">
                    <p data-reveal className="eyebrow !text-white"><Icon name="leaf" size={15} className="text-gold-light" /> {settings.footer_sustain_eyebrow}</p>
                    <h2 data-reveal className="h-section fancy on-photo mt-4 text-white">{fancy(settings.footer_sustain_title)}</h2>
                    {settings.footer_sustain_text && <p data-reveal className="mt-5 text-[16px] leading-relaxed text-white/85">{settings.footer_sustain_text}</p>}
                    {settings.footer_sustain_note && (
                        <p data-reveal className="mt-6 border-l-2 border-gold pl-4 text-[15px] leading-relaxed text-white/90">{settings.footer_sustain_note}</p>
                    )}
                    {!!links.length && (
                        <div data-reveal className="mt-8 flex flex-wrap gap-3">
                            {links.map((l, n) => <Link key={l.url} href={l.url} className={cn('btn', n ? 'border border-white/70 bg-transparent text-white hover:bg-white hover:text-gold' : 'btn-brand')}>{l.label} <Icon name="arrow" size={15} className="arrow" /></Link>)}
                        </div>
                    )}
                </div>
                {!!pillars.length && (
                    <ul className="grid grid-cols-2 gap-3 lg:col-span-7 lg:gap-4">
                        {pillars.map((p, i) => (
                            <li key={p.title} data-reveal style={{ ['--d' as string]: `${i * 90}ms` }} className="bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md sm:p-6">
                                <span className="flex h-10 w-10 items-center justify-center bg-gold text-white sm:h-11 sm:w-11"><Icon name={PILLAR_ICONS[i % PILLAR_ICONS.length]} size={19} /></span>
                                <p className="mt-4 font-display text-[15px] font-bold leading-snug text-white sm:mt-5 sm:text-[18px]">{p.title}</p>
                                {p.text && <p className="mt-1.5 text-[13px] leading-relaxed text-white/80 sm:text-[14.5px]">{p.text}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

function useParallax(speed = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const r = el.parentElement!.getBoundingClientRect();
                el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - window.innerHeight / 2) * -speed}px, 0)`;
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [speed]);
    return ref;
}
