import { router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import Icon from '@/Components/Icon';
import AdminLayout, { Card } from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';

type F = { path: string; url: string; name: string; size: number; source: 'upload' | 'site' };

const TABS = [
    ['', 'All images'],
    ['upload', 'Uploaded'],
    ['site', 'Site photos'],
] as const;

export default function Media({ files }: { files: F[] }) {
    const ref = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [source, setSource] = useState<'' | 'upload' | 'site'>('');
    const [q, setQ] = useState('');
    const upload = (list: FileList | null) => list?.length && router.post('/admin/media', { files: Array.from(list) }, { forceFormData: true, preserveScroll: true });

    const shown = useMemo(() => {
        const words = q.toLowerCase().split(/\s+/).filter(Boolean);
        return files.filter((f) => (!source || f.source === source) && words.every((w) => f.name.toLowerCase().replace(/[-_]/g, ' ').includes(w)));
    }, [files, source, q]);
    const count = (s: string) => (s ? files.filter((f) => f.source === s).length : files.length);

    return (
        <AdminLayout title="Media library">
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-white p-10 text-center">
                <Icon name="upload" size={30} className="text-gold" />
                <p className="font-display text-2xl">Drop images to upload</p>
                <p className="text-sm text-ink/50">or <button onClick={() => ref.current?.click()} className="text-gold-dark underline">browse your computer</button> · JPG, PNG, WEBP, SVG up to 12MB</p>
                <input ref={ref} type="file" multiple accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10">
                    {TABS.map(([key, label]) => (
                        <button key={key} onClick={() => setSource(key)} className={cn('rounded-full px-4 py-1.5 text-sm transition', source === key ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink')}>
                            {label} <span className="opacity-60">{count(key)}</span>
                        </button>
                    ))}
                </div>
                <label className="relative min-w-[220px] flex-1">
                    <Icon name="search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name, e.g. serengeti, chemka, mawe…" className="w-full rounded-full border border-ink/10 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-ink/30" />
                </label>
            </div>
            {source !== 'upload' && (
                <p className="mt-3 text-xs text-ink/45">Site photos came with the website and the old klmsafaris.com. They can be picked anywhere in the CMS but not deleted, because tours, galleries and pages use them.</p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {shown.map((f) => (
                    <Card key={f.path} className="group overflow-hidden">
                        <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                            <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                            {f.source === 'site' && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-ink/60">Site photo</span>}
                        </div>
                        <div className="flex items-center gap-1 p-2.5">
                            <p className="min-w-0 flex-1 truncate text-xs text-ink/60" title={f.name}>{f.name}<br /><span className="text-ink/35">{(f.size / 1024).toFixed(0)} KB</span></p>
                            <button onClick={() => { navigator.clipboard.writeText(f.url); setCopied(f.path); setTimeout(() => setCopied(null), 1500); }} className="rounded-lg p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink" title="Copy URL">
                                <Icon name={copied === f.path ? 'check' : 'copy'} size={14} />
                            </button>
                            {f.source === 'upload' && (
                                <button onClick={() => confirm('Delete this file? Pages using it will show a broken image.') && router.delete('/admin/media', { data: { path: f.path }, preserveScroll: true })} className="rounded-lg p-1.5 text-ink/40 hover:bg-clay/10 hover:text-clay" title="Delete">
                                    <Icon name="trash" size={14} />
                                </button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
            {shown.length === 0 && <p className="mt-10 text-center text-sm text-ink/45">{files.length ? 'No images match.' : 'Your uploaded images will appear here.'}</p>}
        </AdminLayout>
    );
}
