/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkClass: 'cedros-dark',
  theme: {
    extend: {
      colors: {
        cedros: {
          primary: 'var(--cedros-primary)',
          'primary-foreground': 'var(--cedros-primary-foreground)',
          background: 'var(--cedros-background)',
          foreground: 'var(--cedros-foreground)',
          muted: 'var(--cedros-muted)',
          'muted-foreground': 'var(--cedros-muted-foreground)',
          border: 'var(--cedros-border)',
          input: 'var(--cedros-input)',
          ring: 'var(--cedros-ring)',
          destructive: 'var(--cedros-destructive)',
          'destructive-foreground': 'var(--cedros-destructive-foreground)',
        },
      },
      borderRadius: {
        cedros: 'var(--cedros-radius)',
      },
    },
  },
  plugins: [],
  // Prefix all classes to avoid conflicts with consumer's styles
  prefix: 'cl-',
};
