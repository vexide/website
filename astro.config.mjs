import { defineConfig } from "astro/config";

import path from "path";

import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import prefetch from "@astrojs/prefetch";

// https://astro.build/config
export default defineConfig({
	site: "https://pros-rs.github.io",
	base: "/website"
	integrations: [sitemap(), svelte(), prefetch()],
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
});
