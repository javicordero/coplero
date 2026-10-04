import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

/** Abre la pantalla de resultado en desarrollo, opcionalmente con un caso. */
async function abrirResultado(page: Page, caso?: string): Promise<void> {
  const url = caso
    ? `/jugar?dev=resultado&caso=${caso}`
    : "/jugar?dev=resultado"
  await page.goto(url)
  await expect(page.getByTestId("resultado")).toBeVisible()
}

test("abre cada caso de resultado sin jugar decisiones", async ({ page }) => {
  const casos: Array<{ caso: string; texto: string }> = [
    { caso: "campeon", texto: "Coplas por Andalucía" },
    { caso: "podio", texto: "puesto 2" },
    { caso: "finalista", texto: "Final" },
    { caso: "preliminares", texto: "Te has quedado en" },
    { caso: "sin-premios", texto: "Cuartos de final" },
    { caso: "fuera-de-concurso", texto: "Este año no has concursado" },
    { caso: "distinciones", texto: "Aguja de oro" },
    { caso: "todas", texto: "Coplas por Andalucía" },
  ]

  for (const { caso, texto } of casos) {
    await abrirResultado(page, caso)
    await expect(page.getByTestId("resultado")).toContainText(texto)
    // El año de la fixture se refleja en el contenedor.
    const ano = await page
      .locator('[data-pantalla="resultado"]')
      .getAttribute("data-ano")
    expect(ano).toMatch(/^\d{4}$/)
  }

  // El caso por defecto no trae premios ajenos; el campeón sí.
  await abrirResultado(page, "podio")
  await expect(page.getByTestId("resultado")).not.toContainText(
    "Coplas por Andalucía",
  )
})

test("un caso desconocido muestra el caso por defecto", async ({ page }) => {
  await abrirResultado(page, "campeon")
  const porDefecto = await page.getByTestId("resultado").innerText()

  await abrirResultado(page, "inexistente")
  const desconocido = await page.getByTestId("resultado").innerText()

  expect(desconocido).toBe(porDefecto)
})

test("«Continuar» va fuera del panel, no avanza en dev y no persiste", async ({
  page,
}) => {
  await abrirResultado(page)
  await expect(page.locator(".panel")).toBeVisible()
  await expect(
    page.locator('.panel [data-testid="continuar-ano"]'),
  ).toHaveCount(0)
  await expect(
    page.locator('.resultado > [data-testid="continuar-ano"]'),
  ).toHaveCount(1)

  await page.getByTestId("continuar-ano").click()
  await expect(page.getByTestId("resultado")).toBeVisible()
  await expect(page.locator('[data-pantalla="resultado"]')).toHaveCount(1)

  const guardado = await page.evaluate(() =>
    localStorage.getItem("coplero:partida"),
  )
  expect(guardado).toBeNull()
})

test("el indicador dice «Año N · Resultado» y nunca «Febrero»", async ({
  page,
}) => {
  await abrirResultado(page)
  const indicador = page.getByTestId("indicador")
  await expect(indicador).toContainText("Resultado")
  await expect(indicador).toHaveAttribute("data-momento", "resultado")
  await expect(indicador).not.toContainText("Febrero")

  // Comparte el tono del texto suave de la pantalla (la etiqueta de llegada).
  const colorIndicador = await indicador.evaluate(
    (el) => getComputedStyle(el).color,
  )
  const colorLlegada = await page
    .locator(".llegada__texto")
    .evaluate((el) => getComputedStyle(el).color)
  expect(colorIndicador).toBe(colorLlegada)
})

test("las distinciones se muestran en fila con roseta y nombre debajo", async ({
  page,
}) => {
  await abrirResultado(page, "distinciones")
  const distinciones = page.getByTestId("distinciones")
  await expect(distinciones.locator(".distincion")).toHaveCount(2)
  await expect(distinciones.locator(".distincion__roseta")).toHaveCount(2)
  await expect(
    distinciones.locator('[data-tipo="aguja_de_oro"] .distincion__nombre'),
  ).toHaveText("Aguja de oro")
  await expect(
    distinciones.locator('[data-tipo="candela_y_espino"] .distincion__nombre'),
  ).toHaveText("Candela y espino")

  // Las rosetas resuelven a un asset real.
  const src = await distinciones
    .locator(".distincion__roseta")
    .first()
    .getAttribute("src")
  expect(src).toMatch(/^\/rosetas\/roseta_.+\.svg$/)

  // Cada distinción ocupa ~1/2, no todo el ancho.
  const anchoFila = await distinciones.evaluate((el) => el.clientWidth)
  const anchoCard = await distinciones
    .locator(".distincion")
    .first()
    .evaluate((el) => el.clientWidth)
  expect(anchoCard).toBeGreaterThan(anchoFila * 0.4)
  expect(anchoCard).toBeLessThan(anchoFila * 0.6)

  // Sin distinciones, la fila no aparece.
  await abrirResultado(page, "podio")
  await expect(page.getByTestId("distinciones")).toHaveCount(0)
})

test("el puesto aparece en todos los años en concurso", async ({ page }) => {
  for (const caso of [
    "campeon",
    "podio",
    "finalista",
    "preliminares",
    "sin-premios",
    "distinciones",
  ]) {
    await abrirResultado(page, caso)
    await expect(page.locator(".puesto")).toHaveCount(1)
  }

  // Fuera de concurso no hay puesto.
  await abrirResultado(page, "fuera-de-concurso")
  await expect(page.locator(".puesto")).toHaveCount(0)
})

test("el puesto pesa más que la fase", async ({ page }) => {
  await abrirResultado(page, "podio")
  const size = (sel: string) =>
    page
      .locator(sel)
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  expect(await size(".puesto")).toBeGreaterThan(await size(".fase"))
})

test("las distinciones salen en orden: aguja, candela y coplas al final", async ({
  page,
}) => {
  await abrirResultado(page, "todas")
  const tipos = await page
    .getByTestId("distinciones")
    .locator(".distincion")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-tipo")))
  expect(tipos).toEqual([
    "aguja_de_oro",
    "candela_y_espino",
    "copla_para_andalucia",
  ])
})

test("el texto de cada distinción toma el color de su roseta", async ({
  page,
}) => {
  await abrirResultado(page, "todas")
  const distinciones = page.getByTestId("distinciones")
  await expect(distinciones.locator(".distincion")).toHaveCount(3)

  const color = (tipo: string) =>
    distinciones
      .locator(`.distincion[data-tipo="${tipo}"] .distincion__nombre`)
      .evaluate((el) => getComputedStyle(el).color)

  expect(await color("aguja_de_oro")).toBe("rgb(245, 197, 66)") // oro
  expect(await color("copla_para_andalucia")).toBe("rgb(127, 195, 91)") // verde
  expect(await color("candela_y_espino")).toBe("rgb(228, 87, 76)") // rojo
})

test("el resultado usa el panel oscuro de las pantallas de creación", async ({
  page,
}) => {
  await abrirResultado(page)
  const fondo = await page
    .locator(".panel")
    .evaluate((el) => getComputedStyle(el).backgroundColor)
  // --c-superficie del tema oscuro por defecto (#141414).
  expect(fondo).toBe("rgb(20, 20, 20)")
})

test("sin scroll horizontal a 320 px y sin violaciones graves", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await abrirResultado(page, "distinciones")
  // La pantalla anima su entrada; se espera para analizar en reposo.
  await page.waitForTimeout(400)

  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  expect(desborda).toBe(false)

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze()
  const graves = violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => v.id)
  expect(graves).toEqual([])
})
