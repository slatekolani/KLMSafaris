import { Link } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import HeroMedia from '@/Components/HeroMedia';
import Icon from '@/Components/Icon';
import { cn, fancy, splitLines, useText } from '@/lib/utils';

export type HeroFact = { label: string; value: string | number | null | undefined; prefix?: string; suffix?: string };

export default function PageHero({ image, eyebrow, title, subtitle, crumbs = [], facts = [], children, tall = false, overlap = false }: {
    image?: string | null;
    eyebrow?: string | null;
    title: string;
    subtitle?: string | null;
    crumbs?: { label: string; href?: string }[];
    /** Quick, page-specific numbers shown beside the title (tour counts, prices, contact details…). */
    facts?: HeroFact[];
    children?: ReactNode;
    tall?: boolean;
    /** Leave room for cards that overlap the hero's bottom edge. */
    overlap?: boolean;
}) {
    const shown = facts.filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
    const lines = splitLines(title);
    const tx = useText();

    return (
        <section className={cn('relative isolate flex flex-col overflow-hidden bg-ink text-white', tall ? 'min-h-[78svh] md:min-h-[calc(100svh-120px)]' : 'min-h-[64svh] md:min-h-[72svh]')}>
            {image && <HeroMedia src={image} />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/25" />

            <div className="container-site relative z-10 flex items-center justify-between gap-6 pt-6 sm:pt-8">
                <nav className="hero-in flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-white">{tx('crumb_home')}</Link>
                    {crumbs.map((c) => (
                        <span key={c.label} className="flex min-w-0 items-center gap-2">
                            <Icon name="chevronRight" size={12} />
                            {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="truncate text-white">{c.label}</span>}
                        </span>
                    ))}
                </nav>
                <MoshiClock />
            </div>

            <div className={cn('container-site relative z-10 mt-auto grid gap-10 pt-20', overlap ? 'pb-28 sm:pb-32' : 'pb-12 sm:pb-16', 'lg:grid-cols-12 lg:items-end lg:gap-12')}>
                <div className={cn('min-w-0', shown.length ? 'lg:col-span-8' : 'lg:col-span-10')}>
                    {eyebrow && (
                        <p className="hero-in flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/85">
                            <span className="h-px w-10 bg-gold" />{eyebrow}
                        </p>
                    )}
                    <h1 className="h-display fancy on-photo mt-5 max-w-5xl">
                        {lines.map((line, i) => (
                            <span key={i} className="mask"><span style={{ animationDelay: `${120 + i * 120}ms` }}>{fancy(line)}</span></span>
                        ))}
                    </h1>
                    {subtitle && <p className="hero-in mt-6 max-w-2xl text-[17px] leading-relaxed text-white/80 sm:text-lg" style={{ ['--d' as string]: '380ms' }}>{subtitle}</p>}
                    {children && <div className="hero-in" style={{ ['--d' as string]: '480ms' }}>{children}</div>}
                </div>

                {shown.length > 0 && (
                    <dl className="grid grid-cols-2 border-t border-white/20 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1 lg:border-t-0 lg:bg-black/40 lg:px-8 lg:py-2 lg:backdrop-blur-md">
                        {shown.map((f, i) => (
                            <div key={f.label} className="hero-in border-b border-white/15 py-4 pr-4 last:border-b-0 lg:py-5 lg:pr-0" style={{ ['--d' as string]: `${450 + i * 110}ms` }}>
                                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{f.label}</dt>
                                <dd className="font-display mt-1 truncate text-[1.35rem] font-semibold leading-tight tracking-tight sm:text-[1.6rem]">
                                    {f.prefix}{typeof f.value === 'number' ? <CountUp to={f.value} delay={450 + i * 110} /> : f.value}{f.suffix}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </section>
    );
}

/** Live local time at the office, so the page feels like it comes from people on the ground. */
function MoshiClock() {
    const read = () => {
        const parts = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Africa/Dar_es_Salaam' }).formatToParts(new Date());
        const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
        const m = parts.find((p) => p.type === 'minute')?.value ?? '00';
        return { time: `${String(h).padStart(2, '0')}:${m}`, part: h < 5 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening' };
    };
    const [now, setNow] = useState(read);
    useEffect(() => {
        const id = window.setInterval(() => setNow(read()), 20000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <p className="hero-in hidden shrink-0 items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75 md:flex">
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            Good {now.part} from Moshi · <span className="tabular-nums text-white">{now.time}</span> EAT
        </p>
    );
}

function CountUp({ to, delay = 0 }: { to: number; delay?: number }) {
    const [n, setN] = useState(0);
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(to); return; }
        let frame = 0;
        const start = performance.now() + delay;
        const tick = (t: number) => {
            const p = Math.min(Math.max((t - start) / 1100, 0), 1);
            setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [to, delay]);
    return <span className="tabular-nums">{n.toLocaleString('en-US')}</span>;
}
