import { Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import AdminLayout, { Card } from '@/Layouts/AdminLayout';
import { cn, formatDate, img, useShared } from '@/lib/utils';

type Enq = { id: number; name: string; email: string; status: string; source: string; created_at: string; tour: { title: string } | null };
type Props = {
    counts: Record<string, number>;
    months: { label: string; count: number }[];
    recent: Enq[];
    topTours: { id: number; title: string; image: string; enquiries_count: number }[];
};

export const STATUS_COLORS: Record<string, string> = {
    new: 'bg-gold/15 text-gold-dark',
    contacted: 'bg-sky-100 text-sky-700',
    quoted: 'bg-violet-100 text-violet-700',
    booked: 'bg-acacia/15 text-acacia',
    closed: 'bg-ink/10 text-ink/50',
};

export default function Dashboard({ counts, months, recent, topTours }: Props) {
    const { auth, settings } = useShared();
    const max = Math.max(1, ...months.map((m) => m.count));
    const hour = new Date().getHours();
    const tiles = [
        ['New enquiries', counts.newEnquiries, 'inbox', '/admin/enquiries?status=new'],
        ['Tours & packages', counts.tours, 'compass', '/admin/r/tours'],
        ['Destinations', counts.destinations, 'map', '/admin/r/destinations'],
        ['Journal articles', counts.posts, 'pen', '/admin/r/posts'],
        ['Subscribers', counts.subscribers, 'mail', '/admin/subscribers'],
    ] as const;

    return (
        <AdminLayout title="Dashboard">
            <div className="grain relative overflow-hidden rounded-2xl bg-forest-900 p-8 text-white">
                <img src={settings.home_cta_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
                <div className="relative">
                    <p className="text-sm text-white/60">{hour < 12 ? 'Habari za asubuhi' : hour < 17 ? 'Habari za mchana' : 'Habari za jioni'},</p>
                    <p className="mt-1 font-display text-4xl">{auth.user?.name}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        <Link href="/admin/r/tours/create" className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm"><Icon name="plus" size={15} /> New tour</Link>
                        <Link href="/admin/r/posts/create" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"><Icon name="pen" size={15} /> Write article</Link>
                        <Link href="/admin/settings" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"><Icon name="settings" size={15} /> Edit homepage text</Link>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                {tiles.map(([label, n, icon, href]) => (
                    <Link key={label} href={href}>
                        <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-gold-dark"><Icon name={icon} size={18} /></span>
                            <p className="mt-4 font-display text-4xl leading-none">{n}</p>
                            <p className="mt-1 text-sm text-ink/55">{label}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <Card className="p-6 xl:col-span-2">
                    <div className="flex items-center justify-between">
                        <p className="font-display text-2xl">Latest enquiries</p>
                        <Link href="/admin/enquiries" className="text-sm text-gold-dark hover:underline">View all</Link>
                    </div>
                    <div className="mt-4 divide-y divide-ink/[0.06]">
                        {recent.length === 0 && <p className="py-10 text-center text-sm text-ink/45">No enquiries yet — they will appear here the moment a guest gets in touch.</p>}
                        {recent.map((e) => (
                            <Link key={e.id} href={`/admin/enquiries?q=${encodeURIComponent(e.email)}`} className="flex items-center gap-4 py-3.5 hover:bg-sand-50">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-900 text-sm text-gold-light">{e.name[0]}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{e.name}</p>
                                    <p className="truncate text-sm text-ink/50">{e.tour?.title ?? `via ${e.source}`}</p>
                                </div>
                                <span className={cn('rounded-full px-2.5 py-1 text-xs capitalize', STATUS_COLORS[e.status])}>{e.status}</span>
                                <span className="hidden w-28 text-right text-xs text-ink/45 sm:block">{formatDate(e.created_at, { day: 'numeric', month: 'short' })}</span>
                            </Link>
                        ))}
                    </div>
                </Card>
                <div className="space-y-6">
                    <Card className="p-6">
                        <p className="font-display text-2xl">Enquiries, last 6 months</p>
                        <div className="mt-6 flex h-40 items-end gap-3">
                            {months.map((m) => (
                                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                                    <span className="text-xs text-ink/50">{m.count}</span>
                                    <div className="w-full rounded-t-lg bg-gold/80" style={{ height: `${Math.max(4, (m.count / max) * 120)}px` }} />
                                    <span className="text-xs text-ink/50">{m.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card className="p-6">
                        <p className="font-display text-2xl">Most enquired tours</p>
                        <div className="mt-4 space-y-3">
                            {topTours.map((t) => (
                                <Link key={t.id} href={`/admin/r/tours/${t.id}/edit`} className="flex items-center gap-3">
                                    <img src={img(t.image, 120)} alt="" className="h-10 w-14 rounded-lg object-cover" />
                                    <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                                    <span className="text-sm text-ink/50">{t.enquiries_count}</span>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
