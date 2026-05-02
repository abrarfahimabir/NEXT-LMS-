/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Updated color palette per requirements
        ink: "#0a0a12",
        surface: "#12121f",
        primary: "#6366f1",
        mist: "#dce7f5",
        accent: "#42d392",
        coral: "#ff7a59",
        gold: "#f8c146",
        violet: "#a78bfa",
        indigo: "#818cf8",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(66, 211, 146, 0.18)",
        card: "0 18px 45px rgba(2, 12, 27, 0.28)",
        panel: "0 30px 120px rgba(8, 15, 33, 0.42)",
        soft: "0 12px 40px rgba(15, 23, 42, 0.22)",
        primary: "0 0 30px rgba(99, 102, 241, 0.25)",
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(circle at top left, rgba(66, 211, 146, 0.22), transparent 35%), radial-gradient(circle at top right, rgba(248, 193, 70, 0.24), transparent 30%), radial-gradient(circle at bottom, rgba(255, 122, 89, 0.18), transparent 35%)",
        "aurora-gradient":
          "radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.18), transparent 24%), radial-gradient(circle at 80% 0%, rgba(248, 193, 70, 0.2), transparent 24%), radial-gradient(circle at 50% 100%, rgba(66, 211, 146, 0.2), transparent 28%)",
        "grid-fade":
          "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        drift: "drift 16s ease-in-out infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(18px, -14px, 0) scale(1.04)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
