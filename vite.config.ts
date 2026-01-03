import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/refnull/",   // 👈 REQUIRED for GitHub Pages
});
