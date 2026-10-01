import netlify from "@astrojs/netlify"
import svelte from "@astrojs/svelte"
import { defineConfig } from "astro/config"

export default defineConfig({
  devToolbar: { enabled: false },
  integrations: [svelte()],
  adapter: netlify({
    devFeatures: {
      environmentVariables: false,
      images: true,
      edgeFunctions: false,
    },
  }),
})
