import { useEffect, useRef, useState } from 'react';
import Icon from '@/Components/Icon';
import { cn } from '@/lib/utils';

/** Splits a card list into pages (12 = three rows of four). Goes back to page 1 whenever the list changes (a filter or tab). */
export function usePaged<T>(items: T[], perPage = 12) {
    const [page, setPage] = useState(1);
    const top = useRef<HTMLDivElement>(null);
    const pages = Math.max(1, Math.ceil(items.length / perPage));
    const key = items.length + ':' + items.slice(0, 3).map((x) => JSON.stringify(x).length).join(',');
    useEffect(() => setPage(1), [key]);
    const go = (p: number) => {
        setPage(Math.min(pages, Math.max(1, p)));
        const el = top.current;
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' });
    };
    return { shown: items.slice((page - 1) * perPage, page * perPage), page, pages, go, top };
}

/** Numbered pages with previous/next, shown under a card grid when there is more than one page. */
export default function Pagination({ page, pages, go, className }: { page: number; pages: number; go: (p: number) => void; className?: string }) {
    if (pages < 2) return null;
    // 1 … 4 5 6 … 10: always the first, last and the pages around the current one
    const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    const btn = 'flex h-11 min-w-[44px] items-center justify-center border px-3 text-[14px] font-semibold tabular-nums transition';
    return (
        <nav aria-label="Pages" className={cn('mt-12 flex flex-wrap items-center justify-center gap-2', className)}>
            <button onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page" className={cn(btn, 'border-ink/15 text-ink hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30')}><Icon name="arrowLeft" size={16} /></button>
            {nums.map((n, i) => (
                <span key={n} className="flex items-center gap-2">
                    {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-ink/40">…</span>}
                    <button onClick={() => go(n)} aria-current={n === page ? 'page' : undefined}
                        className={cn(btn, n === page ? 'border-gold bg-gold text-white' : 'border-ink/15 text-ink hover:border-gold hover:text-gold')}>{n}</button>
                </span>
            ))}
            <button onClick={() => go(page + 1)} disabled={page === pages} aria-label="Next page" className={cn(btn, 'border-ink/15 text-ink hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30')}><Icon name="arrow" size={16} /></button>
        </nav>
    );
}
