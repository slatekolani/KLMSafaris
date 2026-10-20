import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import Counter from '@/Components/Counter';
import Icon from '@/Components/Icon';
import SectionHeading from '@/Components/SectionHeading';
import Stars from '@/Components/Stars';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, fancy, formatDate, img, money, plain, useShared } from '@/lib/utils';
import type { Category, Destination, Partner, Post, Slide, Stat, Testimonial } from '@/types';

type Cat = Category & { tours_count?: number };
type Props = {
    slides: (Slide & { video?: string | null })[];
    categories: Cat[];
    rows: Category[];
    destinations: Destination[];
    stats: Stat[];
    testimonials: Testimonial[];
    partners: Partner[];
    posts: Post[];
    counts: { tours: number; destinations: number; categories: number };
};

export default function Home(props: Props) {
    const { settings } = useShared();
    const kili = props.rows.find((r) => r.slug === 'kilimanjaro');
    const safari = props.rows.find((r) => r.slug === 'safari');
    const others = props.rows.filter((r) => r !== kili && r !== safari);

    return (
        <SiteLayout title={settings.tagline}>
            <Hero slides={props.slides} />
            <TripFinder categories={props.categories} />
            <Intro counts={props.counts} />
            <Experiences categories={props.categories} />
            {kili && <RouteIndex category={kili} />}
            {safari && <Carousel category={safari} />}
            <FullMoon />
            <WhyUs />
            {others.map((c, i) => <GridRow key={c.id} category={c} tinted={i % 2 === 0} />)}
            <Destinations items={props.destinations} />
            <Impact stats={props.stats} />
            <Reviews items={props.testimonials} />
            <Rescue />
            <Partners items={props.partners} />
            <Journal posts={props.posts} />
            <ClosingCta />
        </SiteLayout>
    );
}

/* ================================================================ Hero — cinematic reel */
function Hero({ slides }: { slides: Props['slides'] }) {
    const { settings } = useShared();
    const [active, setActive] = useState(0);
    const [playing, setPlaying] = useState(true);
    const videos = useRef<(HTMLVideoElement | null)[]>([]);
    const duration = slides[active]?.video ? 10000 : 7000;

    useEffect(() => {
        if (slides.length < 2 || !playing) return;
        const t = window.setTimeout(() => setActive((a) => (a + 1) % slides.length), duration);
        return () => window.clearTimeout(t);
    }, [active, playing, slides.length, duration]);

    useEffect(() => {
        videos.current.forEach((v, i) => {
            if (!v) return;
            if (i === active && playing) v.play().catch(() => undefined);
            else v.pause();
        });
    }, [active, playing]);

    if (!slides.length) return <div className="h-[70vh] bg-ink" />;
    const slide = slides[active];
    const facts: { title: string; text: string }[] = settings.hero_facts ?? [];

    return (
        <section className="relative flex h-[100svh] min-h-[680px] flex-col overflow-hidden bg-ink text-white">
            {slides.map((s, i) => (
                <div key={s.id} className={cn('absolute inset-0 transition-opacity duration-[1400ms] ease-out', i === active ? 'opacity-100' : 'opacity-0')} aria-hidden={i !== active}>
                    {s.video ? (
                        <video ref={(el) => (videos.current[i] = el)} src={s.video} poster={img(s.image, 1920)} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'} className="h-full w-full object-cover" />
                    ) : (
                        <img src={img(s.image, 2200, 78)} alt="" className={cn('h-full w-full object-cover', i === active && 'kenburns')} />
                    )}
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/45" />
            <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/45 to-transparent" />

            <div className="container-site relative z-10 flex flex-1 flex-col justify-end pb-10 pt-40">
                <div className="grid items-end gap-10 lg:grid-cols-12">
                    <div key={slide.id} className="min-w-0 lg:col-span-9">
                        <p className="mask text-[12px] font-semibold uppercase tracking-[0.22em] text-white/75"><span>{slide.eyebrow}</span></p>
                        <h1 className="display-xl fancy mt-5">
                            {splitLines(slide.title).map((line, i) => (
                                <span key={i} className="mask"><span style={{ animationDelay: `${120 + i * 110}ms` }}>{fancy(line)}</span></span>
                            ))}
                        </h1>
                        {slide.subtitle && <p className="mask mt-7 max-w-xl text-[17px] leading-relaxed text-white/80"><span style={{ animationDelay: '380ms' }}>{slide.subtitle}</span></p>}
                        <div className="mt-9 flex flex-wrap gap-3">
                            {slide.cta_label && <Link href={slide.cta_url || '/tours'} className="btn btn-light">{slide.cta_label} <Icon name="arrow" size={16} className="arrow" /></Link>}
                            <Link href="/plan-your-trip" className="btn btn-ghost">Plan your trip</Link>
                        </div>
                    </div>

                    {/* Chapter navigation */}
                    <ol className="hidden lg:col-span-3 lg:block">
                        {slides.map((s, i) => (
                            <li key={s.id}>
                                <button onClick={() => setActive(i)} className="group relative w-full border-t border-white/20 py-3.5 text-left">
                                    {i === active && <span key={`${active}-${playing}`} className="slide-progress absolute -top-px left-0 h-px w-full bg-white" style={{ ['--dur' as string]: `${duration}ms`, animationPlayState: playing ? 'running' : 'paused' }} />}
                                    <span className={cn('flex items-baseline gap-4 text-[14px] transition-colors', i === active ? 'text-white' : 'text-white/45 group-hover:text-white/80')}>
                                        <span className="text-[12px] tabular-nums">0{i + 1}</span>
                                        <span className="font-semibold">{plain(s.title)}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                        <li className="border-t border-white/20 pt-4">
                            <button onClick={() => setPlaying(!playing)} className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60 hover:text-white" aria-label={playing ? 'Pause' : 'Play'}>
                                <Icon name={playing ? 'pause' : 'play'} size={13} /> {playing ? 'Pause' : 'Play'}
                            </button>
                        </li>
                    </ol>
                </div>
            </div>

            {/* Trust bar */}
            {facts.length > 0 && (
                <div className="relative z-10 border-t border-white/15 bg-black/30 backdrop-blur-sm">
                    <div className="container-site no-scrollbar flex gap-10 overflow-x-auto py-5 lg:grid lg:grid-cols-4 lg:gap-8">
                        {facts.map((f, i) => (
                            <div key={i} className="flex shrink-0 items-center gap-3">
                                <div className="leading-tight">
                                    <p className="flex items-center gap-2 text-[14px] font-semibold">{f.title}{i === 1 && <Stars size={12} className="text-accent" />}</p>
                                    <p className="mt-0.5 text-[12.5px] text-white/55">{f.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

/** "Journey with *KLM Safaris*" → ["Journey with", "*KLM Safaris*"] so each line can be revealed. */
function splitLines(title: string): string[] {
    const parts = title.split(/(\*[^*]+\*)/).map((p) => p.trim()).filter(Boolean);
    return parts.length > 1 ? parts : [title];
}

/* ================================================================ Trip finder */
function TripFinder({ categories }: { categories: Category[] }) {
    const [f, setF] = useState({ category: '', duration: '', budget: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/tours', Object.fromEntries(Object.entries(f).filter(([, v]) => v)));
    };
    return (
        <section className="border-b border-ink/10 bg-white">
            <form onSubmit={submit} className="container-site grid items-stretch md:grid-cols-[auto_1fr_1fr_1fr_auto]">
                <p className="hidden items-center pr-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-ink md:flex">Find your trip</p>
                <Select label="Experience" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={[['', 'All experiences'], ...categories.map((c) => [c.slug, c.name] as [string, string])]} />
                <Select label="Duration" value={f.duration} onChange={(v) => setF({ ...f, duration: v })} options={[['', 'Any length'], ['1-1', 'Day trips'], ['2-5', '2 – 5 days'], ['6-9', '6 – 9 days'], ['10-99', '10+ days']]} />
                <Select label="Budget per person" value={f.budget} onChange={(v) => setF({ ...f, budget: v })} options={[['', 'Any budget'], ['500', 'Up to $500'], ['1500', 'Up to $1,500'], ['3000', 'Up to $3,000'], ['10000', 'Up to $10,000']]} />
                <div className="flex items-center py-4 md:pl-6"><button className="btn btn-dark w-full md:w-auto">Search tours <Icon name="arrow" size={16} className="arrow" /></button></div>
            </form>
        </section>
    );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
    return (
        <label className="relative flex cursor-pointer flex-col justify-center border-b border-ink/10 py-4 md:border-b-0 md:border-l md:px-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{label}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full cursor-pointer appearance-none bg-transparent pr-6 text-[16px] font-medium text-ink outline-none">
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <Icon name="chevronDown" size={16} className="pointer-events-none absolute bottom-5 right-0 text-ink/40 md:right-6" />
        </label>
    );
}

/* ================================================================ Intro */
function Intro({ counts }: { counts: Props['counts'] }) {
    const { settings } = useShared();
    const reviews = (settings.rating_count || '').match(/\d+/)?.[0];
    const figures = [
        [String(counts.tours), 'Tours & day trips'],
        [String(counts.destinations), 'Destinations in Tanzania'],
        ...(reviews ? [[reviews, `${settings.rating_source} reviews`]] : []),
        ['5895', 'Metres to Uhuru Peak'],
    ] as [string, string][];

    return (
        <section className="py-24 lg:py-36">
            <div className="container-site grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-3">
                    <p data-reveal className="eyebrow"><span className="text-gold">01</span> {settings.home_intro_eyebrow}</p>
                </div>
                <div className="lg:col-span-9">
                    <h2 data-reveal className="h-section fancy text-balance">{fancy(settings.home_intro_title)}</h2>
                    <p data-reveal style={{ ['--d' as string]: '80ms' }} className="lead mt-8 text-ink/75">{settings.home_intro_text}</p>
                    <div data-reveal style={{ ['--d' as string]: '140ms' }} className="mt-10 flex flex-wrap gap-3">
                        <Link href="/about-klm-safaris" className="btn btn-dark">About KLM Safaris <Icon name="arrow" size={16} className="arrow" /></Link>
                        <Link href="/why-traveling-with-klm-safaris" className="btn btn-outline">Why travel with us</Link>
                    </div>
                    <dl className="mt-20 grid grid-cols-2 border-t border-ink/15 lg:grid-cols-4">
                        {figures.map(([n, label], i) => (
                            <div key={label} data-reveal style={{ ['--d' as string]: `${i * 70}ms` }} className={cn('pb-2 pt-6', i % 2 === 1 && 'border-l border-ink/15 pl-6', i === 2 && 'lg:border-l lg:border-ink/15 lg:pl-8', i > 0 && 'lg:pl-8')}>
                                <dt className="font-display text-[clamp(2.4rem,4vw,3.6rem)] font-semibold leading-none tracking-tight"><Counter value={n} /></dt>
                                <dd className="mt-3 text-[14px] text-ink/55">{label}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Experiences — expanding panels */
function Experiences({ categories }: { categories: Cat[] }) {
    const [open, setOpen] = useState(0);
    if (!categories.length) return null;
    const names = categories.map((c) => c.name);
    const title = names.length > 1 ? `${names.slice(0, -1).join(', ')} *& ${names[names.length - 1]}*` : names[0];

    return (
        <section className="pb-24 lg:pb-36">
            <div className="container-site">
                <SectionHeading index="02" eyebrow="What we offer" title={title} />

                <div className="mt-14 hidden h-[620px] gap-2 lg:flex">
                    {categories.map((c, i) => (
                        <Link key={c.id} href={`/experiences/${c.slug}`} onMouseEnter={() => setOpen(i)} onFocus={() => setOpen(i)}
                            className={cn('group relative overflow-hidden bg-ink text-white transition-[flex-grow] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]', open === i ? 'flex-[3.2]' : 'flex-[1]')}>
                            <img src={img(c.image, 1400)} alt="" loading="lazy" className={cn('absolute inset-0 h-full w-full object-cover transition duration-[1.2s]', open === i ? 'scale-100 opacity-100' : 'scale-110 opacity-60')} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
                            <span className="absolute left-6 top-6 text-[12px] font-semibold tabular-nums tracking-[0.16em] text-white/70">0{i + 1}</span>
                            {open !== i && <h3 className="absolute left-5 top-16 whitespace-nowrap font-display text-[1.6rem] font-bold uppercase tracking-tight [font-stretch:110%] [writing-mode:vertical-rl]">{c.name}</h3>}
                            <div className="absolute inset-x-0 bottom-0 p-7">
                                {open === i ? (
                                    <>
                                        <h3 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight [font-stretch:110%]">{c.name}</h3>
                                        <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/75">{c.description}</p>
                                        <p className="mt-6 inline-flex items-center gap-3 text-[14px] font-semibold">
                                            {c.tours_count ? `${c.tours_count} tours` : 'Explore'} <span className="h-px w-10 bg-white/50" /> View all <Icon name="arrow" size={16} />
                                        </p>
                                    </>
                                ) : null}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:hidden">
                    {categories.map((c) => (
                        <Link key={c.id} href={`/experiences/${c.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-ink text-white">
                            <img src={img(c.image, 900)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-0 p-5">
                                <h3 className="font-display text-3xl font-bold uppercase [font-stretch:110%]">{c.name}</h3>
                                <p className="mt-1 text-sm text-white/70">{c.tagline}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Kilimanjaro — route index with cursor preview */
function RouteIndex({ category }: { category: Category }) {
    const { settings } = useShared();
    const tours = (category.items ?? []).slice(0, 8);
    const [hover, setHover] = useState<number | null>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });

    return (
        <section className="bg-ink py-24 text-white lg:py-36">
            <div className="container-site grid gap-14 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-32">
                        <p data-reveal className="eyebrow eyebrow-light"><span className="text-gold">03</span> {settings.home_kili_eyebrow || category.tagline}</p>
                        <h2 data-reveal className="h-section fancy mt-4 text-balance">{fancy(category.home_title || settings.home_kili_title)}</h2>
                        <p data-reveal className="mt-6 text-[16.5px] leading-relaxed text-white/60">{category.home_text || settings.home_kili_text}</p>
                        <div data-reveal className="mt-8">
                            <Link href={`/experiences/${category.slug}`} className="btn btn-light">All Kilimanjaro routes <Icon name="arrow" size={16} className="arrow" /></Link>
                        </div>
                        <div data-reveal className="mt-12 hidden aspect-[4/3] overflow-hidden lg:block">
                            <img src={img(settings.home_kili_image, 900)} alt="" loading="lazy" className="h-full w-full object-cover opacity-90" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8" onMouseMove={move} onMouseLeave={() => setHover(null)}>
                    <div className="hidden grid-cols-[3rem_1fr_7rem_8rem_2rem] gap-4 border-b border-white/15 pb-3 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/40 md:grid">
                        <span>No.</span><span>Route</span><span>Duration</span><span className="text-right">From</span><span />
                    </div>
                    <ul>
                        {tours.map((t, i) => (
                            <li key={t.id} data-reveal style={{ ['--d' as string]: `${i * 50}ms` }}>
                                <Link href={`/tours/${t.slug}`} onMouseEnter={() => setHover(i)}
                                    className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-white/15 py-6 transition-colors hover:bg-white/[0.03] md:grid-cols-[3rem_1fr_7rem_8rem_2rem] md:py-7">
                                    <span className="text-[13px] tabular-nums text-white/40">{String(i + 1).padStart(2, '0')}</span>
                                    <span>
                                        <span className="block font-display text-[1.35rem] font-semibold leading-tight tracking-tight transition-transform duration-500 group-hover:translate-x-2 md:text-[1.7rem]">{t.title.replace(/^Kilimanjaro\s*[–-]?\s*/i, '')}</span>
                                        <span className="mt-1 block text-[13px] text-white/45">{t.group_name}{t.difficulty ? ` · ${t.difficulty}` : ''}</span>
                                    </span>
                                    <span className="hidden text-[15px] text-white/70 md:block">{t.duration_days} days</span>
                                    <span className="text-right text-[15px] font-semibold md:text-[16px]">{money(t.price_from)}</span>
                                    <Icon name="arrowUpRight" size={20} className="hidden text-white/40 transition group-hover:text-white md:block" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Floating preview that follows the cursor */}
            <div className="pointer-events-none fixed left-0 top-0 z-40 hidden h-56 w-80 overflow-hidden transition-[opacity,transform] duration-300 ease-out lg:block"
                style={{ transform: `translate3d(${pos.x + 28}px, ${pos.y - 110}px, 0) scale(${hover !== null ? 1 : 0.9})`, opacity: hover !== null ? 1 : 0 }}>
                {tours.map((t, i) => <img key={t.id} src={img(t.image, 640)} alt="" className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-300', hover === i ? 'opacity-100' : 'opacity-0')} />)}
            </div>
        </section>
    );
}

/* ================================================================ Safari — carousel */
function Carousel({ category }: { category: Category }) {
    const track = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const scroll = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });
    const onScroll = () => {
        const el = track.current;
        if (el) setProgress(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
    };

    return (
        <section className="overflow-hidden py-24 lg:py-36">
            <div className="container-site">
                <SectionHeading index="04" eyebrow={category.tagline} title={category.home_title || category.name} text={category.description}
                    action={<Link href={`/experiences/${category.slug}`} className="link-arrow">All {category.name.toLowerCase()} tours <Icon name="arrow" size={16} /></Link>} />
            </div>
            <div ref={track} onScroll={onScroll} className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-pl-5 px-5 sm:scroll-pl-8 sm:px-8 lg:scroll-pl-[max(3rem,calc((100vw-88rem)/2+3rem))] lg:px-[max(3rem,calc((100vw-88rem)/2+3rem))]">
                {(category.items ?? []).map((t, i) => <TourCard key={t.id} tour={t} delay={i * 60} className="w-[78vw] shrink-0 snap-start sm:w-[340px] lg:w-[380px]" />)}
            </div>
            <div className="container-site mt-10 flex items-center gap-6">
                <div className="relative h-px flex-1 bg-ink/15"><div className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-300" style={{ width: `${Math.max(12, progress * 100)}%` }} /></div>
                <div className="flex gap-2">
                    <button onClick={() => scroll(-1)} aria-label="Previous" className="flex h-12 w-12 items-center justify-center border border-ink/20 transition hover:bg-ink hover:text-white"><Icon name="arrowLeft" size={18} /></button>
                    <button onClick={() => scroll(1)} aria-label="Next" className="flex h-12 w-12 items-center justify-center border border-ink/20 transition hover:bg-ink hover:text-white"><Icon name="arrow" size={18} /></button>
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Full moon band */
function FullMoon() {
    const { settings } = useShared();
    const bg = useParallax(0.12);
    if (!settings.fullmoon_title) return null;
    return (
        <section className="relative flex min-h-[78vh] items-center overflow-hidden bg-ink text-white">
            <div ref={bg} className="absolute inset-x-0 -top-[12%] h-[124%]">
                <img src={img(settings.fullmoon_image, 2000)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/55" />
            <div className="container-site relative py-28 text-center">
                <p data-reveal className="eyebrow eyebrow-light">Kilimanjaro group climbs</p>
                <h2 data-reveal style={{ ['--d' as string]: '60ms' }} className="h-display fancy mx-auto mt-6 max-w-5xl text-balance">{fancy(settings.fullmoon_title)}</h2>
                <p data-reveal style={{ ['--d' as string]: '120ms' }} className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-white/75">{settings.fullmoon_text}</p>
                <div data-reveal style={{ ['--d' as string]: '180ms' }} className="mt-10">
                    <Link href={settings.fullmoon_link || '/'} className="btn btn-light">See the full moon dates <Icon name="arrow" size={16} className="arrow" /></Link>
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Why us */
function WhyUs() {
    const { settings } = useShared();
    const points: { title: string; text: string }[] = settings.home_advice_points ?? [];
    return (
        <section className="py-24 lg:py-36">
            <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-20">
                <div className="relative self-start lg:col-span-5">
                    <div className="clip-reveal aspect-[4/5] overflow-hidden bg-sand-200">
                        <img src={img(settings.home_advice_image, 1100)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    {settings.home_advice_badge_value && (
                        <div data-reveal className="absolute -bottom-6 right-0 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.35)] sm:-right-6">
                            <p className="font-display text-5xl font-semibold leading-none tracking-tight">{settings.home_advice_badge_value}</p>
                            <p className="mt-2 text-[13px] text-ink/55">{settings.home_advice_badge_label}</p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-7">
                    <p data-reveal className="eyebrow"><span className="text-gold">05</span> {settings.home_advice_eyebrow}</p>
                    <h2 data-reveal className="h-section fancy mt-4 text-balance">{fancy(settings.home_advice_title)}</h2>
                    <p data-reveal className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink/60">{settings.home_advice_text}</p>
                    <ol className="mt-12 border-t border-ink/15">
                        {points.map((p, i) => (
                            <li key={i} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }} className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-1 border-b border-ink/15 py-6 sm:grid-cols-[3rem_14rem_1fr]">
                                <span className="text-[13px] font-semibold tabular-nums text-gold">{String(i + 1).padStart(2, '0')}</span>
                                <h3 className="text-[1.15rem] font-semibold tracking-tight">{p.title}</h3>
                                <p className="col-start-2 text-[15px] leading-relaxed text-ink/60 sm:col-start-3">{p.text}</p>
                            </li>
                        ))}
                    </ol>
                    <div data-reveal className="mt-10 flex flex-wrap gap-3">
                        <Link href="/plan-your-trip" className="btn btn-gold">Make an enquiry <Icon name="arrow" size={16} className="arrow" /></Link>
                        <Link href="/tours" className="btn btn-outline">View all tours</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Category rows */
function GridRow({ category: c, tinted }: { category: Category; tinted: boolean }) {
    return (
        <section className={cn('py-24 lg:py-32', tinted ? 'bg-sand-100' : 'bg-sand-50')}>
            <div className="container-site">
                <SectionHeading eyebrow={c.tagline} title={c.home_title || c.name} text={c.home_text || c.description}
                    action={<Link href={`/experiences/${c.slug}`} className="link-arrow">All {c.name.toLowerCase()} <Icon name="arrow" size={16} /></Link>} />
                <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {(c.items ?? []).slice(0, 4).map((t, i) => <TourCard key={t.id} tour={t} delay={i * 60} />)}
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Destinations mosaic */
function Destinations({ items }: { items: Destination[] }) {
    const { settings } = useShared();
    if (!items.length) return null;
    return (
        <section className="py-24 lg:py-36">
            <div className="container-site">
                <SectionHeading index="06" eyebrow="Destinations" title={settings.home_dest_title}
                    action={<Link href="/destinations" className="link-arrow">All destinations <Icon name="arrow" size={16} /></Link>} />
                <div className="mt-14 grid auto-rows-[260px] gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {items.slice(0, 7).map((d, i) => (
                        <Link key={d.id} href={`/destinations/${d.slug}`} data-reveal style={{ ['--d' as string]: `${(i % 4) * 60}ms` }}
                            className={cn('img-zoom group relative block overflow-hidden bg-ink text-white', i === 0 && 'sm:col-span-2 sm:row-span-2')}>
                            <img src={img(d.image, i === 0 ? 1400 : 700)} alt={d.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                                <div>
                                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/65">{d.region}</p>
                                    <h3 className={cn('mt-1 font-semibold tracking-tight', i === 0 ? 'text-4xl' : 'text-2xl')}>{d.name}</h3>
                                </div>
                                {!!d.tours_count && <span className="shrink-0 text-[13px] text-white/70">{d.tours_count} tours</span>}
                            </div>
                        </Link>
                    ))}
                    <Link href="/destinations" className="group flex flex-col justify-between bg-ink p-6 text-white">
                        <Icon name="map" size={26} className="text-gold-light" />
                        <span>
                            <span className="block text-2xl font-semibold tracking-tight">All destinations</span>
                            <span className="mt-2 inline-flex items-center gap-2 text-[14px] text-white/60 group-hover:text-white">Explore Tanzania <Icon name="arrow" size={15} /></span>
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Impact (only when stats exist) */
function Impact({ stats }: { stats: Stat[] }) {
    const { settings } = useShared();
    if (!stats.length) return null;
    return (
        <section className="bg-ink py-24 text-white">
            <div className="container-site">
                <SectionHeading light eyebrow="Impact" title={settings.home_stats_title} />
                <dl className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s) => (
                        <div key={s.id} className="bg-ink p-8">
                            <dt className="font-display text-6xl font-semibold"><Counter value={s.value} />{s.suffix}</dt>
                            <dd className="mt-3 font-semibold">{s.label}</dd>
                            <dd className="mt-2 text-[14px] text-white/55">{s.caption}</dd>
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
                    <p data-reveal className="eyebrow"><span className="text-gold">07</span> Guest reviews</p>
                    <h2 data-reveal className="h-section fancy mt-4">{fancy(settings.home_reviews_title)}</h2>
                    {settings.rating_count && (
                        <a href={settings.tripadvisor || '#'} target="_blank" rel="noreferrer" data-reveal className="mt-10 flex items-center gap-5 border-t border-ink/15 pt-6">
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#34E0A1] text-ink"><Icon name="tripadvisor" size={28} /></span>
                            <span>
                                <Stars size={15} className="text-[#00aa6c]" />
                                <span className="mt-1 block text-[15px] font-semibold">{settings.rating_count}</span>
                                <span className="link-arrow mt-1 !text-[13px]">Read them on {settings.rating_source}</span>
                            </span>
                        </a>
                    )}
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                    <figure key={r.id} className="min-h-[340px]">
                        <Stars count={r.rating} size={16} className="text-[#00aa6c]" />
                        {r.title && <p className="mask mt-6 text-[1.2rem] font-semibold tracking-tight"><span>{r.title}</span></p>}
                        <blockquote className="mask mt-4"><span style={{ animationDelay: '100ms' }} className={cn('line-clamp-[7] font-display font-medium leading-[1.35] tracking-tight text-ink', r.quote.length > 280 ? 'text-[1.2rem] sm:text-[1.45rem]' : 'text-2xl sm:text-[2rem]')}>“{r.quote}”</span></blockquote>
                        <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]"><span><span className="font-semibold">{r.name}</span><span className="text-ink/50"> · {[r.trip, r.source].filter(Boolean).join(' · ')}</span></span>{r.quote.length > 280 && settings.tripadvisor && <a href={settings.tripadvisor} target="_blank" rel="noreferrer" className="link-arrow !text-[13px]">Read full review</a>}</figcaption>
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

/* ================================================================ Travel protection */
function Rescue() {
    const { settings } = useShared();
    if (!settings.rescue_title) return null;
    return (
        <section className="py-24 lg:py-32">
            <div className="container-site grid items-center gap-12 lg:grid-cols-12">
                <div className="clip-reveal aspect-[16/11] overflow-hidden bg-sand-200 lg:col-span-6">
                    <img src={img(settings.rescue_image, 1200)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="lg:col-span-5 lg:col-start-8">
                    <p data-reveal className="eyebrow">{settings.rescue_eyebrow}</p>
                    <h2 data-reveal className="h-section fancy mt-4 text-balance">{fancy(settings.rescue_title)}</h2>
                    <p data-reveal className="mt-6 text-[16.5px] leading-relaxed text-ink/60">{settings.rescue_text}</p>
                    {settings.rescue_link && <a data-reveal href={settings.rescue_link} target="_blank" rel="noreferrer" className="btn btn-dark mt-9"><Icon name="shield" size={16} /> {settings.rescue_button || 'Learn more'}</a>}
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Partners */
function Partners({ items }: { items: Partner[] }) {
    const { settings } = useShared();
    if (!items.length) return null;
    return (
        <section className="border-y border-ink/10 bg-white py-14">
            <div className="container-site grid items-center gap-8 lg:grid-cols-[14rem_1fr]">
                <p className="eyebrow">{settings.home_partners_title}</p>
                <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-8">
                    {items.map((p) => {
                        const logo = p.logo ? <img src={p.logo} alt={p.subtitle || p.name} title={p.subtitle || p.name} loading="lazy" className="h-12 w-auto max-w-[120px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" /> : <span className="font-semibold text-ink/50">{p.name}</span>;
                        return p.url ? <a key={p.id} href={p.url} target="_blank" rel="noreferrer">{logo}</a> : <span key={p.id}>{logo}</span>;
                    })}
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Journal */
function Journal({ posts }: { posts: Post[] }) {
    const { settings } = useShared();
    if (!posts.length) return null;
    return (
        <section className="py-24 lg:py-36">
            <div className="container-site">
                <SectionHeading index="08" eyebrow="Blog" title={settings.home_journal_title}
                    action={<Link href="/journal" className="link-arrow">Read the blog <Icon name="arrow" size={16} /></Link>} />
                <div className="mt-14 grid gap-x-6 gap-y-12 md:grid-cols-3">
                    {posts.map((p, i) => (
                        <Link key={p.id} href={`/journal/${p.slug}`} data-reveal style={{ ['--d' as string]: `${i * 70}ms` }} className="group block">
                            <div className="img-zoom aspect-[3/2] overflow-hidden bg-sand-200"><img src={img(p.image, 800)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
                            <p className="eyebrow mt-5">{p.topic} · {formatDate(p.published_at, { month: 'short', year: 'numeric' })}</p>
                            <h3 className="mt-2 text-[1.3rem] font-semibold leading-snug tracking-tight group-hover:text-gold-dark">{p.title}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ================================================================ Closing CTA */
function ClosingCta() {
    const { settings } = useShared();
    const bg = useParallax(0.1);
    const contacts = [['Call', settings.phone, `tel:${settings.phone}`], ['WhatsApp', settings.phone_2, `https://wa.me/${settings.whatsapp}`], ['Email', settings.email, `mailto:${settings.email}`]].filter(([, v]) => v);
    return (
        <section className="relative overflow-hidden bg-ink text-white">
            <div ref={bg} className="absolute inset-x-0 -top-[10%] h-[120%]">
                <img src={img(settings.home_cta_image, 2000)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
            <div className="container-site relative grid gap-12 py-28 lg:grid-cols-12 lg:py-40">
                <div className="lg:col-span-8">
                    <p data-reveal className="eyebrow eyebrow-light">Start planning</p>
                    <h2 data-reveal className="h-display fancy mt-6 text-balance">{fancy(settings.home_cta_title)}</h2>
                    <p data-reveal className="mt-7 max-w-xl text-[17px] leading-relaxed text-white/75">{settings.home_cta_text}</p>
                    <div data-reveal className="mt-10 flex flex-wrap gap-3">
                        <Link href="/plan-your-trip" className="btn btn-light">Plan my trip <Icon name="arrow" size={16} className="arrow" /></Link>
                        <Link href="/contact" className="btn btn-ghost">Contact us</Link>
                    </div>
                </div>
                <div data-reveal className="self-end border-t border-white/20 lg:col-span-4">
                    {contacts.map(([k, v, href]) => (
                        <a key={k} href={href} className="flex items-baseline justify-between gap-6 border-b border-white/20 py-4 transition hover:text-gold-light">
                            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/50">{k}</span>
                            <span className="text-[15px] font-semibold">{v}</span>
                        </a>
                    ))}
                </div>
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
