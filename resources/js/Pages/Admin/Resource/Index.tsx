import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/Components/Icon';
import AdminLayout, { Card } from '@/Layouts/AdminLayout';
import { cn, formatDate, img, money } from '@/lib/utils';
import type { Paginated } from '@/types';

type Column = { name: string; label: string; format?: 'money' | 'bool' | 'date' | 'path' };
type Meta = { key: string; label: string; singular: string; columns: Column[]; searchable: boolean; filterLabel: string | null; hasImage: boolean };
type Row = { id: number; title: string; image: string | null; cells: unknown[]; view: string | null };

export default function ResourceIndex({ resource, rows, filters, filterOptions }: { resource: Meta; rows: Paginated<Row>; filters: { q?: string; filter?: string }; filterOptions: Record<string, string> | null }) {
    const [q, setQ] = useState(filters.q ?? '');
    const first = useRef(true);
    const base = `/admin/r/${resource.key}`;

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = window.setTimeout(() => router.get(base, { ...filters, q: q || undefined }, { preserveState: true, replace: true }), 300);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const fmt = (v: unknown, c: Column) => {
        if (c.format === 'bool') return <span className={cn('inline-block h-2.5 w-2.5 rounded-full', v ? 'bg-acacia' : 'bg-ink/15')} title={v ? 'Yes' : 'No'} />;
        if (c.format === 'money') return money(v as number);
        if (c.format === 'date') return formatDate(v as string, { day: 'numeric', month: 'short', year: 'numeric' });
        if (c.format === 'path') return <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">/{String(v)}</code>;
        return (v as string) ?? '—';
    };

    return (
        <AdminLayout title={resource.label} actions={<Link href={`${base}/create`} className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-dark"><Icon name="plus" size={16} /> New {resource.singular.toLowerCase()}</Link>}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                {resource.searchable && (
                    <label className="relative flex-1">
                        <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${resource.label.toLowerCase()}…`} className="w-full rounded-full border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold" />
                    </label>
                )}
                {filterOptions && (
                    <select value={filters.filter ?? ''} onChange={(e) => router.get(base, { ...filters, filter: e.target.value || undefined }, { preserveState: true })} className="rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none">
                        <option value="">All {resource.filterLabel?.toLowerCase()}s</option>
                        {Object.entries(filterOptions).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                )}
                <p className="self-center text-sm text-ink/50 sm:ml-auto">{rows.total} total</p>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden overscroll-x-contain">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-ink/[0.06] bg-sand-50 text-xs uppercase tracking-wider text-ink/45">
                            <tr>
                                <th className="px-5 py-3 font-medium">{resource.singular}</th>
                                {resource.columns.map((c) => <th key={c.name} className="px-4 py-3 font-medium">{c.label}</th>)}
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/[0.05]">
                            {rows.data.length === 0 && (
                                <tr><td colSpan={resource.columns.length + 2} className="px-5 py-16 text-center text-ink/45">Nothing here yet. <Link href={`${base}/create`} className="text-gold-dark underline">Create the first one</Link>.</td></tr>
                            )}
                            {rows.data.map((r) => (
                                <tr key={r.id} className="group cursor-pointer hover:bg-sand-50" onClick={() => router.visit(`${base}/${r.id}/edit`)}>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {resource.hasImage && (r.image ? <img src={img(r.image, 120)} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" /> : <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-sand-100"><Icon name="image" size={16} className="text-ink/25" /></span>)}
                                            <span className="font-medium text-ink group-hover:text-gold-dark">{r.title}</span>
                                        </div>
                                    </td>
                                    {r.cells.map((v, i) => <td key={i} className="whitespace-nowrap px-4 py-3 text-ink/65">{fmt(v, resource.columns[i])}</td>)}
                                    <td className="whitespace-nowrap px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        {r.view && <a href={r.view} target="_blank" rel="noreferrer" className="inline-flex rounded-lg p-2 text-ink/40 hover:bg-ink/5 hover:text-ink" title="View on site"><Icon name="eye" size={16} /></a>}
                                        <Link href={`${base}/${r.id}/edit`} className="inline-flex rounded-lg p-2 text-ink/40 hover:bg-ink/5 hover:text-ink" title="Edit"><Icon name="pen" size={16} /></Link>
                                        <button onClick={() => confirm(`Delete “${r.title}”? This cannot be undone.`) && router.delete(`${base}/${r.id}`)} className="inline-flex rounded-lg p-2 text-ink/40 hover:bg-clay/10 hover:text-clay" title="Delete"><Icon name="trash" size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {rows.last_page > 1 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                    {rows.links.map((l, i) => l.url ? <Link key={i} href={l.url} preserveState className={cn('rounded-lg px-3 py-1.5 text-sm', l.active ? 'bg-forest-900 text-white' : 'bg-white ring-1 ring-ink/10')} dangerouslySetInnerHTML={{ __html: l.label }} /> : null)}
                </div>
            )}
        </AdminLayout>
    );
}
