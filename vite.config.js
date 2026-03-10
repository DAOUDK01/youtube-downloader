import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        // Ensure SSE (Server-Sent Events) are streamed without buffering
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            if (
              proxyRes.headers["content-type"]?.includes("text/event-stream")
            ) {
              // Prevent any proxy-level buffering for SSE
              proxyRes.headers["cache-control"] = "no-cache";
              proxyRes.headers["x-accel-buffering"] = "no";
            }
          });
        },
      },
    },
    // SPA fallback for client-side routing
    historyApiFallback: true,
  },
});
