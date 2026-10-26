import { Link } from '@inertiajs/react';
import HeroMedia from '@/Components/HeroMedia';
import Icon from '@/Components/Icon';
import TourCard from '@/Components/TourCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { formatDate, img, useShared, useText } from '@/lib/utils';
import type { Post, TourCard as TC } from '@/types';

export default function JournalShow({ post, more, tours }: { post: Post; more: Post[]; tours: TC[] }) {
    const { settings } = useShared();
    const tx = useText();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    return (
        <SiteLayout solidHeader title={post.title} description={post.excerpt} image={post.image}>
            <article>
                <header className="container-site max-w-4xl pb-12 pt-16 text-center lg:pt-20">
                    <Link href={`/journal?topic=${encodeURIComponent(post.topic ?? '')}`} className="eyebrow after:h-px after:w-8 after:bg-current after:opacity-70">{post.topic}</Link>
                    <h1 className="h-display mt-6 text-balance !text-[clamp(2.2rem,4.6vw,4.2rem)]"><span className="mask"><span>{post.title}</span></span></h1>
                    <p className="mt-6 text-lg text-ink/60">{post.excerpt}</p>
                    <p className="mt-6 text-sm uppercase tracking-[0.16em] text-ink/45">{post.author} · {formatDate(post.published_at)} · {tx('blog_read', { minutes: post.read_minutes })}</p>
                </header>
                {post.image && <div className="relative aspect-[4/3] overflow-hidden bg-ink sm:aspect-[21/9]"><HeroMedia src={post.image} /></div>}
                <div className="container-site grid gap-14 py-20 lg:grid-cols-12">
                    <aside className="hidden lg:col-span-2 lg:block">
                        <div className="sticky top-28 space-y-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-ink/45">{tx('blog_share')}</p>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-none ring-1 ring-ink/15 hover:bg-ink hover:text-white"><Icon name="facebook" size={17} /></a>
                            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`} target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-none ring-1 ring-ink/15 hover:bg-ink hover:text-white"><Icon name="send" size={17} /></a>
                            <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}`} className="flex h-11 w-11 items-center justify-center rounded-none ring-1 ring-ink/15 hover:bg-ink hover:text-white"><Icon name="mail" size={17} /></a>
                        </div>
                    </aside>
                    <div className="prose-lux lg:col-span-7" dangerouslySetInnerHTML={{ __html: post.body ?? '' }} />
                    <aside className="lg:col-span-3">
                        <div className="sticky top-28 bg-forest-900 p-7 text-white">
                            <p className="font-display text-2xl leading-snug">{tx('blog_cta_title')}</p>
                            <p className="mt-3 text-sm text-white/60">{tx('blog_cta_text')}</p>
                            <Link href="/plan-your-trip" className="btn btn-brand mt-6 w-full">{tx('blog_cta_button')}</Link>
                            <a href={`tel:${settings.phone}`} className="mt-4 flex items-center justify-center gap-2 text-sm text-gold-light"><Icon name="phone" size={14} />{settings.phone}</a>
                        </div>
                    </aside>
                </div>
            </article>

            {tours.length > 0 && (
                <section className="bg-sand-100 py-20">
                    <div className="container-site">
                        <span className="eyebrow">{tx('blog_tours')}</span>
                        <div className="mt-8 grid gap-6 md:grid-cols-2">{tours.map((t) => <TourCard key={t.id} tour={t} />)}</div>
                    </div>
                </section>
            )}

            <section className="container-site py-20">
                <span className="eyebrow">{tx('blog_more')}</span>
                <div className="mt-8 grid gap-8 md:grid-cols-3">
                    {more.map((p) => (
                        <Link key={p.id} href={`/journal/${p.slug}`} className="img-zoom group">
                            <div className="aspect-[4/3] overflow-hidden"><img src={img(p.image, 700)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
                            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-gold-dark">{p.topic}</p>
                            <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight leading-tight group-hover:text-gold-dark">{p.title}</h3>
                        </Link>
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}
