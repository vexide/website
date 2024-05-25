import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://pros-rs.pages.dev/",
	integrations: [sitemap(), svelte()],
	output: "hybrid",
	adapter: cloudflare(),
});
