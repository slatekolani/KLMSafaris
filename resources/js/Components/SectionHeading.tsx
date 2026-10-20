import type { ReactNode } from 'react';
import { cn, fancy } from '@/lib/utils';

/** Editorial section header: label + headline on the left, supporting copy and action on the right. */
export default function SectionHeading({ eyebrow, title, text, align = 'left', light = false, action, className, index }: {
    eyebrow?: string | null;
    title: string;
    text?: string | null;
    align?: 'left' | 'center';
    light?: boolean;
    action?: ReactNode;
    className?: string;
    index?: string;
}) {
    if (align === 'center') {
        return (
            <div className={cn('mx-auto max-w-3xl text-center', className)}>
                {eyebrow && <p data-reveal className={cn('eyebrow', light && 'eyebrow-light')}>{index && <span className="text-gold">{index}</span>}{eyebrow}</p>}
                <h2 data-reveal style={{ ['--d' as string]: '60ms' }} className={cn('h-section fancy mt-4 text-balance', light ? 'text-white' : 'text-ink')}>{fancy(title)}</h2>
                {text && <p data-reveal style={{ ['--d' as string]: '120ms' }} className={cn('mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed', light ? 'text-white/65' : 'text-ink/60')}>{text}</p>}
                {action && <div data-reveal className="mt-8">{action}</div>}
            </div>
        );
    }
    return (
        <div className={cn('grid gap-6 lg:grid-cols-12 lg:items-end', className)}>
            <div className="lg:col-span-7">
                {eyebrow && <p data-reveal className={cn('eyebrow', light && 'eyebrow-light')}>{index && <span className="mr-1 text-gold">{index}</span>}{eyebrow}</p>}
                <h2 data-reveal style={{ ['--d' as string]: '60ms' }} className={cn('h-section fancy mt-4 text-balance', light ? 'text-white' : 'text-ink')}>{fancy(title)}</h2>
            </div>
            {(text || action) && (
                <div data-reveal style={{ ['--d' as string]: '120ms' }} className="lg:col-span-4 lg:col-start-9">
                    {text && <p className={cn('text-[16.5px] leading-relaxed', light ? 'text-white/65' : 'text-ink/60')}>{text}</p>}
                    {action && <div className={text ? 'mt-6' : ''}>{action}</div>}
                </div>
            )}
        </div>
    );
}
