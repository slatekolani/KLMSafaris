/** @type {import('tailwindcss').Config} */
// Brand colours and fonts come from CSS variables set by the CMS (Site settings → Design).
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                ink: v('--c-ink'),
                // "forest" = brand dark, "gold" = brand primary, "sand" = light surfaces.
                forest: { DEFAULT: v('--c-dark'), 900: v('--c-dark-900'), 800: v('--c-dark-800'), 700: v('--c-dark-700'), 600: v('--c-dark-600') },
                sand: { DEFAULT: v('--c-light'), 50: v('--c-light-50'), 100: v('--c-light-100'), 200: v('--c-light-200'), 300: v('--c-light-300') },
                gold: { DEFAULT: v('--c-primary'), light: v('--c-primary-light'), dark: v('--c-primary-dark') },
                accent: v('--c-accent'),
                clay: '#c0533a',
                acacia: '#4f9a52',
            },
            fontFamily: {
                display: ['var(--font-display)'],
                sans: ['var(--font-sans)'],
            },
            letterSpacing: { eyebrow: '0.24em' },
            transitionTimingFunction: { lux: 'cubic-bezier(.19,1,.22,1)' },
            maxWidth: { site: '88rem' },
        },
    },
    plugins: [],
};
