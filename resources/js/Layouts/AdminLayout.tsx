import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import Icon from '@/Components/Icon';
import { cn, initials, useShared } from '@/lib/utils';

export default function AdminLayout({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
    const { admin, auth, flash, settings } = useShared();
    const { url } = usePage();
    const [mobile, setMobile] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (flash.success || flash.error) {
            setToast(flash.success || flash.error);
            const t = window.setTimeout(() => setToast(null), 4000);
            return () => window.clearTimeout(t);
        }
    }, [flash]);
    useEffect(() => router.on('navigate', () => setMobile(false)), []);

    const groups = (admin?.nav ?? []).reduce<Record<string, { key: string; label: string; icon: string }[]>>((acc, n) => {
        (acc[n.group] ??= []).push(n);
        return acc;
    }, {});
    const is = (path: string) => (path === '/admin' ? url === '/admin' : url.startsWith(path));

    const sidebar = (
        <div className="flex h-full flex-col">
            <Link href="/admin" className="flex items-center gap-3 px-6 py-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold font-display text-lg text-white">K</span>
                <span className="leading-tight">
                    <span className="block font-display text-xl text-white">{settings.site_name}</span>
                    <span className="block text-[10px] uppercase tracking-[0.25em] text-white/40">Content studio</span>
                </span>
            </Link>
            <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-6">
                <div className="space-y-0.5">
                    <NavLink href="/admin" icon="home" active={is('/admin')}>Dashboard</NavLink>
                    <NavLink href="/admin/enquiries" icon="inbox" active={is('/admin/enquiries')} badge={admin?.newEnquiries}>Enquiries</NavLink>
                </div>
                {Object.entries(groups).map(([group, items]) => (
                    <div key={group}>
                        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white/35">{group}</p>
                        <div className="space-y-0.5">
                            {items.map((n) => <NavLink key={n.key} href={`/admin/r/${n.key}`} icon={n.icon} active={is(`/admin/r/${n.key}`)}>{n.label}</NavLink>)}
                        </div>
                    </div>
                ))}
                <div>
                    <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white/35">System</p>
                    <div className="space-y-0.5">
                        <NavLink href="/admin/settings" icon="settings" active={is('/admin/settings')}>Site settings</NavLink>
                        <NavLink href="/admin/media" icon="image" active={is('/admin/media')}>Media library</NavLink>
                        <NavLink href="/admin/subscribers" icon="mail" active={is('/admin/subscribers')}>Subscribers</NavLink>
                    </div>
                </div>
            </nav>
            <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3 rounded-xl p-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm text-white">{initials(auth.user?.name ?? 'A')}</span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{auth.user?.name}</p>
                        <p className="truncate text-xs text-white/40">{auth.user?.email}</p>
                    </div>
                    <button onClick={() => router.post('/admin/logout')} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" title="Log out"><Icon name="logout" size={17} /></button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f6f4f0] font-sans text-ink">
            <Head title={`${title} · Admin`} />
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-forest-900 lg:block">{sidebar}</aside>
            <div className={cn('fixed inset-0 z-50 lg:hidden', mobile ? 'visible' : 'invisible')}>
                <div onClick={() => setMobile(false)} className={cn('absolute inset-0 bg-ink/50 transition-opacity', mobile ? 'opacity-100' : 'opacity-0')} />
                <aside className={cn('absolute inset-y-0 left-0 w-72 bg-forest-900 transition-transform duration-300', mobile ? 'translate-x-0' : '-translate-x-full')}>{sidebar}</aside>
            </div>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 border-b border-ink/[0.06] bg-[#f6f4f0]/90 backdrop-blur-xl">
                    <div className="flex h-16 items-center gap-4 px-5 sm:px-8">
                        <button onClick={() => setMobile(true)} className="rounded-lg p-2 hover:bg-ink/5 lg:hidden" aria-label="Menu"><Icon name="menu" size={20} /></button>
                        <h1 className="min-w-0 flex-1 truncate font-display text-2xl">{title}</h1>
                        <div className="flex items-center gap-2">
                            {actions}
                            <a href="/" target="_blank" className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm text-ink/60 ring-1 ring-ink/10 hover:bg-white hover:text-ink sm:flex"><Icon name="external" size={15} /> View site</a>
                        </div>
                    </div>
                </header>
                <main className="px-5 py-8 sm:px-8">{children}</main>
            </div>

            <div className={cn('fixed bottom-6 right-6 z-[60] transition-all duration-500', toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
                <div className="flex items-center gap-3 rounded-xl bg-forest-900 px-5 py-3.5 text-sm text-white shadow-2xl">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-acacia"><Icon name="check" size={14} /></span>{toast}
                </div>
            </div>
        </div>
    );
}

function NavLink({ href, icon, active, badge, children }: { href: string; icon: string; active: boolean; badge?: number; children: ReactNode }) {
    return (
        <Link href={href} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition', active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white')}>
            <Icon name={icon} size={17} className={active ? 'text-gold-light' : ''} />
            <span className="flex-1">{children}</span>
            {!!badge && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-medium text-white">{badge}</span>}
        </Link>
    );
}

/* Shared admin primitives */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('rounded-2xl bg-white ring-1 ring-ink/[0.06]', className)}>{children}</div>;
}

export function Button({ children, variant = 'primary', className, ...rest }: { variant?: 'primary' | 'ghost' | 'danger' | 'dark' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const styles = {
        primary: 'bg-gold text-white hover:bg-gold-dark',
        dark: 'bg-forest-900 text-white hover:bg-ink',
        ghost: 'bg-white text-ink ring-1 ring-ink/10 hover:bg-sand-100',
        danger: 'bg-white text-clay ring-1 ring-clay/30 hover:bg-clay hover:text-white',
    }[variant];
    return <button {...rest} className={cn('inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-50', styles, className)}>{children}</button>;
}
