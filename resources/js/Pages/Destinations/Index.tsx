import { Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import PageHero from '@/Components/PageHero';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, img, useShared, useText } from '@/lib/utils';
import type { Destination } from '@/types';

export default function DestinationsIndex({ destinations }: { destinations: Destination[] }) {
    const { settings } = useShared();
    const tx = useText();
    return (
        <SiteLayout title={tx('menu_destinations')}>
            <PageHero image={settings.destinations_hero_image} eyebrow={settings.destinations_hero_eyebrow} title={settings.destinations_hero_title} subtitle={settings.destinations_hero_text} crumbs={[{ label: tx('menu_destinations') }]}
                facts={[{ label: tx('dest_fact_count'), value: destinations.length }, { label: tx('dest_fact_tours'), value: destinations.reduce((n, d) => n + (d.tours_count ?? 0), 0) || null }, { label: tx('dest_fact_base'), value: tx('dest_fact_base_value') }]} />
            {/* Two large feature tiles, then the rest three to a row: every row lines up, whatever the number of destinations */}
            <section className="container-site py-14 lg:py-20">
                <div className="grid gap-5 md:grid-cols-6">
                    {destinations.map((d, i) => {
                        const big = i < 2;
                        return (
                            <Link key={d.id} href={`/destinations/${d.slug}`} data-reveal style={{ ['--d' as string]: `${(i % 3) * 70}ms` }}
                                className={cn('img-zoom group relative block overflow-hidden bg-forest-900', big ? 'h-[22rem] md:col-span-3 lg:h-[26rem]' : 'h-[19rem] md:col-span-2 lg:h-[21rem]')}>
                                <img src={img(d.image, big ? 1300 : 800)} alt={d.name} loading="lazy" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/20 to-transparent" />
                                {!!d.tours_count && (
                                    <span className="absolute left-4 top-4 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">{d.tours_count} {d.tours_count === 1 ? 'tour' : 'tours'}</span>
                                )}
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-light"><Icon name="pin" size={12} />{d.region}</p>
                                        <h2 className={cn('font-display mt-1.5 font-semibold leading-tight tracking-tight', big ? 'text-[1.5rem]' : 'text-[1.25rem]')}>{d.name}</h2>
                                        {d.tagline && <p className="mt-1.5 line-clamp-1 text-[14px] text-white/75">{d.tagline}</p>}
                                    </div>
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/40 transition-all duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold"><Icon name="arrowUpRight" size={18} /></span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </SiteLayout>
    );
}
