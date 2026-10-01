import type { Page } from "@playwright/test"

export const SELECTOR_PANTALLA =
  '[data-pantalla="decision"], [data-pantalla="resultado"], [data-pantalla="cambio-variante"], [data-pantalla="fin"]'

export function clavePantalla(page: Page): Promise<string> {
  return page.locator("[data-pantalla]").evaluate((el) => {
    const root = el as HTMLElement
    return [
      root.getAttribute("data-pantalla"),
      root.getAttribute("data-momento"),
      root.getAttribute("data-ano"),
    ].join("|")
  })
}

export async function esperarClave(page: Page, clave: string): Promise<void> {
  await page.waitForFunction((esperada) => {
    const root = document.querySelector("[data-pantalla]")
    if (!root) return false
    const actual = [
      root.getAttribute("data-pantalla"),
      root.getAttribute("data-momento"),
      root.getAttribute("data-ano"),
    ].join("|")
    return actual === esperada
  }, clave)
}

export async function crearPersonaje(
  page: Page,
  nombre: string,
): Promise<void> {
  await page.getByLabel("Nombre o apodo").fill(nombre)
  await page.getByTestId("crear").click()
}

export async function elegirModalidadYVariante(page: Page): Promise<void> {
  await page.locator('[data-testid="modalidad"] button').first().click()
  await page.locator('[data-testid="variante"] button').first().click()
}

export async function avanzar(page: Page, clavePrevia: string): Promise<void> {
  const pantalla = clavePrevia.split("|")[0]

  if (pantalla === "decision") {
    await page.locator('[data-testid="decision"] button').first().click()
  } else if (pantalla === "resultado") {
    await page.getByTestId("continuar-ano").click()
  } else if (pantalla === "cambio-variante" || pantalla === "variante") {
    await page.locator('[data-testid="variante"] button').first().click()
  } else {
    throw new Error(`Pantalla inesperada en el bucle: ${pantalla}`)
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
}

export async function completarCarrera(page: Page): Promise<void> {
  await page.waitForSelector(SELECTOR_PANTALLA)

  for (let pasos = 0; pasos < 400; pasos += 1) {
    const clave = await clavePantalla(page)
    if (clave.split("|")[0] === "fin") return
    await avanzar(page, clave)
  }

  throw new Error("La carrera no terminó en 400 pasos")
}

export async function enlaceCompartido(page: Page): Promise<string> {
  await page.getByTestId("copiar-enlace").click()
  return page.evaluate(() => navigator.clipboard.readText())
}
