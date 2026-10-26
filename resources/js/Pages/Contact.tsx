import EnquiryForm from '@/Components/EnquiryForm';
import Icon from '@/Components/Icon';
import PageHero from '@/Components/PageHero';
import SiteLayout from '@/Layouts/SiteLayout';
import { img, initials, useShared, useText, whatsappLink } from '@/lib/utils';
import type { Faq, TeamMember } from '@/types';
import { FaqList } from './Category';

export default function Contact({ faqs, team }: { faqs: Faq[]; team: TeamMember[] }) {
    const { settings } = useShared();
    const tx = useText();
    const cards = [
        { icon: 'phone', label: tx('contact_call'), value: settings.phone, href: `tel:${settings.phone}` },
        { icon: 'mail', label: tx('contact_email'), value: settings.email, href: `mailto:${settings.email}` },
        { icon: 'send', label: tx('contact_whatsapp'), value: settings.phone_2 || tx('contact_whatsapp_text'), href: whatsappLink(settings.whatsapp, tx('whatsapp_message')) },
        { icon: 'clock', label: tx('contact_hours'), value: settings.office_hours },
    ];

    return (
        <SiteLayout title={settings.contact_hero_eyebrow || tx('menu_contact')}>
            <PageHero image={settings.contact_hero_image} eyebrow={settings.contact_hero_eyebrow} title={settings.contact_hero_title} subtitle={settings.contact_hero_text} crumbs={[{ label: tx('menu_contact') }]} overlap />

            <section className="container-site -mt-16 relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((c, i) => {
                    const inner = (
                        <>
                            <span className="flex h-12 w-12 items-center justify-center rounded-none bg-gold/15 text-gold-dark transition group-hover:bg-gold group-hover:text-white"><Icon name={c.icon} size={20} /></span>
                            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-ink/45">{c.label}</p>
                            <p className="mt-1 font-display text-xl">{c.value}</p>
                        </>
                    );
                    const cls = 'group block bg-white p-7 shadow-[0_30px_60px_-40px_rgba(18,20,15,.4)] ring-1 ring-ink/5 transition hover:-translate-y-1';
                    return c.href ? <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" data-reveal style={{ ['--d' as string]: `${i * 80}ms` }} className={cls}>{inner}</a> : <div key={c.label} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }} className={cls}>{inner}</div>;
                })}
            </section>

            <section className="container-site grid gap-14 py-24 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <span className="eyebrow">{tx('contact_form_label')}</span>
                    <h2 className="h-section mt-4">{tx('contact_form_title')}</h2>
                    <p className="mt-5 text-ink/60">{tx('contact_form_text')}</p>
                    <div className="mt-10 overflow-hidden ring-1 ring-ink/5">
                        {settings.map_embed && <iframe src={settings.map_embed} title="Office map" className="h-72 w-full grayscale" loading="lazy" />}
                        <div className="flex items-start gap-4 bg-white p-6"><Icon name="pin" className="mt-1 text-gold" /><p className="whitespace-pre-line text-ink/70"><span className="font-semibold text-ink">{settings.company_name}</span>{'\n'}{settings.address}</p></div>
                    </div>
                </div>
                <div className=" bg-white p-8 ring-1 ring-ink/5 sm:p-10 lg:col-span-7">
                    <EnquiryForm source="contact" />
                </div>
            </section>

            {team.length > 0 && (
                <section className="bg-sand-100 py-24">
                    <div className="container-site">
                        <span className="eyebrow">{tx('contact_team')}</span>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {team.map((m) => (
                                <div key={m.id} data-reveal className=" bg-white p-7 text-center ring-1 ring-ink/5">
                                    {m.photo ? <img src={img(m.photo, 300)} alt={m.name} className="mx-auto h-28 w-28 rounded-none object-cover" /> : <span className="font-display mx-auto flex h-28 w-28 items-center justify-center rounded-none bg-forest text-4xl font-semibold tracking-tight text-gold-light">{initials(m.name)}</span>}
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
                    <div className="lg:col-span-4"><span className="eyebrow">{tx('faq_label')}</span><h2 className="h-section mt-4">{tx('contact_faq_title')}</h2></div>
                    <div className="lg:col-span-8"><FaqList faqs={faqs} /></div>
                </section>
            )}
        </SiteLayout>
    );
}
