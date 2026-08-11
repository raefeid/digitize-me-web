import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split shared vendors into stable, long-cacheable chunks so the app
        // entry stays small and vendors survive redeploys in the browser cache.
        // Admin-only heavy libs (editor, dnd) get their own chunks that only
        // load on the routes that import them.
        // Split ONLY the big vendors shared across public pages, to extract them
        // from the entry into stable, long-cacheable chunks. Everything else is
        // left to Rollup's defaults:
        //  - lucide-react is tree-shaken per-icon; naming it would bundle the whole library.
        //  - admin-only libs (BlockNote/prosemirror/yjs, dnd-kit) are already isolated
        //    into their lazy route chunks by default; grouping them would drag the
        //    1MB+ editor onto the public homepage.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Anchor package names to the node_modules boundary so scoped packages
          // like @blocknote/react or @sentry/react do NOT fall into react-vendor.
          if (id.includes("react-router") || id.includes("@remix-run")) return "react-router";
          if (/node_modules[\\/](react|react-dom|scheduler|react-is)[\\/]/.test(id)) return "react-vendor";
          if (id.includes("@tanstack")) return "tanstack";
          if (/node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return "framer";
          if (id.includes("@supabase")) return "supabase";
          // NOTE: @radix-ui is deliberately NOT grouped — it is many independent
          // per-route components; grouping would load admin-only ones on public pages.
        },
      },
    },
  },
}));
