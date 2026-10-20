import { Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { cn, img, money } from '@/lib/utils';
import type { TourCard as T } from '@/types';

export default function TourCard({ tour, className, delay = 0, light = false }: { tour: T; className?: string; delay?: number; light?: boolean }) {
    return (
        <Link href={`/tours/${tour.slug}`} data-reveal style={{ ['--d' as string]: `${delay}ms` }} className={cn('group block', className)}>
            <div className="img-zoom relative aspect-[4/5] overflow-hidden bg-sand-200">
                <img src={img(tour.image, 800)} alt={tour.title} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-0 top-0 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
                    {tour.duration_days} {tour.duration_days === 1 ? 'day' : 'days'}
                </span>
                {tour.badge && <span className="absolute right-0 top-0 bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">{tour.badge}</span>}
                <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center bg-white text-ink opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <Icon name="arrowUpRight" size={18} />
                </span>
            </div>
            <div className="pt-5">
                <p className={cn('eyebrow', light && 'eyebrow-light')}>{tour.group_name || tour.category?.name}</p>
                <h3 className={cn('mt-2 text-[1.28rem] font-semibold leading-snug tracking-tight transition-colors', light ? 'text-white group-hover:text-gold-light' : 'text-ink group-hover:text-gold-dark')}>{tour.title}</h3>
                <div className={cn('mt-4 flex items-baseline justify-between gap-4 border-t pt-3 text-[14px]', light ? 'border-white/15' : 'border-ink/10')}>
                    <span className={light ? 'text-white/55' : 'text-ink/55'}>{tour.season || 'All year round'}</span>
                    <span className={cn('shrink-0 font-semibold', light ? 'text-white' : 'text-ink')}>{tour.price_from ? <>From {money(tour.price_from)}</> : 'Price on request'}</span>
                </div>
            </div>
        </Link>
    );
}
