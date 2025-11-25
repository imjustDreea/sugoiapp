module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        'accent-violet': 'var(--accent-violet)',
        'accent-lime': 'var(--accent-lime)',
        'bg-dark': 'var(--color-bg)',
        'grid-gray': 'var(--color-grid)',
        'dark-card': 'var(--color-darkCard)'
      },
      boxShadow: {
        card: 'var(--boxShadow-card)'
      }
    }
  },
  plugins: []
};
