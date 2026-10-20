import { Link } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '@/Components/Icon';
import Lightbox from '@/Components/Lightbox';
import PageHero from '@/Components/PageHero';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { img } from '@/lib/utils';
import type { Destination, TourCard as TC } from '@/types';

export default function DestinationShow({ destination: d, tours, others }: { destination: Destination; tours: TC[]; others: Destination[] }) {
    const [lb, setLb] = useState<number | null>(null);
    const gallery = d.gallery ?? [];

    return (
        <SiteLayout title={d.name} description={d.excerpt} image={d.image}>
            <PageHero tall image={d.image} eyebrow={d.region} title={d.name} subtitle={d.tagline} crumbs={[{ label: 'Destinations', href: '/destinations' }, { label: d.name }]} />

            <section className="container-site grid gap-14 py-24 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <span className="eyebrow">About {d.name}</span>
                    <p className="mt-6 text-3xl font-semibold tracking-tight leading-snug sm:text-4xl">{d.excerpt}</p>
                    <div className="prose-lux mt-8" dangerouslySetInnerHTML={{ __html: d.body ?? '' }} />
                </div>
                <aside className="lg:col-span-5">
                    <div className="sticky top-28 space-y-5">
                        <div className=" bg-forest-900 p-8 text-white">
                            <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-gold-light"><Icon name="calendar" size={16} /> Best time to visit</p>
                            <p className="mt-3 text-2xl font-semibold tracking-tight leading-snug">{d.best_time}</p>
                            {!!d.highlights?.length && (
                                <>
                                    <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-gold-light">Highlights</p>
                                    <ul className="mt-4 space-y-3">{d.highlights.map((h) => <li key={h} className="flex gap-3 text-white/80"><Icon name="sparkle" size={16} className="mt-1 shrink-0 text-gold-light" />{h}</li>)}</ul>
                                </>
                            )}
                            <Link href="/plan-your-trip" className="btn btn-gold mt-8 w-full">Plan a trip here</Link>
                        </div>
                    </div>
                </aside>
            </section>

            {gallery.length > 0 && (
                <section className="container-site pb-24">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {gallery.map((g, i) => (
                            <button key={g} onClick={() => setLb(i)} data-reveal="scale" style={{ ['--d' as string]: `${i * 70}ms` }} className="img-zoom aspect-[4/5] overflow-hidden">
                                <img src={img(g, 700)} alt="" loading="lazy" className="h-full w-full object-cover" />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {tours.length > 0 && (
                <section className="bg-sand-100 py-24">
                    <div className="container-site">
                        <span className="eyebrow">Journeys</span>
                        <h2 className="mt-4 text-5xl font-semibold tracking-tight">Experience {d.name}</h2>
                        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{tours.map((t, i) => <TourCard key={t.id} tour={t} delay={(i % 3) * 70} />)}</div>
                    </div>
                </section>
            )}

            <section className="container-site py-24">
                <span className="eyebrow">Combine with</span>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {others.map((o) => (
                        <Link key={o.id} href={`/destinations/${o.slug}`} className="img-zoom group relative block h-64 overflow-hidden">
                            <img src={img(o.image, 600)} alt="" loading="lazy" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                            <div className="absolute bottom-0 p-6 text-white"><p className="text-[10px] uppercase tracking-[0.2em] text-white/60">{o.region}</p><p className="font-display text-2xl">{o.name}</p></div>
                        </Link>
                    ))}
                </div>
            </section>
            <Lightbox images={gallery} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
        </SiteLayout>
    );
}
