import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/Components/Icon';
import PageHero from '@/Components/PageHero';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, useShared } from '@/lib/utils';
import type { TourCard as TC } from '@/types';

type Opt = { id: number; name: string; slug: string; image?: string | null };
type Filters = { category?: string; destination?: string; q?: string; duration?: string; budget?: string; sort?: string };

export default function ToursIndex({ tours, categories, destinations, filters }: { tours: TC[]; categories: Opt[]; destinations: Opt[]; filters: Filters }) {
    const { settings } = useShared();
    const [q, setQ] = useState(filters.q ?? '');
    const first = useRef(true);

    const apply = (next: Filters) => {
        const merged = { ...filters, ...next };
        router.get('/tours', Object.fromEntries(Object.entries(merged).filter(([, v]) => v)), { preserveState: true, preserveScroll: true, replace: true });
    };

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = window.setTimeout(() => apply({ q }), 350);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const active = categories.find((c) => c.slug === filters.category);
    const activeCount = ['destination', 'duration', 'budget', 'q'].filter((k) => filters[k as keyof Filters]).length + (filters.category ? 1 : 0);

    return (
        <SiteLayout title={active ? `${active.name} journeys` : 'All journeys'}>
            <PageHero
                image={active?.image || settings.tours_hero_image}
                eyebrow={settings.tours_hero_eyebrow}
                title={active ? `${active.name} *tours*` : settings.tours_hero_title}
                subtitle={settings.tours_hero_text}
                crumbs={[{ label: 'Tours' }]}
            />

            <div className="sticky top-0 z-30 border-b border-ink/5 bg-sand-50/90 backdrop-blur-xl">
                <div className="container-site py-4">
                    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
                        {[{ slug: '', name: 'All' }, ...categories].map((c) => (
                            <button key={c.slug} onClick={() => apply({ category: c.slug })} className={cn('shrink-0 rounded-none px-5 py-2 text-[13px] font-medium transition', (filters.category ?? '') === c.slug ? 'bg-ink text-sand' : 'bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink')}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
                        <label className="relative col-span-2 md:col-span-1">
                            <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tours" className="field !rounded-none !py-2.5 !pl-11" />
                        </label>
                        <Select value={filters.destination} onChange={(v) => apply({ destination: v })} options={[['', 'All destinations'], ...destinations.map((d) => [d.slug, d.name] as [string, string])]} />
                        <Select value={filters.duration} onChange={(v) => apply({ duration: v })} options={[['', 'Any duration'], ['1-3', '1 – 3 days'], ['4-7', '4 – 7 days'], ['8-14', '8 – 14 days'], ['15-99', '15+ days']]} />
                        <Select value={filters.budget} onChange={(v) => apply({ budget: v })} options={[['', 'Any budget'], ['1000', 'Up to $1,000'], ['2500', 'Up to $2,500'], ['5000', 'Up to $5,000']]} />
                        <Select value={filters.sort} onChange={(v) => apply({ sort: v })} options={[['', 'Recommended'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['duration', 'Shortest first']]} />
                    </div>
                </div>
            </div>

            <section className="container-site py-14">
                <div className="mb-8 flex items-center justify-between">
                    <p className="text-ink/60"><span className="font-display text-3xl text-ink">{tours.length}</span> tours found</p>
                    {activeCount > 0 && <button onClick={() => { setQ(''); router.get('/tours'); }} className="flex items-center gap-2 text-sm text-gold-dark hover:underline"><Icon name="close" size={14} /> Clear filters</button>}
                </div>
                {tours.length ? (
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tours.map((t, i) => <TourCard key={t.id} tour={t} delay={(i % 3) * 70} />)}
                    </div>
                ) : (
                    <div className=" bg-white p-16 text-center ring-1 ring-ink/5">
                        <Icon name="compass" size={44} className="mx-auto text-gold" />
                        <h2 className="mt-5 text-4xl font-semibold tracking-tight">Nothing matches — yet</h2>
                        <p className="mx-auto mt-3 max-w-md text-ink/60">We design custom journeys every day. Tell us what you are dreaming of and we will build it from scratch.</p>
                        <Link href="/plan-your-trip" className="btn btn-gold mt-8">Design a custom trip</Link>
                    </div>
                )}
            </section>
        </SiteLayout>
    );
}

function Select({ value, onChange, options }: { value?: string; onChange: (v: string) => void; options: [string, string][] }) {
    return (
        <label className="relative">
            <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field cursor-pointer appearance-none !rounded-none !py-2.5 pr-10">
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <Icon name="chevronDown" size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/40" />
        </label>
    );
}
