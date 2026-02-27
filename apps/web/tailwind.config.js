/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Monochrome dark glass palette
                surface: {
                    900: '#0a0a0f',
                    800: '#12121a',
                    700: '#1a1a25',
                    600: '#222230',
                    500: '#2a2a3a',
                },
                accent: {
                    primary: '#00e5a0',    // Mint green — energy, vitality
                    secondary: '#00b8d4',  // Cyan — intelligence, tech
                    warm: '#ff9f43',       // Amber — motivation, warmth
                    danger: '#ff6b6b',     // Coral — warnings
                    muted: '#636e88',      // Slate — secondary text
                },
                glass: {
                    light: 'rgba(255, 255, 255, 0.06)',
                    medium: 'rgba(255, 255, 255, 0.10)',
                    heavy: 'rgba(255, 255, 255, 0.15)',
                    border: 'rgba(255, 255, 255, 0.08)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            fontSize: {
                'display': ['3rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
                'heading': ['1.5rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
                'body': ['0.9375rem', { lineHeight: '1.6' }],
                'caption': ['0.8125rem', { lineHeight: '1.4' }],
                'micro': ['0.6875rem', { lineHeight: '1.3' }],
            },
            borderRadius: {
                'glass': '16px',
                'card': '12px',
                'pill': '999px',
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
                'glow-mint': '0 0 20px rgba(0, 229, 160, 0.15)',
                'glow-cyan': '0 0 20px rgba(0, 184, 212, 0.15)',
                'glow-warm': '0 0 20px rgba(255, 159, 67, 0.15)',
                'inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            },
            backdropBlur: {
                'glass': '20px',
            },
            animation: {
                'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.3s ease-out',
                'slide-in-right': 'slide-in-right 0.3s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                'pulse-soft': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(10px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(10px)', opacity: 0 },
                    '100%': { transform: 'translateX(0)', opacity: 1 },
                },
                'fade-in': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'glow': {
                    '0%': { boxShadow: '0 0 10px rgba(0, 229, 160, 0.1)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 229, 160, 0.25)' },
                },
            },
        },
    },
    plugins: [],
};
