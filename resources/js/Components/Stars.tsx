import Icon from '@/Components/Icon';

export default function Stars({ count = 5, size = 15, className = 'text-accent' }: { count?: number; size?: number; className?: string }) {
    return (
        <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${count} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
                <Icon key={i} name="star" size={size} fill={i < count ? 'currentColor' : undefined} strokeWidth={1.2} className={i < count ? '' : 'opacity-30'} />
            ))}
        </span>
    );
}
