/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        "colors": {
            "on-tertiary-fixed": "#01210b",
            "on-error": "#ffffff",
            "on-error-container": "#93000a",
            "primary-container": "#1a4173",
            "on-primary": "#ffffff",
            "secondary-fixed-dim": "#f5bd58",
            "on-tertiary-container": "#92b695",
            "surface-container": "#edeeef",
            "tertiary-fixed": "#c6ecc8",
            "on-primary-fixed": "#001b3c",
            "surface-dim": "#d9dadb",
            "on-secondary-fixed-variant": "#5f4100",
            "on-surface-variant": "#43474f",
            "on-tertiary": "#ffffff",
            "secondary-container": "#ffc55f",
            "on-primary-fixed-variant": "#224779",
            "surface-bright": "#f8f9fa",
            "surface": "#f8f9fa",
            "on-surface": "#191c1d",
            "on-tertiary-fixed-variant": "#2d4e33",
            "error": "#ba1a1a",
            "surface-container-highest": "#e1e3e4",
            "surface-container-low": "#f3f4f5",
            "tertiary-container": "#28482e",
            "inverse-primary": "#a8c8ff",
            "surface-container-lowest": "#ffffff",
            "secondary-fixed": "#ffdeaa",
            "background": "#f8f9fa",
            "inverse-surface": "#2e3132",
            "secondary": "#7d5700",
            "on-secondary-container": "#755100",
            "on-secondary": "#ffffff",
            "tertiary": "#113119",
            "on-background": "#191c1d",
            "surface-variant": "#e1e3e4",
            "on-primary-container": "#8caee7",
            "primary": "#002b57",
            "outline-variant": "#c3c6d0",
            "surface-tint": "#3c5f93",
            "tertiary-fixed-dim": "#abd0ad",
            "inverse-on-surface": "#f0f1f2",
            "primary-fixed": "#d5e3ff",
            "surface-container-high": "#e7e8e9",
            "primary-fixed-dim": "#a8c8ff",
            "error-container": "#ffdad6",
            "on-secondary-fixed": "#271900",
            "outline": "#737780"
        },
        "borderRadius": {
            "DEFAULT": "0.25rem",
            "lg": "0.5rem",
            "xl": "0.75rem",
            "full": "9999px"
        },
        "spacing": {
            "base": "4px",
            "gutter-mobile": "12px",
            "xs": "8px",
            "margin-mobile": "20px",
            "sm": "12px",
            "lg": "24px",
            "xl": "32px",
            "md": "16px"
        },
        "fontFamily": {
            "headline-lg": ["Public Sans", "sans-serif"],
            "headline-md": ["Public Sans", "sans-serif"],
            "label-sm": ["Public Sans", "sans-serif"],
            "body-md": ["Public Sans", "sans-serif"],
            "label-lg": ["Public Sans", "sans-serif"],
            "body-lg": ["Public Sans", "sans-serif"]
        },
        "fontSize": {
            "headline-lg": ["28px", {"lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
            "headline-md": ["22px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
            "label-sm": ["10px", {"lineHeight": "12px", "fontWeight": "500"}],
            "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
            "label-lg": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
            "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}]
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(5px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          }
        },
        animation: {
          fadeIn: 'fadeIn 0.5s ease-out'
        }
      },
    },
    plugins: [],
  }
