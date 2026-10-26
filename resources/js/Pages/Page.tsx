import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import Icon from '@/Components/Icon';
import PageHero from '@/Components/PageHero';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, img, initials, plain, useShared, useText } from '@/lib/utils';
import type { Faq, Page as P, TeamMember } from '@/types';
import { FaqList } from './Category';

export default function Page({ page, team, faqs }: { page: P; team: TeamMember[]; faqs: Faq[] }) {
    const { settings } = useShared();
    const tx = useText();
    return (
        <SiteLayout title={page.meta_title || plain(page.title)} description={page.meta_description || page.subtitle} image={page.image}>
            <PageHero image={page.image || settings.og_image} eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} crumbs={[{ label: plain(page.title) }]} />

            <section className="container-site grid gap-14 py-24 lg:grid-cols-12">
                <div className="prose-lux lg:col-span-8 lg:col-start-3" dangerouslySetInnerHTML={{ __html: page.body ?? '' }} />
            </section>

            {!!page.sections?.length && (
                <section className="container-site space-y-24 pb-24">
                    {page.sections.map((s, i) => (
                        <div key={i} className="grid items-center gap-12 lg:grid-cols-2">
                            {s.image && <div className={cn('clip-reveal aspect-[5/4] overflow-hidden', i % 2 && 'lg:order-2')}><img src={img(s.image, 1200)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>}
                            <div data-reveal>
                                <span className="font-display text-xl text-gold-dark">0{i + 1}</span>
                                <h2 className="h-section mt-3">{s.title}</h2>
                                <p className="mt-5 text-lg leading-relaxed text-ink/65">{s.text}</p>
                                {!!s.points?.trim() && (
                                    <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                                        {s.points.split('\n').map((pt) => pt.trim()).filter(Boolean).map((pt) => (
                                            <li key={pt} className="flex gap-3 text-[15px] text-ink/80"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold" />{pt}</li>
                                        ))}
                                    </ul>
                                )}
                                {s.button_label && s.button_url && <CtaLink href={s.button_url} className="btn btn-outline mt-8">{s.button_label} <Icon name="arrow" size={16} className="arrow" /></CtaLink>}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {team.length > 0 && (
                <section className="bg-sand-100 py-24">
                    <div className="container-site">
                        <span className="eyebrow">{tx('page_team')}</span>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {team.map((m) => (
                                <div key={m.id} data-reveal className=" bg-white p-7 ring-1 ring-ink/5">
                                    {m.photo ? <img src={img(m.photo, 400)} alt={m.name} className="aspect-square w-full object-cover" /> : <span className="font-display flex aspect-square w-full items-center justify-center bg-forest text-6xl font-semibold tracking-tight text-gold-light">{initials(m.name)}</span>}
                                    <p className="font-display mt-5 text-2xl font-semibold tracking-tight">{m.name}</p>
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-gold-dark">{m.role}</p>
                                    <p className="mt-3 text-sm text-ink/60">{m.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {faqs.length > 0 && (
                <section className="container-site grid gap-12 py-24 lg:grid-cols-12">
                    <div className="lg:col-span-4"><span className="eyebrow">{tx('faq_label')}</span><h2 className="h-section mt-4">{tx('page_faq_title')}</h2></div>
                    <div className="lg:col-span-8"><FaqList faqs={faqs} /></div>
                </section>
            )}

            <section className="container-site pb-24 text-center">
                <p className="font-display text-4xl">{page.cta_title || tx('page_cta_title', { site: settings.site_name })}</p>
                {page.cta_text && <p className="mx-auto mt-4 max-w-2xl text-lg text-ink/60">{page.cta_text}</p>}
                <CtaLink href={page.cta_url || '/plan-your-trip'} className="btn btn-gold mt-6">{page.cta_label || tx('page_cta_button')}</CtaLink>
            </section>
        </SiteLayout>
    );
}

/** CMS links can be site pages, full URLs or mailto: — only site pages use client-side navigation. */
function CtaLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
    return href.startsWith('/') ? <Link href={href} className={className}>{children}</Link> : <a href={href} className={className} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{children}</a>;
}
