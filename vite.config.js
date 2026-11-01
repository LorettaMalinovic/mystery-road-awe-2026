import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".",
  plugins: [react()], // compiles JSX/TSX and enables React fast refresh
  build: {
    rollupOptions: {
      input: {
        main: "index.html", // vanilla app
        react: "react.html", // React app
      },
    },
  },
});
