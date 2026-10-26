import { usePage } from '@inertiajs/react';
import { Fragment, type ReactNode } from 'react';
import type { SharedProps } from '@/types';

/** Append responsive sizing to Unsplash URLs; leave uploaded images untouched. */
export function img(url: string | null | undefined, width = 1200, quality = 72): string {
    if (!url) return '';
    if (url.includes('images.unsplash.com')) {
        const base = url.split('?')[0];
        return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
    }
    return url;
}

export function money(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return 'On request';
    return '$' + Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function cn(...parts: (string | number | false | null | undefined)[]): string {
    return parts.filter(Boolean).join(' ');
}

/** Render "*word*" segments from CMS headlines as styled <em>. */
export function fancy(text: string | null | undefined): ReactNode {
    if (!text) return null;
    return text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <Fragment key={i}>{part}</Fragment>,
    );
}

export function plain(text: string | null | undefined): string {
    return (text ?? '').replace(/\*/g, '');
}

export function formatDate(date: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', opts);
}

export function initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function useShared(): SharedProps {
    return usePage<SharedProps>().props;
}

/** Site text from CMS → Site settings → “Site text” tabs: t('nav_plan') reads ui_nav_plan; {name}-style placeholders are filled from vars. */
export function useText() {
    const { settings } = useShared();
    return (key: string, vars: Record<string, string | number> = {}) =>
        String(settings[`ui_${key}`] ?? '').replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ''));
}

/** A CMS option list (rows of title + value) as [value, label] pairs for a <select>. */
export function useOptions(key: string): [string, string][] {
    const { settings } = useShared();
    const rows: { title?: string; value?: string }[] = Array.isArray(settings[`ui_${key}`]) ? settings[`ui_${key}`] : [];
    return rows.map((r) => [r.value ?? '', r.title ?? '']);
}

export function whatsappLink(number: string, text = 'Hello KLM Safaris! I would like to plan a trip to Tanzania.'): string {
    return `https://wa.me/${(number || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

/** "Journey with *KLM Safaris*" → ["Journey with", "*KLM Safaris*"] so each line can be revealed. */
export function splitLines(title: string): string[] {
    const parts = title.split(/(\*[^*]+\*)/).map((p) => p.trim()).filter(Boolean);
    return parts.length > 1 ? parts : [title];
}
