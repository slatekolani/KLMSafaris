import { Link, router } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import AdminLayout, { Card } from '@/Layouts/AdminLayout';
import { cn, formatDate } from '@/lib/utils';
import type { Paginated } from '@/types';

export default function Subscribers({ subscribers }: { subscribers: Paginated<{ id: number; email: string; created_at: string }> }) {
    return (
        <AdminLayout title="Newsletter subscribers" actions={<a href="/admin/subscribers/export" className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm text-white"><Icon name="upload" size={15} className="rotate-180" /> Export CSV</a>}>
            <Card className="divide-y divide-ink/[0.05]">
                {subscribers.data.length === 0 && <p className="p-12 text-center text-sm text-ink/45">No subscribers yet.</p>}
                {subscribers.data.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                        <Icon name="mail" size={16} className="text-ink/30" />
                        <span className="flex-1">{s.email}</span>
                        <span className="text-xs text-ink/45">{formatDate(s.created_at)}</span>
                        <button onClick={() => confirm('Remove subscriber?') && router.delete(`/admin/subscribers/${s.id}`)} className="rounded-lg p-2 text-ink/40 hover:text-clay"><Icon name="trash" size={15} /></button>
                    </div>
                ))}
            </Card>
            {subscribers.last_page > 1 && <div className="mt-5 flex gap-1.5">{subscribers.links.map((l, i) => l.url ? <Link key={i} href={l.url} className={cn('rounded-lg px-3 py-1.5 text-sm', l.active ? 'bg-forest-900 text-white' : 'bg-white ring-1 ring-ink/10')} dangerouslySetInnerHTML={{ __html: l.label }} /> : null)}</div>}
        </AdminLayout>
    );
}
