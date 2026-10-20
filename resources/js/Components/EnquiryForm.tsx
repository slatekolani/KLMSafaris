import { useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Icon from '@/Components/Icon';
import { cn } from '@/lib/utils';

export default function EnquiryForm({ tourId, source = 'contact', compact = false, dark = false }: { tourId?: number; source?: string; compact?: boolean; dark?: boolean }) {
    const [sent, setSent] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', country: '', travel_date: '', adults: 2, children: 0, message: '',
        tour_id: tourId ?? null as number | null, source,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/enquire', { preserveScroll: true, onSuccess: () => { setSent(true); reset(); } });
    };

    if (sent) {
        return (
            <div className={cn(' p-8 text-center', dark ? 'bg-white/5 text-white' : 'bg-sand-100')}>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-gold text-white"><Icon name="check" size={24} /></span>
                <h3 className="mt-5 text-3xl font-semibold tracking-tight">Asante sana!</h3>
                <p className={cn('mt-2', dark ? 'text-white/70' : 'text-ink/60')}>Your enquiry is with our Moshi team. Expect a personal reply within 24 hours.</p>
                <button onClick={() => setSent(false)} className="mt-6 text-sm text-gold underline underline-offset-4">Send another enquiry</button>
            </div>
        );
    }

    const label = cn('field-label', dark && '!text-white/60');
    const field = cn('field', dark && '!border-white/10 !bg-white/5 !text-white placeholder:!text-white/30');

    return (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className={compact ? 'sm:col-span-2' : ''}>
                <label className={label}>Full name *</label>
                <input className={field} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Jane Doe" required />
                {errors.name && <p className="mt-1 text-xs text-clay">{errors.name}</p>}
            </div>
            <div className={compact ? 'sm:col-span-2' : ''}>
                <label className={label}>Email *</label>
                <input type="email" className={field} value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="you@email.com" required />
                {errors.email && <p className="mt-1 text-xs text-clay">{errors.email}</p>}
            </div>
            {!compact && (
                <>
                    <div>
                        <label className={label}>Phone / WhatsApp</label>
                        <input className={field} value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+1 555 000 000" />
                    </div>
                    <div>
                        <label className={label}>Country</label>
                        <input className={field} value={data.country} onChange={(e) => setData('country', e.target.value)} placeholder="United Kingdom" />
                    </div>
                </>
            )}
            <div className={compact ? 'sm:col-span-2' : ''}>
                <label className={label}>Preferred travel date</label>
                <input type="date" className={field} value={data.travel_date} onChange={(e) => setData('travel_date', e.target.value)} />
            </div>
            <div className={cn('grid grid-cols-2 gap-3', compact && 'sm:col-span-2')}>
                <div>
                    <label className={label}>Adults</label>
                    <input type="number" min={1} className={field} value={data.adults} onChange={(e) => setData('adults', Number(e.target.value))} />
                </div>
                <div>
                    <label className={label}>Children</label>
                    <input type="number" min={0} className={field} value={data.children} onChange={(e) => setData('children', Number(e.target.value))} />
                </div>
            </div>
            <div className="sm:col-span-2">
                <label className={label}>Tell us about your dream trip</label>
                <textarea rows={compact ? 3 : 5} className={field} value={data.message} onChange={(e) => setData('message', e.target.value)} placeholder="Interests, travel style, special occasions…" />
            </div>
            <div className="sm:col-span-2">
                <button disabled={processing} className="btn btn-gold w-full disabled:opacity-60">
                    {processing ? 'Sending…' : 'Send enquiry'} <Icon name="send" size={16} />
                </button>
                <p className={cn('mt-3 flex items-center justify-center gap-2 text-xs', dark ? 'text-white/45' : 'text-ink/45')}>
                    <Icon name="shield" size={14} /> No obligation · Reply within 24 hours · We never share your data
                </p>
            </div>
        </form>
    );
}
