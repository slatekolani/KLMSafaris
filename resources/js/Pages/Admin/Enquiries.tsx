import { Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import Icon from '@/Components/Icon';
import AdminLayout, { Button, Card } from '@/Layouts/AdminLayout';
import { cn, formatDate, whatsappLink } from '@/lib/utils';
import type { Paginated } from '@/types';
import { STATUS_COLORS } from './Dashboard';

type Enquiry = {
    id: number; name: string; email: string; phone: string | null; country: string | null; travel_date: string | null;
    adults: number; children: number; nights: number | null; budget: string | null; interests: string[] | null; message: string | null;
    source: string; status: string; notes: string | null; created_at: string; tour: { id: number; title: string; slug: string } | null;
    status_changed_by: string | null; status_changed_at: string | null;
};

/** Each status: its dot colour and icon. The order of the statuses is the order of the progress bar. */
const STATUS_DOT: Record<string, string> = { new: 'bg-gold', contacted: 'bg-sky-500', quoted: 'bg-violet-500', confirmed: 'bg-emerald-500', booked: 'bg-acacia', closed: 'bg-ink/40' };
const STATUS_ICON: Record<string, Parameters<typeof Icon>[0]['name']> = { new: 'inbox', contacted: 'phone', quoted: 'file', confirmed: 'check', booked: 'award', closed: 'close' };
const when = (d: string) => formatDate(d, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function StatusPill({ status }: { status: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize', STATUS_COLORS[status])}>
            <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[status])} />{status}
        </span>
    );
}

export default function Enquiries({ enquiries, statuses, counts, filters }: { enquiries: Paginated<Enquiry>; statuses: string[]; counts: Record<string, number>; filters: { status?: string; q?: string } }) {
    const [openId, setOpenId] = useState<number | null>(enquiries.data[0]?.id ?? null);
    const open = enquiries.data.find((e) => e.id === openId) ?? enquiries.data[0] ?? null;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const [q, setQ] = useState(filters.q ?? '');
    const search = (ev: FormEvent) => { ev.preventDefault(); router.get('/admin/enquiries', { ...(filters.status ? { status: filters.status } : {}), ...(q ? { q } : {}) }, { preserveState: true }); };
    useEffect(() => { if (!enquiries.data.some((e) => e.id === openId)) setOpenId(enquiries.data[0]?.id ?? null); }, [enquiries.data, openId]);

    return (
        <AdminLayout title="Enquiries">
            {/* Filter by status: one tile per status with its count */}
            <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
                {['', ...statuses].map((s) => {
                    const on = (filters.status ?? '') === s;
                    return (
                        <Link key={s || 'all'} href={s ? `/admin/enquiries?status=${s}` : '/admin/enquiries'} preserveState
                            className={cn('flex min-w-[118px] shrink-0 flex-col gap-1 rounded-2xl px-4 py-3 ring-1 transition', on ? 'bg-forest-900 text-white ring-forest-900' : 'bg-white text-ink ring-ink/10 hover:ring-gold/50')}>
                            <span className={cn('flex items-center gap-2 text-[12px] font-semibold capitalize', on ? 'text-white/80' : 'text-ink/55')}>
                                {s ? <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[s])} /> : <Icon name="layers" size={13} />}{s || 'All'}
                            </span>
                            <span className="font-display text-[1.6rem] font-semibold leading-none tabular-nums">{s ? counts[s] ?? 0 : total}</span>
                        </Link>
                    );
                })}
            </div>

            <form onSubmit={search} className="mb-5 flex max-w-md items-center gap-2 rounded-full bg-white px-4 ring-1 ring-ink/10 focus-within:ring-gold">
                <Icon name="search" size={16} className="text-ink/40" />
                <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Search by name or email" className="w-full bg-transparent py-2.5 text-sm outline-none" />
            </form>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                <Card className="divide-y divide-ink/[0.05] self-start overflow-hidden">
                    {enquiries.data.length === 0 && <p className="p-12 text-center text-sm text-ink/45">No enquiries here.</p>}
                    {enquiries.data.map((e) => (
                        <button key={e.id} onClick={() => setOpenId(e.id)} className={cn('relative flex w-full items-start gap-4 p-4 text-left transition', open?.id === e.id ? 'bg-sand-100' : 'hover:bg-sand-50')}>
                            {open?.id === e.id && <span className="absolute inset-y-0 left-0 w-1 bg-gold" />}
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-900 text-sm font-semibold text-gold-light">{e.name[0]}</span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate font-semibold">{e.name}</p>
                                    <span className="shrink-0 text-xs text-ink/40">{formatDate(e.created_at, { day: 'numeric', month: 'short' })}</span>
                                </div>
                                <p className="mt-0.5 truncate text-sm text-ink/55">{e.tour?.title ?? (e.interests?.length ? e.interests.join(', ') : e.message) ?? ''}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <StatusPill status={e.status} />
                                    {e.status_changed_by && <span className="truncate text-[11px] text-ink/40">by {e.status_changed_by}</span>}
                                </div>
                            </div>
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
    const { data, setData, put, processing } = useForm({ status: e.status, notes: e.notes ?? '' });
    const [saving, setSaving] = useState<string | null>(null);
    // A status click is saved straight away, with who did it, so every admin sees the same progress.
    const setStatus = (s: string) => {
        if (s === e.status || saving) return;
        setData('status', s);
        setSaving(s);
        router.put(`/admin/enquiries/${e.id}`, { status: s }, { preserveScroll: true, preserveState: true, onFinish: () => setSaving(null), onError: () => setData('status', e.status) });
    };
    const steps = statuses.filter((s) => s !== 'closed');
    const reached = steps.indexOf(data.status);
    const rows: [string, string | number | null, Parameters<typeof Icon>[0]['name']][] = [
        ['Email', e.email, 'mail'], ['Phone', e.phone, 'phone'], ['Country', e.country, 'globe'],
        ['Travel date', e.travel_date ? formatDate(e.travel_date) : null, 'calendar'], ['Nights', e.nights, 'clock'],
        ['Travellers', `${e.adults} adults${e.children ? `, ${e.children} children` : ''}`, 'users'], ['Budget', e.budget, 'chart'], ['Source', e.source, 'link'],
    ];

    return (
        <Card className="self-start overflow-hidden xl:sticky xl:top-24">
            <div className="flex items-start justify-between gap-4 border-b border-ink/[0.06] p-6">
                <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest-900 font-display text-lg font-semibold text-gold-light">{e.name[0]}</span>
                    <div>
                        <p className="font-display text-2xl font-semibold leading-tight">{e.name}</p>
                        <p className="text-sm text-ink/50">Received {formatDate(e.created_at, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <button onClick={() => confirm('Delete this enquiry?') && router.delete(`/admin/enquiries/${e.id}`)} className="rounded-lg p-2 text-ink/40 hover:bg-clay/10 hover:text-clay" title="Delete"><Icon name="trash" size={17} /></button>
            </div>

            {/* Progress: click a step to move the enquiry there (saved at once, visible to everyone) */}
            <div className="border-b border-ink/[0.06] bg-sand-50 p-6">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Progress</p>
                    <StatusPill status={data.status} />
                </div>
                <ol className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
                    {steps.map((s, i) => {
                        const done = data.status !== 'closed' && i <= reached;
                        return (
                            <li key={s}>
                                <button type="button" onClick={() => setStatus(s)} disabled={!!saving} title={`Mark as ${s}`} className="group w-full text-left">
                                    <span className={cn('block h-1.5 rounded-full transition', done ? STATUS_DOT[data.status] : 'bg-ink/10 group-hover:bg-ink/25')} />
                                    <span className={cn('mt-2 flex items-center gap-1.5 text-[12px] font-semibold capitalize', done ? 'text-ink' : 'text-ink/40 group-hover:text-ink/70')}>
                                        <Icon name={STATUS_ICON[s] ?? 'check'} size={13} />{saving === s ? 'Saving…' : s}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-[12.5px] text-ink/55">
                        <Icon name="users" size={13} />
                        {e.status_changed_by && e.status_changed_at
                            ? <>Marked <strong className="capitalize text-ink">{e.status}</strong> by <strong className="text-ink">{e.status_changed_by}</strong> · {when(e.status_changed_at)}</>
                            : 'Not updated yet'}
                    </p>
                    {statuses.includes('closed') && (
                        <button type="button" onClick={() => setStatus('closed')} disabled={!!saving || data.status === 'closed'} className="rounded-full px-3 py-1 text-[12px] font-semibold text-ink/50 ring-1 ring-ink/10 hover:bg-white hover:text-ink disabled:opacity-40">
                            {data.status === 'closed' ? 'Closed' : 'Close enquiry'}
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {e.tour && <a href={`/tours/${e.tour.slug}`} target="_blank" rel="noreferrer" className="mb-5 flex items-center gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm font-medium text-gold-dark"><Icon name="compass" size={16} /> {e.tour.title}</a>}
                <dl className="grid grid-cols-2 gap-3 text-sm">
                    {rows.filter(([, v]) => v).map(([k, v, icon]) => (
                        <div key={k} className="flex items-start gap-2.5 rounded-xl bg-sand-50 p-3">
                            <Icon name={icon} size={15} className="mt-0.5 shrink-0 text-gold" />
                            <div className="min-w-0"><dt className="text-[11px] uppercase tracking-wider text-ink/40">{k}</dt><dd className="break-words font-medium">{v}</dd></div>
                        </div>
                    ))}
                </dl>
                {!!e.interests?.length && <div className="mt-4 flex flex-wrap gap-1.5">{e.interests.map((i) => <span key={i} className="rounded-full bg-sand-100 px-3 py-1 text-xs">{i}</span>)}</div>}
                {e.message && <p className="mt-4 whitespace-pre-line rounded-xl border border-ink/[0.06] p-4 text-[15px] leading-relaxed">{e.message}</p>}

                <div className="mt-5 flex flex-wrap gap-2">
                    <a href={`mailto:${e.email}?subject=${encodeURIComponent('Your Tanzania journey with KLM Safaris')}`} className="flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2 text-sm text-white"><Icon name="mail" size={15} /> Reply by email</a>
                    {e.phone && <a href={whatsappLink(e.phone, `Hello ${e.name.split(' ')[0]}, this is KLM Safaris regarding your enquiry.`)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm text-white"><Icon name="whatsapp" size={15} /> WhatsApp</a>}
                </div>

                <form onSubmit={(ev) => { ev.preventDefault(); put(`/admin/enquiries/${e.id}`, { preserveScroll: true }); }} className="mt-6 space-y-3 border-t border-ink/[0.06] pt-5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink/45">Internal notes</label>
                    <textarea rows={3} value={data.notes} onChange={(ev) => setData('notes', ev.target.value)} placeholder="Only the team sees this" className="w-full rounded-xl border border-ink/10 px-3.5 py-2.5 text-sm outline-none focus:border-gold" />
                    <Button type="submit" disabled={processing || data.notes === (e.notes ?? '')}>Save notes</Button>
                </form>
            </div>
        </Card>
    );
}
