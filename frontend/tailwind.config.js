/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Steep tokens
        ink: "#17191c",
        paper: "#ffffff",
        mist: {
          DEFAULT: "#f2f2f3",
          soft: "#f7f7f8",
        },
        fog: "#fafafb",
        slate: {
          DEFAULT: "#777b86",
        },
        ash: "#979799",
        smoke: "#a3a6af",
        peach: "#fbe1d1",
        sienna: "#5d2a1a",
        // Legacy aliases remapped to Steep (never use as dark panel fills)
        forest: "#17191c",
        leaf: "#17191c",
        mint: "#f2f2f3",
        canvas: "#fafafb",
        warn: "#5d2a1a",
        alert: "#5d2a1a",
        border: "#ececec",

      },
      fontFamily: {
        display: ['"Source Serif 4"', "Georgia", "ui-serif", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        caption: ["15px", { lineHeight: "1.5" }],
        body: ["17px", { lineHeight: "1.35" }],
        "body-lg": ["20px", { lineHeight: "1.35" }],
        subheading: ["22px", { lineHeight: "1.5" }],
        "heading-sm": ["26px", { lineHeight: "1.18", letterSpacing: "-0.23px" }],
        heading: ["44px", { lineHeight: "1.3", letterSpacing: "-0.66px" }],
        "heading-lg": ["64px", { lineHeight: "1.3", letterSpacing: "-0.96px" }],
      },
      borderRadius: {
        card: "24px",
        elevated: "20px",
        input: "16px",
        pill: "9999px",
        image: "12px",
      },
      maxWidth: {
        page: "1200px",
      },
      boxShadow: {
        soft: "0 0 0 1px rgba(4,23,43,0.05), 0 8px 10px -6px rgba(0,0,0,0.08)",
        artifact:
          "0 0 0 1px rgba(4,23,43,0.05), 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        popover: "0 0 0 1px rgba(4,23,43,0.05), 0 4px 24px rgba(0,0,0,0.08)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.4s ease-out",
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
