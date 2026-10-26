import { useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { FieldRenderer, type FieldDef } from '@/Components/admin/Fields';
import AdminLayout, { Button, Card } from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';

type Group = { key: string; label: string; fields: (FieldDef & { type: string })[] };

export default function Settings({ groups, values }: { groups: Group[]; values: Record<string, any> }) {
    const [tab, setTab] = useState(0);
    const { data, setData, post, processing, isDirty } = useForm<Record<string, any>>(values);
    const submit = (e?: FormEvent) => { e?.preventDefault(); post('/admin/settings', { preserveScroll: true }); };

    // Ctrl/Cmd + S saves, as on the other CMS forms.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); submit(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });
    const group = groups[tab];

    return (
        <AdminLayout title="Site settings">
            <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[220px_1fr]">
                <nav className="flex gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain lg:flex-col">
                    {groups.map((g, i) => (
                        <button type="button" key={g.key} onClick={() => setTab(i)} className={cn('shrink-0 rounded-xl px-4 py-2.5 text-left text-sm transition', tab === i ? 'bg-forest-900 text-white' : 'text-ink/60 hover:bg-white')}>{g.label}</button>
                    ))}
                </nav>
                <div>
                    <Card className="p-6 sm:p-8">
                        <p className="font-display text-3xl">{group.label}</p>
                        {group.key === 'home' && <p className="mt-1 text-sm text-ink/50">Tip: wrap a word in *asterisks* to set it in italic gold on the site.</p>}
                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            {group.fields.map((f) => (
                                <FieldRenderer key={f.name} field={{ ...f, width: ['text', 'image', 'color', 'select'].includes(f.type) && !f.name.includes('title') && !f.name.includes('text') ? 'half' : undefined }} value={data[f.name]} onChange={(v) => setData(f.name, v)} />
                            ))}
                        </div>
                    </Card>
                    <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-ink/[0.06] backdrop-blur">
                        <span className={cn('text-xs', isDirty ? 'text-gold-dark' : 'text-ink/40')}>{isDirty ? 'Unsaved changes' : 'All changes saved'}</span>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Save settings'}</Button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
