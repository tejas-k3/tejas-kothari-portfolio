import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://tejaskothari.dev", // TODO(tejas): set the real production domain (used for canonical/OG/sitemap)
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "auto" },
  devToolbar: { enabled: false },
});
