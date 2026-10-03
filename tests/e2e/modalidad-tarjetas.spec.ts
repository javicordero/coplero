import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"
import { crearPersonaje } from "./apoyo/juego"

/** Arranca el juego limpio y llega a la pantalla de modalidad. */
async function irAModalidad(page: Page): Promise<void> {
  await page.goto("/jugar")
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await crearPersonaje(page, "Modalidad")
  await expect(page.getByTestId("modalidad")).toBeVisible()
}

/** Arranca limpio y llega a la pantalla de variante. */
async function irAVariante(page: Page): Promise<void> {
  await irAModalidad(page)
  await page.locator('[data-testid="modalidad"] .tarjeta').first().click()
  await expect(page.getByTestId("variante")).toBeVisible()
}

function desbordeHorizontal(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
}

test("las tarjetas muestran la modalidad misma y los subtítulos en cursiva", async ({
  page,
}) => {
  await irAModalidad(page)

  const tarjetas = page.locator('[data-testid="modalidad"] .tarjeta')
  await expect(tarjetas).toHaveCount(2)

  await expect(tarjetas.nth(0).locator("strong")).toHaveText("Comparsa")
  await expect(tarjetas.nth(1).locator("strong")).toHaveText("Chirigota")

  const pantalla = page.getByTestId("modalidad")
  await expect(pantalla).not.toContainText("Comparsista")
  await expect(pantalla).not.toContainText("Chirigotero")

  for (const i of [0, 1]) {
    const subtitulo = tarjetas.nth(i).locator(".tarjeta__subtitulo")
    expect(
      await subtitulo.evaluate((el) => getComputedStyle(el).fontStyle),
      `subtítulo ${i} en cursiva`,
    ).toBe("italic")
  }

  await expect(tarjetas.nth(0).locator(".tarjeta__subtitulo")).toHaveText(
    "“¡Pasión, decía Paco Alba, la comparsa es pasión!”",
  )
  await expect(tarjetas.nth(1).locator(".tarjeta__subtitulo")).toHaveText(
    "“Humor, tipo y crítica desde la calle.”",
  )

  // Elegir sigue resolviéndose en un solo toque.
  await tarjetas.nth(0).click()
  await expect(page.getByTestId("variante")).toBeVisible()
})

test("cada modalidad muestra su icono directo en el color del subtítulo", async ({
  page,
}) => {
  await irAModalidad(page)

  const tarjetas = page.locator('[data-testid="modalidad"] .tarjeta')
  const iconos = page.locator('[data-testid="modalidad"] .tarjeta__icono')
  await expect(iconos).toHaveCount(2)

  for (const i of [0, 1]) {
    const icono = iconos.nth(i)
    await expect(icono).toHaveAttribute("aria-hidden", "true")

    // El icono es un SVG inline visible, sin máscara ni recorte.
    await expect(icono).toHaveJSProperty("tagName", "svg")
    const caja = await icono.boundingBox()
    expect(caja?.width ?? 0).toBeGreaterThan(0)
    expect(caja?.height ?? 0).toBeGreaterThan(0)

    const colorSubtitulo = await tarjetas
      .nth(i)
      .locator(".tarjeta__subtitulo")
      .evaluate((el) => getComputedStyle(el).color)
    expect(await icono.evaluate((el) => getComputedStyle(el).color)).toBe(
      colorSubtitulo,
    )
  }

  // El nombre accesible no incluye el icono.
  const opcion = page.getByRole("button", { name: /Chirigota/ })
  await expect(opcion).toHaveCount(1)
})

test("la pantalla de variante usa el mismo tratamiento y sus iconos", async ({
  page,
}) => {
  await irAVariante(page)

  const pantalla = page.getByTestId("variante")
  await expect(pantalla.locator("h2")).toHaveText("Elige tu estilo")

  const tarjetas = pantalla.locator(".tarjeta")
  const total = await tarjetas.count()
  expect(total).toBeGreaterThan(0)

  // Una tarjeta por variante, todas con icono decorativo.
  await expect(pantalla.locator(".tarjeta__icono")).toHaveCount(total)

  for (let i = 0; i < total; i += 1) {
    const icono = tarjetas.nth(i).locator(".tarjeta__icono")
    await expect(icono).toHaveAttribute("aria-hidden", "true")
    const caja = await icono.boundingBox()
    expect(caja?.width ?? 0).toBeGreaterThan(0)

    const subtitulo = tarjetas.nth(i).locator(".tarjeta__subtitulo")
    const esCita = await subtitulo.evaluate((el) =>
      el.classList.contains("tarjeta__subtitulo--cita"),
    )
    expect(
      await subtitulo.evaluate((el) => getComputedStyle(el).fontStyle),
      `subtítulo ${i}: cursiva si es cita`,
    ).toBe(esCita ? "italic" : "normal")

    const colorSubtitulo = await subtitulo.evaluate(
      (el) => getComputedStyle(el).color,
    )
    expect(await icono.evaluate((el) => getComputedStyle(el).color)).toBe(
      colorSubtitulo,
    )
  }

  // Iconos por variante (comparsa): bigote, raíces y nueva escuela.
  await expect(tarjetas.nth(0).locator(".tarjeta__icono--bigote")).toHaveCount(
    1,
  )
  await expect(tarjetas.nth(1).locator(".tarjeta__icono--raices")).toHaveCount(
    1,
  )
  await expect(
    tarjetas.nth(2).locator(".tarjeta__icono--nueva-escuela"),
  ).toHaveCount(1)

  // Elegir sigue resolviéndose en un solo toque.
  await tarjetas.first().click()
  await expect(pantalla).toHaveCount(0)
})

test("las variantes de chirigota van en orden y marcan sus citas", async ({
  page,
}) => {
  await irAModalidad(page)
  await page.locator('[data-testid="modalidad"] .tarjeta').nth(1).click()

  const pantalla = page.getByTestId("variante")
  await expect(pantalla).toBeVisible()

  const titulos = await pantalla.locator(".tarjeta strong").allTextContents()
  expect(titulos).toEqual([
    "Clásico",
    "Interpretar el personaje",
    "Lolosedismo",
  ])

  const tarjetas = pantalla.locator(".tarjeta")
  const estilos = await tarjetas
    .locator(".tarjeta__subtitulo")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).fontStyle))
  expect(estilos).toEqual(["italic", "italic", "normal"])

  // Las variantes de chirigota usan la guitarra.
  await expect(pantalla.locator(".tarjeta__icono--guitarra")).toHaveCount(3)

  await expect(tarjetas.nth(0).locator(".tarjeta__subtitulo")).toHaveText(
    "“Vuelve ya el 3x4, el 3x4 bueno”",
  )
  await expect(tarjetas.nth(1).locator(".tarjeta__subtitulo")).toHaveText(
    "“Aquí, de toda la vida, se han cantao pasodobles pa que vibre el coliseo, aquí no deberían permitirse pasodobles de cachondeo”",
  )
})

test("sin scroll horizontal a 320 y 390 px en modalidad y variante", async ({
  page,
}) => {
  for (const size of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size)
    await irAModalidad(page)
    expect(
      await desbordeHorizontal(page),
      `modalidad ${size.width}px`,
    ).toBeLessThanOrEqual(0)

    await page.locator('[data-testid="modalidad"] .tarjeta').first().click()
    await expect(page.getByTestId("variante")).toBeVisible()
    expect(
      await desbordeHorizontal(page),
      `variante ${size.width}px`,
    ).toBeLessThanOrEqual(0)
  }
})

test("modalidad y variante pasan WCAG 2.2 AA", async ({ page }) => {
  const graves = async () => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze()
    return violations
      .filter((v) => v.impact === "critical" || v.impact === "serious")
      .map((v) => v.id)
  }

  await irAModalidad(page)
  // La entrada de pantalla anima 280 ms; se espera para analizar en reposo.
  await page.waitForTimeout(360)
  expect(await graves(), "modalidad").toEqual([])

  await page.locator('[data-testid="modalidad"] .tarjeta').first().click()
  await expect(page.getByTestId("variante")).toBeVisible()
  await page.waitForTimeout(360)
  expect(await graves(), "variante").toEqual([])
})
