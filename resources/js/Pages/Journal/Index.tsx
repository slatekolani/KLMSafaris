import { Link } from '@inertiajs/react';
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
                        <Link key={t} href={t ? `/journal?topic=${encodeURIComponent(t)}` : '/journal'} preserveScroll className={cn('shrink-0 rounded-none px-5 py-2 text-[13px] transition', (topic ?? '') === t ? 'bg-ink text-sand' : 'bg-white text-ink/70 ring-1 ring-ink/10')}>{t || tx('blog_all')}</Link>
                    ))}
                </div>

                {lead && (
                    <Link href={`/journal/${lead.slug}`} data-reveal className="img-zoom group mt-12 grid items-center gap-10 lg:grid-cols-2">
                        <div className="aspect-[16/11] overflow-hidden"><img src={img(lead.image, 1300)} alt="" className="h-full w-full object-cover" /></div>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-gold-dark">{lead.topic} · {tx('blog_read', { minutes: lead.read_minutes })}</p>
                            <h2 className="font-display mt-4 text-[1.9rem] font-semibold leading-[1.1] tracking-tight group-hover:text-gold-dark sm:text-5xl sm:leading-[1.05]">{lead.title}</h2>
                            <p className="mt-5 text-lg text-ink/60">{lead.excerpt}</p>
                            <p className="mt-6 text-sm text-ink/45">{formatDate(lead.published_at)} · {lead.author}</p>
                        </div>
                    </Link>
                )}

                <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((p, i) => (
                        <Link key={p.id} href={`/journal/${p.slug}`} data-reveal style={{ ['--d' as string]: `${(i % 3) * 80}ms` }} className="img-zoom group">
                            <div className="aspect-[4/3] overflow-hidden"><img src={img(p.image, 800)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
                            <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-gold-dark">{p.topic} · {p.read_minutes} min</p>
                            <h3 className="mt-2 font-display text-[1.8rem] leading-tight group-hover:text-gold-dark">{p.title}</h3>
                            <p className="mt-2 text-ink/60">{p.excerpt}</p>
                        </Link>
                    ))}
                </div>

                {posts.last_page > 1 && (
                    <div className="mt-16 flex justify-center gap-2">
                        {posts.links.map((l, i) => l.url ? (
                            <Link key={i} href={l.url} preserveScroll className={cn('flex h-11 min-w-11 items-center justify-center rounded-none px-4 text-sm', l.active ? 'bg-ink text-white' : 'bg-white ring-1 ring-ink/10')} dangerouslySetInnerHTML={{ __html: l.label }} />
                        ) : null)}
                    </div>
                )}
            </section>
        </SiteLayout>
    );
}
