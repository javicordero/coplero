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
  const cta = page.getByRole("link", { name: /empezar a jugar/i })
  await expect(cta).toBeVisible()
  await expect(cta).toBeInViewport()
  await expect(cta).toHaveAttribute("href", "/jugar")
})

test("incluye las secciones de la landing", async ({ page }) => {
  await page.goto("/")

  await expect(page.locator("#que-es")).toBeVisible()
  await expect(page.locator("#como-funciona li")).toHaveCount(4)
  await expect(page.locator("#modalidades article")).toHaveCount(2)
  await expect(page.getByTestId("tarjeta")).toBeVisible()
  await expect(page.locator("#faq details")).toHaveCount(6)
})

test("la FAQ responde y los enlaces internos son correctos", async ({
  page,
}) => {
  await page.goto("/")

  const preguntas = page.locator("#faq details")
  expect(await preguntas.count()).toBeGreaterThanOrEqual(5)
  await preguntas.first().locator("summary").click()
  await expect(preguntas.first()).toHaveAttribute("open", "")

  const internos = page.locator('a[href^="/"]')
  const total = await internos.count()
  expect(total).toBeGreaterThan(0)
  for (let i = 0; i < total; i++) {
    const href = await internos.nth(i).getAttribute("href")
    expect(href?.startsWith("/jugar")).toBe(true)
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

  // Sin enlaces legales rotos (FR-014): las páginas aún no existen.
  await expect(pie.locator('a[href^="/politicas"]')).toHaveCount(0)
})

test("la landing pasa WCAG 2.2 AA", async ({ page }) => {
  await page.goto("/")
  expect(await violacionesGraves(page)).toEqual([])
})
