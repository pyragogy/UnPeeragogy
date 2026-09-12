import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://unpeeragogy.pyragogy.org",
  output: "static",
  integrations: [mdx(), icon(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allowed hosts — set to your Coolify proxy domain if needed
    },
  },
  srcDir: "./src",
  outDir: "./dist",
  publicDir: "./public",
});