import { useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import CountrySelect from '@/Components/CountrySelect';
import Icon from '@/Components/Icon';
import { cn, img, money, useText } from '@/lib/utils';

type TripSummary = { title: string; duration_days: number; price_from: number | null; image: string | null; group_name?: string | null };

export default function EnquiryForm({ tourId, tour, source = 'contact', compact = false, dark = false }: { tourId?: number; tour?: TripSummary; source?: string; compact?: boolean; dark?: boolean }) {
    const tx = useText();
    const [sent, setSent] = useState<string | false>(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', country: '', travel_date: '', adults: 2, children: 0, message: '',
        tour_id: tourId ?? null as number | null, source,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/enquire', { preserveScroll: true, onSuccess: () => { setSent(data.email); reset(); } });
    };

    if (sent) {
        return (
            <div className={cn(' p-8 text-center', dark ? 'bg-white/5 text-white' : 'bg-sand-100')}>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-gold text-white"><Icon name="check" size={24} /></span>
                <h3 className="font-display mt-5 text-3xl font-semibold tracking-tight">{tx('form_thanks')}</h3>
                <p className={cn('mt-2', dark ? 'text-white/70' : 'text-ink/60')}>{tx('form_thanks_text', { email: sent || '' })}</p>
                <button onClick={() => setSent(false)} className="mt-6 text-sm text-gold underline underline-offset-4">{tx('form_again')}</button>
            </div>
        );
    }

    const label = cn('field-label', dark && '!text-white/60');
    const field = cn('field', dark && '!border-white/10 !bg-white/5 !text-white placeholder:!text-white/30');

    return (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            {tour && (
                <div className={cn('flex items-center gap-4 p-3 sm:col-span-2', dark ? 'bg-white/[.07] ring-1 ring-white/10' : 'bg-sand-100 ring-1 ring-ink/5')}>
                    {tour.image && <img src={img(tour.image, 240)} alt="" className="h-16 w-20 shrink-0 object-cover" />}
                    <div className="min-w-0 flex-1">
                        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', dark ? 'text-gold-light' : 'text-gold-dark')}>{tx('form_trip')}{tour.group_name ? ` · ${tour.group_name}` : ''}</p>
                        <p className="font-display mt-0.5 truncate text-[16px] font-semibold tracking-tight">{tour.title}</p>
                        <p className={cn('text-[13px]', dark ? 'text-white/55' : 'text-ink/55')}>{tx('form_trip_meta', { days: tour.duration_days, price: money(tour.price_from) })}</p>
                    </div>
                    <span className={cn('hidden items-center gap-1.5 text-[12px] sm:flex', dark ? 'text-white/60' : 'text-ink/55')}><Icon name="check" size={14} className="text-gold" />{tx('form_added')}</span>
                </div>
            )}
            <div className={compact ? 'sm:col-span-2' : ''}>
                <label className={label}>{tx('form_name')}</label>
                <input className={field} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={tx('form_name_ph')} required />
                {errors.name && <p className="mt-1 text-xs text-clay">{errors.name}</p>}
            </div>
            <div className={compact ? 'sm:col-span-2' : ''}>
                <label className={label}>{tx('form_email')}</label>
                <input type="email" className={field} value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder={tx('form_email_ph')} required />
                {errors.email && <p className="mt-1 text-xs text-clay">{errors.email}</p>}
            </div>
            {!compact && (
                <>
                    <div>
                        <label className={label}>{tx('form_phone')}</label>
                        <input className={field} value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder={tx('form_phone_ph')} />
                    </div>
                    <div>
                        <label className={label}>{tx('form_country')}</label>
                        <CountrySelect className={cn(field, 'cursor-pointer [&_option]:text-ink')} value={data.country} onChange={(v) => setData('country', v)} />
                    </div>
                </>
            )}
            <div className={compact ? 'sm:col-span-2' : ''}>
                <label className={label}>{tx('form_date')}</label>
                <input type="date" className={field} value={data.travel_date} onChange={(e) => setData('travel_date', e.target.value)} />
            </div>
            <div className={cn('grid grid-cols-2 gap-3', compact && 'sm:col-span-2')}>
                <div>
                    <label className={label}>{tx('form_adults')}</label>
                    <input type="number" min={1} className={field} value={data.adults} onChange={(e) => setData('adults', Number(e.target.value))} />
                </div>
                <div>
                    <label className={label}>{tx('form_children')}</label>
                    <input type="number" min={0} className={field} value={data.children} onChange={(e) => setData('children', Number(e.target.value))} />
                </div>
            </div>
            <div className="sm:col-span-2">
                <label className={label}>{tx('form_message')}</label>
                <textarea rows={compact ? 3 : 5} className={field} value={data.message} onChange={(e) => setData('message', e.target.value)} placeholder={tour ? tx('form_message_ph_tour') : tx('form_message_ph')} />
            </div>
            <div className="sm:col-span-2">
                <button disabled={processing} className="btn btn-gold w-full disabled:opacity-60">
                    {processing ? tx('form_sending') : tx('form_send')} <Icon name="send" size={16} />
                </button>
                <p className={cn('mt-3 flex items-center justify-center gap-2 text-xs', dark ? 'text-white/45' : 'text-ink/45')}>
                    <Icon name="shield" size={14} /> {tx('form_note')}
                </p>
            </div>
        </form>
    );
}
