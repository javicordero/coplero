import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const ENLACES_PIE = [
  "https://x.com/acordesgaditano",
  "https://www.youtube.com/@acordesgaditanos",
  "https://www.tiktok.com/@acordes.gaditanos",
  "https://www.instagram.com/acordesgaditanos/",
  "https://www.linkedin.com/in/javier-cordero-toscano",
  "https://github.com/javicordero",
  "https://acordesgaditanos.com",
]

const RUTAS_INTERNAS = [
  "/",
  "/jugar",
  "/colaborar",
  "/politicas/politica-de-privacidad",
  "/politicas/politica-de-cookies",
]

async function violacionesGraves(page: import("@playwright/test").Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze()
  return resultado.violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => v.id)
}

test("el hero muestra el CTA sin scroll en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await page.goto("/")

  await expect(
    page.getByRole("heading", { level: 1, name: "Coplero" }),
  ).toBeVisible()
  const cta = page.getByRole("link", { name: /empezar a jugar/i }).first()
  await expect(cta).toBeVisible()
  await expect(cta).toBeInViewport()
  await expect(cta).toHaveAttribute("href", "/jugar")
})

test("la portada fusiona qué es y cómo funciona, y no tiene modalidades/FAQ/cierre", async ({
  page,
}) => {
  await page.goto("/")

  await expect(page.locator("#que-es")).toBeVisible()
  await expect(page.locator("#que-es li")).toHaveCount(4)
  await expect(page.getByTestId("tarjeta")).toBeVisible()

  await expect(page.locator("#como-funciona")).toHaveCount(0)
  await expect(page.locator("#modalidades")).toHaveCount(0)
  await expect(page.locator("#faq")).toHaveCount(0)
})

test("los bloques usan ornamento en lugar del compás", async ({ page }) => {
  await page.goto("/")

  for (const id of ["#que-es", "#ejemplo"]) {
    await expect(page.locator(`${id} svg.regla-compas`)).toHaveCount(0)
    await expect(page.locator(`${id} [data-separador]`)).toHaveCount(1)
  }
})

test("el ejemplo muestra la carrera larga y sus distinciones", async ({
  page,
}) => {
  await page.goto("/")

  const tarjeta = page.getByTestId("tarjeta")
  await expect(tarjeta).toBeVisible()

  await expect(
    page.locator('[data-testid="tarjeta-premios"] .hito'),
  ).toHaveCount(7)
  await expect(
    page.locator('[data-testid="tarjeta-distinciones"] .roseta'),
  ).toHaveCount(3)
  await expect(
    page.locator('[data-testid="tarjeta-mejor-posicion"]'),
  ).toHaveAttribute("data-tono", "oro")

  await expect(tarjeta).toContainText("2038")
})

test("los enlaces internos de la portada apuntan a rutas existentes", async ({
  page,
}) => {
  await page.goto("/")

  const internos = page.locator('a[href^="/"]')
  const total = await internos.count()
  expect(total).toBeGreaterThan(0)
  for (let i = 0; i < total; i++) {
    const href = await internos.nth(i).getAttribute("href")
    expect(RUTAS_INTERNAS, `enlace ${href}`).toContain(href)
  }
})

test("el pie muestra redes, autor y acordesgaditanos", async ({ page }) => {
  await page.goto("/")

  const pie = page.locator('footer[role="contentinfo"]')
  await expect(pie).toContainText("Javier Cordero Toscano")
  await expect(pie).toContainText("Coplero")

  for (const enlace of ENLACES_PIE) {
    const ancla = pie.locator(`a[href="${enlace}"]`)
    await expect(ancla).toHaveCount(1)
    await expect(ancla).toHaveAttribute("target", "_blank")
    await expect(ancla).toHaveAttribute("rel", "noopener noreferrer")
  }

  await expect(
    pie.locator('a[href="/politicas/politica-de-privacidad"]'),
  ).toHaveCount(1)
  await expect(
    pie.locator('a[href="/politicas/politica-de-cookies"]'),
  ).toHaveCount(1)
})

test("la landing pasa WCAG 2.2 AA", async ({ page }) => {
  await page.goto("/")
  expect(await violacionesGraves(page)).toEqual([])
})

test("la portada ofrece el botón de donación y el pie enlaza a colaborar", async ({
  page,
}) => {
  await page.goto("/")

  const ejemplo = page.locator("#ejemplo")
  const boton = ejemplo.locator('a[href^="https://www.buymeacoffee.com/"]')
  await expect(boton).toHaveCount(1)
  await expect(boton).toHaveAttribute("target", "_blank")
  await expect(boton).toHaveAttribute("rel", "noopener noreferrer")

  // El botón va después del CTA final del bloque del ejemplo.
  const cta = ejemplo.locator('a[href="/jugar"]').last()
  const cajaCta = await cta.boundingBox()
  const cajaBoton = await boton.boundingBox()
  expect(cajaBoton?.y ?? 0).toBeGreaterThan(cajaCta?.y ?? 0)

  await expect(
    page.locator('footer[role="contentinfo"] a[href="/colaborar"]'),
  ).toHaveCount(1)
})
