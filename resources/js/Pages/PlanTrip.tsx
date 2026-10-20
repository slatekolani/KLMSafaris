import { useForm } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import Icon from '@/Components/Icon';
import SiteLayout from '@/Layouts/SiteLayout';
import { cn, img, initials, useShared } from '@/lib/utils';
import type { Category, Destination, TeamMember } from '@/types';

type Props = {
    categories: Category[];
    destinations: Destination[];
    tour: { id: number; title: string; slug: string; image: string; duration_days: number } | null;
    consultant: TeamMember | null;
};


export default function PlanTrip({ categories, destinations, tour, consultant }: Props) {
    const { settings } = useShared();
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const { data, setData, post, processing, errors, transform } = useForm({
        interests: [] as string[],
        destinations: [] as string[],
        travel_date: '',
        nights: tour?.duration_days ?? 10,
        adults: 2,
        children: 0,
        budget: '',
        name: '', email: '', phone: '', country: '', message: tour ? `I'm interested in "${tour.title}".` : '',
        tour_id: tour?.id ?? null,
        source: 'planner',
    });

    const toggle = (key: 'interests' | 'destinations', v: string) =>
        setData(key, data[key].includes(v) ? data[key].filter((x) => x !== v) : [...data[key], v]);

    const steps = [
        { title: 'What *inspires* you?', image: categories[0]?.image },
        { title: 'Where would you *like to go?*', image: destinations[0]?.image },
        { title: 'When & *who* is travelling?', image: settings.home_cta_image || settings.plan_image },
        { title: 'Your travel *style*', image: settings.home_advice_image || settings.plan_image },
        { title: 'Almost *there*', image: settings.plan_image },
    ];

    const submit = () => {
        transform((d) => ({ ...d, interests: [...d.interests, ...d.destinations.map((x) => `Destination: ${x}`)] }));
        post('/enquire', { preserveScroll: true, onSuccess: () => setDone(true) });
    };

    const canNext = [data.interests.length > 0, true, data.adults > 0, !!data.budget, !!data.name && !!data.email][step];
    const current = steps[step];
    const bg = step === 0 && data.interests.length ? categories.find((c) => c.name === data.interests[data.interests.length - 1])?.image : step === 1 && data.destinations.length ? destinations.find((d) => d.name === data.destinations[data.destinations.length - 1])?.image : current.image;

    return (
        <SiteLayout solidHeader title="Plan your trip">
            <section className="grid min-h-screen pt-[78px] lg:grid-cols-[42%_1fr]">
                {/* Visual side */}
                <div className="grain relative hidden overflow-hidden bg-forest-900 text-white lg:block">
                    <img key={bg} src={img(bg || tour?.image, 1400)} alt="" className="kenburns absolute inset-0 h-full w-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/30 to-forest-900/40" />
                    <div className="sticky top-[78px] flex h-[calc(100vh-78px)] flex-col justify-between p-12">
                        <div>
                            <span className="eyebrow eyebrow-light">Tailor-made trip planner</span>
                            <p className="mt-5 max-w-sm text-4xl font-semibold tracking-tight leading-tight">{settings.plan_title}</p>
                        </div>
                        <div className="glass p-6">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Your trip so far</p>
                            <dl className="mt-4 space-y-2 text-sm">
                                <Summary label="Inspired by" value={data.interests.join(', ')} />
                                <Summary label="Destinations" value={data.destinations.join(', ') || (step > 1 ? 'Open to ideas' : '')} />
                                <Summary label="When" value={step > 2 ? `${data.travel_date || 'Flexible'} · ${data.nights} nights` : ''} />
                                <Summary label="Travellers" value={step > 2 ? `${data.adults} adults${data.children ? `, ${data.children} children` : ''}` : ''} />
                                <Summary label="Style" value={data.budget} />
                            </dl>
                            {consultant && (
                                <div className="mt-5 flex items-center gap-3 border-t border-white/15 pt-5">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-none bg-gold font-display">{initials(consultant.name)}</span>
                                    <p className="text-sm text-white/75">Your plan goes straight to <span className="text-white">{consultant.name}</span>, who replies within 24h.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div className="flex flex-col px-5 py-12 sm:px-12 lg:px-16 lg:py-16">
                    {done ? (
                        <div className="m-auto max-w-lg text-center">
                            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-none bg-gold text-white"><Icon name="check" size={36} /></span>
                            <h1 className="mt-8 text-6xl font-semibold tracking-tight">Asante sana, {data.name.split(' ')[0]}!</h1>
                            <p className="mt-5 text-lg text-ink/60">Your journey brief is with our Moshi team. Expect a personal reply — with first ideas and honest advice — within 24 hours.</p>
                            <a href="/" className="btn btn-dark mt-10">Back to home</a>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <span className="font-display text-xl text-gold-dark">0{step + 1}<span className="text-ink/30"> / 05</span></span>
                                <div className="h-px flex-1 bg-ink/10"><div className="h-px bg-gold transition-all duration-700 ease-lux" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
                            </div>
                            {tour && <p className="mt-6 inline-flex items-center gap-2 self-start rounded-none bg-gold/10 px-4 py-2 text-sm text-gold-dark"><Icon name="compass" size={15} /> Customising: {tour.title}</p>}
                            <h1 key={step} className="fancy fancy-dark mask mt-8 text-5xl font-semibold tracking-tight leading-[1.05] sm:text-6xl"><span>{current.title.split(/(\*[^*]+\*)/g).map((p, i) => p.startsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : p)}</span></h1>

                            <div key={`s${step}`} className="mt-10 flex-1" style={{ animation: 'rise .9s cubic-bezier(.19,1,.22,1) both' }}>
                                {step === 0 && (
                                    <Grid>
                                        {categories.map((c) => (
                                            <PickCard key={c.id} active={data.interests.includes(c.name)} onClick={() => toggle('interests', c.name)} image={c.image} title={c.name} text={c.tagline} />
                                        ))}
                                    </Grid>
                                )}
                                {step === 1 && (
                                    <>
                                        <Grid>
                                            {destinations.map((d) => (
                                                <PickCard key={d.id} small active={data.destinations.includes(d.name)} onClick={() => toggle('destinations', d.name)} image={d.image} title={d.name} />
                                            ))}
                                        </Grid>
                                        <p className="mt-6 text-sm text-ink/50">Not sure? Skip ahead — we love making recommendations.</p>
                                    </>
                                )}
                                {step === 2 && (
                                    <div className="max-w-xl space-y-8">
                                        <div>
                                            <label className="field-label">Approximate start date</label>
                                            <input type="date" className="field" value={data.travel_date} onChange={(e) => setData('travel_date', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="field-label flex justify-between"><span>Trip length</span><span className="text-gold-dark">{data.nights} nights</span></label>
                                            <input type="range" min={1} max={30} value={data.nights} onChange={(e) => setData('nights', Number(e.target.value))} className="w-full accent-[#c39a5b]" />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Stepper label="Adults" value={data.adults} min={1} onChange={(v) => setData('adults', v)} />
                                            <Stepper label="Children" value={data.children} min={0} onChange={(v) => setData('children', v)} />
                                        </div>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {((settings.plan_budgets ?? []) as { title: string; range: string; text: string }[]).map(({ title: name, range, text }) => (
                                            <button key={name} onClick={() => setData('budget', `${name} (${range})`)} className={cn(' p-6 text-left ring-1 transition-all duration-500', data.budget.startsWith(name) ? 'bg-forest-900 text-white ring-forest-900' : 'bg-white ring-ink/10 hover:ring-gold')}>
                                                <p className="font-display text-3xl">{name}</p>
                                                <p className={cn('mt-1 text-sm font-medium', data.budget.startsWith(name) ? 'text-gold-light' : 'text-gold-dark')}>{range}</p>
                                                <p className={cn('mt-3 text-sm', data.budget.startsWith(name) ? 'text-white/65' : 'text-ink/55')}>{text}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {step === 4 && (
                                    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
                                        <Field label="Full name *" error={errors.name}><input className="field" value={data.name} onChange={(e) => setData('name', e.target.value)} /></Field>
                                        <Field label="Email *" error={errors.email}><input type="email" className="field" value={data.email} onChange={(e) => setData('email', e.target.value)} /></Field>
                                        <Field label="Phone / WhatsApp"><input className="field" value={data.phone} onChange={(e) => setData('phone', e.target.value)} /></Field>
                                        <Field label="Country"><input className="field" value={data.country} onChange={(e) => setData('country', e.target.value)} /></Field>
                                        <div className="sm:col-span-2"><Field label="Anything else? Celebrations, must-sees, dietary needs…"><textarea rows={4} className="field" value={data.message} onChange={(e) => setData('message', e.target.value)} /></Field></div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 flex items-center justify-between gap-4 border-t border-ink/10 pt-8">
                                <button onClick={() => setStep(step - 1)} disabled={step === 0} className="flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-ink/60 hover:text-ink disabled:opacity-0"><Icon name="arrowLeft" size={16} /> Back</button>
                                {step < steps.length - 1 ? (
                                    <button onClick={() => setStep(step + 1)} disabled={!canNext} className="btn btn-dark disabled:opacity-40">Continue <Icon name="arrow" size={16} className="arrow" /></button>
                                ) : (
                                    <button onClick={submit} disabled={!canNext || processing} className="btn btn-gold disabled:opacity-40">{processing ? 'Sending…' : 'Send my trip brief'} <Icon name="send" size={16} /></button>
                                )}
                            </div>
                            <p className="mt-4 text-right text-xs text-ink/40">Prefer to talk? Call {settings.phone}</p>
                        </>
                    )}
                </div>
            </section>
        </SiteLayout>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return <div className="flex justify-between gap-6"><dt className="text-white/50">{label}</dt><dd className="truncate text-right">{value || '—'}</dd></div>;
}

function Grid({ children }: { children: ReactNode }) {
    return <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">{children}</div>;
}

function PickCard({ active, onClick, image, title, text, small }: { active: boolean; onClick: () => void; image: string | null; title: string; text?: string | null; small?: boolean }) {
    return (
        <button onClick={onClick} className={cn('img-zoom group relative overflow-hidden text-left ring-2 transition-all duration-500', small ? 'h-40' : 'h-56', active ? 'ring-gold' : 'ring-transparent')}>
            <img src={img(image, 600)} alt="" className="h-full w-full object-cover" />
            <div className={cn('absolute inset-0 transition-colors duration-500', active ? 'bg-forest-900/55' : 'bg-gradient-to-t from-ink/80 to-transparent')} />
            <span className={cn('absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-none border-2 transition-all duration-500', active ? 'border-gold bg-gold text-white' : 'border-white/70 text-transparent')}><Icon name="check" size={16} /></span>
            <div className="absolute bottom-0 p-5 text-white">
                <p className={cn('font-display leading-tight', small ? 'text-xl' : 'text-2xl')}>{title}</p>
                {text && <p className="mt-1 text-xs text-white/70">{text}</p>}
            </div>
        </button>
    );
}

function Stepper({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center justify-between bg-white p-4 ring-1 ring-ink/10">
            <span className="font-display text-2xl">{label}</span>
            <div className="flex items-center gap-4">
                <button onClick={() => onChange(Math.max(min, value - 1))} className="flex h-10 w-10 items-center justify-center rounded-none ring-1 ring-ink/15 hover:bg-ink hover:text-white" aria-label={`Fewer ${label}`}><Icon name="minus" size={16} /></button>
                <span className="w-6 text-center text-lg">{value}</span>
                <button onClick={() => onChange(value + 1)} className="flex h-10 w-10 items-center justify-center rounded-none ring-1 ring-ink/15 hover:bg-ink hover:text-white" aria-label={`More ${label}`}><Icon name="plus" size={16} /></button>
            </div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return <div><label className="field-label">{label}</label>{children}{error && <p className="mt-1 text-xs text-clay">{error}</p>}</div>;
}
