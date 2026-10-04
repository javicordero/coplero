import { expect, test } from "@playwright/test"

test("la pantalla final no usa el fondo estacional", async ({ page }) => {
  for (const momento of ["verano", "febrero"]) {
    await page.goto(`/jugar?dev=fin&momento=${momento}`)
    await expect(page.getByTestId("fin")).toBeVisible()

    const main = page.getByTestId("juego")
    await expect(main, `data-momento en ${momento}`).toHaveAttribute(
      "data-momento",
      "",
    )

    const fondo = await main.evaluate(
      (el) => getComputedStyle(el).backgroundImage,
    )
    expect(fondo, `fondo en ${momento}`).toBe("none")
    await expect(page.locator(".lluvia"), `lluvia en ${momento}`).toHaveCount(0)
  }
})

test("el antetítulo va fuera de la tarjeta, sobre el nombre", async ({
  page,
}) => {
  await page.goto("/jugar?dev=fin")
  await expect(page.getByTestId("fin")).toBeVisible()

  const antetitulo = page.locator('[data-testid="fin"] .antetitulo')
  await expect(antetitulo).toBeVisible()
  await expect(antetitulo).toHaveText(/carrera finalizada/i)

  const estilo = await antetitulo.evaluate((el) => {
    const s = getComputedStyle(el)
    return { color: s.color, transform: s.textTransform }
  })
  expect(estilo.transform).toBe("uppercase")
  expect(estilo.color).toBe("rgb(179, 189, 202)")

  const estaEncima = await page.evaluate(() => {
    const a = document.querySelector('[data-testid="fin"] .antetitulo')
    const n = document.querySelector('[data-testid="tarjeta-nombre"]')
    if (!a || !n) return false
    return a.getBoundingClientRect().bottom <= n.getBoundingClientRect().top
  })
  expect(estaEncima).toBe(true)
})

test("los botones y el antetítulo quedan fuera de la tarjeta compartible", async ({
  page,
}) => {
  await page.goto("/jugar?dev=fin")
  await expect(page.getByTestId("fin")).toBeVisible()

  const dentro = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="tarjeta"]')
    if (!t) return { botones: true, antetitulo: true }
    return {
      botones: t.querySelector('[data-testid="compartir"]') !== null,
      antetitulo: t.querySelector(".antetitulo") !== null,
    }
  })
  expect(dentro.botones).toBe(false)
  expect(dentro.antetitulo).toBe(false)
})
