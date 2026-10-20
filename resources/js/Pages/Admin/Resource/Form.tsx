import { Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { FieldRenderer, type FieldDef } from '@/Components/admin/Fields';
import Icon from '@/Components/Icon';
import AdminLayout, { Button, Card } from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';

type Meta = { key: string; label: string; singular: string };

export default function ResourceForm({ resource, tabs, record, viewUrl }: { resource: Meta; tabs: { label: string; fields: FieldDef[] }[]; record: Record<string, any>; viewUrl: string | null }) {
    const editing = !!record.id;
    const base = `/admin/r/${resource.key}`;
    const [tab, setTab] = useState(0);
    const form = useForm<Record<string, any>>(record);
    const { data, setData, processing, errors, isDirty } = form;

    const submit = (e?: FormEvent) => {
        e?.preventDefault();
        const opts = {
            preserveScroll: true,
            onError: (errs: Record<string, string>) => {
                const idx = tabs.findIndex((t) => t.fields.some((f) => errs[f.name]));
                if (idx >= 0) setTab(idx);
            },
        };
        editing ? form.put(`${base}/${record.id}`, opts) : form.post(base, opts);
    };

    // Ctrl/Cmd + S saves.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); submit(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const title = editing ? (data.title || data.name || data.question || data.label || `Edit ${resource.singular}`) : `New ${resource.singular.toLowerCase()}`;

    return (
        <AdminLayout title={title} actions={viewUrl && <a href={viewUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-ink/10 hover:bg-sand-100 md:flex"><Icon name="eye" size={15} /> Preview</a>}>
            <form onSubmit={submit} className="mx-auto max-w-5xl">
                <Link href={base} className="mb-5 inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink"><Icon name="arrowLeft" size={15} /> {resource.label}</Link>

                {tabs.length > 1 && (
                    <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-ink/[0.06]">
                        {tabs.map((t, i) => {
                            const hasErr = t.fields.some((f) => errors[f.name]);
                            return (
                                <button type="button" key={t.label} onClick={() => setTab(i)} className={cn('relative shrink-0 rounded-full px-4 py-2 text-sm transition', tab === i ? 'bg-forest-900 text-white' : 'text-ink/60 hover:text-ink')}>
                                    {t.label}{hasErr && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-clay" />}
                                </button>
                            );
                        })}
                    </div>
                )}

                <Card className="p-6 sm:p-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {tabs[tab].fields.map((f) => (
                            <FieldRenderer key={f.name} field={f} value={data[f.name]} onChange={(v) => setData(f.name, v)} error={errors[f.name]} />
                        ))}
                    </div>
                </Card>

                <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-2xl bg-white/90 p-3 shadow-[0_20px_50px_-20px_rgba(18,20,15,.35)] ring-1 ring-ink/[0.06] backdrop-blur">
                    <div className="flex items-center gap-2">
                        {editing && <Button type="button" variant="danger" onClick={() => confirm('Delete permanently?') && router.delete(`${base}/${record.id}`)}><Icon name="trash" size={15} /><span className="hidden sm:inline">Delete</span></Button>}
                        {editing && <Button type="button" variant="ghost" onClick={() => router.post(`${base}/${record.id}/duplicate`)}><Icon name="copy" size={15} /><span className="hidden sm:inline">Duplicate</span></Button>}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={cn('hidden text-xs sm:inline', isDirty ? 'text-gold-dark' : 'text-ink/40')}>{isDirty ? 'Unsaved changes' : 'All changes saved'} · ⌘S</span>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : editing ? 'Save changes' : `Create ${resource.singular.toLowerCase()}`}</Button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
