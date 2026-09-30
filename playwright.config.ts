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
    // Se reutiliza el servidor ya levantado (por ejemplo el `npm run dev` local):
    // así ejecutar los E2E no libera ni mata el puerto 4321. Si no hay servidor,
    // Playwright arranca uno propio y lo apaga al terminar.
    reuseExistingServer: true,
  },
})
