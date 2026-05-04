import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        timber: {
          ink: "#2f241b",
          brown: "#7a4610",
          tan: "#f8efe5",
          line: "#e8ddd4",
          paper: "#fffaf5"
        }
      }
    }
  },
  plugins: []
};

export default config;
