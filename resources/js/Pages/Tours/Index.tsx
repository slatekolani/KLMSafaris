import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/Components/Icon';
import PageHero from '@/Components/PageHero';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, useOptions, useShared, useText } from '@/lib/utils';
import type { TourCard as TC } from '@/types';

type Opt = { id: number; name: string; slug: string; image?: string | null };
type Filters = { category?: string; destination?: string; q?: string; duration?: string; budget?: string; sort?: string };

export default function ToursIndex({ tours, categories, destinations, filters }: { tours: TC[]; categories: Opt[]; destinations: Opt[]; filters: Filters }) {
    const { settings } = useShared();
    const tx = useText();
    const durations = useOptions('tours_durations');
    const budgets = useOptions('tours_budgets');
    const sorts = useOptions('tours_sorts');
    const [q, setQ] = useState(filters.q ?? '');
    const [more, setMore] = useState(false); // phones: search & dropdowns fold away so the sticky bar stays slim
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
    const folded = ['destination', 'duration', 'budget', 'q'].filter((k) => filters[k as keyof Filters]).length; // filters behind the phone "Filters" button
    const activeCount = folded + (filters.category ? 1 : 0);

    return (
        <SiteLayout title={active ? tx('tours_count_label_cat', { name: active.name }) : tx('tours_title_all')}>
            <PageHero
                image={active?.image || settings.tours_hero_image}
                eyebrow={settings.tours_hero_eyebrow}
                title={active ? tx('tours_title_cat', { name: active.name }) : settings.tours_hero_title}
                subtitle={settings.tours_hero_text}
                crumbs={[{ label: 'Tours' }]}
                facts={[{ label: active ? tx('tours_count_label_cat', { name: active.name }) : tx('tours_count_label'), value: tours.length }, { label: tx('tours_fact_experiences'), value: categories.length }, { label: tx('tours_fact_destinations'), value: destinations.length }]}
            />

            <div className="below-nav sticky z-30 border-b border-ink/5 bg-sand-50/90 backdrop-blur-xl">
                <div className="container-site py-4">
                    <div className="flex items-center gap-2">
                    <div className="no-scrollbar -ml-5 flex min-w-0 flex-1 gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain pl-5 md:-mr-5 md:pr-5">
                        {[{ slug: '', name: tx('tours_all') }, ...categories].map((c) => (
                            <button key={c.slug} onClick={() => apply({ category: c.slug })} className={cn('shrink-0 rounded-none px-5 py-2 text-[13px] font-medium transition', (filters.category ?? '') === c.slug ? 'bg-ink text-sand' : 'bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink')}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className={cn('relative flex h-9 shrink-0 items-center gap-2 border px-3.5 text-[13px] font-semibold transition md:hidden', more ? 'border-gold bg-gold text-white' : 'border-ink/15 bg-white text-ink')}>
                        <Icon name="filter" size={15} /> {tx('tours_filters')}
                        {folded > 0 && <span className={cn('flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px]', more ? 'bg-white text-gold' : 'bg-gold text-white')}>{folded}</span>}
                    </button>
                    </div>
                    <div className={cn('mt-3 grid-cols-2 gap-2 md:grid md:grid-cols-5', more ? 'grid' : 'hidden')}>
                        <label className="relative col-span-2 md:col-span-1">
                            <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('tours_search')} className="field !rounded-none !py-2.5 !pl-11" />
                        </label>
                        <Select value={filters.destination} onChange={(v) => apply({ destination: v })} options={[['', tx('tours_all_dest')], ...destinations.map((d) => [d.slug, d.name] as [string, string])]} />
                        <Select value={filters.duration} onChange={(v) => apply({ duration: v })} options={durations} />
                        <Select value={filters.budget} onChange={(v) => apply({ budget: v })} options={budgets} />
                        <Select value={filters.sort} onChange={(v) => apply({ sort: v })} options={sorts} />
                    </div>
                </div>
            </div>

            <section className="container-site py-14">
                <div className="mb-8 flex items-center justify-between">
                    <p className="text-ink/60"><span className="font-display text-3xl text-ink">{tours.length}</span> {tx('tours_found')}</p>
                    {activeCount > 0 && <button onClick={() => { setQ(''); router.get('/tours'); }} className="flex items-center gap-2 text-sm text-gold-dark hover:underline"><Icon name="close" size={14} /> {tx('tours_clear')}</button>}
                </div>
                {tours.length ? (
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tours.map((t, i) => <TourCard key={t.id} tour={t} delay={(i % 3) * 70} />)}
                    </div>
                ) : (
                    <div className=" bg-white p-16 text-center ring-1 ring-ink/5">
                        <Icon name="compass" size={44} className="mx-auto text-gold" />
                        <h2 className="font-display mt-5 text-4xl font-semibold tracking-tight">{tx('tours_empty_title')}</h2>
                        <p className="mx-auto mt-3 max-w-md text-ink/60">{tx('tours_empty_text')}</p>
                        <Link href="/plan-your-trip" className="btn btn-gold mt-8">{tx('tours_empty_button')}</Link>
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
