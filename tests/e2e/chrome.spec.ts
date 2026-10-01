import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const RUTAS = [
  "/",
  "/jugar",
  "/como-jugar",
  "/politicas/politica-de-privacidad",
  "/politicas/politica-de-cookies",
  "/r/codigo-invalido",
]

async function violacionesGraves(page: import("@playwright/test").Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze()
  return resultado.violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => v.id)
}

async function sinScrollHorizontal(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  )
}

test("la cabecera y el pie aparecen en todas las páginas", async ({ page }) => {
  for (const ruta of RUTAS) {
    await page.goto(ruta)
    await expect(page.locator("[data-marca]"), `marca en ${ruta}`).toBeVisible()
    await expect(
      page.locator('footer[role="contentinfo"]'),
      `pie en ${ruta}`,
    ).toBeVisible()
  }
})

test("la marca cambia con el sexo del personaje", async ({ page }) => {
  await page.goto("/jugar")
  await expect(page.locator("[data-marca]")).toHaveText("Coplero")

  await page.getByTestId("empezar").click()
  await page.getByLabel("Nombre o apodo").fill("La Chata")
  await page.locator('label[for="genero-femenino"]').click()
  await page.getByTestId("crear").click()

  await expect(page.locator("[data-marca]")).toHaveText("Coplera")
})

test("la portada y el juego comparten fondo, cabecera y pie", async ({
  page,
}) => {
  await page.goto("/")
  const fondoPortada = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  )
  const marcaPortada = await page.locator("[data-marca]").innerText()
  const piePortada = await page
    .locator('footer[role="contentinfo"]')
    .innerText()

  await page.goto("/jugar")
  const fondoJuego = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  )
  const marcaJuego = await page.locator("[data-marca]").innerText()
  const pieJuego = await page.locator('footer[role="contentinfo"]').innerText()

  expect(fondoJuego).toBe(fondoPortada)
  expect(marcaJuego).toBe(marcaPortada)
  expect(pieJuego).toBe(piePortada)
})

test("no hay scroll horizontal desde 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  for (const ruta of ["/", "/jugar", "/como-jugar"]) {
    await page.goto(ruta)
    expect(await sinScrollHorizontal(page), `scroll en ${ruta}`).toBe(true)
  }
})

test("/como-jugar muestra reglas, modalidades y FAQ", async ({ page }) => {
  await page.goto("/como-jugar")
  await expect(page.getByRole("heading", { name: "Las reglas" })).toBeVisible()
  await expect(page.locator(".modalidad")).toHaveCount(2)
  expect(await page.locator(".faq details").count()).toBeGreaterThanOrEqual(5)
})

test("el marco y las páginas estáticas pasan WCAG 2.2 AA", async ({ page }) => {
  for (const ruta of ["/", "/como-jugar", "/jugar"]) {
    await page.goto(ruta)
    expect(await violacionesGraves(page), `axe en ${ruta}`).toEqual([])
  }
})
