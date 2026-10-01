import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"
import {
  avanzar,
  clavePantalla,
  completarCarrera,
  crearPersonaje,
  elegirModalidadYVariante,
  esperarClave,
  SELECTOR_PANTALLA,
} from "./apoyo/juego"

const CLAVE_GUARDADO = "coplero:partida"

async function violacionesGraves(page: Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze()
  return resultado.violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => v.id)
}

test("A · sin guardado arranca directamente en la creación de personaje", async ({
  page,
}) => {
  await page.goto("/jugar")
  await expect(page.getByTestId("crear-personaje")).toBeVisible()
  await expect(page.getByTestId("reanudar")).toHaveCount(0)
  await expect(page.getByTestId("empezar")).toHaveCount(0)
})

test("B · con partida en curso ofrece reanudar y continuar retoma el punto", async ({
  page,
}) => {
  await page.goto("/jugar")
  await crearPersonaje(page, "El Chato")
  await elegirModalidadYVariante(page)

  await page.waitForSelector(SELECTOR_PANTALLA)
  const claveAntes = await clavePantalla(page)
  await avanzar(page, claveAntes)
  const claveTras = await clavePantalla(page)

  await page.reload()
  await expect(page.getByTestId("reanudar")).toBeVisible()
  await expect(page.getByTestId("continuar")).toBeVisible()
  await expect(page.getByTestId("nueva-partida")).toBeVisible()

  await page.getByTestId("continuar").click()
  await esperarClave(page, claveTras)
})

test("C · «Nueva partida» conserva el guardado hasta crear la nueva", async ({
  page,
}) => {
  await page.goto("/jugar")
  await crearPersonaje(page, "El Chato")
  await elegirModalidadYVariante(page)

  await page.waitForSelector(SELECTOR_PANTALLA)
  await avanzar(page, await clavePantalla(page))

  await page.reload()
  await expect(page.getByTestId("reanudar")).toBeVisible()
  await page.getByTestId("nueva-partida").click()
  await expect(page.getByTestId("crear-personaje")).toBeVisible()

  const guardado = await page.evaluate(
    (clave) => localStorage.getItem(clave),
    CLAVE_GUARDADO,
  )
  expect(guardado).not.toBeNull()

  await page.reload()
  await expect(page.getByTestId("reanudar")).toBeVisible()
})

test("D · una carrera terminada arranca directo, sin reanudar", async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.goto("/jugar")
  await crearPersonaje(page, "El Chato")
  await elegirModalidadYVariante(page)
  await completarCarrera(page)

  await expect(page.getByTestId("fin")).toBeVisible()

  await page.reload()
  await expect(page.getByTestId("crear-personaje")).toBeVisible()
  await expect(page.getByTestId("reanudar")).toHaveCount(0)
})

test("las pantallas de arranque pasan WCAG 2.2 AA", async ({ page }) => {
  await page.goto("/jugar")
  await expect(page.getByTestId("crear-personaje")).toBeVisible()
  expect(await violacionesGraves(page)).toEqual([])

  await crearPersonaje(page, "El Chato")
  await elegirModalidadYVariante(page)
  await page.waitForSelector(SELECTOR_PANTALLA)

  await page.reload()
  await expect(page.getByTestId("reanudar")).toBeVisible()
  expect(await violacionesGraves(page)).toEqual([])
})
