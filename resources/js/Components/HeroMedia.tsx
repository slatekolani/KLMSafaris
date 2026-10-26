import { useEffect, useRef, useState } from 'react';
import { cn, img } from '@/lib/utils';

const MOVES = ['kb-a', 'kb-b', 'kb-c', 'kb-d'];

/**
 * Full-bleed hero photo with a camera move picked at random per visit, a slow scroll
 * parallax and a gentle mouse drift. Fills the nearest positioned parent.
 */
export default function HeroMedia({ src, width = 2200 }: { src: string; width?: number }) {
    const scroll = useRef<HTMLDivElement>(null);
    const drift = useRef<HTMLDivElement>(null);
    const [move] = useState(() => MOVES[Math.floor(Math.random() * MOVES.length)]);

    useEffect(() => {
        const host = scroll.current?.parentElement;
        if (!host || !drift.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let frame = 0;
        const onScroll = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const y = Math.min(window.scrollY, host.offsetHeight);
                scroll.current?.style.setProperty('transform', `translate3d(0, ${y * 0.28}px, 0)`);
            });
        };
        const onMove = (e: MouseEvent) => {
            const r = host.getBoundingClientRect();
            drift.current?.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
            drift.current?.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        };
        const onLeave = () => {
            drift.current?.style.setProperty('--mx', '0');
            drift.current?.style.setProperty('--my', '0');
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        const fine = window.matchMedia('(pointer: fine)').matches;
        if (fine) {
            host.addEventListener('mousemove', onMove);
            host.addEventListener('mouseleave', onLeave);
        }
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            host.removeEventListener('mousemove', onMove);
            host.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return (
        <div ref={scroll} aria-hidden className="absolute inset-0 will-change-transform">
            <div ref={drift} className="absolute -inset-6 transition-transform duration-[900ms] ease-out" style={{ transform: 'translate3d(calc(var(--mx, 0) * -22px), calc(var(--my, 0) * -14px), 0)' }}>
                <img src={img(src, width, 78)} alt="" className={cn('h-full w-full object-cover', move)} style={{ ['--kb' as string]: '16s' }} />
            </div>
        </div>
    );
}
