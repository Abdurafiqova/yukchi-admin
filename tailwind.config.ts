import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a365d',
          deep: '#102542',
          soft: '#e8eef7',
          line: '#c9d6e6',
        },
        orange: {
          DEFAULT: '#f97316',
          deep: '#c2410c',
          soft: '#fff1e5',
          ink: '#13233a',
        },
        bg: '#f3f4f6',
        surface: '#ffffff',
        surface2: '#f8fafc',
        line: {
          DEFAULT: '#e2e6ec',
          strong: '#c7d0dc',
        },
        ink: {
          DEFAULT: '#16202e',
          2: '#45566d',
          3: '#5c6b7f',
        },
        green: {
          DEFAULT: '#157347',
          bg: '#e6f4ec',
        },
        red: {
          DEFAULT: '#b42318',
          bg: '#fdecea',
        },
        amber: {
          DEFAULT: '#8a5308',
          bg: '#fdf0d5',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Segoe UI',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 10px 30px -22px rgba(16,37,66,.45)',
      },
    },
  },
};
