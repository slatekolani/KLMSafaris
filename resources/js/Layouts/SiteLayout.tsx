import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Icon from '@/Components/Icon';
import Logo from '@/Components/Logo';
import { cn, img, plain, useShared, whatsappLink } from '@/lib/utils';

type Props = { children: ReactNode; title?: string; description?: string | null; image?: string | null; solidHeader?: boolean };

export default function SiteLayout({ children, title, description, image, solidHeader = false }: Props) {
    const { settings } = useShared();
    useRevealObserver();

    return (
        <>
            <Head title={title ? plain(title) : undefined}>
                <meta name="description" content={description || settings.meta_description} />
                <meta property="og:title" content={plain(title) || settings.site_name} />
                <meta property="og:description" content={description || settings.meta_description} />
                <meta property="og:image" content={img(image || settings.og_image, 1200)} />
            </Head>
            <Header solid={solidHeader} />
            <main>{children}</main>
            <Newsletter />
            <Footer />
            <FloatingContact />
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
type MenuSection = { key: string; label: string; href: string; image?: string | null; tagline?: string | null; columns: MenuColumn[]; tiles?: boolean };

/** Builds every navigation section from CMS data: categories → grouped tours, page groups → pages. */
function useMenuSections(): MenuSection[] {
    const { menu } = useShared();
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
        if (guides.length) columns.push({ title: `${c.name} guides`, links: guides });
        return { key: c.slug, label: c.name, href: `/experiences/${c.slug}`, image: c.image, tagline: c.tagline, columns };
    });

    sections.push({ key: 'destinations', label: 'Destinations', href: '/destinations', columns: [], tiles: true });

    const volunteer = pageLinks('Volunteer');
    if (volunteer.length) {
        const first = pages.find((p) => p.footer_group === 'Volunteer');
        sections.push({ key: 'volunteer', label: 'Volunteering', href: first ? `/${first.slug}` : '/', columns: [{ title: 'Volunteer programmes', links: volunteer }] });
    }

    sections.push({
        key: 'about', label: 'About Us', href: '/about-klm-safaris',
        columns: [
            { title: 'About us', links: [...pageLinks('About'), { label: 'Get inspired by our blog', href: '/journal' }, { label: 'Contact info', href: '/contact' }] },
            { title: 'Sustainability', links: pageLinks('Sustainability') },
            { title: 'Travel information', links: pageLinks('Travel Info') },
        ].filter((c) => c.links.length),
    });

    return sections;
}

function Header({ solid }: { solid: boolean }) {
    const { settings, menu } = useShared();
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [open, setOpen] = useState<string | null>(null);
    const [drawer, setDrawer] = useState(false);
    const closeTimer = useRef<number>();
    const sections = useMenuSections();

    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 40);
            setHidden(y > 500 && y > last + 4);
            if (y < last - 4) setHidden(false);
            last = y;
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => router.on('navigate', () => { setOpen(null); setDrawer(false); }), []);
    useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; }, [drawer]);

    const light = !(scrolled || solid || open);
    const enter = (key: string) => { window.clearTimeout(closeTimer.current); setOpen(key); };
    const leave = () => { closeTimer.current = window.setTimeout(() => setOpen(null), 160); };
    const current = sections.find((s) => s.key === open);

    return (
        <>
            <header className={cn('fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-lux', hidden && !open && !drawer ? '-translate-y-full' : 'translate-y-0')}>
                {/* Announcement + contact bar */}
                <div className={cn('overflow-hidden bg-ink text-[12.5px] text-white/75 transition-all duration-500', scrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100')}>
                    <div className="container-site flex min-h-[38px] items-center justify-between gap-6 py-1.5">
                        {settings.announcement_text ? (
                            <Link href={settings.announcement_link || '#'} className="group flex min-w-0 items-center gap-2.5 hover:text-white">
                                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-light">New</span>
                                <span className="truncate">{settings.announcement_text}</span>
                                <Icon name="arrow" size={13} className="shrink-0 transition-transform group-hover:translate-x-1" />
                            </Link>
                        ) : <span />}
                        <div className="hidden shrink-0 items-center gap-6 lg:flex">
                            <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-white"><Icon name="phone" size={13} />{settings.phone}</a>
                            <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-white"><Icon name="mail" size={13} />{settings.email}</a>
                            {settings.rating_count && (
                                <a href={settings.tripadvisor || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><Icon name="star" size={13} fill="currentColor" className="text-accent" />{settings.rating_score ? `${settings.rating_score} · ` : ''}{settings.rating_count}</a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main bar */}
                <div className={cn('relative transition-colors duration-500', light ? 'bg-transparent' : 'border-b border-ink/10 bg-white')} onMouseLeave={leave}>
                    <div className={cn('container-site flex h-[84px] items-center justify-between gap-6', light && 'border-b border-white/15')}>
                        <Logo light={light} />

                        <nav className="hidden items-center xl:flex">
                            {sections.map((s) => (
                                <NavItem key={s.key} label={s.label} href={s.href} light={light} active={open === s.key} onEnter={() => enter(s.key)} />
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/tours" aria-label="Search tours" className={cn('hidden h-11 w-11 items-center justify-center border transition sm:flex xl:hidden 2xl:flex', light ? 'border-white/30 text-white hover:bg-white hover:text-ink' : 'border-ink/15 text-ink hover:bg-ink hover:text-white')}>
                                <Icon name="search" size={17} />
                            </Link>
                            <Link href="/plan-your-trip" className={cn('btn hidden !h-11 !px-6 sm:inline-flex', light ? 'btn-light' : 'btn-dark')}>Enquire now</Link>
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
                                                <p className="mt-2 text-2xl font-semibold tracking-tight">All {current.label}</p>
                                                <span className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em]">Explore <Icon name="arrow" size={14} /></span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="col-span-3">
                                            <p className="text-3xl font-semibold leading-tight tracking-tight text-ink">Tanzania is our home.</p>
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
                            <MobileGroup key={s.key} label={s.label} href={s.href}
                                links={s.tiles ? (menu?.destinations ?? []).map((d) => ({ label: d.name, href: `/destinations/${d.slug}` })) : s.columns.flatMap((c) => c.links)} />
                        ))}
                        <Link href="/journal" className="block border-b border-white/10 py-4 text-xl font-semibold">Blog</Link>
                        <Link href="/contact" className="block border-b border-white/10 py-4 text-xl font-semibold">Contact</Link>
                        <Link href="/plan-your-trip" className="btn btn-light mt-8 w-full">Enquire now</Link>
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

function NavItem({ label, href, light, active, onEnter }: { label: string; href: string; light: boolean; active: boolean; onEnter: () => void }) {
    return (
        <Link href={href} onMouseEnter={onEnter} className={cn('group relative flex items-center gap-1 whitespace-nowrap px-3 py-8 text-[14.5px] font-medium transition-colors 2xl:px-4', light ? 'text-white/90 hover:text-white' : 'text-ink/80 hover:text-ink')}>
            {label}
            <Icon name="chevronDown" size={13} className={cn('transition-transform duration-300', active && 'rotate-180')} />
            <span className={cn('absolute inset-x-3 bottom-[22px] h-px origin-left bg-current transition-transform duration-300', active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} />
        </Link>
    );
}

function MobileGroup({ label, href, links }: { label: string; href: string; links: { label: string; href: string }[] }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left text-xl font-semibold">
                {label}
                <Icon name="plus" size={20} className={cn('text-gold-light transition-transform duration-500', open && 'rotate-45')} />
            </button>
            <div className={cn('grid transition-all duration-500 ease-lux', open ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden">
                    <Link href={href} className="block py-2 text-sm font-semibold text-gold-light">View all {label} →</Link>
                    {links.map((l) => <Link key={l.href} href={l.href} className="block py-2 text-[15px] text-white/70">{l.label}</Link>)}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
function Newsletter() {
    const { settings } = useShared();
    const { data, setData, post, processing, errors, reset } = useForm({ email: '' });
    const submit = (e: FormEvent) => { e.preventDefault(); post('/subscribe', { preserveScroll: true, onSuccess: () => reset() }); };

    return (
        <section className="border-t border-ink/10 bg-sand-100">
            <div className="container-site grid gap-10 py-20 lg:grid-cols-12 lg:items-end">
                <div data-reveal className="lg:col-span-6">
                    <p className="eyebrow">Newsletter</p>
                    <h2 className="h-section mt-4 !text-[clamp(1.9rem,3vw,2.8rem)]">{settings.newsletter_title}</h2>
                    <p className="mt-4 max-w-lg text-ink/60">{settings.newsletter_text}</p>
                </div>
                <form onSubmit={submit} data-reveal className="lg:col-span-5 lg:col-start-8">
                    <div className="flex items-end gap-4 border-b border-ink pb-2">
                        <label className="flex-1">
                            <span className="sr-only">Email address</span>
                            <input type="email" required value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="Your email address" className="w-full bg-transparent py-2 text-lg outline-none placeholder:text-ink/40" />
                        </label>
                        <button disabled={processing} className="flex shrink-0 items-center gap-2 py-2 text-[14px] font-semibold hover:text-gold-dark">Subscribe <Icon name="arrow" size={16} /></button>
                    </div>
                    {errors.email && <p className="mt-2 text-sm text-clay">{errors.email}</p>}
                    <p className="mt-3 text-[12.5px] text-ink/45">One email a month. Unsubscribe any time.</p>
                </form>
            </div>
        </section>
    );
}

function Footer() {
    const { settings, menu } = useShared();
    const legal = (menu?.pages ?? []).filter((p) => p.footer_group === 'Legal');
    const socials = (['facebook', 'instagram', 'x', 'linkedin', 'pinterest', 'youtube', 'tripadvisor'] as const).filter((s) => settings[s]);
    const col = (links: { label: string; url: string }[] | undefined) => (links ?? []).map((l) => ({ label: l.label, href: l.url }));
    const experiences = (menu?.categories ?? []).map((c) => ({ label: c.name, href: `/experiences/${c.slug}` }));

    return (
        <footer className="bg-ink text-white/65">
            <div className="container-site pb-10 pt-20">
                <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <Logo light />
                        <p className="mt-6 max-w-sm text-[15px] leading-relaxed">{settings.footer_about}</p>
                        <div className="mt-8 flex flex-wrap gap-2">
                            {socials.map((s) => (
                                <a key={s} href={settings[s]} target="_blank" rel="noreferrer" aria-label={s} className="flex h-10 w-10 items-center justify-center border border-white/15 transition hover:border-white hover:text-white">
                                    <Icon name={s === 'x' ? 'xlogo' : s} size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
                        <FooterCol title="Experiences" links={[...experiences, { label: 'All tours', href: '/tours' }]} />
                        <FooterCol title={settings.footer_col1_title} links={col(settings.footer_col1_links)} />
                        <FooterCol title={settings.footer_col2_title} links={col(settings.footer_col2_links)} />
                        <div>
                            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white">Contact</p>
                            <ul className="mt-5 space-y-3 text-[14.5px]">
                                <li className="whitespace-pre-line leading-relaxed">{settings.company_name}{'\n'}{settings.address}</li>
                                <li><a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a></li>
                                {settings.phone_2 && <li><a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="hover:text-white">{settings.phone_2} · WhatsApp</a></li>}
                                <li><a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-6 pt-8 text-[13px] sm:flex-row sm:items-center">
                    <p>© {new Date().getFullYear()} {settings.copyright}</p>
                    <div className="flex flex-wrap items-center gap-6">
                        {settings.payments_image && <img src={settings.payments_image} alt="Accepted payment methods" className="h-7 w-auto bg-white p-1" />}
                        {legal.map((p) => <Link key={p.slug} href={`/${p.slug}`} className="hover:text-white">{p.menu_title || p.title}</Link>)}
                        <Link href="/admin" className="hover:text-white">Staff login</Link>
                    </div>
                </div>
            </div>
        </footer>
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

/* ------------------------------------------------------------------ */
function FloatingContact() {
    const { settings } = useShared();
    const [show, setShow] = useState(false);
    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    if (!settings.whatsapp) return null;

    return (
        <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
            className={cn('fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,.35)] transition-all duration-500 hover:scale-105', show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 0 1 2.2 12C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 0 1 2.9 6.9c0 5.4-4.4 9.8-9.8 9.8zM20.5 3.5A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3z" /></svg>
        </a>
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
