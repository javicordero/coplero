import { expect, test } from "@playwright/test"
import {
  avanzar,
  clavePantalla,
  completarCarrera,
  crearPersonaje,
  elegirModalidadYVariante,
  esperarClave,
  SELECTOR_PANTALLA,
} from "./apoyo/juego"

test("completa una carrera de principio a fin", async ({ page }) => {
  await page.goto("/jugar")
  await crearPersonaje(page, "El Chato")
  await elegirModalidadYVariante(page)
  await completarCarrera(page)

  await expect(page.getByTestId("fin")).toBeVisible()
  await expect(page.getByTestId("fin")).toContainText("El Chato")
})

/** 013: una carrera no puede repetir la misma posición todo el tiempo. */
test("los resultados de una carrera son variados", async ({ page }) => {
  await page.goto("/jugar")
  await crearPersonaje(page, "El Chato")
  await elegirModalidadYVariante(page)

  const puestos: number[] = []
  let pasos = 0
  while (pasos < 400) {
    await page.waitForSelector(SELECTOR_PANTALLA)
    const clavePrevia = await clavePantalla(page)
    if (clavePrevia.split("|")[0] === "fin") break

    if (clavePrevia.split("|")[0] === "resultado") {
      const texto = await page.getByTestId("resultado").innerText()
      const coincidencia = /puesto (\d+)/.exec(texto)
      if (coincidencia) puestos.push(Number(coincidencia[1]))
    }

    await avanzar(page, clavePrevia)
    pasos += 1
  }

  await expect(page.getByTestId("fin")).toBeVisible()
  expect(puestos.length).toBeGreaterThanOrEqual(15)
  expect(new Set(puestos).size).toBeGreaterThanOrEqual(3)
})

test("conserva la partida al recargar", async ({ page }) => {
  await page.goto("/jugar")
  await crearPersonaje(page, "El Chato")
  await elegirModalidadYVariante(page)

  await page.waitForSelector(SELECTOR_PANTALLA)
  const claveAntes = await clavePantalla(page)

  await avanzar(page, claveAntes)

  const claveTrasDecision = await clavePantalla(page)
  const guardado = await page.evaluate(() =>
    localStorage.getItem("coplero:partida"),
  )
  expect(guardado).not.toBeNull()

  await page.reload()
  await expect(page.getByTestId("continuar")).toBeVisible()
  await page.getByTestId("continuar").click()

  await esperarClave(page, claveTrasDecision)
})
