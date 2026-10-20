import { Link } from '@inertiajs/react';
import PageHero from '@/Components/PageHero';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, img, initials, useShared } from '@/lib/utils';
import type { Faq, Page as P, TeamMember } from '@/types';
import { FaqList } from './Category';

export default function Page({ page, team, faqs }: { page: P; team: TeamMember[]; faqs: Faq[] }) {
    const { settings } = useShared();
    return (
        <SiteLayout title={page.meta_title || page.title} description={page.meta_description || page.subtitle} image={page.image}>
            <PageHero image={page.image || settings.og_image} eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} crumbs={[{ label: page.title }]} />

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
                                <h2 className="mt-3 text-5xl font-semibold tracking-tight leading-tight">{s.title}</h2>
                                <p className="mt-5 text-lg leading-relaxed text-ink/65">{s.text}</p>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {team.length > 0 && (
                <section className="bg-sand-100 py-24">
                    <div className="container-site">
                        <span className="eyebrow">Meet the team</span>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {team.map((m) => (
                                <div key={m.id} data-reveal className=" bg-white p-7 ring-1 ring-ink/5">
                                    {m.photo ? <img src={img(m.photo, 400)} alt={m.name} className="aspect-square w-full object-cover" /> : <span className="flex aspect-square w-full items-center justify-center bg-forest text-6xl font-semibold tracking-tight text-gold-light">{initials(m.name)}</span>}
                                    <p className="mt-5 text-2xl font-semibold tracking-tight">{m.name}</p>
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
                    <div className="lg:col-span-4"><span className="eyebrow">FAQ</span><h2 className="mt-4 text-5xl font-semibold tracking-tight">Common questions</h2></div>
                    <div className="lg:col-span-8"><FaqList faqs={faqs} /></div>
                </section>
            )}

            <section className="container-site pb-24 text-center">
                <p className="font-display text-4xl">Ready to travel with {settings.site_name}?</p>
                <Link href="/plan-your-trip" className="btn btn-gold mt-6">Book now</Link>
            </section>
        </SiteLayout>
    );
}
