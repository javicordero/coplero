import { defineConfig } from "@playwright/test"

// Puerto dedicado a las pruebas E2E, separado del `npm run dev` de desarrollo
// (4321). Así Playwright arranca y apaga su propio servidor sin tocar el tuyo.
// Se puede sobreescribir con la variable de entorno PLAYWRIGHT_PORT.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4322)

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
  },
  webServer: {
    // `--ignore-lock` permite un segundo `astro dev` junto al que ya tengas en
    // 4321 (si no, Astro lo rechaza) sin tocar el lock ni detener tu servidor.
    command: `npm run dev -- --port ${PORT} --ignore-lock`,
    port: PORT,
    reuseExistingServer: true,
  },
})
