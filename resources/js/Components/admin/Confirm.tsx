import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Ask = { title: string; text?: string; confirm?: string; cancel?: string; danger?: boolean };
type Pending = Ask & { resolve: (ok: boolean) => void };

let show: ((p: Pending) => void) | null = null;

/**
 * SweetAlert-style "Are you sure?" box for the CMS. `if (await askConfirm({ title: 'Delete this tour?' })) …`.
 * Falls back to the browser's own confirm if the box isn't on the page.
 */
export function askConfirm(ask: Ask): Promise<boolean> {
    return new Promise((resolve) => (show ? show({ ...ask, resolve }) : resolve(window.confirm(ask.title))));
}

/** Mounted once in the admin layout. */
export function ConfirmHost() {
    const [p, setP] = useState<Pending | null>(null);
    const [open, setOpen] = useState(false);
    const yes = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        show = (next) => { setP(next); requestAnimationFrame(() => setOpen(true)); };
        return () => { show = null; };
    }, []);

    const close = (ok: boolean) => {
        if (!p) return;
        setOpen(false);
        const done = p.resolve;
        window.setTimeout(() => { setP(null); done(ok); }, 160);
    };

    useEffect(() => {
        if (!p) return;
        yes.current?.focus();
        const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false); };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p]);

    if (!p) return null;
    const danger = p.danger !== false;

    return (
        <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
            className={cn('fixed inset-0 z-[100] flex items-center justify-center bg-forest-900/55 p-4 backdrop-blur-sm transition-opacity duration-150', open ? 'opacity-100' : 'opacity-0')}
            onClick={() => close(false)}>
            <div onClick={(e) => e.stopPropagation()}
                className={cn('w-full max-w-sm rounded-2xl bg-white px-7 pb-7 pt-8 text-center shadow-2xl transition duration-200', open ? 'scale-100 opacity-100' : 'scale-90 opacity-0')}>
                {/* The warning mark, drawn like SweetAlert's */}
                <span className={cn('mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[3px]', danger ? 'border-clay/40 text-clay' : 'border-gold/40 text-gold')}>
                    <span className="font-display text-[44px] font-semibold leading-none">!</span>
                </span>
                <p id="confirm-title" className="font-display mt-5 text-[1.45rem] font-semibold leading-snug text-ink">{p.title}</p>
                {p.text && <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">{p.text}</p>}
                <div className="mt-7 flex justify-center gap-3">
                    <button type="button" onClick={() => close(false)} className="rounded-xl bg-sand-100 px-5 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-sand-200">{p.cancel ?? 'Cancel'}</button>
                    <button ref={yes} type="button" onClick={() => close(true)}
                        className={cn('rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4', danger ? 'bg-clay hover:bg-clay/90 focus:ring-clay/25' : 'bg-gold hover:bg-gold-dark focus:ring-gold/25')}>
                        {p.confirm ?? 'Yes, delete it'}
                    </button>
                </div>
            </div>
        </div>
    );
}
