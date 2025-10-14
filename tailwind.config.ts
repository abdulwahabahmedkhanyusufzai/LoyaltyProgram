import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    screens: {
      sm: "640px",   // default
      md: "1366px",  // custom breakpoint
      lg: "1821px",  // custom breakpoint
      xl: "1920px",
      "2xl": "2560px",
    },
  },
  plugins: [],
};

export default config;
