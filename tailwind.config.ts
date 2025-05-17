import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{js,jsx,ts,tsx,css}'],
    safelist: [
        "grid-cols-[1fr_4fr]",
        "grid-cols-[2fr_4fr]",
        "grid-cols-[2fr_3fr]",
        "grid-cols-[1fr]"
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};

export default config;
