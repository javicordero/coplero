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
    // Nunca se reutiliza un servidor ya levantado: cualquier otro proceso en el
    // puerto (por ejemplo, el dev server de otro proyecto) hacía que la suite
    // probara **otra web** y fallara o pasara por motivos que no eran suyos.
    // Con esto, si el puerto está ocupado la ejecución falla y se ve el motivo.
    reuseExistingServer: false,
  },
})
