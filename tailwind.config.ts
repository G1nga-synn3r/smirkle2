import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        smirkleMint: "#00FF9C",
        smirkleRed: "#FF003C",
      },
      borderWidth: {
        '4': '4px',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'brutal-mint': '4px 4px 0px 0px #00FF9C',
        'neon-glow': '0 0 20px rgba(0, 255, 156, 0.4)',
      },
    },
  },
  plugins: [],
};
export default config;