import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages base:
// - User/Org pages: base "/"
// - Project pages: base "/REPO_NAME/"
// See Vite deploy docs. :contentReference[oaicite:2]{index=2}
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  plugins: [react()],
  base,
});
