import { defineConfig } from "astro/config";
import path from "path";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://pros-rs.pages.dev/",
	integrations: [sitemap(), svelte()],
	output: "hybrid",
	vite: {
		build: {
			sourcemap: true,
		},
		resolve: {
			alias: {
				"~": path.resolve("./src"),
			},
		},
	},
	adapter: cloudflare(),
});
