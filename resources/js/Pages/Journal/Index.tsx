import { Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import PageHero from '@/Components/PageHero';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, formatDate, img, useShared, useText } from '@/lib/utils';
import type { Paginated, Post } from '@/types';

export default function JournalIndex({ posts, topics, topic }: { posts: Paginated<Post>; topics: string[]; topic: string | null }) {
    const { settings } = useShared();
    const tx = useText();
    const [lead, ...rest] = posts.data;
    return (
        <SiteLayout title={tx('menu_blog')}>
            <PageHero image={settings.journal_hero_image} eyebrow={settings.journal_hero_eyebrow} title={settings.journal_hero_title} subtitle={settings.journal_hero_text} crumbs={[{ label: tx('menu_blog') }]}
                facts={[{ label: tx('blog_fact_posts'), value: posts.total }, { label: tx('blog_fact_topics'), value: topics.length || null }, { label: tx('blog_fact_written'), value: tx('blog_fact_written_value') }]} />
            <section className="container-site py-20">
                <div className="no-scrollbar flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain">
                    {['', ...topics].map((t) => (
                        <Link key={t} href={t ? `/journal?topic=${encodeURIComponent(t)}` : '/journal'} preserveScroll className={cn('shrink-0 rounded-none px-5 py-2 text-[13px] transition', (topic ?? '') === t ? 'bg-forest-900 text-sand' : 'bg-white text-ink/70 ring-1 ring-ink/10')}>{t || tx('blog_all')}</Link>
                    ))}
                </div>

                {/* Latest post: a wide card on page one only */}
                {lead && posts.current_page === 1 && (
                    <Link href={`/journal/${lead.slug}`} data-reveal className="img-zoom group mt-10 grid overflow-hidden border border-ink/10 bg-white transition duration-300 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)] md:grid-cols-2">
                        <div className="aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[300px]"><img src={img(lead.image, 1100)} alt="" className="h-full w-full object-cover" /></div>
                        <div className="flex flex-col justify-center p-6 lg:p-10">
                            <p className="eyebrow !text-[11px]">{lead.topic} · {tx('blog_read', { minutes: lead.read_minutes })}</p>
                            <h2 className="font-display mt-3 line-clamp-3 text-[1.5rem] font-semibold leading-snug tracking-tight group-hover:text-gold-dark lg:text-[1.75rem]">{lead.title}</h2>
                            <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-ink/65">{lead.excerpt}</p>
                            <p className="mt-5 text-[13px] text-ink/45">{formatDate(lead.published_at)}{lead.author ? ` · ${lead.author}` : ''}</p>
                        </div>
                    </Link>
                )}

                {/* The rest: the same card size as trips and stays, four to a row */}
                <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {(posts.current_page === 1 ? rest : posts.data).map((p, i) => (
                        <Link key={p.id} href={`/journal/${p.slug}`} data-reveal style={{ ['--d' as string]: `${(i % 4) * 60}ms` }}
                            className="img-zoom group flex h-full flex-col overflow-hidden border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]">
                            <div className="aspect-[16/10] shrink-0 overflow-hidden bg-sand-200"><img src={img(p.image, 700)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
                            <div className="flex flex-1 flex-col p-4">
                                <p className="eyebrow !text-[11px]">{p.topic}</p>
                                <h3 className="font-display mt-1.5 line-clamp-2 min-h-[2.75em] text-[1.05rem] font-semibold leading-snug tracking-tight group-hover:text-gold-dark">{p.title}</h3>
                                <div className="mt-auto flex items-center justify-between border-t border-ink/10 pt-3 text-[13px] text-ink/50">
                                    <span>{formatDate(p.published_at)} · {p.read_minutes} min</span>
                                    <span className="flex h-8 w-8 items-center justify-center text-gold transition group-hover:translate-x-0.5"><Icon name="arrow" size={16} /></span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {posts.last_page > 1 && (
                    <nav aria-label="Pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
                        {posts.links.map((l, i) => {
                            const label = l.label.includes('Previous') ? <Icon name="arrowLeft" size={16} /> : l.label.includes('Next') ? <Icon name="arrow" size={16} /> : l.label;
                            const cls = cn('flex h-11 min-w-[44px] items-center justify-center border px-3 text-[14px] font-semibold tabular-nums transition', l.active ? 'border-gold bg-gold text-white' : 'border-ink/15 text-ink hover:border-gold hover:text-gold');
                            return l.url ? <Link key={i} href={l.url} className={cls}>{label}</Link> : <span key={i} className={cn(cls, 'opacity-30')}>{label}</span>;
                        })}
                    </nav>
                )}
            </section>
        </SiteLayout>
    );
}
