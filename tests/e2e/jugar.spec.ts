import { expect, test } from "@playwright/test"

async function clavePantalla(page: import("@playwright/test").Page) {
  return page.locator("[data-pantalla]").evaluate((el) => {
    const root = el as HTMLElement
    return [
      root.getAttribute("data-pantalla"),
      root.getAttribute("data-momento"),
      root.getAttribute("data-ano"),
    ].join("|")
  })
}

test("completa una carrera de principio a fin", async ({ page }) => {
  await page.goto("/jugar")

  await page.getByTestId("empezar").click()
  await page.getByLabel("Nombre o apodo").fill("El Chato")
  await page.getByTestId("crear").click()

  await page.locator('[data-testid="modalidad"] button').first().click()
  await page.locator('[data-testid="variante"] button').first().click()

  let pasos = 0
  while (pasos < 400) {
    await page.waitForSelector(
      '[data-pantalla="decision"], [data-pantalla="resultado"], [data-pantalla="fin"]',
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
  await expect(page.getByTestId("fin")).toContainText("El Chato")
})

test("conserva la partida al recargar", async ({ page }) => {
  await page.goto("/jugar")

  await page.getByTestId("empezar").click()
  await page.getByLabel("Nombre o apodo").fill("El Chato")
  await page.getByTestId("crear").click()
  await page.locator('[data-testid="modalidad"] button').first().click()
  await page.locator('[data-testid="variante"] button').first().click()

  await page.waitForSelector('[data-pantalla="decision"]')
  const claveAntes = await clavePantalla(page)

  await page.locator('[data-testid="decision"] button').first().click()
  await page.waitForFunction((previa) => {
    const root = document.querySelector("[data-pantalla]")
    if (!root) return false
    const actual = [
      root.getAttribute("data-pantalla"),
      root.getAttribute("data-momento"),
      root.getAttribute("data-ano"),
    ].join("|")
    return actual !== previa
  }, claveAntes)

  const claveTrasDecision = await clavePantalla(page)
  const guardado = await page.evaluate(() =>
    localStorage.getItem("coplero:partida"),
  )
  expect(guardado).not.toBeNull()

  await page.reload()
  await expect(page.getByTestId("continuar")).toBeVisible()
  await page.getByTestId("continuar").click()

  await page.waitForFunction((esperada) => {
    const root = document.querySelector("[data-pantalla]")
    if (!root) return false
    const actual = [
      root.getAttribute("data-pantalla"),
      root.getAttribute("data-momento"),
      root.getAttribute("data-ano"),
    ].join("|")
    return actual === esperada
  }, claveTrasDecision)
})
