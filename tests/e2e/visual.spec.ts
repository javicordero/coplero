import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const ESTATICAS = [
  "/",
  "/como-jugar",
  "/politicas/politica-de-privacidad",
  "/politicas/politica-de-cookies",
  "/r/codigo-invalido",
]

const TODAS = [...ESTATICAS, "/jugar"]

/** E-01 — WCAG 2.2 AA sin violaciones en todas las superficies. */
test("E-01 · todas las rutas pasan axe WCAG 2.2 AA", async ({ page }) => {
  for (const ruta of TODAS) {
    await page.goto(ruta)
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze()
    const resumen = violations.map((v) => `${v.id} (${v.impact}): ${v.help}`)
    expect(resumen, `axe en ${ruta}`).toEqual([])
  }
})

/** E-02 — mobile-first real: nada se sale a 320 px. */
test("E-02 · sin scroll horizontal desde 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  for (const ruta of TODAS) {
    await page.goto(ruta)
    const desborda = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(desborda, `scroll horizontal en ${ruta}`).toBe(false)
  }
})

/** E-06 — las páginas estáticas no ejecutan JavaScript propio. */
test("E-06 · las estáticas no cargan script de aplicación", async ({
  page,
}) => {
  // En `astro dev` el servidor inyecta su propio cliente (HMR y barra de
  // desarrollo) y sirve el CSS como módulo JS: se excluye lo uno y lo otro,
  // porque en el build el CSS es un <link>. La comprobación autoritativa es el
  // build (T039).
  const toolingDeDesarrollo =
    /\/@vite\/|\/@id\/|astro-dev-toolbar|\/node_modules\//
  const cssDeDesarrollo = /type=style|\.css(\?|$)/

  for (const ruta of ESTATICAS) {
    const scripts: string[] = []
    page.on("request", (peticion) => {
      if (peticion.resourceType() === "script") scripts.push(peticion.url())
    })

    await page.goto(ruta)
    await page.waitForLoadState("networkidle")

    const aplicacion = scripts.filter(
      (url) => !toolingDeDesarrollo.test(url) && !cssDeDesarrollo.test(url),
    )
    expect(aplicacion, `scripts en ${ruta}`).toEqual([])

    const inline = await page.evaluate(
      () =>
        [...document.querySelectorAll("script:not([src])")].filter(
          (script) => !script.textContent.includes("__astro_dev_toolbar__"),
        ).length,
    )
    expect(inline, `scripts inline en ${ruta}`).toBe(0)

    page.removeAllListeners("request")
  }
})

/** E-08 — el texto escala y la prosa mantiene una medida legible. */
test("E-08 · el texto al 200 % no rompe el layout", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  for (const ruta of TODAS) {
    await page.goto(ruta)
    const desborda = await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%"
      return document.documentElement.scrollWidth > window.innerWidth + 1
    })
    expect(desborda, `scroll al 200 % en ${ruta}`).toBe(false)
  }
})

test("E-08 · la prosa no supera 75 caracteres de ancho", async ({ page }) => {
  for (const ruta of ["/", "/como-jugar"]) {
    await page.goto(ruta)
    const resultado = await page.evaluate(() => {
      const sonda = document.createElement("span")
      sonda.textContent = "0".repeat(75)
      sonda.style.cssText =
        "position:absolute;visibility:hidden;white-space:pre;font-size:1rem"
      document.body.appendChild(sonda)
      const anchoMaximo = sonda.getBoundingClientRect().width
      sonda.remove()

      const anchos = [...document.querySelectorAll("main p")].map(
        (p) => p.getBoundingClientRect().width,
      )
      return { anchoMaximo, anchos }
    })

    for (const ancho of resultado.anchos) {
      expect(ancho).toBeLessThanOrEqual(resultado.anchoMaximo + 1)
    }
  }
})

/** E-03 — objetivo táctil cómodo. Se excluyen los enlaces dentro de un texto
 *  (excepción de la propia norma: van en la línea del texto que los contiene). */
test("E-03 · los controles miden al menos 44×44 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const ruta of TODAS) {
    await page.goto(ruta)
    const pequenos = await page.evaluate(() => {
      const salida: string[] = []
      const elementos = document.querySelectorAll(
        "button, input, select, summary, a",
      )
      for (const el of elementos) {
        const estilo = getComputedStyle(el)
        if (estilo.display === "inline" || estilo.visibility === "hidden")
          continue
        const caja = el.getBoundingClientRect()
        if (caja.width === 0 && caja.height === 0) continue
        if (caja.width < 44 || caja.height < 44) {
          salida.push(
            `${el.tagName.toLowerCase()}.${String(el.className)} ${Math.round(caja.width)}×${Math.round(caja.height)}`,
          )
        }
      }
      return salida
    })
    expect(pequenos, `objetivos pequeños en ${ruta}`).toEqual([])
  }
})

/** E-04 — el foco se ve al navegar con teclado. */
test("E-04 · el primer control de cada pantalla muestra el foco", async ({
  page,
}) => {
  for (const ruta of TODAS) {
    await page.goto(ruta)
    await page.keyboard.press("Tab")
    const foco = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const estilo = getComputedStyle(el)
      return {
        etiqueta: el.tagName.toLowerCase(),
        ancho: Number.parseFloat(estilo.outlineWidth),
        estilo: estilo.outlineStyle,
      }
    })
    expect(foco, `sin foco en ${ruta}`).not.toBeNull()
    expect(foco?.estilo, `outline en ${ruta}`).not.toBe("none")
    expect(foco?.ancho ?? 0, `grosor de outline en ${ruta}`).toBeGreaterThan(0)
  }
})

/** E-05 — la reducción de movimiento neutraliza transiciones y animaciones. */
test("E-05 · con prefers-reduced-motion no hay movimiento", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const ruta of TODAS) {
    await page.goto(ruta)
    const maximo = await page.evaluate(() => {
      const aMs = (valor: string) =>
        Math.max(
          ...valor.split(",").map((parte) => {
            const n = Number.parseFloat(parte)
            return parte.includes("ms") ? n : n * 1000
          }),
        )
      let maximo = 0
      for (const el of document.querySelectorAll(
        "button, a, main, section, article, details, summary, svg",
      )) {
        const estilo = getComputedStyle(el)
        maximo = Math.max(
          maximo,
          aMs(estilo.transitionDuration),
          aMs(estilo.animationDuration),
        )
      }
      return maximo
    })
    expect(maximo, `movimiento en ${ruta}`).toBeLessThanOrEqual(1)
  }
})
