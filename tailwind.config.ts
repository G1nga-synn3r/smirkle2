import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin"; // Import the plugin helper

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
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.clip-hexagon': {
          'clip-path': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        },
      })
    }),
  ],
};
export default config;