import { expect, type Page, test } from "@playwright/test"

const TOL = 2

/** Alfa de un color computado: `rgb(...)` = 1; `rgba(..., a)` = a. */
function alfa(color: string): number {
  const m = color.match(/^rgba?\(([^)]+)\)$/)
  if (!m) return 0
  const partes = m[1].split(",").map((s) => s.trim())
  return partes.length < 4 ? 1 : Number.parseFloat(partes[3])
}

/** Espera a que la fuente de display esté cargada (evita medir con la reserva). */
async function esperarFuentes(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => document.fonts.check("1.6rem Anton"))
}

interface Cabecera {
  h2Top: number | null
  pTop: number | null
  h2Style: Record<string, string>
  pStyle: Record<string, string> | null
}

async function medirCabecera(page: Page, testid: string): Promise<Cabecera> {
  const seccion = page.locator(`[data-testid="${testid}"]`)
  await seccion.waitFor({ state: "visible" })
  // La entrada de pantalla anima 280 ms; se espera para medir en reposo.
  await page.waitForTimeout(360)

  const h2 = seccion.locator("h2")
  const subtitulo = seccion.locator("p").first()

  const h2Box = await h2.boundingBox()
  const pBox = (await subtitulo.count()) ? await subtitulo.boundingBox() : null

  const h2Style = await h2.evaluate((el) => {
    const c = getComputedStyle(el)
    return {
      font: c.fontFamily,
      size: c.fontSize,
      color: c.color,
      transform: c.textTransform,
    }
  })
  const pStyle = pBox
    ? await subtitulo.evaluate((el) => {
        const c = getComputedStyle(el)
        return {
          font: c.fontFamily,
          size: c.fontSize,
          color: c.color,
          transform: c.textTransform,
        }
      })
    : null

  return { h2Top: h2Box?.y ?? null, pTop: pBox?.y ?? null, h2Style, pStyle }
}

test("la cabecera del flujo previo cae en la misma posición y con el mismo estilo", async ({
  page,
}) => {
  test.setTimeout(90_000)

  for (const size of [
    { width: 390, height: 844 },
    { width: 390, height: 700 },
    { width: 480, height: 900 },
  ]) {
    await page.setViewportSize(size)
    await page.goto("/jugar")
    await esperarFuentes(page)

    await page.getByTestId("empezar").click()
    const crear = await medirCabecera(page, "crear-personaje")

    await page.getByLabel("Nombre o apodo").fill("Estable")
    await page.getByTestId("crear").click()
    const modalidad = await medirCabecera(page, "modalidad")

    await page.locator('[data-testid="modalidad"] button').first().click()
    const variante = await medirCabecera(page, "variante")

    const etiqueta = `${size.width}x${size.height}`

    expect(crear.h2Top, `${etiqueta}: sin título en creación`).not.toBeNull()
    expect(
      Math.abs((crear.h2Top ?? 0) - (modalidad.h2Top ?? 0)),
      `${etiqueta}: título modalidad desalineado`,
    ).toBeLessThanOrEqual(TOL)
    expect(
      Math.abs((crear.h2Top ?? 0) - (variante.h2Top ?? 0)),
      `${etiqueta}: título variante desalineado`,
    ).toBeLessThanOrEqual(TOL)

    expect(
      Math.abs((crear.pTop ?? 0) - (modalidad.pTop ?? 0)),
      `${etiqueta}: subtítulo desalineado`,
    ).toBeLessThanOrEqual(TOL)

    expect(modalidad.h2Style, `${etiqueta}: estilo de título distinto`).toEqual(
      crear.h2Style,
    )
    expect(
      modalidad.pStyle,
      `${etiqueta}: estilo de subtítulo distinto`,
    ).toEqual(crear.pStyle)
  }
})

test("el flujo previo no desborda en horizontal a 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto("/jugar")

  const desborde = () =>
    page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    )

  await page.getByTestId("empezar").click()
  await expect(page.getByTestId("crear-personaje")).toBeVisible()
  expect(await desborde()).toBeLessThanOrEqual(0)

  await page.getByLabel("Nombre o apodo").fill("Estable")
  await page.getByTestId("crear").click()
  await expect(page.getByTestId("modalidad")).toBeVisible()
  expect(await desborde()).toBeLessThanOrEqual(0)
})

test("no hay textura de puntos en ninguna pantalla", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  for (const ruta of ["/", "/jugar"]) {
    await page.goto(ruta)
    await esperarFuentes(page)
    await expect(page.locator("body")).not.toHaveClass(/textura-puntos/)
  }

  await page.getByTestId("empezar").click()
  await expect(page.getByTestId("crear-personaje")).toBeVisible()
  await expect(page.locator("body")).not.toHaveClass(/textura-puntos/)

  await page.getByLabel("Nombre o apodo").fill("Sin textura")
  await page.getByTestId("crear").click()
  await expect(page.getByTestId("modalidad")).toBeVisible()
  await expect(page.locator("body")).not.toHaveClass(/textura-puntos/)
})

test("el header es negro, sticky y no altera la altura de cabecera", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })

  // Portada (larga): el header se sobrepone al hacer scroll.
  await page.goto("/")
  await esperarFuentes(page)

  const header = page.locator(".site-header")
  const estilo = await header.evaluate((el) => {
    const c = getComputedStyle(el)
    return { position: c.position, top: c.top, bg: c.backgroundColor }
  })
  expect(estilo.position).toBe("sticky")
  expect(estilo.top).toBe("0px")
  expect(alfa(estilo.bg)).toBe(1)

  await page.evaluate(() => window.scrollTo(0, 600))
  await page.waitForTimeout(200)
  const caja = await header.boundingBox()
  expect(caja?.y ?? -1).toBeLessThanOrEqual(1)

  // En /jugar, `--alto-cabecera` sigue midiendo el header (sticky no lo saca
  // del flujo, así que los `100dvh - cabecera` no cambian).
  await page.goto("/jugar")
  await esperarFuentes(page)
  await page.getByTestId("empezar").click()
  await page.waitForTimeout(150)

  const altoVar = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--alto-cabecera")
      .trim(),
  )
  const altoHeader = await page
    .locator(".site-header")
    .evaluate((el) => `${(el as HTMLElement).offsetHeight}px`)
  expect(altoVar).toBe(altoHeader)
})
