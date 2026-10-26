import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Icon from '@/Components/Icon';
import Lightbox from '@/Components/Lightbox';
import PageHero from '@/Components/PageHero';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, fancy, img, useShared, useText } from '@/lib/utils';

type Photo = { id: number; image: string; caption: string | null; category: string };

/** Photo gallery (CMS → Gallery): a masonry wall with category filters and a full-screen lightbox. */
export default function Gallery({ photos, categories }: { photos: Photo[]; categories: string[] }) {
    const { settings } = useShared();
    const tx = useText();
    const [category, setCategory] = useState('');
    const [open, setOpen] = useState<number | null>(null);
    // "All photos" deals the categories out in turn, so the wall mixes treks, wildlife and beaches.
    const shown = useMemo(() => {
        if (category) return photos.filter((p) => p.category === category);
        const groups = categories.map((c) => photos.filter((p) => p.category === c));
        const mixed: Photo[] = [];
        for (let i = 0; mixed.length < photos.length && i < photos.length; i++) groups.forEach((g) => g[i] && mixed.push(g[i]));
        return mixed.length === photos.length ? mixed : photos;
    }, [photos, categories, category]);
    const images = useMemo(() => shown.map((p) => p.image), [shown]);
    const countOf = (c: string) => (c ? photos.filter((p) => p.category === c).length : photos.length);

    return (
        <SiteLayout title={tx('gallery_title')}>
            <PageHero image={settings.gallery_hero_image} eyebrow={settings.gallery_hero_eyebrow} title={settings.gallery_hero_title} subtitle={settings.gallery_hero_text} crumbs={[{ label: tx('gallery_title') }]}
                facts={[{ label: tx('gallery_fact_photos'), value: photos.length || null }, { label: tx('gallery_fact_themes'), value: categories.length || null }, { label: tx('gallery_fact_by'), value: tx('gallery_fact_by_value') }]} />

            <section className="container-site py-16 lg:py-20">
                {photos.length === 0 ? (
                    <p className="py-20 text-center text-lg text-ink/60">{tx('gallery_empty')}</p>
                ) : (
                    <>
                        <div className="below-nav sticky z-20 -mx-5 bg-sand-50/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
                            <div className="no-scrollbar flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain">
                                {['', ...categories].map((c) => (
                                    <button key={c} onClick={() => setCategory(c)}
                                        className={cn('shrink-0 border px-5 py-2 text-[13px] font-semibold transition', category === c ? 'border-gold bg-gold text-white' : 'border-ink/10 bg-white text-ink/70 hover:border-gold hover:text-gold')}>
                                        {c || tx('gallery_all')} <span className={cn('ml-1 tabular-nums', category === c ? 'text-white/70' : 'text-ink/35')}>{countOf(c)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
                            {shown.map((p, i) => (
                                <button key={p.id} onClick={() => setOpen(i)} aria-label={`${tx('gallery_open')}: ${p.caption || p.category}`}
                                    className="img-zoom group relative mb-3 block w-full overflow-hidden bg-ink/5 md:mb-4" style={{ breakInside: 'avoid' }}>
                                    <img src={img(p.image, 700)} alt={p.caption || p.category} loading="lazy" className="block h-auto w-full" />
                                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">{p.category}</span>
                                        {p.caption && <span className="mt-0.5 block font-display text-[15px] font-semibold text-white">{p.caption}</span>}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </section>

            <section className="bg-gold py-16 text-white lg:py-20">
                <div className="container-site flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div className="max-w-2xl">
                        <h2 className="h-section [&_em]:!text-white [&_em]:underline [&_em]:decoration-2 [&_em]:underline-offset-8">{fancy(tx('gallery_cta_title'))}</h2>
                        <p className="mt-4 text-lg text-white/85">{tx('gallery_cta_text')}</p>
                    </div>
                    <Link href="/plan-your-trip" className="btn border border-white bg-white text-gold hover:bg-gold hover:text-white">{tx('gallery_cta_button')} <Icon name="arrow" size={16} className="arrow" /></Link>
                </div>
            </section>

            <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
        </SiteLayout>
    );
}
