import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.use({ permissions: ["clipboard-read", "clipboard-write"] })

async function violacionesGraves(page: import("@playwright/test").Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze()
  return resultado.violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => v.id)
}

async function jugarHastaFin(page: import("@playwright/test").Page) {
  await page.goto("/jugar")
  await page.getByTestId("empezar").click()
  await page.getByLabel("Nombre o apodo").fill("El Chato")
  await page.getByTestId("crear").click()
  await page.locator('[data-testid="modalidad"] button').first().click()
  await page.locator('[data-testid="variante"] button').first().click()

  let pasos = 0
  while (pasos < 400) {
    await page.waitForSelector(
      '[data-pantalla="decision"], [data-pantalla="resultado"], [data-pantalla="variante"], [data-pantalla="fin"]',
    )
    const clavePrevia = await page.locator("[data-pantalla]").evaluate((el) => {
      const root = el as HTMLElement
      return [
        root.getAttribute("data-pantalla"),
        root.getAttribute("data-momento"),
        root.getAttribute("data-ano"),
      ].join("|")
    })
    const pantalla = clavePrevia.split("|")[0]
    if (pantalla === "fin") break

    if (pantalla === "decision") {
      await page.locator('[data-testid="decision"] button').first().click()
    } else if (pantalla === "variante") {
      await page.locator('[data-testid="variante"] button').first().click()
    } else if (pantalla === "resultado") {
      await page.getByTestId("continuar-ano").click()
    }

    await page.waitForFunction((previa) => {
      const root = document.querySelector("[data-pantalla]")
      if (!root) return false
      const actual = [
        root.getAttribute("data-pantalla"),
        root.getAttribute("data-momento"),
        root.getAttribute("data-ano"),
      ].join("|")
      return actual !== previa
    }, clavePrevia)
    pasos += 1
  }

  await expect(page.getByTestId("fin")).toBeVisible()
}

test("muestra la tarjeta y permite ocultar el nombre", async ({ page }) => {
  test.setTimeout(60_000)
  await jugarHastaFin(page)

  await expect(page.getByTestId("tarjeta-nombre")).toHaveText("El Chato")
  await expect(page.getByTestId("tarjeta-hitos").locator("li")).toHaveCount(3)

  await page.getByTestId("toggle-nombre").click()
  await expect(page.getByTestId("tarjeta-nombre")).toHaveText("Anónimo")
})

test("el enlace reproduce la tarjeta y el código inválido es amable", async ({
  page,
}) => {
  test.setTimeout(60_000)
  await jugarHastaFin(page)

  await page.getByTestId("copiar-enlace").click()
  const enlace = await page.evaluate(() => navigator.clipboard.readText())
  expect(enlace).toContain("/r/")

  await page.goto(enlace)
  await expect(page.getByTestId("tarjeta-nombre")).toHaveText("El Chato")

  await page.goto("/r/codigo-invalido")
  await expect(page.getByTestId("codigo-invalido")).toBeVisible()
  await expect(
    page.getByRole("link", { name: /juega tu carrera/i }),
  ).toBeVisible()
})

test("la tarjeta y la página de resultado pasan WCAG 2.2 AA", async ({
  page,
}) => {
  test.setTimeout(60_000)
  await jugarHastaFin(page)
  expect(await violacionesGraves(page)).toEqual([])

  await page.getByTestId("copiar-enlace").click()
  const enlace = await page.evaluate(() => navigator.clipboard.readText())
  await page.goto(enlace)
  await expect(page.getByTestId("tarjeta")).toBeVisible()
  expect(await violacionesGraves(page)).toEqual([])
})
