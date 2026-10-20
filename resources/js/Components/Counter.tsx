import { useEffect, useRef, useState } from 'react';

/** Counts up from zero the first time it scrolls into view. */
export default function Counter({ value, duration = 2200 }: { value: string; duration?: number }) {
    const target = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
    const [n, setN] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            io.disconnect();
            const start = performance.now();
            const tick = (t: number) => {
                const p = Math.min(1, (t - start) / duration);
                setN(target * (1 - Math.pow(1 - p, 4)));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, { threshold: 0.4 });
        io.observe(el);
        return () => io.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{Math.round(n).toLocaleString('en-US')}</span>;
}
