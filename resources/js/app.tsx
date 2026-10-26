import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });

createInertiaApp({
    // Public pages get a full title from the server (App\Support\Seo); admin screens add the site name here.
    title: (title) => (!title ? 'KLM Safaris' : title.includes('KLM Safaris') ? title : `${title} - KLM Safaris`),
    resolve: (name) => {
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) throw new Error(`Page not found: ${name}`);
        return page as never;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    // Loading bar uses the CMS brand colour.
    progress: { color: typeof document !== 'undefined' ? `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--c-primary').trim() || '70 139 194'})` : '#468BC2' },
});
