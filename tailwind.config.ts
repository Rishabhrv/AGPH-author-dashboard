import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F1E7",
        panel: "#FFFFFF",
        ink: "#17171A",
        sidebar: "#181818",
        muted: "#8A8782",
        line: "#E7E2D6",
        pink: {
          DEFAULT: "#F5B9D1",
          soft: "#FBE0EB",
        },
        yellow: {
          DEFAULT: "#F6D65C",
          soft: "#FCF0BE",
        },
        blue: {
          DEFAULT: "#AFCBEE",
          soft: "#E1EBFA",
        },
        sage: {
          DEFAULT: "#C4D9A8",
          soft: "#E7F0DA",
        },
        lilac: {
          DEFAULT: "#C9BCEB",
          soft: "#EAE3F9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,23,26,0.04), 0 8px 24px -12px rgba(23,23,26,0.08)",
        card: "0 1px 1px rgba(23,23,26,0.03)",
      },
    },
  },
  plugins: [],
};
export default config;
