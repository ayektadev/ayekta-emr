/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ayekta-orange': '#ef4826',
        'ayekta-border': '#bdbdbd',
        'ayekta-muted': '#666',
        'ayekta-tab': '#f3f3f3',
      },
      fontFamily: {
        'mono': ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
