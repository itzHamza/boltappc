/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "hidden",
    "block",
    "grid",
    "flex",
    "bg-blue-50",
    "bg-red-50",
    "text-blue-600",
    "text-red-600",
    "hover:bg-gray-50",
  ],

  theme: {
    extend: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
    },
  },
  plugins: [],
};