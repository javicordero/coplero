import { expect, type Page, test } from "@playwright/test"
import {
  avanzar,
  clavePantalla,
  crearPersonaje,
  elegirModalidadYVariante,
  SELECTOR_PANTALLA,
} from "./apoyo/juego"

const TOL = 2
const TOL_MOMENTO = 1

interface Muestra {
  momento: string
  indX: number
  indY: number
  titY: number
  titH: number
  o1Y: number
  o1H: number
  o1TituloY: number
  o2Y: number
  o2H: number
  o2TituloY: number
  centroBloque: number
  centroMain: number
  texto: string
  dataTipo: string | null
}

async function caja(page: Page, selector: string, n = 0) {
  const loc = page.locator(selector).nth(n)
  await loc.waitFor({ state: "visible" })
  const caja = await loc.boundingBox()
  if (!caja) throw new Error(`sin caja para ${selector}[${n}]`)
  return caja
}

async function muestraDecision(page: Page): Promise<Muestra> {
  // Espera a las fuentes (evita medir con la reserva) y a la animación (280 ms).
  await esperarFuentes(page)
  await page.waitForTimeout(360)
  const indicador = page.locator('[data-testid="indicador"]')
  const ind = await caja(page, '[data-testid="indicador"]')
  const tit = await caja(page, '[data-bloque="titulo"]')
  const o1 = await caja(page, '[data-bloque="opcion"]', 0)
  const o2 = await caja(page, '[data-bloque="opcion"]', 1)
  const o1Titulo = await caja(page, '[data-bloque="opcion"] strong', 0)
  const o2Titulo = await caja(page, '[data-bloque="opcion"] strong', 1)
  const main = await caja(page, '[data-testid="juego"]')
  const sec = await caja(page, '[data-testid="decision"]')
  return {
    momento:
      (await page.locator("[data-pantalla]").getAttribute("data-momento")) ??
      "",
    indX: ind.x,
    indY: ind.y,
    titY: tit.y,
    titH: tit.height,
    o1Y: o1.y,
    o1H: o1.height,
    o1TituloY: o1Titulo.y,
    o2Y: o2.y,
    o2H: o2.height,
    o2TituloY: o2Titulo.y,
    centroBloque: sec.y + sec.height / 2,
    centroMain: main.y + main.height / 2,
    texto: (await indicador.innerText()).trim(),
    dataTipo: await indicador.getAttribute("data-tipo"),
  }
}

function rango(valores: number[]) {
  return Math.max(...valores) - Math.min(...valores)
}

/** Espera a que la fuente de display esté realmente cargada (evita el FOUT). */
async function esperarFuentes(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => document.fonts.check("1.6rem Anton"))
}

async function recorrerDecisiones(page: Page, max: number): Promise<Muestra[]> {
  const muestras: Muestra[] = []
  for (let i = 0; i < 60 && muestras.length < max; i++) {
    await page.waitForSelector(SELECTOR_PANTALLA)
    const clave = await clavePantalla(page)
    const pantalla = clave.split("|")[0]
    if (pantalla === "fin") break
    if (pantalla === "decision") muestras.push(await muestraDecision(page))
    await avanzar(page, clave)
  }
  return muestras
}

test("INV-1..INV-4 e INV-8 · decisión estable, centrada y sin tipo", async ({
  page,
}) => {
  test.setTimeout(180_000)
  for (const size of [
    { width: 390, height: 844 },
    { width: 480, height: 900 },
  ]) {
    await page.setViewportSize(size)
    await page.goto("/jugar")
    // El mismo contexto se reutiliza entre iteraciones: se limpia el guardado
    // de la vuelta anterior y se recarga para arrancar en `crear-personaje`.
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await crearPersonaje(page, "Estable")
    await elegirModalidadYVariante(page)
    await page.waitForSelector(SELECTOR_PANTALLA)

    const muestras = await recorrerDecisiones(page, 12)
    const momentos = new Set(muestras.map((m) => m.momento))
    const etiqueta = `${size.width}x${size.height}`

    expect(momentos.has("verano"), `${etiqueta}: sin verano`).toBe(true)
    expect(momentos.has("febrero"), `${etiqueta}: sin febrero`).toBe(true)

    const campos: Array<[string, number[]]> = [
      ["titulo.y", muestras.map((m) => m.titY)],
      ["opcion1.y", muestras.map((m) => m.o1Y)],
      ["opcion2.y", muestras.map((m) => m.o2Y)],
      ["opcion1.titulo.y", muestras.map((m) => m.o1TituloY)],
      ["opcion2.titulo.y", muestras.map((m) => m.o2TituloY)],
      ["indicador.x", muestras.map((m) => m.indX)],
      ["indicador.y", muestras.map((m) => m.indY)],
      ["titulo.alto", muestras.map((m) => m.titH)],
    ]
    for (const [nombre, valores] of campos) {
      const r = rango(valores)
      console.log(`[${etiqueta}] rango ${nombre} = ${r.toFixed(2)}`)
      expect(
        r,
        `${etiqueta}: ${nombre} se mueve ${r.toFixed(2)}px`,
      ).toBeLessThanOrEqual(TOL)
    }

    // INV-4: alternar verano↔febrero no desplaza (0 px, con redondeo subpíxel).
    const verano = muestras.find((m) => m.momento === "verano")
    const febrero = muestras.find((m) => m.momento === "febrero")
    if (verano && febrero) {
      expect(Math.abs(verano.indY - febrero.indY)).toBeLessThanOrEqual(
        TOL_MOMENTO,
      )
      expect(Math.abs(verano.titY - febrero.titY)).toBeLessThanOrEqual(
        TOL_MOMENTO,
      )
      expect(Math.abs(verano.o1Y - febrero.o1Y)).toBeLessThanOrEqual(
        TOL_MOMENTO,
      )
      expect(Math.abs(verano.o2Y - febrero.o2Y)).toBeLessThanOrEqual(
        TOL_MOMENTO,
      )
    }

    // Las dos primeras opciones miden lo mismo.
    for (const m of muestras) {
      expect(
        Math.abs(m.o1H - m.o2H),
        `${etiqueta}: opciones de distinto alto`,
      ).toBeLessThanOrEqual(1)
    }

    // Centrado visual del bloque situación + opciones.
    for (const m of muestras) {
      expect(
        Math.abs(m.centroBloque - m.centroMain),
        `${etiqueta}: bloque no centrado`,
      ).toBeLessThanOrEqual(2)
    }

    // INV-8: el indicador no muestra el tipo ni expone data-tipo.
    for (const m of muestras) {
      expect(m.texto).not.toMatch(/contenido|personaje/i)
      expect(m.dataTipo).toBeNull()
    }
  }
})

test("INV-5 · el resultado conserva el indicador alineado", async ({
  page,
}) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/jugar")
  await crearPersonaje(page, "Estable")
  await elegirModalidadYVariante(page)
  await page.waitForSelector(SELECTOR_PANTALLA)

  let indDecision: number | null = null
  for (let i = 0; i < 60; i++) {
    await page.waitForSelector(SELECTOR_PANTALLA)
    const clave = await clavePantalla(page)
    const pantalla = clave.split("|")[0]
    if (pantalla === "fin") break

    if (pantalla === "decision") {
      await page.waitForTimeout(360)
      indDecision = (await caja(page, '[data-testid="indicador"]')).y
    }

    if (pantalla === "resultado") {
      await page.waitForTimeout(360)
      const ind = await caja(page, '[data-testid="indicador"]')
      const texto = (
        await page.locator('[data-testid="indicador"]').innerText()
      ).trim()
      expect(indDecision, "sin muestra de decisión").not.toBeNull()
      expect(Math.abs(ind.y - (indDecision ?? 0))).toBeLessThanOrEqual(TOL)
      expect(texto).toMatch(/Año\s*\d+/i)
      expect(texto).toMatch(/Resultado/i)
      expect(texto).not.toMatch(/contenido|personaje/i)
      return
    }

    await avanzar(page, clave)
  }
  throw new Error("No se alcanzó la pantalla de resultado")
})

test("INV-6 e INV-7 · sin scroll horizontal ni desbordes a 320 px", async ({
  page,
}) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto("/jugar")
  await crearPersonaje(page, "Estable")
  await elegirModalidadYVariante(page)
  await page.waitForSelector(SELECTOR_PANTALLA)

  for (let i = 0; i < 60; i++) {
    await page.waitForSelector(SELECTOR_PANTALLA)
    const clave = await clavePantalla(page)
    const pantalla = clave.split("|")[0]
    if (pantalla === "fin") break

    if (pantalla === "decision") {
      await esperarFuentes(page)
      await page.waitForTimeout(360)
      const desborda = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      )
      expect(desborda, "scroll horizontal a 320 px").toBe(false)

      // Se mide el desborde real (cajas de los descendientes), no scrollHeight:
      // estos bloques reportan un scrollHeight inflado constante (~4 px).
      // En las opciones se permite rebasar la caja mientras no se solapen con la
      // siguiente opción (decisión de diseño 016).
      const desbordes = await page.evaluate(() => {
        const salida: string[] = []
        const opciones = [
          ...document.querySelectorAll<HTMLElement>('[data-bloque="opcion"]'),
        ]
        const bloques = document.querySelectorAll<HTMLElement>(
          '[data-bloque="titulo"], [data-bloque="texto"], [data-bloque="opcion"]',
        )
        for (const el of bloques) {
          const caja = el.getBoundingClientRect()
          let fondo = caja.top
          for (const hijo of el.querySelectorAll("*")) {
            fondo = Math.max(fondo, hijo.getBoundingClientRect().bottom)
          }
          let limite = caja.bottom
          if (el.dataset.bloque === "opcion") {
            const i = opciones.indexOf(el)
            limite =
              i >= 0 && i + 1 < opciones.length
                ? opciones[i + 1].getBoundingClientRect().top
                : (el.parentElement?.getBoundingClientRect().bottom ??
                  caja.bottom)
          }
          if (fondo > limite + 1) {
            salida.push(
              `${el.dataset.bloque}: ${Math.round(fondo - caja.top)}>${Math.round(limite - caja.top)}`,
            )
          }
        }
        return salida
      })
      expect(desbordes, "bloques desbordados a 320 px").toEqual([])
    }

    await avanzar(page, clave)
  }
})
