import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Icon from '@/Components/Icon';
import AdminLayout, { Card } from '@/Layouts/AdminLayout';

type F = { path: string; url: string; name: string; size: number };

export default function Media({ files }: { files: F[] }) {
    const ref = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const upload = (list: FileList | null) => list?.length && router.post('/admin/media', { files: Array.from(list) }, { forceFormData: true, preserveScroll: true });

    return (
        <AdminLayout title="Media library">
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-white p-10 text-center">
                <Icon name="upload" size={30} className="text-gold" />
                <p className="font-display text-2xl">Drop images to upload</p>
                <p className="text-sm text-ink/50">or <button onClick={() => ref.current?.click()} className="text-gold-dark underline">browse your computer</button> · JPG, PNG, WEBP, SVG up to 12MB</p>
                <input ref={ref} type="file" multiple accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {files.map((f) => (
                    <Card key={f.path} className="group overflow-hidden">
                        <div className="aspect-[4/3] overflow-hidden bg-sand-100"><img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
                        <div className="flex items-center gap-1 p-2.5">
                            <p className="min-w-0 flex-1 truncate text-xs text-ink/60" title={f.name}>{f.name}<br /><span className="text-ink/35">{(f.size / 1024).toFixed(0)} KB</span></p>
                            <button onClick={() => { navigator.clipboard.writeText(f.url); setCopied(f.path); setTimeout(() => setCopied(null), 1500); }} className="rounded-lg p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink" title="Copy URL"><Icon name={copied === f.path ? 'check' : 'copy'} size={14} /></button>
                            <button onClick={() => confirm('Delete this file? Pages using it will show a broken image.') && router.delete('/admin/media', { data: { path: f.path }, preserveScroll: true })} className="rounded-lg p-1.5 text-ink/40 hover:bg-clay/10 hover:text-clay" title="Delete"><Icon name="trash" size={14} /></button>
                        </div>
                    </Card>
                ))}
            </div>
            {files.length === 0 && <p className="mt-10 text-center text-sm text-ink/45">Your uploaded images will appear here.</p>}
        </AdminLayout>
    );
}
