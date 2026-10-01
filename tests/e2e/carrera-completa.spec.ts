import { expect, test } from "@playwright/test"
import {
  avanzar,
  clavePantalla,
  completarCarrera,
  crearPersonaje,
  enlaceCompartido,
  esperarClave,
  SELECTOR_PANTALLA,
} from "./apoyo/juego"

const NOMBRE = "El Chato"

test.use({ permissions: ["clipboard-read", "clipboard-write"] })

test("E2E-001: carrera completa de principio a fin", async ({ page }) => {
  test.setTimeout(90_000)

  const externas: string[] = []
  page.on("request", (request) => {
    const { hostname } = new URL(request.url())
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      externas.push(request.url())
    }
  })

  await test.step("1 · entrar en /jugar", async () => {
    await page.goto("/jugar")
    await expect(page.getByTestId("crear-personaje")).toBeVisible()
  })

  await test.step("2 · crear personaje", async () => {
    await crearPersonaje(page, NOMBRE)
    await expect(page.getByTestId("modalidad")).toBeVisible()
  })

  await test.step("3 · elegir modalidad", async () => {
    await page.locator('[data-testid="modalidad"] button').first().click()
    await expect(page.getByTestId("variante")).toBeVisible()
  })

  await test.step("4 · elegir variante", async () => {
    await page.locator('[data-testid="variante"] button').first().click()
    await page.waitForSelector(SELECTOR_PANTALLA)
  })

  await test.step("5 · completar varias decisiones", async () => {
    // El indicador es un overlay del área de juego (016): ya no vive dentro de
    // la sección y no expone el tipo. Solo se comprueba que está presente.
    let decisiones = 0

    while (decisiones < 4) {
      await page.waitForSelector(SELECTOR_PANTALLA)
      const clave = await clavePantalla(page)
      if (clave.split("|")[0] === "fin") break

      if (clave.split("|")[0] === "decision") {
        await expect(page.getByTestId("indicador")).toBeVisible()
        decisiones += 1
      }

      await avanzar(page, clave)
    }

    expect(decisiones).toBeGreaterThanOrEqual(4)
  })

  await test.step("8 · recargar y recuperar partida", async () => {
    await page.waitForSelector(SELECTOR_PANTALLA)
    const claveAntes = await clavePantalla(page)

    await page.reload()
    await expect(page.getByTestId("reanudar")).toBeVisible()
    await expect(page.getByTestId("continuar")).toBeVisible()
    await page.getByTestId("continuar").click()

    await esperarClave(page, claveAntes)
  })

  await test.step("6 · completar la carrera", async () => {
    await completarCarrera(page)
  })

  await test.step("7 · tarjeta final", async () => {
    await expect(page.getByTestId("fin")).toBeVisible()
    await expect(page.getByTestId("tarjeta")).toBeVisible()
    await expect(page.getByTestId("tarjeta-nombre")).toHaveText(NOMBRE)
  })

  let enlace = ""
  await test.step("9 · generar código compartible", async () => {
    enlace = await enlaceCompartido(page)
    expect(enlace).toContain("/r/")
  })

  await test.step("10 · abrir /r/[codigo]", async () => {
    await page.evaluate(() => localStorage.clear())
    await page.goto(enlace)
    await expect(page.getByTestId("tarjeta")).toBeVisible()
    await expect(page.getByTestId("tarjeta-nombre")).toHaveText(NOMBRE)
  })

  expect(externas).toEqual([])
})
