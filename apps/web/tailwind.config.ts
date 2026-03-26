import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E88E5',
          dark: '#0B1F33',
        },
        page: '#F7F9FB',
        card: '#FFFFFF',
        muted: '#F1F5F9',
        border: '#E0E6ED',
        status: {
          success: '#2E7D32',
          warning: '#F59E0B',
          error: '#D32F2F',
          gold: '#C9A227',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
