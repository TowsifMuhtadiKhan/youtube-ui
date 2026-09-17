import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
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
});
