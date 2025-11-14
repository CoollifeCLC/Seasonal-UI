// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    // Needed because src contains TSX (hooks/provider)
    react(),

    // Emit type declarations to dist/ and add "types" entry
    dts({
      insertTypesEntry: true,
      outDir: "dist",
      include: ["src"],
      exclude: ["examples", "node_modules", "dist"]
    }),

    // Copy raw CSS assets so consumers can import:
    // import "seasonal-ui/dist/css/seasonal.css"
    viteStaticCopy({
      targets: [{ src: "src/css/**/*", dest: "css" }]
    })
  ],

  build: {
    lib: {
      entry: "src/index.ts",
      name: "SeasonalUI",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.esm.js" : "index.cjs")
    },
    rollupOptions: {
      // Don't bundle peer deps
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        },
        // Keep module structure simple for tree-shaking
        interop: "auto"
      }
    },
    sourcemap: true,
    // Smaller, modern output while keeping Node compatibility
    target: "es2020",
    minify: "esbuild",
    emptyOutDir: true
  },
    server: {
      open: "src/examples/react/index.html",
  },

  // Good defaults for JSX + bundlers
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react"
  }
});
