import { Link } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '@/Components/Icon';
import PageHero from '@/Components/PageHero';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, img, useText } from '@/lib/utils';
import type { Category as Cat, Faq, TourCard as TC } from '@/types';

export default function Category({ category, tours, others, faqs, guides }: { category: Cat; tours: TC[]; others: Cat[]; faqs: Faq[]; guides: { id: number; title: string; slug: string; subtitle: string | null; image: string | null }[] }) {
    const tx = useText();
    const [len, setLen] = useState<'all' | 'short' | 'long'>('all');
    const prices = tours.map((t) => t.price_from).filter((p): p is number => !!p);
    const days = tours.map((t) => t.duration_days).filter(Boolean);
    const span = days.length ? (Math.min(...days) === Math.max(...days) ? `${Math.min(...days)}` : `${Math.min(...days)}–${Math.max(...days)}`) : null;
    const shown = tours.filter((t) => len === 'all' || (len === 'short' ? t.duration_days <= 5 : t.duration_days > 5));

    return (
        <SiteLayout title={category.name} description={category.description} image={category.image}>
            <PageHero image={category.image} eyebrow={category.tagline} title={`${category.name} *in Tanzania*`} subtitle={category.description} crumbs={[{ label: 'Experiences', href: '/tours' }, { label: category.name }]}
                facts={[{ label: tx('cat_fact_tours'), value: tours.length }, { label: tx('cat_fact_price'), value: prices.length ? Math.min(...prices) : null, prefix: '$' }, { label: tx('cat_fact_length'), value: span, suffix: ` ${tx('label_days')}` }]}>
                <div className="mt-10 flex flex-wrap gap-3">
                    <a href="#journeys" className="btn btn-gold">{tx('cat_see', { count: tours.length })} <Icon name="arrow" size={16} className="arrow" /></a>
                    <Link href={`/plan-your-trip?category=${category.slug}`} className="btn btn-ghost">{tx('cat_custom')}</Link>
                </div>
            </PageHero>

            <section id="journeys" className="container-site scroll-mt-24 py-20">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <span className="eyebrow">{category.name}</span>
                        <h2 className="h-section mt-4">{category.home_title ? category.home_title.replace(/\*/g, '') : tx('cat_choose')}</h2>
                    </div>
                    <div className="flex gap-2 rounded-none bg-white p-1.5 ring-1 ring-ink/10">
                        {([['all', tx('cat_filter_all')], ['short', tx('cat_filter_short')], ['long', tx('cat_filter_long')]] as const).map(([k, l]) => (
                            <button key={k} onClick={() => setLen(k)} className={cn('rounded-none px-4 py-2 text-[13px] transition', len === k ? 'bg-ink text-sand' : 'text-ink/60 hover:text-ink')}>{l}</button>
                        ))}
                    </div>
                </div>
                <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {shown.map((t, i) => <TourCard key={t.id} tour={t} delay={(i % 3) * 70} />)}
                </div>
            </section>

            {guides.length > 0 && (
                <section className="container-site pb-20">
                    <span className="eyebrow">{tx('cat_prepare')}</span>
                    <h2 className="h-section mt-4">{tx('cat_guides', { name: category.name })}</h2>
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {guides.map((g) => (
                            <Link key={g.id} href={`/${g.slug}`} data-reveal className="group flex items-center gap-5 bg-white p-4 ring-1 ring-ink/[0.06] transition hover:-translate-y-1 hover:ring-gold">
                                <span className="h-20 w-24 shrink-0 overflow-hidden bg-sand-100">{g.image && <img src={img(g.image, 300)} alt="" loading="lazy" className="h-full w-full object-cover" />}</span>
                                <span className="min-w-0">
                                    <span className="block font-display text-xl leading-tight group-hover:text-gold-dark">{g.title}</span>
                                    <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{tx('cat_read')} <Icon name="arrow" size={13} /></span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {faqs.length > 0 && (
                <section className="bg-sand-100 py-20">
                    <div className="container-site grid gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <span className="eyebrow">{tx('cat_know')}</span>
                            <h2 className="h-section mt-4">{tx('cat_questions', { name: category.name })}</h2>
                        </div>
                        <div className="lg:col-span-8"><FaqList faqs={faqs} /></div>
                    </div>
                </section>
            )}

            <section className="container-site py-20">
                <span className="eyebrow">{tx('cat_explore')}</span>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {others.map((c) => (
                        <Link key={c.id} href={`/experiences/${c.slug}`} data-reveal className="img-zoom group relative block h-72 overflow-hidden">
                            <img src={img(c.image, 700)} alt="" loading="lazy" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
                            <div className="absolute bottom-0 p-6 text-white">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-gold-light">{c.tagline}</p>
                                <p className="font-display mt-1 text-3xl font-semibold tracking-tight">{c.name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}

export function FaqList({ faqs, dark = false }: { faqs: Faq[]; dark?: boolean }) {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <div className={cn('divide-y', dark ? 'divide-white/10' : 'divide-ink/10')}>
            {faqs.map((f, i) => (
                <div key={f.id}>
                    <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                        <span className="font-display text-2xl leading-snug">{f.question}</span>
                        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-none border transition-all duration-500', open === i ? 'rotate-45 border-gold bg-gold text-white' : dark ? 'border-white/20' : 'border-ink/15')}><Icon name="plus" size={16} /></span>
                    </button>
                    <div className={cn('grid transition-all duration-700 ease-lux', open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                        <p className={cn('overflow-hidden pr-14 leading-relaxed', dark ? 'text-white/65' : 'text-ink/65')}><span className="block pb-6">{f.answer}</span></p>
                    </div>
                </div>
            ))}
        </div>
    );
}
