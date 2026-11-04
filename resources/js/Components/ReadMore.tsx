import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from '@/Components/Icon';
import { cn, useText } from '@/lib/utils';

const count = (s: string) => (s.match(/\S+/g) ?? []).length;

/**
 * CMS text that runs past `words` (300 by default) opens showing about that much: it ends after the paragraph
 * holding the limit, fades out, and a "Read more" button unfolds the rest smoothly ("Show less" folds it again).
 * Shorter text shows as it is, with no button.
 */
export default function ReadMore({ html, words = 300, className, fade = 'from-sand-50' }: { html: string; words?: number; className?: string; fade?: string }) {
    const tx = useText();
    const box = useRef<HTMLDivElement>(null);
    const [cut, setCut] = useState<number | null>(null); // height that shows the first `words` words
    const [full, setFull] = useState(0);
    const [open, setOpen] = useState(false);
    const long = count(html.replace(/<[^>]+>/g, ' ')) > words + 40; // a few words over isn't worth a button

    const measure = () => {
        const el = box.current;
        if (!el || !long) return setCut(null);
        let total = 0;
        let end = 0;
        for (const child of Array.from(el.children) as HTMLElement[]) {
            const n = count(child.textContent ?? '');
            const top = child.offsetTop - el.offsetTop;
            if (total + n >= words) {
                // The limit falls in this block: a long paragraph is cut part-way, on a whole line, so one huge
                // paragraph still folds; a short block is shown whole.
                if (n > 80 && child.tagName === 'P') {
                    const line = parseFloat(getComputedStyle(child).lineHeight) || 28;
                    end = top + Math.max(3, Math.round((child.offsetHeight * ((words - total) / n)) / line)) * line;
                } else {
                    end = top + child.offsetHeight;
                }
                break;
            }
            total += n;
            end = top + child.offsetHeight;
        }
        setFull(el.scrollHeight);
        setCut(end > 0 && end < el.scrollHeight - 40 ? end : null);
    };
    useLayoutEffect(measure, [html, words]);
    useEffect(() => {
        window.addEventListener('resize', measure);
        const imgs = box.current?.querySelectorAll('img') ?? [];
        imgs.forEach((i) => i.addEventListener('load', measure));
        return () => { window.removeEventListener('resize', measure); imgs.forEach((i) => i.removeEventListener('load', measure)); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [html]);

    const toggle = () => {
        // Folding back up: return to the top of the text so the reader isn't left far down the page.
        if (open) box.current?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setOpen(!open);
    };

    return (
        <div>
            <div className="relative">
                <div ref={box} className={cn('prose-lux overflow-hidden transition-[max-height] duration-700 ease-in-out', className)}
                    style={cut !== null ? { maxHeight: open ? full + 40 : cut } : undefined}
                    dangerouslySetInnerHTML={{ __html: html }} />
                {cut !== null && !open && <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent', fade)} />}
            </div>
            {cut !== null && (
                <button type="button" onClick={toggle} aria-expanded={open}
                    className="group mt-5 inline-flex items-center gap-2 border border-ink/15 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-gold hover:text-gold">
                    {tx(open ? 'read_less' : 'read_more')}
                    <Icon name="chevronDown" size={15} className={cn('transition-transform duration-300', open && 'rotate-180')} />
                </button>
            )}
        </div>
    );
}
