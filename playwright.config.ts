import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:4321",
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    port: 4321,
    // Reutiliza el `npm run dev` que ya tengas levantado: no arranca ni para
    // ningún servidor si el puerto ya responde. Si no hay servidor, Playwright
    // arranca uno propio y lo apaga al terminar.
    reuseExistingServer: true,
  },
})
