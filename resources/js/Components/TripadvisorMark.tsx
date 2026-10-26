import { cn } from '@/lib/utils';

/** Tripadvisor's owl in its own brand colours (black on Tripadvisor green) — never tinted with the site colours. */
export const TRIPADVISOR_GREEN = '#34E0A1';

export default function TripadvisorMark({ size = 40, className }: { size?: number; className?: string }) {
    return (
        <svg viewBox="0 0 40 40" width={size} height={size} className={cn('shrink-0', className)} role="img" aria-label="Tripadvisor">
            <circle cx="20" cy="20" r="20" fill={TRIPADVISOR_GREEN} />
            <path d="M6.5 15.5C10.4 12.3 15 10.8 20 10.8s9.6 1.5 13.5 4.7" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="13.2" cy="21.6" r="6.2" fill="#fff" stroke="#000" strokeWidth="2.4" />
            <circle cx="26.8" cy="21.6" r="6.2" fill="#fff" stroke="#000" strokeWidth="2.4" />
            <circle cx="13.2" cy="21.6" r="2.5" fill="#000" />
            <circle cx="26.8" cy="21.6" r="2.5" fill="#000" />
            <path d="M17.6 26.6 20 30l2.4-3.4z" fill="#000" />
        </svg>
    );
}

/** Tripadvisor's green rating bubbles. */
export function TripadvisorBubbles({ count = 5, size = 14, className }: { count?: number; size?: number; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1', className)} aria-label={`${count} of 5 on Tripadvisor`}>
            {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="block rounded-full" style={{ width: size, height: size, border: `2px solid ${TRIPADVISOR_GREEN}`, background: i < count ? TRIPADVISOR_GREEN : 'transparent' }} />
            ))}
        </span>
    );
}
