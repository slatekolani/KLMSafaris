import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '@/Components/Icon';
import AdminLayout, { Button, Card } from '@/Layouts/AdminLayout';
import { cn, formatDate, whatsappLink } from '@/lib/utils';
import type { Paginated } from '@/types';
import { STATUS_COLORS } from './Dashboard';

type Enquiry = {
    id: number; name: string; email: string; phone: string | null; country: string | null; travel_date: string | null;
    adults: number; children: number; nights: number | null; budget: string | null; interests: string[] | null; message: string | null;
    source: string; status: string; notes: string | null; created_at: string; tour: { id: number; title: string; slug: string } | null;
};

export default function Enquiries({ enquiries, statuses, counts, filters }: { enquiries: Paginated<Enquiry>; statuses: string[]; counts: Record<string, number>; filters: { status?: string; q?: string } }) {
    const [openId, setOpenId] = useState<number | null>(enquiries.data[0]?.id ?? null);
    const open = enquiries.data.find((e) => e.id === openId) ?? null;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <AdminLayout title="Enquiries">
            <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto">
                {['', ...statuses].map((s) => (
                    <Link key={s} href={s ? `/admin/enquiries?status=${s}` : '/admin/enquiries'} preserveState className={cn('flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm capitalize', (filters.status ?? '') === s ? 'bg-forest-900 text-white' : 'bg-white text-ink/60 ring-1 ring-ink/10')}>
                        {s || 'All'} <span className="text-xs opacity-60">{s ? counts[s] ?? 0 : total}</span>
                    </Link>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <Card className="divide-y divide-ink/[0.05] overflow-hidden">
                    {enquiries.data.length === 0 && <p className="p-12 text-center text-sm text-ink/45">No enquiries here.</p>}
                    {enquiries.data.map((e) => (
                        <button key={e.id} onClick={() => setOpenId(e.id)} className={cn('flex w-full items-start gap-4 p-4 text-left transition', openId === e.id ? 'bg-sand-100' : 'hover:bg-sand-50')}>
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-900 text-sm text-gold-light">{e.name[0]}</span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate font-medium">{e.name}</p>
                                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] capitalize', STATUS_COLORS[e.status])}>{e.status}</span>
                                </div>
                                <p className="truncate text-sm text-ink/55">{e.tour?.title ?? (e.interests?.length ? e.interests.join(', ') : e.message) ?? '—'}</p>
                            </div>
                            <span className="shrink-0 text-xs text-ink/40">{formatDate(e.created_at, { day: 'numeric', month: 'short' })}</span>
                        </button>
                    ))}
                </Card>
                {open ? <Detail key={open.id} e={open} statuses={statuses} /> : <Card className="p-12 text-center text-sm text-ink/45">Select an enquiry to view it.</Card>}
            </div>

            {enquiries.last_page > 1 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                    {enquiries.links.map((l, i) => l.url ? <Link key={i} href={l.url} className={cn('rounded-lg px-3 py-1.5 text-sm', l.active ? 'bg-forest-900 text-white' : 'bg-white ring-1 ring-ink/10')} dangerouslySetInnerHTML={{ __html: l.label }} /> : null)}
                </div>
            )}
        </AdminLayout>
    );
}

function Detail({ e, statuses }: { e: Enquiry; statuses: string[] }) {
    const { data, setData, put, processing, isDirty } = useForm({ status: e.status, notes: e.notes ?? '' });
    const rows: [string, string | number | null][] = [
        ['Email', e.email], ['Phone', e.phone], ['Country', e.country],
        ['Travel date', e.travel_date ? formatDate(e.travel_date) : null], ['Nights', e.nights],
        ['Travellers', `${e.adults} adults${e.children ? `, ${e.children} children` : ''}`], ['Budget', e.budget], ['Source', e.source],
    ];

    return (
        <Card className="self-start p-6 xl:sticky xl:top-24">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-display text-3xl">{e.name}</p>
                    <p className="text-sm text-ink/50">Received {formatDate(e.created_at, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => confirm('Delete this enquiry?') && router.delete(`/admin/enquiries/${e.id}`)} className="rounded-lg p-2 text-ink/40 hover:bg-clay/10 hover:text-clay"><Icon name="trash" size={17} /></button>
            </div>
            {e.tour && <a href={`/tours/${e.tour.slug}`} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold-dark"><Icon name="compass" size={16} /> {e.tour.title}</a>}
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-xs uppercase tracking-wider text-ink/40">{k}</dt><dd className="break-words">{v}</dd></div>)}
            </dl>
            {!!e.interests?.length && <div className="mt-5 flex flex-wrap gap-1.5">{e.interests.map((i) => <span key={i} className="rounded-full bg-sand-100 px-3 py-1 text-xs">{i}</span>)}</div>}
            {e.message && <p className="mt-5 whitespace-pre-line rounded-xl bg-sand-50 p-4 text-[15px] leading-relaxed">{e.message}</p>}

            <div className="mt-5 flex flex-wrap gap-2">
                <a href={`mailto:${e.email}?subject=${encodeURIComponent('Your Tanzania journey with KLM Safaris')}`} className="flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2 text-sm text-white"><Icon name="mail" size={15} /> Reply by email</a>
                {e.phone && <a href={whatsappLink(e.phone, `Hello ${e.name.split(' ')[0]}, this is KLM Safaris regarding your enquiry.`)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm text-white"><Icon name="phone" size={15} /> WhatsApp</a>}
            </div>

            <form onSubmit={(ev) => { ev.preventDefault(); put(`/admin/enquiries/${e.id}`, { preserveScroll: true }); }} className="mt-6 space-y-4 border-t border-ink/[0.06] pt-6">
                <div className="flex flex-wrap gap-1.5">
                    {statuses.map((s) => (
                        <button type="button" key={s} onClick={() => setData('status', s)} className={cn('rounded-full px-3 py-1.5 text-xs capitalize ring-1 transition', data.status === s ? 'bg-forest-900 text-white ring-forest-900' : 'ring-ink/10 hover:bg-sand-100')}>{s}</button>
                    ))}
                </div>
                <textarea rows={3} value={data.notes} onChange={(ev) => setData('notes', ev.target.value)} placeholder="Internal notes (not visible to the guest)" className="w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm outline-none focus:border-gold" />
                <Button type="submit" disabled={processing || !isDirty}>Save</Button>
            </form>
        </Card>
    );
}
