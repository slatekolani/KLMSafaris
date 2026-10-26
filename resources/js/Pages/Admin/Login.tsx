import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Icon from '@/Components/Icon';
import { useShared } from '@/lib/utils';

export default function Login() {
    const { settings } = useShared();
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: true });
    const submit = (e: FormEvent) => { e.preventDefault(); post('/admin/login'); };

    return (
        <div className="grid min-h-screen bg-sand-50 font-sans lg:grid-cols-2">
            <Head title="Sign in" />
            <div className="grain relative hidden overflow-hidden bg-forest-900 lg:block">
                <img src={settings.og_image} alt="" className="kenburns absolute inset-0 h-full w-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900 to-transparent" />
                <div className="absolute bottom-0 p-14 text-white">
                    <p className="eyebrow eyebrow-light">Content studio</p>
                    <p className="mt-4 max-w-md font-display text-5xl leading-tight">Every journey, page and story — <em className="text-gold-light">in one place.</em></p>
                </div>
            </div>
            <div className="flex items-center justify-center p-6">
                <form onSubmit={submit} className="w-full max-w-sm">
                    <p className="font-display text-4xl">{settings.site_name}</p>
                    <p className="mt-2 text-ink/55">Sign in to manage your website.</p>
                    <div className="mt-10 space-y-5">
                        <div>
                            <label className="field-label">Email</label>
                            <input type="email" autoFocus className="field" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            {errors.email && <p className="mt-1.5 text-sm text-clay">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="field-label">Password</label>
                            <input type="password" className="field" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-ink/60"><input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="accent-[rgb(var(--c-primary))]" /> Keep me signed in</label>
                        <button disabled={processing} className="btn btn-dark w-full">{processing ? 'Signing in…' : 'Sign in'} <Icon name="arrow" size={16} className="arrow" /></button>
                    </div>
                    <a href="/" className="mt-8 flex items-center gap-2 text-sm text-ink/50 hover:text-ink"><Icon name="arrowLeft" size={15} /> Back to website</a>
                </form>
            </div>
        </div>
    );
}
