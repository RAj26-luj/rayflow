/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9', // Electric Purple Base
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        pinkAccent: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        commerce: {
          bg: '#09090b', // Deep Dark Graphite
          surface: '#18181b', // Elevated Card Surface
          elevated: '#27272a',
          border: '#27272a',
          borderHover: '#3f3f46',
          text: '#f4f4f5',
          muted: '#a1a1aa',
          subtle: '#71717a',
          accent: '#7c3aed',
          accentPink: '#ec4899',
          price: '#ffffff',
          discount: '#f43f5e',
          seller: '#a78bfa',
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        '2xl': '1.25rem',
        xl: '0.875rem',
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.03)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
