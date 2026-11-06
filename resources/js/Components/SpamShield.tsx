import { useEffect, useRef, useState } from 'react';

type TurnstileApi = {
    render: (container: HTMLElement, options: {
        sitekey: string;
        action: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
    }) => string;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window { turnstile?: TurnstileApi }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
    if (window.turnstile) return Promise.resolve();
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => window.turnstile ? resolve() : reject(new Error('Turnstile did not initialise'));
        script.onerror = () => reject(new Error('Turnstile could not load'));
        document.head.appendChild(script);
    });

    scriptPromise.catch(() => { scriptPromise = null; });

    return scriptPromise;
}

/** A Cloudflare Turnstile widget whose token is always checked by the server. */
export default function SpamShield({ enabled, siteKey, action, onToken }: {
    enabled: boolean;
    siteKey: string | null;
    action: string;
    onToken: (token: string) => void;
}) {
    const container = useRef<HTMLDivElement>(null);
    const onTokenRef = useRef(onToken);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { onTokenRef.current = onToken; }, [onToken]);

    useEffect(() => {
        onTokenRef.current('');
        if (!enabled) return;
        if (!siteKey) {
            setError('Spam protection is not configured. Please contact us another way.');
            return;
        }

        let widgetId: string | null = null;
        let cancelled = false;
        loadTurnstile().then(() => {
            if (cancelled || !container.current || !window.turnstile) return;
            widgetId = window.turnstile.render(container.current, {
                sitekey: siteKey,
                action,
                callback: (token) => { setError(null); onTokenRef.current(token); },
                'expired-callback': () => onTokenRef.current(''),
                'error-callback': () => { onTokenRef.current(''); setError('Spam protection could not load. Please refresh and try again.'); },
            });
        }).catch(() => {
            if (!cancelled) setError('Spam protection could not load. Please refresh and try again.');
        });

        return () => {
            cancelled = true;
            if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
        };
    }, [action, enabled, siteKey]);

    if (!enabled) return null;

    return (
        <div className="mt-1">
            <div ref={container} />
            {error && <p className="mt-2 text-xs text-clay" role="alert">{error}</p>}
        </div>
    );
}
