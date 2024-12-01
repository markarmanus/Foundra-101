import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

import hotReloadExtension from "hot-reload-extension-vite";

export default defineConfig({
  plugins: [
    react(),
    hotReloadExtension({
      log: true,
      backgroundPath: "src/BackgroundRuntime/ServiceApp.ts",
    }),
  ],
  build: {
    outDir: "build",
    rollupOptions: {
      input: {
        main: "./index.html",
        background: resolve(__dirname, "src/BackgroundRuntime/ServiceApp.ts"),
      },
      output: {
        entryFileNames: "src/[name]/[name].js",
        chunkFileNames: "assets/js/[name].js",
      },
      watch: {
        exclude: "node_modules/**",
      },
    },
    minify: false,
    sourcemap: true,
    watch: {
      exclude: "node_modules/**",
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
