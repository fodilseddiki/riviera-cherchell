/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rc: {
          50:  '#E8F5F0',
          100: '#C3E6D8',
          200: '#8ECFB8',
          400: '#1D9E75',
          500: '#178A64',
          600: '#0F6E56',
          700: '#095040',
          800: '#05342A',
          900: '#021F18',
        },
        sand: {
          50:  '#FAF7F0',
          100: '#F2EBD9',
          200: '#E5D6B3',
          400: '#C4A96A',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
}
