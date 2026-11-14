import { networkInterfaces } from "node:os";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** First non-internal IPv4 address — used so QR codes work from phones on the LAN. */
function detectLanHost(): string {
  try {
    const nets = networkInterfaces();
    for (const entries of Object.values(nets)) {
      for (const net of entries ?? []) {
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }
  } catch {
    // Sandbox / restricted environments may block os.networkInterfaces().
  }
  return "";
}

const lanHost = detectLanHost();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["VITE_"],
  define: {
    // Expose as import.meta.env.VITE_DEV_LAN_HOST for join QR URLs.
    "import.meta.env.VITE_DEV_LAN_HOST": JSON.stringify(lanHost),
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});
