import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        daimo: {
          blue: "#394e9d",
          lightblue: "#3fb5cc",
          green: "#65b22e",
          purple: "#662d91",
          gray: "#76818e",
          pink: "#ec008c",
        },
      },
      fontFamily: {
        heading: ["var(--font-exo2)", "system-ui", "sans-serif"],
        body: ["var(--font-exo)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "daimo-gradient": "linear-gradient(135deg, #394e9d 0%, #3fb5cc 55%, #65b22e 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
