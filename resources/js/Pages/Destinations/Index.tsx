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
            <section className="container-site py-24">
                <div className="grid gap-6 md:grid-cols-6">
                    {destinations.map((d, i) => {
                        const wide = i % 5 === 0 || i % 5 === 4;
                        return (
                            <Link key={d.id} href={`/destinations/${d.slug}`} data-reveal style={{ ['--d' as string]: `${(i % 3) * 80}ms` }}
                                className={cn('img-zoom group relative block overflow-hidden', wide ? 'h-[30rem] md:col-span-4' : 'h-[30rem] md:col-span-2')}>
                                <img src={img(d.image, wide ? 1400 : 800)} alt={d.name} loading="lazy" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-8 text-white">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-eyebrow text-gold-light">{d.region}</p>
                                        <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight leading-tight sm:text-5xl">{d.name}</h2>
                                        <p className="mt-2 max-w-md text-white/75">{d.tagline}</p>
                                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/60">{d.tours_count} tours{d.best_time ? ` · Best: ${d.best_time.split('·')[0]}` : ''}</p>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none border border-white/40 transition-all duration-500 group-hover:rotate-45 group-hover:bg-gold"><Icon name="arrowUpRight" /></span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </SiteLayout>
    );
}
