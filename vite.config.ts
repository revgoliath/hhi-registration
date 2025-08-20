import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",                         // critical for Tauri packaged app
  plugins: [react()],
  server: { port: 5173, host: true }, // dev server
  build: { outDir: "dist", assetsDir: "assets", sourcemap: false }
});