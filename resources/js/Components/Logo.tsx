import { Link } from '@inertiajs/react';
import { cn, useShared, useText } from '@/lib/utils';

/** Uses the logo uploaded in the CMS; falls back to a typographic KLM roundel. */
export default function Logo({ light = false, className }: { light?: boolean; className?: string }) {
    const { settings } = useShared();
    const t = useText();
    const [first, ...rest] = String(settings.site_name || '').split(' ');
    const src = light ? settings.logo_light || settings.logo : settings.logo;

    return (
        <Link href="/" className={cn('group flex items-center gap-3', className)} aria-label={settings.site_name}>
            {src ? (
                <img src={src} alt={settings.site_name} className="h-12 w-12 rounded-full object-contain" />
            ) : (
                <span className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gold font-display leading-none text-white ring-2 ring-white/80">
                    <span className="text-xl">{first.toLowerCase()}</span>
                    <span className="text-[9px] tracking-[0.2em]">{rest.join(' ').toLowerCase()}</span>
                </span>
            )}
            <span className="hidden leading-none sm:block">
                <span className={cn('block font-display text-[17px] font-bold uppercase tracking-[0.02em] [font-stretch:112%]', light ? 'text-white' : 'text-ink')}>{settings.site_name}</span>
                <span className={cn('mt-1 block text-[10px] font-medium uppercase tracking-[0.24em]', light ? 'text-white/60' : 'text-ink/50')}>{t('logo_tagline')}</span>
            </span>
        </Link>
    );
}
