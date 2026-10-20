import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import Icon from '@/Components/Icon';
import { cn, fancy, img } from '@/lib/utils';

export default function PageHero({ image, eyebrow, title, subtitle, crumbs = [], children, tall = false }: {
    image?: string | null;
    eyebrow?: string | null;
    title: string;
    subtitle?: string | null;
    crumbs?: { label: string; href?: string }[];
    children?: ReactNode;
    tall?: boolean;
}) {
    return (
        <section className={cn('grain relative flex items-end overflow-hidden bg-forest-900 text-white', tall ? 'min-h-[88vh]' : 'min-h-[68vh]')}>
            {image && <img src={img(image, 2000)} alt="" className="kenburns absolute inset-0 h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/45 to-forest-900/30" />
            <div className="container-site relative z-10 pb-16 pt-40 sm:pb-20">
                {crumbs.length > 0 && (
                    <nav className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-white">Home</Link>
                        {crumbs.map((c) => (
                            <span key={c.label} className="flex items-center gap-2">
                                <Icon name="chevronRight" size={12} />
                                {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="text-white/90">{c.label}</span>}
                            </span>
                        ))}
                    </nav>
                )}
                {eyebrow && <span className="eyebrow eyebrow-light">{eyebrow}</span>}
                <h1 className="h-display fancy mt-5 max-w-5xl text-balance"><span className="mask"><span>{fancy(title)}</span></span></h1>
                {subtitle && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{subtitle}</p>}
                {children}
            </div>
        </section>
    );
}
