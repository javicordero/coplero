import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import {
  completarCarrera,
  crearPersonaje,
  elegirModalidadYVariante,
  enlaceCompartido,
} from "./apoyo/juego"

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
  await crearPersonaje(page, "El Chato")
  await elegirModalidadYVariante(page)
  await completarCarrera(page)
  // La entrada de pantalla anima 280 ms; se espera para medir/analizar en
  // reposo (si no, axe calcula contraste sobre elementos con opacity < 1).
  await page.waitForTimeout(400)
}

test("muestra la información esencial y las acciones acordadas", async ({
  page,
}) => {
  test.setTimeout(60_000)
  await jugarHastaFin(page)

  await expect(page.getByTestId("tarjeta-nombre")).toHaveText("El Chato")
  await expect(page.getByTestId("tarjeta-modalidad")).toBeVisible()
  await expect(page.getByTestId("tarjeta-estilo")).toBeVisible()
  await expect(page.getByTestId("tarjeta-mejor-posicion")).toBeVisible()

  // Contenido retirado.
  await expect(page.getByTestId("tarjeta-hitos")).toHaveCount(0)
  await expect(page.getByTestId("tarjeta-frase")).toHaveCount(0)
  await expect(page.getByTestId("tarjeta-trayectoria")).toHaveCount(0)

  // Acciones conservadas.
  await expect(page.getByTestId("compartir")).toBeVisible()
  await expect(page.getByTestId("descargar-9x16")).toBeVisible()
  await expect(page.getByTestId("reiniciar")).toBeVisible()

  // Acciones retiradas.
  await expect(page.getByTestId("copiar-texto")).toHaveCount(0)
  await expect(page.getByTestId("descargar-1x1")).toHaveCount(0)
  await expect(page.getByTestId("copiar-enlace")).toHaveCount(0)
})

test("el enlace reproduce la tarjeta y el código inválido es amable", async ({
  page,
}) => {
  test.setTimeout(60_000)
  await jugarHastaFin(page)

  const enlace = await enlaceCompartido(page)
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

  const enlace = await enlaceCompartido(page)
  await page.goto(enlace)
  await expect(page.getByTestId("tarjeta")).toBeVisible()
  expect(await violacionesGraves(page)).toEqual([])
})

test("la imagen OG se genera en los formatos 9:16, apaisado y 1:1", async ({
  page,
  request,
}) => {
  test.setTimeout(60_000)
  await jugarHastaFin(page)

  const codigo = await page.getByTestId("fin").getAttribute("data-codigo")
  expect(codigo).toBeTruthy()

  const formatos = [
    { t: "9x16", ancho: 1080, alto: 1920 },
    { t: "og", ancho: 1200, alto: 630 },
    { t: "1x1", ancho: 1080, alto: 1080 },
  ]

  for (const formato of formatos) {
    const respuesta = await request.get(`/api/og/${codigo}.png?t=${formato.t}`)
    expect(respuesta.status(), formato.t).toBe(200)
    expect(respuesta.headers()["content-type"], formato.t).toContain(
      "image/png",
    )

    const bytes = await respuesta.body()
    // Firma PNG.
    expect(bytes.subarray(0, 8).toString("hex"), formato.t).toBe(
      "89504e470d0a1a0a",
    )
    // Cabecera IHDR: ancho y alto (big-endian) en los offsets 16 y 20.
    expect(bytes.readUInt32BE(16), formato.t).toBe(formato.ancho)
    expect(bytes.readUInt32BE(20), formato.t).toBe(formato.alto)
  }
})

test("la tarjeta válida es indexable y el código inválido no", async ({
  page,
}) => {
  test.setTimeout(60_000)
  await jugarHastaFin(page)

  const enlace = await enlaceCompartido(page)
  await page.goto(enlace)
  await expect(page.getByTestId("tarjeta")).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)

  await page.goto("/r/codigo-invalido")
  await expect(page.getByTestId("codigo-invalido")).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})
