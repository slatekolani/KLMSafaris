import axios from 'axios';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from '@/Components/Icon';
import { cn, img } from '@/lib/utils';

export type FieldDef = {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    help?: string;
    width?: 'half';
    options?: Record<string, string>;
    fields?: Record<string, string>;
    itemLabel?: string;
};

const input = 'w-full rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15';

export function FieldRenderer({ field, value, onChange, error }: { field: FieldDef; value: any; onChange: (v: any) => void; error?: string }) {
    const control = (() => {
        switch (field.type) {
            case 'textarea':
                return <textarea rows={4} className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
            case 'richtext':
                return <RichText value={value ?? ''} onChange={onChange} />;
            case 'number':
                return <input type="number" step="any" className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
            case 'date':
                return <input type="date" className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
            case 'toggle':
                return <Toggle checked={!!value} onChange={onChange} />;
            case 'color':
                return (
                    <div className="flex items-center gap-3">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value ?? '') ? value : '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-11 w-14 cursor-pointer rounded-xl border border-ink/10 bg-white p-1" />
                        <input className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="#468BC2" />
                    </div>
                );
            case 'select':
                return (
                    <select className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
                        {Object.entries(field.options ?? {}).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                );
            case 'relation':
                return (
                    <select className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
                        <option value="">— None —</option>
                        {Object.entries(field.options ?? {}).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                );
            case 'multirelation':
                return <MultiSelect options={field.options ?? {}} value={(value ?? []).map(Number)} onChange={onChange} />;
            case 'image':
                return <ImageInput value={value ?? ''} onChange={onChange} />;
            case 'video':
                return <VideoInput value={value ?? ''} onChange={onChange} />;
            case 'gallery':
                return <GalleryInput value={value ?? []} onChange={onChange} />;
            case 'list':
                return <ListInput value={value ?? []} onChange={onChange} />;
            case 'repeater':
                return <Repeater fields={field.fields ?? {}} value={value ?? []} onChange={onChange} itemLabel={field.itemLabel ?? 'Item'} />;
            default:
                return <input className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
        }
    })();

    return (
        <div className={cn(field.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2')}>
            <label className="mb-1.5 flex items-center gap-1 text-[13px] font-medium text-ink/70">
                {field.label}{field.required && <span className="text-clay">*</span>}
            </label>
            {control}
            {field.help && <p className="mt-1.5 text-xs text-ink/45">{field.help}</p>}
            {error && <p className="mt-1.5 text-xs text-clay">{error}</p>}
        </div>
    );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button type="button" onClick={() => onChange(!checked)} className={cn('relative inline-flex h-7 w-12 items-center rounded-full transition', checked ? 'bg-acacia' : 'bg-ink/15')} role="switch" aria-checked={checked}>
            <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
        </button>
    );
}

function MultiSelect({ options, value, onChange }: { options: Record<string, string>; value: number[]; onChange: (v: number[]) => void }) {
    return (
        <div className="flex flex-wrap gap-2 rounded-xl border border-ink/10 bg-white p-2.5">
            {Object.entries(options).map(([id, label]) => {
                const on = value.includes(Number(id));
                return (
                    <button type="button" key={id} onClick={() => onChange(on ? value.filter((v) => v !== Number(id)) : [...value, Number(id)])}
                        className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition', on ? 'bg-forest-900 text-white' : 'bg-sand-100 text-ink/70 hover:bg-sand-200')}>
                        {on && <Icon name="check" size={13} />}{label}
                    </button>
                );
            })}
        </div>
    );
}

function ListInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const [draft, setDraft] = useState('');
    const add = () => { if (draft.trim()) { onChange([...value, draft.trim()]); setDraft(''); } };
    const move = (i: number, d: number) => { const n = [...value]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
    return (
        <div className="space-y-2">
            {value.map((v, i) => (
                <div key={i} className="group flex items-center gap-2">
                    <input className={input} value={v} onChange={(e) => onChange(value.map((x, n) => (n === i ? e.target.value : x)))} />
                    <IconBtn icon="up" onClick={() => i > 0 && move(i, -1)} disabled={i === 0} />
                    <IconBtn icon="down" onClick={() => i < value.length - 1 && move(i, 1)} disabled={i === value.length - 1} />
                    <IconBtn icon="trash" onClick={() => onChange(value.filter((_, n) => n !== i))} danger />
                </div>
            ))}
            <div className="flex gap-2">
                <input className={input} value={draft} placeholder="Add an item and press Enter" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
                <button type="button" onClick={add} className="rounded-xl bg-sand-100 px-4 text-sm hover:bg-sand-200"><Icon name="plus" size={16} /></button>
            </div>
        </div>
    );
}

function Repeater({ fields, value, onChange, itemLabel }: { fields: Record<string, string>; value: Record<string, string>[]; onChange: (v: Record<string, string>[]) => void; itemLabel: string }) {
    const [open, setOpen] = useState<number | null>(value.length ? 0 : null);
    const blank = () => Object.fromEntries(Object.keys(fields).map((k) => [k, '']));
    const update = (i: number, k: string, v: string) => onChange(value.map((row, n) => (n === i ? { ...row, [k]: v } : row)));
    const move = (i: number, d: number) => { const n = [...value]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); setOpen(i + d); };

    return (
        <div className="space-y-2">
            {value.map((row, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-ink/10 bg-white">
                    <div className="flex items-center gap-2 px-4 py-3">
                        <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex flex-1 items-center gap-3 text-left">
                            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-sand-100 px-2 text-xs font-medium">{itemLabel === 'Day' ? `D${i + 1}` : i + 1}</span>
                            <span className="truncate text-[15px]">{row.title || <span className="text-ink/40">Untitled {itemLabel.toLowerCase()}</span>}</span>
                            <Icon name="chevronDown" size={16} className={cn('ml-auto shrink-0 text-ink/40 transition', open === i && 'rotate-180')} />
                        </button>
                        <IconBtn icon="up" onClick={() => i > 0 && move(i, -1)} disabled={i === 0} />
                        <IconBtn icon="down" onClick={() => i < value.length - 1 && move(i, 1)} disabled={i === value.length - 1} />
                        <IconBtn icon="copy" onClick={() => onChange([...value.slice(0, i + 1), { ...row }, ...value.slice(i + 1)])} />
                        <IconBtn icon="trash" danger onClick={() => confirm(`Remove this ${itemLabel.toLowerCase()}?`) && onChange(value.filter((_, n) => n !== i))} />
                    </div>
                    {open === i && (
                        <div className="grid gap-4 border-t border-ink/[0.06] bg-sand-50 p-4 sm:grid-cols-2">
                            {Object.entries(fields).map(([k, type]) => (
                                <div key={k} className={type === 'textarea' || type === 'image' || k === 'title' ? 'sm:col-span-2' : ''}>
                                    {type === 'toggle' ? (
                                        <label className="flex cursor-pointer items-center gap-2 pt-5 text-sm capitalize text-ink/70">
                                            <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--c-primary))]" checked={!!row[k]} onChange={(e) => update(i, k, e.target.checked ? '1' : '')} />
                                            {k.replace(/_/g, ' ')}
                                        </label>
                                    ) : (
                                        <>
                                            <label className="mb-1 block text-xs font-medium capitalize text-ink/60">{k.replace(/_/g, ' ')}</label>
                                            {type === 'textarea' ? <textarea rows={3} className={input} value={row[k] ?? ''} onChange={(e) => update(i, k, e.target.value)} />
                                                : type === 'image' ? <ImageInput value={row[k] ?? ''} onChange={(v) => update(i, k, v)} />
                                                    : <input type={type === 'number' ? 'number' : 'text'} className={input} value={row[k] ?? ''} onChange={(e) => update(i, k, e.target.value)} />}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            <button type="button" onClick={() => { onChange([...value, blank()]); setOpen(value.length); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm text-ink/60 hover:border-gold hover:text-gold-dark">
                <Icon name="plus" size={16} /> Add {itemLabel.toLowerCase()}
            </button>
        </div>
    );
}

function IconBtn({ icon, onClick, disabled, danger }: { icon: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
    return (
        <button type="button" onClick={onClick} disabled={disabled} className={cn('shrink-0 rounded-lg p-2 text-ink/40 transition disabled:opacity-25', danger ? 'hover:bg-clay/10 hover:text-clay' : 'hover:bg-ink/5 hover:text-ink')}>
            <Icon name={icon} size={15} />
        </button>
    );
}

/* ---------------------------------------------------------------- Images */
export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [picker, setPicker] = useState(false);
    return (
        <div className="flex gap-3">
            <button type="button" onClick={() => setPicker(true)} className="group relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-sand-100 ring-1 ring-ink/10">
                {value ? <img src={img(value, 300)} alt="" className="h-full w-full object-cover" /> : <Icon name="image" size={26} className="mx-auto text-ink/30" />}
                <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">Change</span>
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input className={input} value={value} placeholder="Paste an image URL or choose from library" onChange={(e) => onChange(e.target.value)} />
                <div className="flex gap-2">
                    <button type="button" onClick={() => setPicker(true)} className="flex items-center gap-1.5 rounded-lg bg-sand-100 px-3 py-1.5 text-xs hover:bg-sand-200"><Icon name="upload" size={14} /> Upload / library</button>
                    {value && <button type="button" onClick={() => onChange('')} className="rounded-lg px-3 py-1.5 text-xs text-clay hover:bg-clay/10">Remove</button>}
                </div>
            </div>
            {picker && <MediaPicker onClose={() => setPicker(false)} onPick={(urls) => { onChange(urls[0]); setPicker(false); }} />}
        </div>
    );
}

function VideoInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const ref = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const upload = async (file?: File) => {
        if (!file) return;
        setBusy(true);
        const fd = new FormData();
        fd.append('files[]', file);
        try {
            const r = await axios.post<{ urls: string[] }>('/admin/media', fd);
            onChange(r.data.urls[0]);
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Upload failed');
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="flex gap-3">
            <div className="h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-ink ring-1 ring-ink/10">
                {value ? <video src={value} muted loop autoPlay playsInline className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-white/40">No video</div>}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input className={input} value={value} placeholder="https://…/clip.mp4" onChange={(e) => onChange(e.target.value)} />
                <div className="flex gap-2">
                    <button type="button" onClick={() => ref.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-sand-100 px-3 py-1.5 text-xs hover:bg-sand-200"><Icon name="upload" size={14} /> {busy ? 'Uploading…' : 'Upload MP4'}</button>
                    {value && <button type="button" onClick={() => onChange('')} className="rounded-lg px-3 py-1.5 text-xs text-clay hover:bg-clay/10">Remove</button>}
                </div>
                <input ref={ref} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            </div>
        </div>
    );
}

function GalleryInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const [picker, setPicker] = useState(false);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    return (
        <div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {value.map((url, i) => (
                    <div key={url + i} draggable onDragStart={() => setDragIdx(i)} onDragOver={(e) => e.preventDefault()}
                        onDrop={() => { if (dragIdx === null) return; const n = [...value]; const [m] = n.splice(dragIdx, 1); n.splice(i, 0, m); onChange(n); setDragIdx(null); }}
                        className="group relative aspect-square cursor-move overflow-hidden rounded-xl ring-1 ring-ink/10">
                        <img src={img(url, 300)} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => onChange(value.filter((_, n) => n !== i))} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-clay opacity-0 shadow transition group-hover:opacity-100"><Icon name="trash" size={13} /></button>
                    </div>
                ))}
                <button type="button" onClick={() => setPicker(true)} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink/20 text-xs text-ink/50 hover:border-gold hover:text-gold-dark">
                    <Icon name="plus" size={20} /> Add images
                </button>
            </div>
            {value.length > 1 && <p className="mt-2 text-xs text-ink/45">Drag to reorder.</p>}
            {picker && <MediaPicker multiple onClose={() => setPicker(false)} onPick={(urls) => { onChange([...value, ...urls]); setPicker(false); }} />}
        </div>
    );
}

type MediaFile = { path: string; url: string; name: string };

export function MediaPicker({ onClose, onPick, multiple = false }: { onClose: () => void; onPick: (urls: string[]) => void; multiple?: boolean }) {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [url, setUrl] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const load = () => axios.get<MediaFile[]>('/admin/media').then((r) => setFiles(r.data));
    useEffect(() => { load(); }, []);

    const upload = async (list: FileList | null) => {
        if (!list?.length) return;
        setUploading(true);
        const fd = new FormData();
        Array.from(list).forEach((f) => fd.append('files[]', f));
        try {
            const r = await axios.post<{ urls: string[] }>('/admin/media', fd);
            await load();
            setSelected((s) => (multiple ? [...s, ...r.data.urls] : r.data.urls.slice(0, 1)));
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const toggle = (u: string) => setSelected((s) => (s.includes(u) ? s.filter((x) => x !== u) : multiple ? [...s, u] : [u]));

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-ink/[0.06] px-6 py-4">
                    <p className="font-display text-2xl">Media library</p>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-ink/5"><Icon name="close" size={18} /></button>
                </div>
                <div
                    className="m-5 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 p-6 text-center text-sm text-ink/55"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
                >
                    <Icon name="upload" size={24} className="text-gold" />
                    <p>Drag images here or <button type="button" onClick={() => fileRef.current?.click()} className="text-gold-dark underline">browse</button> · JPG, PNG, WEBP up to 12MB</p>
                    {uploading && <p className="text-gold-dark">Uploading…</p>}
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
                </div>
                <div className="flex gap-2 px-5">
                    <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an external image URL" />
                    <button type="button" disabled={!url} onClick={() => onPick([url])} className="shrink-0 rounded-xl bg-sand-100 px-4 text-sm disabled:opacity-40">Use URL</button>
                </div>
                <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-5 sm:grid-cols-5">
                    {files.length === 0 && <p className="col-span-full py-10 text-center text-sm text-ink/45">No uploads yet.</p>}
                    {files.map((f) => (
                        <button type="button" key={f.path} onClick={() => toggle(f.url)} onDoubleClick={() => onPick([f.url])} className={cn('relative aspect-square overflow-hidden rounded-xl ring-2 transition', selected.includes(f.url) ? 'ring-gold' : 'ring-transparent hover:ring-ink/20')}>
                            <img src={f.url} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                            {selected.includes(f.url) && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-white"><Icon name="check" size={14} /></span>}
                        </button>
                    ))}
                </div>
                <div className="flex items-center justify-between border-t border-ink/[0.06] px-6 py-4">
                    <p className="text-sm text-ink/50">{selected.length} selected</p>
                    <button type="button" disabled={!selected.length} onClick={() => onPick(selected)} className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">Insert</button>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------- Rich text */
function RichText({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const [source, setSource] = useState(false);
    const [picker, setPicker] = useState(false);

    useEffect(() => {
        if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value;
    }, [value, source]);

    const exec = (cmd: string, arg?: string) => {
        ref.current?.focus();
        document.execCommand(cmd, false, arg);
        onChange(ref.current?.innerHTML ?? '');
    };

    const tools: [string, ReactNode, () => void][] = [
        ['Heading', <span className="font-display text-base font-semibold">H2</span>, () => exec('formatBlock', 'h2')],
        ['Subheading', <span className="font-display text-sm font-semibold">H3</span>, () => exec('formatBlock', 'h3')],
        ['Paragraph', <span className="text-sm">¶</span>, () => exec('formatBlock', 'p')],
        ['Bold', <Icon name="bold" size={15} />, () => exec('bold')],
        ['Italic', <Icon name="italic" size={15} />, () => exec('italic')],
        ['Bullet list', <Icon name="list" size={15} />, () => exec('insertUnorderedList')],
        ['Quote', <Icon name="quote" size={15} />, () => exec('formatBlock', 'blockquote')],
        ['Link', <Icon name="link" size={15} />, () => { const u = prompt('Link URL'); if (u) exec('createLink', u); }],
        ['Image', <Icon name="image" size={15} />, () => setPicker(true)],
    ];

    return (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15">
            <div className="flex flex-wrap items-center gap-0.5 border-b border-ink/[0.06] bg-sand-50 p-1.5">
                {!source && tools.map(([title, iconEl, fn]) => (
                    <button key={title} type="button" title={title} onMouseDown={(e) => { e.preventDefault(); fn(); }} className="flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-ink/70 hover:bg-white hover:text-ink">{iconEl}</button>
                ))}
                <button type="button" onClick={() => setSource(!source)} className={cn('ml-auto rounded-lg px-2.5 py-1 text-xs', source ? 'bg-ink text-white' : 'text-ink/50 hover:bg-white')}>{'</>'} HTML</button>
            </div>
            {source ? (
                <textarea className="block min-h-[280px] w-full p-4 font-mono text-[13px] outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
            ) : (
                <div ref={ref} contentEditable suppressContentEditableWarning onInput={() => onChange(ref.current?.innerHTML ?? '')} className="prose-lux min-h-[280px] p-5 !text-[15px] outline-none" />
            )}
            {picker && <MediaPicker onClose={() => setPicker(false)} onPick={(urls) => { setPicker(false); exec('insertImage', urls[0]); }} />}
        </div>
    );
}
