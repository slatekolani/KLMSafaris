import { Link } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '@/Components/Icon';
import Pagination, { usePaged } from '@/Components/Pagination';
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
    const span = days.length ? (Math.min(...days) === Math.max(...days) ? `${Math.min(...days)}` : `${Math.min(...days)}-${Math.max(...days)}`) : null;
    const shown = tours.filter((t) => len === 'all' || (len === 'short' ? t.duration_days <= 5 : t.duration_days > 5));
    const paged = usePaged(shown);

    return (
        <SiteLayout title={category.name} description={category.description} image={category.image}>
            <PageHero image={category.image} eyebrow={category.tagline} title={tx('cat_hero_title', { name: category.name })} subtitle={category.description} crumbs={[{ label: 'Experiences', href: '/tours' }, { label: category.name }]}
                facts={[{ label: tx('cat_fact_tours'), value: tours.length }, { label: tx('cat_fact_price'), value: prices.length ? Math.min(...prices) : null, prefix: '$' }, { label: tx('cat_fact_length'), value: span, suffix: ` ${span === '1' ? tx('tour_fact_day') : tx('label_days')}` }]}>
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
                            <button key={k} onClick={() => setLen(k)} className={cn('rounded-none px-4 py-2 text-[13px] transition', len === k ? 'bg-forest-900 text-sand' : 'text-ink/60 hover:text-ink')}>{l}</button>
                        ))}
                    </div>
                </div>
                <div ref={paged.top} className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {paged.shown.map((t, i) => <TourCard key={t.id} tour={t} delay={(i % 4) * 60} />)}
                </div>
                <Pagination {...paged} />
            </section>

            {guides.length > 0 && (
                <section className="container-site pb-20">
                    <span className="eyebrow">{tx('cat_prepare')}</span>
                    <h2 className="h-section mt-4">{tx('cat_guides', { name: category.name })}</h2>
                    {/* Guides use the same standard card as trips and stays */}
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {guides.map((g, i) => (
                            <Link key={g.id} href={`/${g.slug}`} data-reveal style={{ ['--d' as string]: `${(i % 4) * 60}ms` }}
                                className="group flex h-full flex-col overflow-hidden border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]">
                                <div className="img-zoom relative aspect-[16/10] shrink-0 overflow-hidden bg-forest-900">
                                    {g.image || category.image
                                        ? <img src={img(g.image || category.image, 700)} alt="" loading="lazy" className="h-full w-full object-cover" />
                                        : <span className="absolute inset-0 flex items-center justify-center text-white/40"><Icon name="file" size={28} /></span>}
                                    <span className="absolute left-3 top-3 flex items-center gap-1.5 bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink"><Icon name="file" size={12} className="text-gold" />{tx('cat_prepare')}</span>
                                </div>
                                <div className="flex flex-1 flex-col p-4">
                                    <p className="eyebrow !text-[11px]">{category.name}</p>
                                    <h3 className="font-display mt-1.5 line-clamp-2 min-h-[2.75em] text-[1.05rem] font-semibold leading-snug tracking-tight text-ink group-hover:text-gold-dark">{g.title}</h3>
                                    <div className="mt-auto flex items-center justify-between gap-4 border-t border-ink/10 pt-3 text-[13.5px]">
                                        <span className="font-semibold text-ink">{tx('cat_read')}</span>
                                        <span className="flex h-8 w-8 items-center justify-center text-gold transition group-hover:translate-x-0.5"><Icon name="arrow" size={16} /></span>
                                    </div>
                                </div>
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
                {/* The same standard card as trips and stays */}
                <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {others.map((c) => (
                        <Link key={c.id} href={`/experiences/${c.slug}`} data-reveal
                            className="group flex h-full flex-col overflow-hidden border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]">
                            <div className="img-zoom aspect-[16/10] shrink-0 overflow-hidden bg-sand-200"><img src={img(c.image, 700)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
                            <div className="flex flex-1 flex-col p-4">
                                <p className="eyebrow !text-[11px]">{c.name}</p>
                                <h3 className="font-display mt-1.5 line-clamp-2 min-h-[2.75em] text-[1.05rem] font-semibold leading-snug tracking-tight text-ink group-hover:text-gold-dark">{c.tagline || c.name}</h3>
                                <div className="mt-auto flex items-center justify-between gap-4 border-t border-ink/10 pt-3 text-[13.5px]">
                                    <span className="font-semibold text-ink">{tx('cat_see_tours')}</span>
                                    <span className="flex h-8 w-8 items-center justify-center text-gold transition group-hover:translate-x-0.5"><Icon name="arrow" size={16} /></span>
                                </div>
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
        <div className="space-y-3">
            {faqs.map((f, i) => (
                <div key={f.id} className={cn('border transition', dark ? 'border-white/15 bg-white/[0.04]' : 'bg-white', !dark && (open === i ? 'border-gold/40 shadow-[0_18px_40px_-28px_rgba(29,68,104,.5)]' : 'border-ink/10'))}>
                    <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left sm:px-6">
                        <span className="font-display text-[1.05rem] font-semibold leading-snug sm:text-[1.1rem]">{f.question.replace(/^\d+\s*[.)]\s*/, '')}</span>
                        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center border transition-all duration-300', open === i ? 'rotate-45 border-gold bg-gold text-white' : dark ? 'border-white/20' : 'border-ink/15')}><Icon name="plus" size={15} /></span>
                    </button>
                    <div className={cn('grid transition-all duration-500', open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                        <p className={cn('overflow-hidden px-5 text-[15px] leading-relaxed sm:px-6', dark ? 'text-white/70' : 'text-ink/70')}><span className="block pb-5">{f.answer}</span></p>
                    </div>
                </div>
            ))}
        </div>
    );
}
