import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/Components/Icon';
import { cn } from '@/lib/utils';

type Option = [string, string];
type Group = { label: string; options: Option[] };

/**
 * The site's dropdown, used everywhere instead of the browser's grey/black option list: white panel, hover highlight,
 * a check on the chosen option, keyboard arrows/Enter/Escape, optional search and option groups.
 * Variants: "finder" (small label above the value, homepage trip finder) and "field" (form/search fields).
 * `buttonClass` lets a form give the button its own field look (e.g. the dark enquiry form or the CMS).
 */
export default function Dropdown({ value, onChange, options = [], groups, label, placeholder, variant = 'field', className, buttonClass, searchable = false, searchPlaceholder = 'Search…' }: {
    value?: string | number | null;
    onChange: (v: string) => void;
    options?: Option[];
    groups?: Group[];
    label?: string;
    placeholder?: string;
    variant?: 'finder' | 'field';
    className?: string;
    buttonClass?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [hi, setHi] = useState(0);
    const [q, setQ] = useState('');
    const box = useRef<HTMLDivElement>(null);
    const search = useRef<HTMLInputElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    // The open list is drawn at the top of the page (a portal) under its button, so no card, form or section can cover or clip it.
    const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);
    useLayoutEffect(() => {
        if (!open) return;
        const place = () => {
            const r = box.current?.getBoundingClientRect();
            if (!r) return;
            // Opens upwards when there isn't room below (e.g. a field near the bottom of the screen).
            const h = panel.current?.offsetHeight ?? 320;
            const up = r.bottom + 8 + h > window.innerHeight && r.top - 8 - h > 0;
            setPos({ left: r.left, top: up ? r.top - 8 - h : r.bottom + 8, width: r.width });
        };
        place();
        const again = window.requestAnimationFrame(place);
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);
        return () => { window.cancelAnimationFrame(again); window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); };
    }, [open, q]);
    const current = value === null || value === undefined ? '' : String(value);

    const allGroups: Group[] = groups ?? [{ label: '', options }];
    const shownGroups = useMemo(() => {
        const words = q.toLowerCase().trim();
        return allGroups
            .map((g) => ({ ...g, options: words ? g.options.filter(([, l]) => l.toLowerCase().includes(words)) : g.options }))
            .filter((g) => g.options.length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, groups, options]);
    const flat = shownGroups.flatMap((g) => g.options);
    const chosen = allGroups.flatMap((g) => g.options).find(([v]) => v === current);
    const shownLabel = chosen?.[1] ?? placeholder ?? allGroups[0]?.options[0]?.[1] ?? '';

    useEffect(() => {
        if (!open) { setQ(''); return; }
        setHi(Math.max(0, flat.findIndex(([v]) => v === current)));
        if (searchable) window.setTimeout(() => search.current?.focus(), 30);
        const away = (e: Event) => { const t = e.target as Node; if (!box.current?.contains(t) && !panel.current?.contains(t)) setOpen(false); };
        document.addEventListener('mousedown', away);
        document.addEventListener('touchstart', away);
        return () => { document.removeEventListener('mousedown', away); document.removeEventListener('touchstart', away); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    useEffect(() => setHi(0), [q]);

    const pick = (v: string) => { onChange(v); setOpen(false); };
    const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) setOpen(true);
            else if (flat.length) setHi((i) => (i + (e.key === 'ArrowDown' ? 1 : flat.length - 1)) % flat.length);
        } else if (e.key === 'Enter' && open && flat[hi]) { e.preventDefault(); pick(flat[hi][0]); }
        else if (e.key === ' ' && open && !searchable && flat[hi]) { e.preventDefault(); pick(flat[hi][0]); }
    };
    const chevron = <Icon name="chevronDown" size={15} className={cn('shrink-0 opacity-50 transition-transform duration-300', open && 'rotate-180 text-gold opacity-100')} />;
    let n = -1;

    return (
        <div ref={box} className={cn('relative', className)} onKeyDown={onKey}>
            <button type="button" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}
                className={cn('group w-full text-left transition', buttonClass
                    ? cn(buttonClass, 'flex items-center justify-between gap-3', open && '!border-gold')
                    : variant === 'finder'
                        ? cn('flex h-full flex-col justify-center py-4 md:px-6', open ? 'bg-sand-50' : 'hover:bg-sand-50')
                        : cn('flex items-center justify-between gap-3 border bg-white px-4 py-2.5 text-[14.5px]', open ? 'border-gold' : 'border-ink/15 hover:border-ink/30'))}>
                {variant === 'finder' && !buttonClass ? (
                    <>
                        {label && <span className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{label}</span>}
                        <span className="mt-1 flex items-center justify-between gap-3"><span className="truncate text-[16px] font-medium text-ink">{shownLabel}</span>{chevron}</span>
                    </>
                ) : (
                    <><span className={cn('truncate', !chosen && 'opacity-60')}>{shownLabel}</span>{chevron}</>
                )}
            </button>
            {open && pos && typeof document !== 'undefined' && createPortal(
                <div ref={panel} style={pos ? { left: pos.left + (variant === 'finder' && !buttonClass ? 8 : 0), top: pos.top, width: Math.max(220, pos.width - (variant === 'finder' && !buttonClass ? 16 : 0)) } : undefined}
                    className="menu-pop fixed z-[90] origin-top border border-ink/10 bg-white text-ink shadow-[0_24px_50px_-20px_rgba(29,68,104,.45)]">
                    {searchable && (
                        <div className="flex items-center gap-2 border-b border-ink/10 px-3">
                            <Icon name="search" size={15} className="text-ink/40" />
                            <input ref={search} value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="w-full bg-transparent py-2.5 text-[14px] text-ink outline-none placeholder:text-ink/40" />
                        </div>
                    )}
                    <ul role="listbox" aria-label={label} className="max-h-72 overflow-y-auto p-1.5">
                        {shownGroups.map((g) => (
                            <li key={g.label || 'all'}>
                                {g.label && <p className="px-3.5 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink/40">{g.label}</p>}
                                <ul>
                                    {g.options.map(([v, l]) => {
                                        const i = ++n;
                                        const on = v === current;
                                        return (
                                            <li key={`${g.label}-${v}`} role="option" aria-selected={on}>
                                                <button type="button" onClick={() => pick(v)} onMouseEnter={() => setHi(i)}
                                                    className={cn('flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[14.5px] transition-colors', on ? 'font-semibold text-gold' : 'text-ink/80', hi === i && 'bg-gold/10 text-ink')}>
                                                    <span className="truncate">{l}</span>
                                                    {on && <Icon name="check" size={15} className="shrink-0 text-gold" />}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                        {!flat.length && <li className="px-3.5 py-3 text-[14px] text-ink/45">No matches</li>}
                    </ul>
                </div>,
                document.body,
            )}
        </div>
    );
}
