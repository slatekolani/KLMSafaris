import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Icon from '@/Components/Icon';
import BrandTile, { BrandMark } from '@/Components/BrandIcon';
import Logo from '@/Components/Logo';
import { cn, img, plain, useShared, useText, whatsappLink } from '@/lib/utils';

type Props = { children: ReactNode; title?: string; description?: string | null; image?: string | null; solidHeader?: boolean; mobileBar?: boolean };

export default function SiteLayout({ children, title, description, image, solidHeader = false, mobileBar = true }: Props) {
    const { settings, seo } = useShared();
    useRevealObserver();
    // Tags come from the server (App\Support\Seo) so crawlers see them too; page props are only a fallback.
    const metaTitle = seo?.title || (title ? plain(title) : settings.site_name);
    const metaText = seo?.description || description || settings.meta_description;
    const metaImage = seo?.image || img(image || settings.og_image, 1200);

    return (
        <>
            <Head title={metaTitle}>
                <meta head-key="description" name="description" content={metaText} />
                <meta head-key="robots" name="robots" content={seo?.robots || 'index,follow'} />
                {seo?.url && <link head-key="canonical" rel="canonical" href={seo.url} />}
                <meta head-key="og:site_name" property="og:site_name" content={settings.site_name} />
                <meta head-key="og:type" property="og:type" content={seo?.type || 'website'} />
                <meta head-key="og:title" property="og:title" content={metaTitle} />
                <meta head-key="og:description" property="og:description" content={metaText} />
                {seo?.url && <meta head-key="og:url" property="og:url" content={seo.url} />}
                <meta head-key="og:locale" property="og:locale" content="en_GB" />
                {metaImage && <meta head-key="og:image" property="og:image" content={metaImage} />}
                {metaImage && <meta head-key="og:image:alt" property="og:image:alt" content={metaTitle} />}
                {seo?.published && <meta head-key="article:published_time" property="article:published_time" content={seo.published} />}
                <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta head-key="twitter:title" name="twitter:title" content={metaTitle} />
                <meta head-key="twitter:description" name="twitter:description" content={metaText} />
                {metaImage && <meta head-key="twitter:image" name="twitter:image" content={metaImage} />}
                {seo?.twitter && <meta head-key="twitter:site" name="twitter:site" content={seo.twitter} />}
                {seo?.schema && <script head-key="schema" type="application/ld+json">{JSON.stringify(seo.schema)}</script>}
            </Head>
            <Header solid={solidHeader} />
            <main>{children}</main>
            <Newsletter />
            <Footer />
            <WhatsAppStamp />
            {mobileBar && <MobileBar />}
            <Toast />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Motion: reveal anything marked data-reveal as it enters the viewport */
function useRevealObserver() {
    const { url } = usePage();
    useEffect(() => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    io.unobserve(e.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in), .clip-reveal:not(.is-in)').forEach((el) => io.observe(el));
        scan();
        const mo = new MutationObserver(scan);
        mo.observe(document.body, { childList: true, subtree: true });
        return () => { io.disconnect(); mo.disconnect(); };
    }, [url]);
}

/* ------------------------------------------------------------------ */
type MenuLink = { label: string; href: string; meta?: string };
type MenuColumn = { title: string; links: MenuLink[] };
type MenuSection = { key: string; label: string; href: string; image?: string | null; tagline?: string | null; columns: MenuColumn[]; tiles?: boolean; plain?: boolean };

/** Builds every navigation section from CMS data: categories → grouped tours, page groups → pages. */
function useMenuSections(): MenuSection[] {
    const { menu } = useShared();
    const t = useText();
    const pages = menu?.pages ?? [];
    const pageLinks = (group: string): MenuLink[] =>
        pages.filter((p) => p.footer_group === group && p.menu_title).map((p) => ({ label: p.menu_title as string, href: `/${p.slug}` }));

    const sections: MenuSection[] = (menu?.categories ?? []).map((c) => {
        const groups = new Map<string, MenuLink[]>();
        (c.tours ?? []).forEach((t) => {
            const g = t.group_name || 'Tours';
            if (!groups.has(g)) groups.set(g, []);
            groups.get(g)!.push({ label: t.title, href: `/tours/${t.slug}`, meta: `${t.duration_days}d` });
        });
        const columns: MenuColumn[] = [...groups.entries()].map(([title, links]) => ({ title, links }));
        const guides = pageLinks(c.name);
        if (guides.length) columns.push({ title: t('menu_guides', { name: c.name }), links: guides });
        return { key: c.slug, label: c.name, href: `/experiences/${c.slug}`, image: c.image, tagline: c.tagline, columns };
    });

    sections.push({ key: 'destinations', label: t('menu_destinations'), href: '/destinations', columns: [], tiles: true });

    // One volunteering page = a plain menu link; several = a dropdown of programmes.
    const volunteer = pageLinks('Volunteer');
    if (volunteer.length) {
        sections.push({ key: 'volunteer', label: t('menu_volunteer'), href: volunteer[0].href, columns: volunteer.length > 1 ? [{ title: t('menu_volunteer_col'), links: volunteer }] : [], plain: volunteer.length === 1 });
    }

    sections.push({
        key: 'about', label: t('menu_about'), href: '/about-klm-safaris',
        columns: [
            { title: t('menu_about_col'), links: [...pageLinks('About'), { label: t('menu_blog_link'), href: '/journal' }, { label: t('menu_gallery_link'), href: '/gallery' }, { label: t('menu_stays_link'), href: '/accommodation' }, { label: t('menu_contact_link'), href: '/contact' }] },
            { title: t('menu_sustain_col'), links: pageLinks('Sustainability') },
            { title: t('menu_travel_col'), links: pageLinks('Travel Info') },
        ].filter((c) => c.links.length),
    });

    return sections;
}

function Header({ solid }: { solid: boolean }) {
    const { settings, menu } = useShared();
    const t = useText();
    const [hidden, setHidden] = useState(false);
    const [open, setOpen] = useState<string | null>(null);
    const [drawer, setDrawer] = useState(false);
    const closeTimer = useRef<number>();
    const bar = useRef<HTMLElement>(null);
    const sections = useMenuSections();
    const tucked = hidden && !open && !drawer;

    // Publish how much of the screen the header covers, so other sticky bars can sit just below it.
    useEffect(() => {
        const set = () => document.documentElement.style.setProperty('--nav-h', tucked ? '0px' : `${bar.current?.offsetHeight ?? 0}px`);
        set();
        window.addEventListener('resize', set);
        return () => window.removeEventListener('resize', set);
    }, [tucked]);

    // Tuck away after a real stretch of scrolling down; come back after a deliberate scroll up.
    // Distances add up per direction, so trackpad jitter and slow scrolling never flip it back and forth.
    useEffect(() => {
        const HIDE_AFTER = 80, SHOW_AFTER = 50, TOP = 160;
        let last = window.scrollY, down = 0, up = 0, frame = 0;
        const update = () => {
            frame = 0;
            const y = Math.max(0, window.scrollY);
            const dy = y - last;
            last = y;
            if (y < TOP) { down = up = 0; setHidden(false); return; }
            if (dy > 0) { down += dy; up = 0; if (down > HIDE_AFTER) setHidden(true); }
            else if (dy < 0) { up -= dy; down = 0; if (up > SHOW_AFTER) setHidden(false); }
        };
        const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { window.removeEventListener('scroll', onScroll); if (frame) window.cancelAnimationFrame(frame); };
    }, []);

    useEffect(() => router.on('navigate', () => { setOpen(null); setDrawer(false); }), []);
    useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; }, [drawer]);

    const light = false; // the navigation bar is always plain white
    const enter = (key: string) => { window.clearTimeout(closeTimer.current); setOpen(key); };
    const leave = () => { closeTimer.current = window.setTimeout(() => setOpen(null), 160); };
    const current = sections.find((s) => s.key === open);

    return (
        <>
            {/* Announcement + contact bar */}
                <div className="bg-gold text-[12.5px] text-white/90">
                    <div className="container-site flex min-h-[38px] items-center justify-between gap-6 py-1.5">
                        {settings.announcement_text ? (
                            <Link href={settings.announcement_link || '#'} className="group flex min-w-0 items-center gap-2.5 hover:text-white">
                                <span className="shrink-0 bg-white px-1.5 py-0.5 text-[10.5px] font-semibold uppercase leading-none tracking-[0.14em] text-gold">{t('new_label')}</span>
                                <span className="truncate">{settings.announcement_text}</span>
                                <Icon name="arrow" size={13} className="shrink-0 transition-transform group-hover:translate-x-1" />
                            </Link>
                        ) : <span />}
                        <div className="hidden shrink-0 items-center gap-6 lg:flex">
                            <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-white"><Icon name="phone" size={13} />{settings.phone}</a>
                            <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-white"><Icon name="mail" size={13} />{settings.email}</a>
                            {settings.rating_count && (
                                <a href={settings.tripadvisor || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><Icon name="star" size={13} fill="currentColor" className="text-white" />{settings.rating_score ? `${settings.rating_score} · ` : ''}{settings.rating_count}</a>
                            )}
                        </div>
                    </div>
                </div>

            {/* Plain white navigation that sits in the page flow and tucks away on scroll down */}
            <header ref={bar} className={cn('sticky top-0 z-50 transition-transform duration-300 ease-out will-change-transform', tucked ? '-translate-y-full' : 'translate-y-0')}>
                {/* Main bar */}
                <div className="relative border-b border-ink/10 bg-white" onMouseLeave={leave}>
                    <div className="container-site flex h-[78px] items-center justify-between gap-6">
                        <Logo light={light} />

                        <nav className="hidden items-center xl:flex">
                            {sections.map((s) => (
                                <NavItem key={s.key} label={s.label} href={s.href} light={light} active={open === s.key} plain={s.plain} onEnter={() => (s.plain ? setOpen(null) : enter(s.key))} />
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/tours" aria-label="Search tours" className={cn('hidden h-11 w-11 items-center justify-center border transition sm:flex xl:hidden 2xl:flex', light ? 'border-white/30 text-white hover:bg-white hover:text-ink' : 'border-ink/15 text-ink hover:bg-ink hover:text-white')}>
                                <Icon name="search" size={17} />
                            </Link>
                            <Link href="/plan-your-trip" className="btn btn-brand hidden !h-11 !px-6 sm:inline-flex">{t('nav_plan')}</Link>
                            <button onClick={() => setDrawer(true)} className={cn('flex h-11 w-11 items-center justify-center xl:hidden', light ? 'text-white' : 'text-ink')} aria-label="Open menu">
                                <Icon name="menu" size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Mega menus */}
                    <div
                        className={cn('absolute inset-x-0 top-full max-h-[calc(100vh-130px)] origin-top overflow-y-auto border-y border-ink/10 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.25)] transition-all duration-300', open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0')}
                        onMouseEnter={() => window.clearTimeout(closeTimer.current)}
                    >
                        <div className="container-site py-10">
                            {current?.tiles && (
                                <div className="grid grid-cols-4 gap-5">
                                    {(menu?.destinations ?? []).slice(0, 8).map((d) => (
                                        <Link key={d.id} href={`/destinations/${d.slug}`} className="img-zoom group relative block h-40 overflow-hidden">
                                            <img src={img(d.image, 500)} alt="" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                                            <div className="absolute bottom-0 p-4 text-white">
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{d.region}</p>
                                                <p className="text-[17px] font-semibold leading-tight">{d.name}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {current && !current.tiles && (
                                <div className="grid grid-cols-12 gap-10">
                                    {current.image ? (
                                        <Link href={current.href} className="img-zoom group relative col-span-3 block h-80 overflow-hidden">
                                            <img src={img(current.image, 700)} alt="" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
                                            <div className="absolute bottom-0 p-6 text-white">
                                                <p className="text-[11px] uppercase tracking-eyebrow text-gold-light">{current.tagline}</p>
                                                <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{t('menu_all', { name: current.label })}</p>
                                                <span className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em]">{t('menu_explore')} <Icon name="arrow" size={14} /></span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="col-span-3">
                                            <p className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink">{t('menu_home_title')}</p>
                                            <p className="mt-4 text-[15px] text-ink/60">{settings.footer_about}</p>
                                        </div>
                                    )}
                                    <div className="col-span-9 columns-3 gap-10">
                                        {current.columns.map((col) => (
                                            <div key={col.title} className="mb-7 break-inside-avoid">
                                                <p className="eyebrow !text-[11px] !text-ink">{col.title}</p>
                                                <ul className="mt-3">
                                                    {col.links.map((l) => (
                                                        <li key={l.href}>
                                                            <Link href={l.href} className="group flex items-start justify-between gap-3 py-1.5 text-[14.5px] leading-snug text-ink/75 hover:text-ink">
                                                                <span className="link-underline">{l.label}</span>
                                                                {l.meta && <span className="shrink-0 pt-0.5 text-[11px] uppercase tracking-wider text-ink/35 group-hover:text-gold-dark">{l.meta}</span>}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            <div className={cn('fixed inset-0 z-[60] xl:hidden', drawer ? 'visible' : 'invisible')}>
                <div onClick={() => setDrawer(false)} className={cn('absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-500', drawer ? 'opacity-100' : 'opacity-0')} />
                <aside className={cn('absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ink text-white transition-transform duration-700 ease-lux', drawer ? 'translate-x-0' : 'translate-x-full')}>
                    <div className="flex h-[84px] items-center justify-between px-6">
                        <Logo light />
                        <button onClick={() => setDrawer(false)} className="flex h-11 w-11 items-center justify-center border border-white/20" aria-label="Close menu"><Icon name="close" /></button>
                    </div>
                    <nav className="flex-1 overflow-y-auto px-6 pb-8">
                        {sections.map((s) => (
                            s.plain ? <Link key={s.key} href={s.href} className="block border-b border-white/10 py-4 font-display text-[1.4rem] font-semibold">{s.label}</Link> : (
                                <MobileGroup key={s.key} label={s.label} href={s.href}
                                    links={s.tiles ? (menu?.destinations ?? []).map((d) => ({ label: d.name, href: `/destinations/${d.slug}` })) : s.columns.flatMap((c) => c.links)} />
                            )
                        ))}
                        <Link href="/journal" className="block border-b border-white/10 py-4 font-display text-[1.4rem] font-semibold">{t('menu_blog')}</Link>
                        <Link href="/gallery" className="block border-b border-white/10 py-4 font-display text-[1.4rem] font-semibold">{t('menu_gallery')}</Link>
                        <Link href="/accommodation" className="block border-b border-white/10 py-4 font-display text-[1.4rem] font-semibold">{t('menu_stays')}</Link>
                        <Link href="/contact" className="block border-b border-white/10 py-4 font-display text-[1.4rem] font-semibold">{t('menu_contact')}</Link>
                        <Link href="/plan-your-trip" className="btn btn-brand mt-8 w-full">{t('nav_plan')}</Link>
                        <div className="mt-8 space-y-3 text-sm text-white/70">
                            <a href={`tel:${settings.phone}`} className="flex items-center gap-3"><Icon name="phone" size={16} />{settings.phone}</a>
                            <a href={`mailto:${settings.email}`} className="flex items-center gap-3"><Icon name="mail" size={16} />{settings.email}</a>
                        </div>
                    </nav>
                </aside>
            </div>
        </>
    );
}

function NavItem({ label, href, light, active, plain, onEnter }: { label: string; href: string; light: boolean; active: boolean; plain?: boolean; onEnter: () => void }) {
    return (
        <Link href={href} onMouseEnter={onEnter} className={cn('group relative flex items-center gap-1 whitespace-nowrap px-3 py-8 text-[14.5px] font-medium transition-colors 2xl:px-4', light ? 'text-white/90 hover:text-white' : 'text-ink/80 hover:text-ink')}>
            {label}
            {!plain && <Icon name="chevronDown" size={13} className={cn('transition-transform duration-300', active && 'rotate-180')} />}
            <span className={cn('absolute inset-x-3 bottom-[22px] h-px origin-left bg-current transition-transform duration-300', active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} />
        </Link>
    );
}

function MobileGroup({ label, href, links }: { label: string; href: string; links: { label: string; href: string }[] }) {
    const [open, setOpen] = useState(false);
    const t = useText();
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left font-display text-[1.4rem] font-semibold">
                {label}
                <Icon name="plus" size={20} className={cn('text-gold-light transition-transform duration-500', open && 'rotate-45')} />
            </button>
            <div className={cn('grid transition-all duration-500 ease-lux', open ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden">
                    <Link href={href} className="block py-2 text-sm font-semibold text-gold-light">{t('menu_view_all', { name: label })}</Link>
                    {links.map((l) => <Link key={l.href} href={l.href} className="block py-2 text-[15px] text-white/70">{l.label}</Link>)}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
function Newsletter() {
    const { settings } = useShared();
    const t = useText();
    const { data, setData, post, processing, errors, reset } = useForm({ email: '' });
    const submit = (e: FormEvent) => { e.preventDefault(); post('/subscribe', { preserveScroll: true, onSuccess: () => reset() }); };

    return (
        <section className="border-t border-ink/10 bg-sand-100">
            <div className="container-site grid gap-10 py-20 lg:grid-cols-12 lg:items-end">
                <div data-reveal className="lg:col-span-6">
                    <p className="eyebrow">{t('newsletter_label')}</p>
                    <h2 className="h-section mt-4 !text-[clamp(1.9rem,3vw,2.8rem)]">{settings.newsletter_title}</h2>
                    <p className="mt-4 max-w-lg text-ink/60">{settings.newsletter_text}</p>
                </div>
                <form onSubmit={submit} data-reveal className="lg:col-span-5 lg:col-start-8">
                    <div className="flex items-end gap-4 border-b border-ink pb-2">
                        <label className="flex-1">
                            <span className="sr-only">{t('newsletter_placeholder')}</span>
                            <input type="email" required value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder={t('newsletter_placeholder')} className="w-full bg-transparent py-2 text-lg outline-none placeholder:text-ink/40" />
                        </label>
                        <button disabled={processing} className="flex shrink-0 items-center gap-2 py-2 text-[14px] font-semibold hover:text-gold-dark">{t('newsletter_button')} <Icon name="arrow" size={16} /></button>
                    </div>
                    {errors.email && <p className="mt-2 text-sm text-clay">{errors.email}</p>}
                    <p className="mt-3 text-[12.5px] text-ink/45">{t('newsletter_note')}</p>
                </form>
            </div>
        </section>
    );
}

function Footer() {
    const { settings, menu } = useShared();
    const t = useText();
    const legal = (menu?.pages ?? []).filter((p) => p.footer_group === 'Legal');
    const socials = (['facebook', 'instagram', 'x', 'linkedin', 'pinterest', 'youtube', 'tiktok', 'tripadvisor'] as const).filter((s) => settings[s]);
    const col = (links: { label: string; url: string }[] | undefined) => (links ?? []).map((l) => ({ label: l.label, href: l.url }));
    const experiences = (menu?.categories ?? []).map((c) => ({ label: c.name, href: `/experiences/${c.slug}` }));

    return (
        <footer className="bg-ink pb-16 text-white/65 lg:pb-0">
            <div className="container-site pb-10 pt-20">
                <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <Logo light />
                        <p className="mt-6 max-w-sm text-[15px] leading-relaxed">{settings.footer_about}</p>
                        <div className="mt-8 flex flex-wrap gap-2">
                            {socials.map((s) => (
                                <a key={s} href={settings[s]} target="_blank" rel="noreferrer" aria-label={s === 'x' ? 'X' : s} className="block transition duration-300 hover:-translate-y-0.5 hover:opacity-90">
                                    <BrandTile brand={s} size={40} />
                                </a>
                            ))}
                            {settings.yopal && (
                                <a href={settings.yopal} target="_blank" rel="noreferrer" aria-label="Yopal" className="block transition duration-300 hover:-translate-y-0.5 hover:opacity-90">
                                    <span className="flex h-10 w-10 items-center justify-center bg-[#5CADFF]"><img src="/images/klm/yopal-mark.png" alt="" className="h-[22px] w-[22px]" /></span>
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
                        <FooterCol title={t('footer_experiences')} links={[...experiences, { label: t('footer_all_tours'), href: '/tours' }]} />
                        <FooterCol title={settings.footer_col1_title} links={col(settings.footer_col1_links)} />
                        <FooterCol title={settings.footer_col2_title} links={col(settings.footer_col2_links)} />
                        <div>
                            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white">{t('footer_contact')}</p>
                            <ul className="mt-5 space-y-3 text-[14.5px]">
                                <li className="whitespace-pre-line leading-relaxed">{settings.company_name}{'\n'}{settings.address}</li>
                                <li><a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a></li>
                                {settings.phone_2 && <li><a href={whatsappLink(settings.whatsapp, t('whatsapp_message'))} target="_blank" rel="noreferrer" className="hover:text-white">{settings.phone_2} · WhatsApp</a></li>}
                                <li><a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <FooterPartners />

                {/* Bottom row: copyright left, the website credit centred, legal links right */}
                <div className="grid gap-5 pt-8 text-[13px] lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
                    <p>© {new Date().getFullYear()} {settings.copyright}</p>
                    {settings.footer_credit_label ? (
                        <a href={settings.footer_credit_url || '#'} target="_blank" rel="noreferrer" aria-label={`${settings.footer_credit_label} ${settings.footer_credit_name}`}
                            className="group flex items-center gap-2.5 transition hover:text-white lg:justify-self-center">
                            <span>{settings.footer_credit_label}</span>
                            <span className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition group-hover:decoration-white">{settings.footer_credit_name}</span>
                        </a>
                    ) : <span className="hidden lg:block" />}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-self-end">
                        {legal.map((p) => <Link key={p.slug} href={`/${p.slug}`} className="hover:text-white">{p.menu_title || p.title}</Link>)}
                        <Link href="/admin" className="hover:text-white">{t('footer_staff')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/** Memberships & partner logos (CMS → Partners & Badges): one row that drifts sideways and can be swiped. */
function FooterPartners() {
    const { settings, menu } = useShared();
    const partners = menu?.partners ?? [];
    const track = useRef<HTMLDivElement>(null);

    // Gentle auto-scroll that loops through the doubled list; any touch, drag or hover pauses it for a moment.
    useEffect(() => {
        const el = track.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let frame = 0, pausedUntil = 0, pos = el.scrollLeft, last = performance.now();
        const pause = () => { pausedUntil = performance.now() + 2500; };
        const tick = (now: number) => {
            const half = el.scrollWidth / 2;
            const dt = Math.min(now - last, 50);
            last = now;
            if (half > el.clientWidth && now > pausedUntil) {
                pos += dt * 0.03; // ~30px a second, whatever the screen's refresh rate
                if (pos >= half) pos -= half;
                el.scrollLeft = pos;
            } else {
                pos = el.scrollLeft >= half ? el.scrollLeft - half : el.scrollLeft;
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        const events = ['pointerdown', 'pointerenter', 'touchstart', 'wheel'] as const;
        events.forEach((e) => el.addEventListener(e, pause, { passive: true }));
        el.addEventListener('pointermove', pause, { passive: true });
        return () => { cancelAnimationFrame(frame); events.forEach((e) => el.removeEventListener(e, pause)); el.removeEventListener('pointermove', pause); };
    }, [partners.length]);

    if (!partners.length) return null;

    const tiles = (copy: number) => partners.map((p) => {
        const tile = (
            <span className="flex h-[68px] w-[120px] items-center justify-center bg-white px-3.5 py-3 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_30px_-12px_rgba(70,139,194,.7)] sm:h-[76px] sm:w-[136px]">
                {p.logo ? <img src={p.logo} alt={copy ? '' : p.name} loading="lazy" draggable={false} className="max-h-full max-w-full object-contain" /> : <span className="text-[13px] font-semibold text-ink">{p.name}</span>}
            </span>
        );
        return (
            <li key={`${copy}-${p.id}`} title={p.subtitle ? `${p.name} — ${p.subtitle}` : p.name} aria-hidden={copy ? true : undefined} className="shrink-0">
                {p.url ? <a href={p.url} target="_blank" rel="noreferrer" tabIndex={copy ? -1 : undefined} aria-label={p.subtitle || p.name} className="group block py-2">{tile}</a> : <span className="group block py-2">{tile}</span>}
            </li>
        );
    });

    return (
        <section className="border-b border-white/10 py-14">
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-white">{settings.home_partners_title}</p>
            <div ref={track} className="no-scrollbar -mx-5 mt-6 overflow-x-auto overscroll-x-contain sm:-mx-8 lg:mx-0 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
                <ul className="flex w-max gap-3 px-5 sm:px-8 lg:px-0">
                    {tiles(0)}
                    {tiles(1)}
                </ul>
            </div>
        </section>
    );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white">{title}</p>
            <ul className="mt-5 space-y-3 text-[14.5px]">
                {links.map((l) => <li key={l.href}>{/^https?:/.test(l.href) ? <a href={l.href} target="_blank" rel="noreferrer" className="hover:text-white">{l.label}</a> : <Link href={l.href} className="hover:text-white">{l.label}</Link>}</li>)}
            </ul>
        </div>
    );
}

/** Moshi's local time ("14:05") and whether it falls inside the team's online hours ("7-21"). */
function moshiClock(hours: string | undefined) {
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Dar_es_Salaam', hour: '2-digit', minute: '2-digit' }).format(now);
    const hour = Number(time.slice(0, 2));
    const [from, to] = (hours || '7-21').split('-').map((n) => Number(n.trim()));
    return { time, online: Number.isFinite(from) && Number.isFinite(to) ? hour >= from && hour < to : true };
}

/** WhatsApp on desktop: a quiet tab in the corner with the team's live status. Phones have it in the bottom bar. */
function WhatsAppStamp() {
    const { settings } = useShared();
    const t = useText();
    const [show, setShow] = useState(false);
    const [clock, setClock] = useState(() => moshiClock(settings.whatsapp_hours));
    const enabled = !!settings.whatsapp && ![false, 0, '0', 'false'].includes(settings.whatsapp_widget);

    useEffect(() => {
        // Shown after the hero, and stepping aside at the very bottom so it never covers the footer's links.
        const onScroll = () => {
            const nearEnd = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 140;
            setShow(window.scrollY > 500 && !nearEnd);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        const tick = window.setInterval(() => setClock(moshiClock(settings.whatsapp_hours)), 30000);
        return () => { window.removeEventListener('scroll', onScroll); window.clearInterval(tick); };
    }, [settings.whatsapp_hours]);

    if (!enabled) return null;

    return (
        <a href={whatsappLink(settings.whatsapp, t('whatsapp_message'))} target="_blank" rel="noreferrer"
            className={cn('fixed bottom-6 right-6 z-40 hidden items-center gap-3.5 bg-white py-2 pl-2 pr-5 text-ink shadow-[0_18px_40px_-20px_rgba(0,0,0,.45)] ring-1 ring-ink/10 transition-all duration-500 ease-lux hover:-translate-y-0.5 hover:ring-[#25D366] lg:flex',
                show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#25D366] text-white"><BrandMark brand="whatsapp" size={21} /></span>
            <span className="leading-tight">
                <span className="block text-[14px] font-semibold">{t('wa_button')}</span>
                <span className="mt-1 flex items-center gap-1.5 text-[12px] text-ink/55">
                    <span className={cn('h-1.5 w-1.5 rounded-full', clock.online ? 'bg-[#25D366]' : 'bg-ink/30')} />
                    {t(clock.online ? 'wa_online' : 'wa_offline', { time: clock.time })}
                </span>
            </span>
        </a>
    );
}

/* ------------------------------------------------------------------ */
/** Phones: a persistent booking bar once the visitor scrolls past the hero. */
function MobileBar() {
    const { settings } = useShared();
    const t = useText();
    const [show, setShow] = useState(false);
    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 500);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className={cn('fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-ink/10 bg-white p-2.5 transition-transform duration-500 lg:hidden', show ? 'translate-y-0' : 'translate-y-full')}>
            <Link href="/plan-your-trip" className="btn btn-brand !h-12 flex-1">{t('mobile_plan')}</Link>
            {settings.whatsapp && (
                <a href={whatsappLink(settings.whatsapp, t('whatsapp_message'))} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-12 w-12 items-center justify-center bg-[#25D366] text-white">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" /></svg>
                </a>
            )}
            <a href={`tel:${settings.phone}`} aria-label="Call us" className="flex h-12 w-12 items-center justify-center border border-ink/15 text-ink"><Icon name="phone" size={18} /></a>
        </div>
    );
}

function Toast() {
    const { flash } = useShared();
    const [msg, setMsg] = useState<string | null>(null);
    useEffect(() => {
        if (flash.success || flash.error) {
            setMsg(flash.success || flash.error);
            const t = window.setTimeout(() => setMsg(null), 6000);
            return () => window.clearTimeout(t);
        }
    }, [flash]);

    return (
        <div className={cn('fixed bottom-6 left-1/2 z-[80] w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 transition-all duration-500', msg ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
            <div className="flex items-start gap-4 bg-ink p-5 text-white shadow-2xl">
                <Icon name="check" size={20} className="mt-0.5 shrink-0 text-gold-light" />
                <p className="flex-1 text-sm leading-relaxed">{msg}</p>
                <button onClick={() => setMsg(null)} aria-label="Dismiss" className="text-white/50 hover:text-white"><Icon name="close" size={18} /></button>
            </div>
        </div>
    );
}
