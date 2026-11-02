import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import Icon from '@/Components/Icon';
import PageHero from '@/Components/PageHero';
import RichContent from '@/Components/RichContent';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, img, initials, plain, useShared, useText } from '@/lib/utils';
import type { Faq, Page as P, TeamMember } from '@/types';
import { FaqList } from './Category';

export default function Page({ page, team, faqs }: { page: P; team: TeamMember[]; faqs: Faq[] }) {
    const { settings } = useShared();
    const tx = useText();
    return (
        <SiteLayout title={page.meta_title || plain(page.title)} description={page.meta_description || page.subtitle} image={page.image}>
            <PageHero image={page.image} eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} crumbs={[{ label: plain(page.title) }]} />

            {page.body && (
                <section className="container-site py-16 lg:py-20">
                    <RichContent html={page.body} heroImage={page.image || settings.og_image} />
                </section>
            )}

            {/* CMS sections (e.g. volunteer programmes). Three or more become a tidy grid of cards, each with its points
                in a small table; one or two keep the photo-beside-text layout with a moderate photo. */}
            {!!page.sections?.length && (page.sections.length >= 3 ? (
                <section className="border-t border-ink/10 bg-sand-100 py-16 lg:py-20">
                    <div className="container-site grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {page.sections.map((s, i) => {
                            const points = (s.points ?? '').split('\n').map((pt) => pt.trim()).filter(Boolean);
                            return (
                                <article key={i} data-reveal style={{ ['--d' as string]: `${(i % 3) * 70}ms` }}
                                    className="group flex flex-col overflow-hidden border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]">
                                    {s.image && <div className="img-zoom aspect-[16/9] shrink-0 overflow-hidden bg-sand-200"><img src={img(s.image, 800)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>}
                                    <div className="flex flex-1 flex-col p-5">
                                        <h2 className="font-display text-[1.15rem] font-semibold leading-snug text-ink">{s.title}</h2>
                                        {s.text && <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-ink/65">{s.text}</p>}
                                        {points.length > 0 && (
                                            <table className="mt-4 w-full border border-ink/10 text-left text-[13.5px]">
                                                <tbody>
                                                    {points.map((pt, n) => (
                                                        <tr key={pt} className={n % 2 ? 'bg-sand-100' : 'bg-white'}>
                                                            <td className="w-8 py-2 pl-3 align-top"><Icon name="check" size={14} className="mt-0.5 text-gold" /></td>
                                                            <td className="py-2 pr-3 text-ink/80">{pt}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                        {s.button_label && s.button_url && (
                                            <div className="mt-auto pt-5"><CtaLink href={s.button_url} className="btn btn-brand-outline w-full !h-11">{s.button_label} <Icon name="arrow" size={15} className="arrow" /></CtaLink></div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            ) : (
                <section className="container-site space-y-16 pb-20">
                    {page.sections.map((s, i) => (
                        <div key={i} className="grid items-center gap-10 md:grid-cols-12">
                            {s.image && <div className={cn('img-zoom aspect-[4/3] overflow-hidden md:col-span-5', i % 2 && 'md:order-2')}><img src={img(s.image, 900)} alt="" loading="lazy" className="h-full w-full object-cover" /></div>}
                            <div data-reveal className={s.image ? 'md:col-span-7' : 'md:col-span-12'}>
                                <h2 className="h-section">{s.title}</h2>
                                <p className="mt-4 text-[16px] leading-relaxed text-ink/65">{s.text}</p>
                                {!!s.points?.trim() && (
                                    <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                                        {s.points.split('\n').map((pt) => pt.trim()).filter(Boolean).map((pt) => (
                                            <li key={pt} className="flex gap-3 text-[15px] text-ink/80"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold" />{pt}</li>
                                        ))}
                                    </ul>
                                )}
                                {s.button_label && s.button_url && <CtaLink href={s.button_url} className="btn btn-outline mt-7">{s.button_label} <Icon name="arrow" size={16} className="arrow" /></CtaLink>}
                            </div>
                        </div>
                    ))}
                </section>
            ))}

            {/* Team (CMS → Team): photo cards with name and role on the photo, the short bio and email below */}
            {team.length > 0 && (
                <section className="border-t border-ink/10 bg-sand-100 py-16 lg:py-20">
                    <div className="container-site">
                        <div className="max-w-2xl">
                            <span className="eyebrow"><Icon name="users" size={15} className="text-gold" /> {tx('page_team')}</span>
                            <h2 className="h-section mt-3">{tx('page_team_title')}</h2>
                        </div>
                        <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {team.map((m, i) => (
                                <article key={m.id} data-reveal style={{ ['--d' as string]: `${(i % 4) * 60}ms` }}
                                    className="group flex flex-col overflow-hidden border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-24px_rgba(29,68,104,.45)]">
                                    <div className="img-zoom relative aspect-[4/5] overflow-hidden bg-forest-900">
                                        {m.photo
                                            ? <img src={img(m.photo, 600)} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                                            : <span className="font-display flex h-full w-full items-center justify-center text-6xl font-semibold text-gold-light">{initials(m.name)}</span>}
                                        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-transparent to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                                            <p className="font-display text-[1.15rem] font-semibold leading-tight">{m.name}</p>
                                            {m.role && <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-light">{m.role}</p>}
                                        </div>
                                    </div>
                                    {(m.bio || m.email) && (
                                        <div className="flex flex-1 flex-col p-4">
                                            {m.bio && <p className="line-clamp-4 text-[14px] leading-relaxed text-ink/65">{m.bio}</p>}
                                            {m.email && <a href={`mailto:${m.email}`} className="mt-auto flex items-center gap-2 pt-3 text-[13px] font-semibold text-gold hover:text-gold-dark"><Icon name="mail" size={14} />{m.email}</a>}
                                        </div>
                                    )}
                                </article>
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

            <section className="border-t border-ink/10 bg-sand-100 py-16"><div className="container-site max-w-none">
                <p className="h-section">{page.cta_title || tx('page_cta_title', { site: settings.site_name })}</p>
                {page.cta_text && <p className="mt-4 max-w-2xl text-lg text-ink/60">{page.cta_text}</p>}
                <CtaLink href={page.cta_url || '/plan-your-trip'} className="btn btn-gold mt-6">{page.cta_label || tx('page_cta_button')}</CtaLink>
            </div></section>
        </SiteLayout>
    );
}

/** CMS links can be site pages, full URLs or mailto links. Only site pages use client-side navigation. */
function CtaLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
    return href.startsWith('/') ? <Link href={href} className={className}>{children}</Link> : <a href={href} className={className} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{children}</a>;
}
