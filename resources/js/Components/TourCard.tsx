import { Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { cn, img, money, useText } from '@/lib/utils';
import type { TourCard as T } from '@/types';

export default function TourCard({ tour, className, delay = 0, light = false }: { tour: T; className?: string; delay?: number; light?: boolean }) {
    const tx = useText();
    // One standard card: same photo ratio, a two-line title slot and the price pinned to the bottom, so every card is the same height.
    return (
        <Link href={`/tours/${tour.slug}`} data-reveal style={{ ['--d' as string]: `${delay}ms` }}
            className={cn('group flex h-full flex-col overflow-hidden border transition duration-300 hover:-translate-y-1',
                light ? 'border-white/15 bg-white/[0.04] hover:border-white/30' : 'border-ink/10 bg-white hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]', className)}>
            <div className="img-zoom relative aspect-[16/10] shrink-0 overflow-hidden bg-sand-200">
                <img src={img(tour.image, 800)} alt={tour.title} loading="lazy" className="h-full w-full object-cover" />
                {tour.badge && <span className="absolute right-0 top-0 bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">{tour.badge}</span>}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <p className={cn('eyebrow !text-[11px]', light && 'eyebrow-light')}>{tour.group_name || tour.category?.name}</p>
                <h3 className={cn('font-display mt-1.5 line-clamp-2 min-h-[2.75em] text-[1.05rem] font-semibold leading-snug tracking-tight transition-colors', light ? 'text-white group-hover:text-gold-light' : 'text-ink group-hover:text-gold-dark')}>{tour.title}</h3>
                <div className={cn('mt-auto flex items-center justify-between gap-4 border-t pt-3 text-[13.5px]', light ? 'border-white/15' : 'border-ink/10')}>
                    <span className={cn('font-semibold', light ? 'text-white' : 'text-ink')}>{tour.price_from ? <>{tx('label_from')} {money(tour.price_from)}</> : tx('price_request')}</span>
                    <span className={cn('flex h-8 w-8 items-center justify-center transition', light ? 'text-white/70 group-hover:text-white' : 'text-gold group-hover:translate-x-0.5')}><Icon name="arrow" size={16} /></span>
                </div>
            </div>
        </Link>
    );
}
