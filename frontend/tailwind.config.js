/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govNavy: {
          950: '#060E18',
          900: '#0B192C',
          800: '#1E3E62',
          700: '#2A4E7A',
          600: '#396396',
          100: '#E3ECF6',
          50: '#F0F4F9',
        },
        govCyan: {
          500: '#0EA5E9',
          600: '#0284C7',
          50: '#F0F9FF',
        },
        govEmerald: {
          500: '#10B981',
          100: '#D1FAE5',
          50: '#ECFDF5',
          800: '#065F46',
        },
        govAmber: {
          500: '#F59E0B',
          100: '#FEF3C7',
          50: '#FFFBEB',
          800: '#92400E',
        },
        govRed: {
          500: '#EF4444',
          100: '#FEE2E2',
          50: '#FEF2F2',
          800: '#991B1B',
        },
        govSlate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
