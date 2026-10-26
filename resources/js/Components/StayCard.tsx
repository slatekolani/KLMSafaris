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

    return (
        <Link href={`/accommodation/${stay.slug}`} className={cn('img-zoom group relative block aspect-[4/3] overflow-hidden bg-ink sm:aspect-[4/5]', className)}>
            {cover ? (
                <img src={img(cover, 900)} alt={stay.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
                <span aria-hidden className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / .07) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
                    <span className="flex flex-col items-center gap-3 pb-16 text-white/35 sm:pb-20 transition duration-500 group-hover:text-white/55">
                        <Icon name="bed" size={34} />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{tx('stays_photo_soon')}</span>
                    </span>
                </span>
            )}
            <div className={cn('absolute inset-0', cover ? 'bg-gradient-to-t from-black/85 via-black/15 to-transparent' : 'bg-gradient-to-t from-black/60 to-transparent')} />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="bg-gold px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em]">{stay.type}</span>
                <p className="mt-3 font-display text-[1.3rem] font-semibold leading-tight">{stay.name}</p>
                {where && <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/70"><Icon name="pin" size={13} />{where}</p>}
            </div>
            <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-1 items-center justify-center bg-white text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <Icon name="arrowUpRight" size={16} />
            </span>
        </Link>
    );
}
