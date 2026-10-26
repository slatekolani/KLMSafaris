import { useState } from 'react';
import PageHero from '@/Components/PageHero';
import StayCard, { type Stay } from '@/Components/StayCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, useShared, useText } from '@/lib/utils';

/** Every lodge, camp and hotel KLM uses (CMS → Accommodation), filterable by style. */
export default function AccommodationIndex({ stays, types }: { stays: Stay[]; types: string[] }) {
    const { settings } = useShared();
    const tx = useText();
    const [type, setType] = useState('');
    const shown = stays.filter((s) => !type || s.type === type);
    const areas = new Set(stays.map((s) => s.destination?.id).filter(Boolean)).size;

    return (
        <SiteLayout title={tx('stays_title')}>
            <PageHero image={settings.stays_hero_image} eyebrow={settings.stays_hero_eyebrow} title={settings.stays_hero_title} subtitle={settings.stays_hero_text} crumbs={[{ label: tx('stays_title') }]}
                facts={[{ label: tx('stays_fact_places'), value: stays.length || null }, { label: tx('stays_fact_areas'), value: areas || null }, { label: tx('stays_fact_types'), value: types.length || null }]} />

            <section className="container-site py-14 lg:py-20">
                {types.length > 1 && (
                    <div className="below-nav sticky z-20 -mx-5 bg-sand-50/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
                        <div className="no-scrollbar flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain">
                            {['', ...types].map((t) => (
                                <button key={t || 'all'} onClick={() => setType(t)}
                                    className={cn('shrink-0 border px-5 py-2 text-[13px] font-semibold transition', type === t ? 'border-gold bg-gold text-white' : 'border-ink/10 bg-white text-ink/70 hover:border-gold hover:text-gold')}>
                                    {t || tx('stays_all')} <span className={cn('ml-1 tabular-nums', type === t ? 'text-white/70' : 'text-ink/35')}>{t ? stays.filter((s) => s.type === t).length : stays.length}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {shown.length ? (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                        {shown.map((s) => <StayCard key={s.id} stay={s} />)}
                    </div>
                ) : (
                    <p className="py-20 text-center text-lg text-ink/60">{tx('stays_empty')}</p>
                )}
            </section>
        </SiteLayout>
    );
}
