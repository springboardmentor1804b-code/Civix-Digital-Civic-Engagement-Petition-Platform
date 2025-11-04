{import('tailwindcss').Config} 
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e3a5f",
          light: "#2d5a94",
          dark: "#152c48",
        },
        background: {
          DEFAULT: "#cfe4f4",
          light: "#e5f0f9",
          dark: "#b8d0e3",
        },
      },
    },
  },
  plugins: [],
};
