import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Icon from '@/Components/Icon';
import Lightbox from '@/Components/Lightbox';
import PageHero from '@/Components/PageHero';
import StayCard, { stayCover, type Stay } from '@/Components/StayCard';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { fancy, img, useText } from '@/lib/utils';
import type { TourCard as TC } from '@/types';

type Full = Stay & { description: string | null; website: string | null };

/** One lodge / camp / hotel. The photo hero only appears once the place has a photo; until then a plain header is used. */
export default function AccommodationShow({ stay, more, tours }: { stay: Full; more: Stay[]; tours: TC[] }) {
    const tx = useText();
    const cover = stayCover(stay);
    const photos = useMemo(() => [stay.image, ...(stay.gallery ?? [])].filter((x, i, a): x is string => !!x && a.indexOf(x) === i), [stay]);
    const [open, setOpen] = useState<number | null>(null);
    const crumbs = [{ label: tx('stays_title'), href: '/accommodation' }, { label: stay.name }];
    const facts = [
        { label: tx('stay_type'), value: stay.type },
        { label: tx('stay_area'), value: stay.destination?.name },
        { label: tx('stay_location'), value: stay.location },
    ];

    return (
        <SiteLayout title={stay.name} description={stay.excerpt} image={cover}>
            {cover ? (
                <PageHero image={cover} eyebrow={stay.type} title={stay.name} subtitle={stay.location} crumbs={crumbs} facts={facts} />
            ) : (
                <section className="border-b border-ink/10 bg-white">
                    <div className="container-site py-12 sm:py-16">
                        <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/45">
                            <Link href="/" className="hover:text-ink">{tx('crumb_home')}</Link><Icon name="chevronRight" size={12} />
                            <Link href="/accommodation" className="hover:text-ink">{tx('stays_title')}</Link><Icon name="chevronRight" size={12} />
                            <span className="text-ink/70">{stay.name}</span>
                        </nav>
                        <span className="mt-8 inline-block bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">{stay.type}</span>
                        <h1 className="h-display mt-5 max-w-4xl text-balance">{stay.name}</h1>
                        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                            {facts.filter((f) => f.value).map((f) => (
                                <div key={f.label}><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{f.label}</dt><dd className="mt-1 text-[16px] font-medium">{f.value}</dd></div>
                            ))}
                        </dl>
                    </div>
                </section>
            )}

            <section className="container-site grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
                <div className="lg:col-span-8">
                    <span className="eyebrow">{tx('stay_about')}</span>
                    {stay.excerpt && <p className="lead mt-5 text-ink">{stay.excerpt}</p>}
                    {stay.description
                        ? <div className="prose-lux mt-6" dangerouslySetInnerHTML={{ __html: stay.description }} />
                        : !stay.excerpt && <p className="mt-5 text-[17px] leading-relaxed text-ink/70">{tx('stay_no_text')}</p>}

                    {photos.length > 0 && (
                        <div className="mt-14">
                            <span className="eyebrow">{tx('stay_photos')}</span>
                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {photos.map((p, i) => (
                                    <button key={p} type="button" onClick={() => setOpen(i)} className="img-zoom block aspect-[4/3] overflow-hidden bg-ink/5">
                                        <img src={img(p, 700)} alt="" loading="lazy" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="lg:col-span-4">
                    <div className="bg-ink p-7 text-white/70 lg:sticky" style={{ top: 'calc(var(--nav-h, 0px) + 2rem)' }}>
                        <h2 className="fancy font-display text-[1.6rem] font-bold leading-tight text-white">{fancy(tx('stay_cta_title'))}</h2>
                        <p className="mt-3 text-[15px] leading-relaxed">{tx('stay_cta_text')}</p>
                        <Link href="/plan-your-trip" className="btn btn-brand mt-6 w-full">{tx('stay_cta_button')} <Icon name="arrow" size={16} className="arrow" /></Link>
                        <Link href="/contact" className="btn mt-3 w-full border border-white/40 bg-transparent text-white hover:bg-white hover:text-gold">{tx('stay_ask')}</Link>
                        {stay.website && (
                            <a href={stay.website} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 text-[13px] font-semibold text-white/80 hover:text-white">
                                {tx('stay_website')} <Icon name="external" size={13} />
                            </a>
                        )}
                    </div>
                </aside>
            </section>

            {tours.length > 0 && stay.destination && (
                <section className="border-t border-ink/10 bg-white py-16 lg:py-20">
                    <div className="container-site">
                        <h2 className="h-section">{tx('stay_tours', { area: stay.destination.name })}</h2>
                        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                            {tours.map((t) => <TourCard key={t.id} tour={t} />)}
                        </div>
                    </div>
                </section>
            )}

            {more.length > 0 && (
                <section className="container-site py-16 lg:py-20">
                    <div className="flex items-end justify-between gap-6">
                        <h2 className="h-section">{tx('stay_more')}</h2>
                        <Link href="/accommodation" className="link-arrow hidden sm:inline-flex">{tx('stays_title')} <Icon name="arrow" size={14} /></Link>
                    </div>
                    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                        {more.map((s) => <StayCard key={s.id} stay={s} />)}
                    </div>
                </section>
            )}

            <Lightbox images={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
        </SiteLayout>
    );
}
