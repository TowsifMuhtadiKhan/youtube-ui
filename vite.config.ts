import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const isNativeBuild = mode === "android" || mode === "ios";
  if (isNativeBuild) {
    const env = { ...loadEnv(mode, process.cwd()), ...process.env };
    const url = env.VITE_SUPABASE_URL;
    if (!url || !env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        new URL(url).protocol !== "https:" ||
        ["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)) {
      throw new Error(`Native builds need hosted Supabase settings in .env.${mode}.local. Copy .env.${mode}.example and fill in your production URL and publishable key.`);
    }
  }
  return {
  plugins: [
    react(),
    svgr(),
    VitePWA({
      disable: isNativeBuild,
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "LittleLoop",
        short_name: "LittleLoop",
        description: "Your family?s favourite videos, thoughtfully chosen.",
        theme_color: "#0b132b",
        background_color: "#0b132b",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/littleloop.svg",
            sizes: "any",
            type: "image/svg+xml"
          }
        ]
      }
    })
  ],
  };
});
