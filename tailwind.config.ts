import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          white: "#FFF9F2",
          cream: "#FAF6EE",
          "cream-light": "#FFF9F2",
          ivory: "#FFF9F2",
          sage: "#EAF2E8",
          champagne: "#F6ECD7",
          "gold-tint": "#F9F0DB",
          "champagne-light": "#F9F0DB",
          orange: "#C8A145",
          "orange-light": "#D8B25B",
          "orange-dark": "#B98B2C",
          gold: "#C8A145",
          "gold-light": "#D8B25B",
          "gold-dark": "#B98B2C",
          "gold-label": "#C9A44C",
          green: "#18382F",
          "green-dark": "#0F2420",
          "green-soft": "#244736",
          "green-mid": "#2D5A47",
          "green-light": "#3A6B55",
          "green-pale": "#EAF2E8",
          forest: "#18382F",
          charcoal: "#18382F",
          slate: "#244736",
          muted: "#5A6B60",
        },
        border: "rgba(201, 154, 74, 0.15)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "Georgia", "serif"],
      },
      boxShadow: {
        luxury: "0 8px 40px rgba(24, 56, 47, 0.08)",
        "luxury-lg": "0 20px 70px rgba(24, 56, 47, 0.12)",
        "luxury-gold": "0 12px 40px rgba(200, 161, 69, 0.22)",
        glass: "0 12px 48px rgba(24, 56, 47, 0.08)",
        float: "0 35px 90px rgba(0, 0, 0, 0.14)",
        glow: "0 0 50px rgba(200, 161, 69, 0.18)",
        "glow-lg": "0 0 80px rgba(200, 161, 69, 0.22)",
        "glass-luxury": "0 35px 90px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.65)",
      },
      backgroundImage: {
        "luxury-gradient":
          "linear-gradient(135deg, #183426 0%, #244736 50%, #2D5A47 100%)",
        "cream-gradient":
          "linear-gradient(180deg, #FDFBF7 0%, #F8F5EE 50%, #F0EDE6 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #A67F3A 0%, #C99A4A 50%, #DBB56A 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at 30% 20%, rgba(219, 181, 106, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201, 154, 74, 0.08) 0%, transparent 50%), linear-gradient(180deg, #FDFBF7 0%, #F8F5EE 100%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,245,238,0.8) 100%)",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "float-medium": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
        "particle-float": "particle-float 20s linear infinite",
        glow: "glow 3s ease-in-out infinite",
        "light-drift": "light-drift 18s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "particle-float": {
          "0%": { transform: "translateY(100vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100vh) rotate(720deg)", opacity: "0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201,154,74,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(201,154,74,0.4)" },
        },
        "light-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.98)" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
