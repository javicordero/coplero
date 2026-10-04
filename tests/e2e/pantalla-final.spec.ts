import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

/** Abre la pantalla final en desarrollo, opcionalmente con un caso. */
async function abrirFin(
  page: import("@playwright/test").Page,
  caso?: string,
): Promise<void> {
  const url = caso ? `/jugar?dev=fin&caso=${caso}` : "/jugar?dev=fin"
  await page.goto(url)
  await expect(page.getByTestId("fin")).toBeVisible()
}

test("muestra el palmarés: identidad, mejor posición, línea temporal y distinciones", async ({
  page,
}) => {
  // Móvil: la línea temporal se reparte en varias filas.
  await page.setViewportSize({ width: 320, height: 640 })
  await abrirFin(page)

  await expect(page.getByTestId("tarjeta-nombre")).toHaveText("El Bauti")
  await expect(page.getByTestId("tarjeta-modalidad")).toHaveText("Comparsista")
  await expect(page.getByTestId("tarjeta-estilo")).toHaveText(
    "Evolución con raíces",
  )
  const mejor = page.getByTestId("tarjeta-mejor-posicion")
  await expect(mejor).toHaveAttribute("data-tono", "oro")
  await expect(mejor).toContainText("Mejor posición")
  await expect(mejor).toContainText("1º")

  // Línea temporal: debut + primeras veces por fase + premios, cronológica.
  const hitos = page.getByTestId("tarjeta-premios").locator(".hito")
  await expect(hitos).toHaveCount(11)
  const filas = page.getByTestId("tarjeta-premios").locator(".fila")
  expect(await filas.count()).toBeGreaterThanOrEqual(2)

  await expect(hitos.nth(0)).toContainText("2027")
  await expect(hitos.nth(0)).toContainText("Debut")
  await expect(hitos.nth(1)).toContainText("2028")
  await expect(hitos.nth(1)).toContainText("CF")
  await expect(hitos.nth(2)).toContainText("2029")
  await expect(hitos.nth(2)).toContainText("SF")
  // Final sin premio (4º): se ve el hito «F».
  await expect(hitos.nth(3)).toContainText("2030")
  await expect(hitos.nth(3)).toContainText("F")
  await expect(hitos.nth(10)).toContainText("2037")
  await expect(hitos.nth(4)).toHaveAttribute("data-puesto", "3")
  await expect(hitos.nth(5)).toHaveAttribute("data-puesto", "1")

  // Distinciones: una roseta por victoria, agrupadas por tipo.
  const distinciones = page.getByTestId("tarjeta-distinciones")
  await expect(distinciones.locator(".distincion")).toHaveCount(3)
  // El campeón acumula 1 aguja + 2 coplas + 1 candela = 4 rosetas.
  await expect(distinciones.locator(".roseta")).toHaveCount(4)
  await expect(
    distinciones.locator('[data-tipo="copla_para_andalucia"] .roseta'),
  ).toHaveCount(2)

  // Bloques retirados.
  await expect(page.getByTestId("tarjeta-hitos")).toHaveCount(0)
  await expect(page.getByTestId("tarjeta-trayectoria")).toHaveCount(0)
})

test("los premios del COAC se pintan como medallas (oro, plata, bronce)", async ({
  page,
}) => {
  await abrirFin(page)
  await expect(
    page.getByTestId("tarjeta-premios").locator(".hito.primero"),
  ).toHaveCount(3)

  const colorPuesto = (puesto: string) =>
    page
      .getByTestId("tarjeta-premios")
      .locator(`.hito[data-puesto="${puesto}"] .hito__puesto`)
      .first()
      .evaluate((el) => getComputedStyle(el).color)
  const colorNodo = (puesto: string) =>
    page
      .getByTestId("tarjeta-premios")
      .locator(`.hito[data-puesto="${puesto}"] .hito__nodo`)
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor)

  expect(await colorPuesto("1")).toBe("rgb(245, 197, 66)")
  expect(await colorPuesto("2")).toBe("rgb(203, 213, 219)")
  expect(await colorPuesto("3")).toBe("rgb(205, 127, 50)")
  expect(await colorNodo("1")).toBe("rgb(245, 197, 66)")
  expect(await colorNodo("2")).toBe("rgb(203, 213, 219)")
  expect(await colorNodo("3")).toBe("rgb(205, 127, 50)")
})

test("cada hito de fase lleva su color", async ({ page }) => {
  await abrirFin(page, "finalista")
  const color = (tono: string) =>
    page
      .getByTestId("tarjeta-premios")
      .locator(`.hito__hito[data-tono="${tono}"]`)
      .first()
      .evaluate((el) => getComputedStyle(el).color)
  expect(await color("preliminares")).toBe("rgb(168, 221, 140)")
  expect(await color("cuartos")).toBe("rgb(142, 192, 238)")
  expect(await color("semifinales")).toBe("rgb(74, 143, 216)")
  expect(await color("final")).toBe("rgb(154, 106, 208)")
})

test("la trayectoria muestra los hitos aunque no haya premios", async ({
  page,
}) => {
  await abrirFin(page, "retirada")
  await expect(
    page.getByTestId("tarjeta-premios").locator(".hito"),
  ).toHaveCount(1)
  await expect(page.getByTestId("tarjeta-premios")).toContainText("Debut")
  await expect(page.getByTestId("tarjeta-distinciones")).toHaveCount(0)

  await abrirFin(page, "sin-premios")
  await expect(
    page.getByTestId("tarjeta-premios").locator(".hito"),
  ).toHaveCount(2)
  await expect(page.getByTestId("tarjeta-premios")).toContainText("CF")
  await expect(page.getByTestId("tarjeta-distinciones")).toHaveCount(0)
})

test("un caso con muchas distinciones envuelve sin desbordar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await abrirFin(page, "distinciones")

  const distinciones = page.getByTestId("tarjeta-distinciones")
  await expect(distinciones.locator(".distincion")).toHaveCount(3)
  // 4 agujas + 3 coplas + 4 candelas = 11 rosetas.
  await expect(distinciones.locator(".roseta")).toHaveCount(11)
  await expect(
    distinciones.locator('[data-tipo="aguja_de_oro"] .roseta'),
  ).toHaveCount(4)
  await expect(
    distinciones.locator('[data-tipo="copla_para_andalucia"] .roseta'),
  ).toHaveCount(3)
  await expect(
    distinciones.locator('[data-tipo="candela_y_espino"] .roseta'),
  ).toHaveCount(4)

  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  expect(desborda).toBe(false)
})

test("el ejemplo de la portada usa el mismo palmarés", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByTestId("tarjeta-nombre")).toBeVisible()
  await expect(page.getByTestId("tarjeta-hitos")).toHaveCount(0)
})

test("sin scroll horizontal a 320 px y sin violaciones graves", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await abrirFin(page)

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
