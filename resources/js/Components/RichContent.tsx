import { useMemo, useState } from 'react';
import Icon from '@/Components/Icon';
import { cn, img } from '@/lib/utils';

type IconName = Parameters<typeof Icon>[0]['name'];
type Block = { id: string; title: string; level: number; html: string; text: string; images: string[] };

/** Topic words → an icon, for the card layout of short "travel info" style pages. */
const TOPIC_ICONS: [RegExp, IconName][] = [
    [/mission|goal|purpose/i, 'compass'],
    [/commitment|promise|pledge/i, 'check'],
    [/measure|track|progress|report/i, 'chart'],
    [/decarbon|carbon|emission|energy/i, 'leaf'],
    [/regenerat|restor/i, 'leaf'],
    [/collaborat|partner|share/i, 'users'],
    [/finance|fund/i, 'chart'],
    [/before you fly|fly/i, 'compass'],
    [/money|getting around/i, 'map'],
    [/safe/i, 'shield'],
    [/vision|future|dream/i, 'eye'],
    [/value|trust|certif|licen|why/i, 'shield'],
    [/welcome|about|who we|story|home/i, 'home'],
    [/excellen|award|year|best|quality/i, 'award'],
    [/offer|service|planning|guide to|discover/i, 'sparkle'],
    [/review|guest|say/i, 'star'],
    [/beach|island|zanzibar|ocean|sea/i, 'sun'],
    [/culture|cultural|tradition|maasai/i, 'globe'],
    [/intern|education|learn|school|train/i, 'pen'],
    [/visa|passport|permit|document|booking|payment|deposit|cancel/i, 'file'],
    [/insurance|safety|crime|security|rescue|emergency/i, 'shield'],
    [/health|medical|malaria|fever|vaccin|doctor|altitude|oxygen|hygien/i, 'heart'],
    [/currency|money|cash|price|cost|tip|budget/i, 'chart'],
    [/transport|driving|flight|airport|transfer|road|trail/i, 'compass'],
    [/communication|phone|internet|wi-?fi|contact/i, 'phone'],
    [/electric|power|plug|light/i, 'sparkle'],
    [/embass|where|location|map|route/i, 'map'],
    [/weather|climate|season|when|sun|rain/i, 'sun'],
    [/pack|cloth|wear|gear|equipment|tent/i, 'layers'],
    [/food|meal|drink|water|cook/i, 'utensils'],
    [/stay|hotel|camp|lodge|accommodation/i, 'bed'],
    [/wildlife|animal|park|safari/i, 'binoculars'],
    [/mountain|climb|summit|kilimanjaro|meru|trek/i, 'mountain'],
    [/team|guide|people|community|staff|volunteer/i, 'users'],
    [/nature|tree|environment|green|sustainab|climate|carbon/i, 'leaf'],
];
const iconFor = (title: string): IconName => TOPIC_ICONS.find(([re]) => re.test(title))?.[1] ?? 'check';
const slug = (s: string, i: number) => `s-${i}-` + s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/**
 * Turns an old-site HTML body into structured parts: an intro, titled sections, short "fact" headings and the
 * questions (any heading ending in "?") as a FAQ. Old pages often use a bold paragraph instead of a heading; those count too.
 */
function parse(html: string) {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild as HTMLElement;
    // Leftovers of the old site's Tripadvisor widget: the homepage has the real reviews.
    root.querySelectorAll('*').forEach((el) => { if (/Posted on Tripadvisor/i.test(el.textContent ?? '') && el.parentElement === root) el.remove(); });

    const isHeading = (el: Element) => /^H[2-4]$/.test(el.tagName)
        || (el.tagName === 'P' && el.children.length === 1 && el.firstElementChild?.tagName === 'STRONG' && (el.textContent ?? '').trim() === (el.firstElementChild.textContent ?? '').trim() && (el.textContent ?? '').trim().length < 90);

    let intro = '';
    const blocks: Block[] = [];
    let cur: Block | null = null;
    let carried: string[] = [];
    const nodes = Array.from(root.childNodes).filter((n) => n.nodeType === 1 || (n.textContent ?? '').trim());
    // A photo on its own right before a heading with text under it belongs to that heading (that is how the old
    // site laid them out); before an empty heading ("100% Certified") it stays with the section it is in.
    const photoOnly = (el: Element | null) => !!el && !(el.textContent ?? '').trim() && (el.tagName === 'IMG' || el.querySelectorAll('img').length === 1);
    nodes.forEach((node, i) => {
        const el = node.nodeType === 1 ? (node as Element) : null;
        const next = nodes[i + 1]?.nodeType === 1 ? (nodes[i + 1] as Element) : null;
        const after = nodes[i + 2]?.nodeType === 1 ? (nodes[i + 2] as Element) : null;
        if (photoOnly(el) && next && isHeading(next) && !!nodes[i + 2] && !(after && isHeading(after))) {
            const src = (el!.tagName === 'IMG' ? el : el!.querySelector('img'))?.getAttribute('src');
            if (src) carried.push(src);
            return;
        }
        if (el && isHeading(el)) {
            // Old-site headings were often numbered ("6. Countries…", "1. When to climb?"): show the plain title.
            const title = (el.textContent ?? '').replace(/\s+/g, ' ').trim().replace(/^\d+\s*[.)]\s*/, '');
            if (!title) return;
            cur = { id: slug(title, blocks.length), title, level: el.tagName === 'H2' ? 2 : 3, html: '', text: '', images: carried };
            carried = [];
            blocks.push(cur);
            return;
        }
        const piece = el ? el.outerHTML : (node.textContent ?? '').trim() ? `<p>${node.textContent}</p>` : '';
        if (!piece) return;
        if (cur) { cur.html += piece; cur.text += ' ' + (node.textContent ?? ''); } else intro += piece;
    });
    blocks.forEach((b) => {
        b.text = b.text.replace(/\s+/g, ' ').trim();
        // Photos are taken out of the text and laid out by the page (side by side, mosaic or banner) instead of stacked in it.
        const box = doc.createElement('div');
        box.innerHTML = b.html;
        box.querySelectorAll('img').forEach((im) => {
            const src = im.getAttribute('src');
            if (src && !b.images.includes(src)) b.images.push(src);
            let el: Element | null = im;
            while (el && el.parentElement && el.parentElement !== box && (el.parentElement.textContent ?? '').trim() === '' && el.parentElement.querySelectorAll('img').length === 1) el = el.parentElement;
            el?.remove();
        });
        b.html = box.innerHTML;
    });

    // Headings with nothing under them ("100% Certified", "10 Years of Excellence") become highlight badges.
    // Only ones with a number count ("100% Certified"); other empty headings are old-site section labels and are dropped.
    const badges = blocks.filter((b) => !b.text && !b.images.length && !/<table/i.test(b.html) && /\d/.test(b.title)).map((b) => b.title.replace(/:$/, ''));
    const withBody = blocks.filter((b) => (b.text || b.images.length || /<table/i.test(b.html)) && !/Posted on Tripadvisor|Write a review/i.test(b.text));
    const faqs = withBody.filter((b) => /\?\s*$/.test(b.title) && b.text.length > 0);
    const sections = withBody.filter((b) => !faqs.includes(b));
    // A single empty heading is usually a leftover from the old site, not a highlight.
    return { intro, badges: badges.length > 1 ? badges.slice(0, 6) : [], faqs, sections };
}

/** Structured layout for long CMS pages (about, volunteering, travel info, guides…). */
export default function RichContent({ html, heroImage }: { html: string; heroImage?: string | null }) {
    const parsed = useMemo(() => parse(html || ''), [html]);
    const { intro, badges, faqs } = parsed;
    // The hero already shows the page photo: drop it from the content (and a section left with nothing to show).
    const sections = useMemo(() => {
        const same = (src: string) => !!heroImage && src.split('?')[0].replace(/^https?:\/\/[^/]+/, '') === heroImage.replace(/^https?:\/\/[^/]+/, '');
        return parsed.sections
            .map((s) => ({ ...s, images: s.images.filter((src) => !same(src)) }))
            .filter((s) => s.text || s.images.length || /<table/i.test(s.html));
    }, [parsed, heroImage]);
    // Many short topics (visa, currency, medical…) read best as a grid of cards; long guides as an article with contents.
    const avg = sections.reduce((n, s) => n + s.text.length, 0) / Math.max(1, sections.length);
    const asCards = sections.length >= 4 && avg < 700 && sections.every((s) => s.text.length < 1300 && !s.images.length && !/<table/i.test(s.html));
    // Pages with photos become a story: text and photos side by side, alternating, instead of photos stacked in the text.
    const story = !asCards && sections.some((s) => s.images.length);
    // Many short entries that each have one photo (a list of trips or routes) read best as a grid of photo cards.
    const photoCards = story && sections.length >= 5 && sections.filter((s) => s.images.length === 1 && s.text.length < 600).length >= sections.length * 0.7;
    const toc = !asCards && !story && sections.length >= 4;

    return (
        <div>
            {intro.trim() && <div className="prose-lux prose-intro max-w-3xl" dangerouslySetInnerHTML={{ __html: intro }} />}

            {badges.length > 0 && (
                <ul className="mt-8 flex max-w-4xl flex-wrap gap-3">
                    {badges.map((b) => (
                        <li key={b} className="flex items-center gap-2 border border-gold/30 bg-gold/5 px-4 py-2 text-[14px] font-semibold text-ink">
                            <Icon name="award" size={16} className="text-gold" />{b}
                        </li>
                    ))}
                </ul>
            )}

            {asCards && avg < 200 ? (
                // One-line points: four across, big icon on top, centred
                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {sections.map((s, i) => (
                        <article key={s.id} id={s.id} data-reveal style={{ ['--d' as string]: `${(i % 4) * 60}ms` }}
                            className="group flex flex-col items-center border border-ink/10 bg-white p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]">
                            <span className="flex h-14 w-14 items-center justify-center bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-white"><Icon name={iconFor(s.title)} size={24} /></span>
                            <h3 className="font-display mt-4 text-[1.05rem] font-semibold leading-snug text-ink">{s.title}</h3>
                            <div className="prose-lux prose-compact mt-2 !text-[14px] text-ink/65" dangerouslySetInnerHTML={{ __html: s.html }} />
                        </article>
                    ))}
                </div>
            ) : asCards ? (
                <div className="mt-12 grid gap-5 md:grid-cols-2">
                    {sections.map((s) => (
                        <article key={s.id} id={s.id} data-reveal className="flex gap-5 border border-ink/10 bg-white p-6 transition hover:border-gold/40">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-gold/10 text-gold"><Icon name={iconFor(s.title)} size={22} /></span>
                            <div className="min-w-0">
                                <h3 className="font-display text-[1.15rem] font-semibold leading-snug text-ink">{s.title}</h3>
                                <div className="prose-lux prose-compact mt-2" dangerouslySetInnerHTML={{ __html: s.html }} />
                            </div>
                        </article>
                    ))}
                </div>
            ) : photoCards ? (
                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {sections.map((s, i) => (
                        <article key={s.id} id={s.id} data-reveal style={{ ['--d' as string]: `${(i % 3) * 70}ms` }}
                            className="group flex flex-col overflow-hidden border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]">
                            {s.images[0] && <div className="img-zoom aspect-[16/10] overflow-hidden bg-sand-200"><img src={img(s.images[0], 800)} alt={s.title} loading="lazy" className="h-full w-full object-cover" /></div>}
                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="font-display text-[1.15rem] font-semibold leading-snug text-ink">{s.title}</h3>
                                <div className="prose-lux prose-compact mt-2" dangerouslySetInnerHTML={{ __html: s.html }} />
                            </div>
                        </article>
                    ))}
                </div>
            ) : story ? (
                <div className="mt-14 space-y-20 lg:space-y-28">
                    {(() => {
                        let side = 0;
                        // Short text-only sections next to each other (Mission, Vision…) are gathered into one row of icon cards.
                        const isShort = (s: Block) => !s.images.length && s.text.length < 600 && !/<table|<ul|<ol/i.test(s.html);
                        const out: JSX.Element[] = [];
                        for (let i = 0; i < sections.length; i++) {
                            const s = sections[i];
                            if (isShort(s) && sections[i + 1] && isShort(sections[i + 1])) {
                                const group = [s];
                                while (sections[i + 1] && isShort(sections[i + 1]) && group.length < 4) group.push(sections[++i]);
                                out.push(<IconCards key={s.id} items={group} />);
                            } else if (s.images.length && !s.text && !/<table/i.test(s.html)) out.push(<Banner key={s.id} s={s} />);
                            else if (s.images.length === 1) out.push(<Split key={s.id} s={s} flip={side++ % 2 === 1} />);
                            else if (s.images.length > 1) out.push(<Mosaic key={s.id} s={s} />);
                            else out.push(<TextOnly key={s.id} s={s} />);
                        }
                        return out;
                    })()}
                </div>
            ) : sections.length > 0 && (
                <div className={cn('mt-12 grid gap-12', toc && 'lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16')}>
                    {toc && (
                        <nav aria-label="On this page" className="hidden lg:block">
                            <div className="sticky top-28 border-l-2 border-gold/30 pl-5">
                                <p className="eyebrow !text-[11px]">On this page</p>
                                <ol className="mt-4 space-y-2.5">
                                    {sections.filter((s) => s.level === 2 || sections.every((x) => x.level !== 2)).slice(0, 14).map((s) => (
                                        <li key={s.id}><a href={`#${s.id}`} className="block text-[14px] leading-snug text-ink/60 transition hover:text-gold">{s.title}</a></li>
                                    ))}
                                </ol>
                            </div>
                        </nav>
                    )}
                    <div className={cn('min-w-0', !toc && 'w-full max-w-3xl')}>
                        {(() => {
                            // Short sections side by side (Vision, Mission…) become icon cards; the rest read as an article with an icon per heading.
                            const isShort = (x: Block) => x.text.length < 260 && !/<table|<ul|<ol/i.test(x.html);
                            const out: JSX.Element[] = [];
                            for (let i = 0; i < sections.length; i++) {
                                const s = sections[i];
                                const gap = out.length > 0 ? 'mt-14 border-t border-ink/10 pt-12' : '';
                                if (isShort(s) && sections[i + 1] && isShort(sections[i + 1])) {
                                    const group = [s];
                                    while (sections[i + 1] && isShort(sections[i + 1]) && group.length < 4) group.push(sections[++i]);
                                    out.push(<div key={s.id} className={gap}><IconCards items={group} /></div>);
                                    continue;
                                }
                                out.push(
                                    <section key={s.id} id={s.id} className={cn('scroll-mt-28', gap)}>
                                        <h2 className="h-section flex items-center gap-3 text-ink">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold/10 text-gold"><Icon name={iconFor(s.title)} size={19} /></span>
                                            {s.title}
                                        </h2>
                                        <div className="prose-lux mt-5" dangerouslySetInnerHTML={{ __html: s.html }} />
                                    </section>,
                                );
                            }
                            return out;
                        })()}
                    </div>
                </div>
            )}

            {faqs.length > 0 && <FaqBlock items={faqs} />}
        </div>
    );
}

function Heading({ s, light = false, icon = false }: { s: Block; light?: boolean; icon?: boolean }) {
    return (
        <h2 className={cn('h-section', light ? 'text-white' : 'text-ink')}>
            {icon
                ? <span className="mb-4 flex h-12 w-12 items-center justify-center bg-gold/10 text-gold"><Icon name={iconFor(s.title)} size={22} /></span>
                : <span className="mb-4 block h-1 w-10 bg-gold" />}
            {s.title}
        </h2>
    );
}

/** One photo: photo and text side by side, alternating sides, the photo set off by an offset gold frame and a topic badge. */
function Split({ s, flip }: { s: Block; flip: boolean }) {
    return (
        <section id={s.id} className="grid scroll-mt-28 items-center gap-10 md:grid-cols-12 lg:gap-16">
            <div data-reveal className={cn('relative md:col-span-6', flip && 'md:order-2')}>
                <span aria-hidden className={cn('absolute -bottom-4 h-full w-full border-2 border-gold/40', flip ? '-left-4' : '-right-4')} />
                <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-sand-200 shadow-[0_30px_60px_-30px_rgba(29,68,104,.55)]">
                    <img src={img(s.images[0], 1200)} alt={s.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <span className={cn('absolute -top-5 flex h-14 w-14 items-center justify-center bg-gold text-white shadow-lg', flip ? '-right-3 md:right-6' : '-left-3 md:left-6')}><Icon name={iconFor(s.title)} size={22} /></span>
            </div>
            <div data-reveal className={cn('md:col-span-6', flip && 'md:order-1')}>
                <Heading s={s} />
                <div className="prose-lux mt-5" dangerouslySetInnerHTML={{ __html: s.html }} />
            </div>
        </section>
    );
}

/** Several photos: the text, then a mosaic with one large photo and smaller ones beside it. */
function Mosaic({ s }: { s: Block }) {
    const pics = s.images.slice(0, 5);
    return (
        <section id={s.id} className="scroll-mt-28">
            <div className="max-w-3xl">
                <Heading s={s} />
                {s.text && <div className="prose-lux mt-5" dangerouslySetInnerHTML={{ __html: s.html }} />}
            </div>
            <div className={cn('mt-10 grid gap-3 sm:gap-4', pics.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4 md:grid-rows-2')}>
                {pics.map((src, i) => (
                    <div key={src} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}
                        className={cn('img-zoom overflow-hidden bg-sand-200', pics.length > 2 && i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/3]', pics.length === 3 && i > 0 && 'md:col-span-2')}>
                        <img src={img(src, i === 0 ? 1200 : 700)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                ))}
            </div>
        </section>
    );
}

/** A heading with only a photo under it: a wide banner with the heading on it. */
function Banner({ s }: { s: Block }) {
    return (
        <section id={s.id} data-reveal className="relative scroll-mt-28 overflow-hidden">
            <div className="img-zoom aspect-[16/9] md:aspect-[21/8]"><img src={img(s.images[0], 1800)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:max-w-3xl lg:p-14"><Heading s={s} light /></div>
        </section>
    );
}

/** No photo: a centred reading column; short ones sit in a soft panel so the rhythm keeps changing. */
function TextOnly({ s }: { s: Block }) {
    const short = s.text.length < 450 && !/<table|<ul|<ol/i.test(s.html);
    return (
        <section id={s.id} className={cn('max-w-3xl scroll-mt-28', short && 'border-l-4 border-gold bg-sand-100 p-8 sm:p-10')}>
            <Heading s={s} icon />
            <div className="prose-lux mt-5" dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
    );
}

/** Two or more short sections in a row (Mission, Vision…): side by side as icon cards. */
function IconCards({ items }: { items: Block[] }) {
    return (
        <div className={cn('grid max-w-5xl gap-5', items.length === 2 || items.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3')}>
            {items.map((s, i) => (
                <section key={s.id} id={s.id} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}
                    className="scroll-mt-28 border border-ink/10 bg-white p-7 transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)] sm:p-8">
                    <span className="flex h-14 w-14 items-center justify-center bg-gold text-white"><Icon name={iconFor(s.title)} size={24} /></span>
                    <h2 className="font-display mt-5 text-[1.15rem] font-semibold leading-snug text-ink">{s.title}</h2>
                    <div className="prose-lux prose-compact mt-3" dangerouslySetInnerHTML={{ __html: s.html }} />
                </section>
            ))}
        </div>
    );
}

/** Questions found in the page body, as their own accordion section. */
function FaqBlock({ items }: { items: Block[] }) {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <section className="mt-20 border-t border-ink/10 pt-16">
            <div className="max-w-3xl">
                <p className="eyebrow">FAQ</p>
                <h2 className="h-section mt-3">Common questions</h2>
            </div>
            <div className="mt-10 max-w-3xl space-y-3">
                {items.map((f, i) => (
                    <div key={f.id} className={cn('border bg-white transition', open === i ? 'border-gold/40 shadow-[0_18px_40px_-28px_rgba(29,68,104,.5)]' : 'border-ink/10')}>
                        <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left sm:px-6">
                            <span className="font-display text-[1.05rem] font-semibold leading-snug text-ink sm:text-[1.1rem]">{f.title.replace(/^\d+\.\s*/, '')}</span>
                            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center border transition-all duration-300', open === i ? 'rotate-45 border-gold bg-gold text-white' : 'border-ink/15 text-ink')}><Icon name="plus" size={15} /></span>
                        </button>
                        <div className={cn('grid transition-all duration-500', open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                            <div className="overflow-hidden"><div className="prose-lux prose-compact px-5 pb-6 sm:px-6" dangerouslySetInnerHTML={{ __html: f.html }} /></div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
