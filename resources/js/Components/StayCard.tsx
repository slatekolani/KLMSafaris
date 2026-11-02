import { Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { cn, img, useText } from '@/lib/utils';

export type Stay = {
    id: number;
    name: string;
    slug: string;
    type: string;
    location: string | null;
    image: string | null;
    gallery?: string[] | null;
    excerpt?: string | null;
    destination: { id: number; name: string; slug?: string } | null;
};

/** The cover to show: the chosen cover photo, else the first gallery photo, else none. */
export const stayCover = (s: Pick<Stay, 'image' | 'gallery'>) => s.image || s.gallery?.[0] || null;

/** A lodge / camp / hotel card (CMS → Accommodation). Without photos it shows a calm "photo coming soon" tile. */
export default function StayCard({ stay, className }: { stay: Stay; className?: string }) {
    const tx = useText();
    const cover = stayCover(stay);
    const where = stay.location || stay.destination?.name;

    // Same frame as TourCard (border, 16:10 photo, two-line title, bottom row) so stays and trips line up everywhere.
    return (
        <Link href={`/accommodation/${stay.slug}`}
            className={cn('group flex h-full flex-col overflow-hidden border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]', className)}>
            <div className="img-zoom relative aspect-[16/10] shrink-0 overflow-hidden bg-forest-900">
                {cover ? (
                    <img src={img(cover, 800)} alt={stay.name} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                    <span aria-hidden className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / .07) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
                        <span className="flex flex-col items-center gap-2 text-white/40 transition duration-500 group-hover:text-white/60">
                            <Icon name="bed" size={26} />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">{tx('stays_photo_soon')}</span>
                        </span>
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <p className="eyebrow !text-[11px]">{stay.type}</p>
                <h3 className="font-display mt-1.5 line-clamp-2 min-h-[2.75em] text-[1.05rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-gold-dark">{stay.name}</h3>
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-ink/10 pt-3 text-[13.5px]">
                    <span className="flex min-w-0 items-center gap-1.5 text-ink/60">{where && <><Icon name="pin" size={13} className="shrink-0 text-gold" /><span className="truncate">{where}</span></>}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-gold transition group-hover:translate-x-0.5"><Icon name="arrow" size={16} /></span>
                </div>
            </div>
        </Link>
    );
}
