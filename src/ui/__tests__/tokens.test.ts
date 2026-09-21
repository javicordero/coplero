import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { AA_NO_TEXTO, AA_TEXTO, AAA_TEXTO, ratio } from "../contraste"
import { COLOR, MOVIMIENTO, TIPOGRAFIA, TOKENS } from "../tokens"

const RUTA_TOKENS_CSS = fileURLToPath(new URL("../tokens.css", import.meta.url))
const RUTA_BASE_CSS = fileURLToPath(new URL("../base.css", import.meta.url))
const RUTA_SRC = fileURLToPath(new URL("../..", import.meta.url))
const RUTA_PUBLIC = fileURLToPath(
  new URL("../../../public/fonts", import.meta.url),
)

const cssTokens = readFileSync(RUTA_TOKENS_CSS, "utf8")
const cssBase = readFileSync(RUTA_BASE_CSS, "utf8")

/** V-01 / V-02 — contraste de cada par declarado en contracts/ui.md §2. */
describe("V-01/V-02 contraste de la paleta", () => {
  const pares: Array<[string, string, string, number]> = [
    ["texto sobre fondo", COLOR.texto, COLOR.fondo, AAA_TEXTO],
    ["texto sobre superficie", COLOR.texto, COLOR.superficie, AAA_TEXTO],
    [
      "texto sobre superficie alta",
      COLOR.texto,
      COLOR.superficieAlta,
      AAA_TEXTO,
    ],
    ["texto suave sobre fondo", COLOR.textoSuave, COLOR.fondo, AA_TEXTO],
    [
      "texto suave sobre superficie",
      COLOR.textoSuave,
      COLOR.superficie,
      AA_TEXTO,
    ],
    [
      "texto suave sobre superficie alta",
      COLOR.textoSuave,
      COLOR.superficieAlta,
      AA_TEXTO,
    ],
    ["acento sobre fondo", COLOR.acento, COLOR.fondo, AA_TEXTO],
    ["acento sobre superficie", COLOR.acento, COLOR.superficie, AA_TEXTO],
    [
      "acento sobre superficie alta",
      COLOR.acento,
      COLOR.superficieAlta,
      AA_TEXTO,
    ],
    ["acento 2 sobre fondo", COLOR.acento2, COLOR.fondo, AA_TEXTO],
    ["acento 2 sobre superficie", COLOR.acento2, COLOR.superficie, AA_TEXTO],
    [
      "acento 2 sobre superficie alta",
      COLOR.acento2,
      COLOR.superficieAlta,
      AA_TEXTO,
    ],
    ["error sobre fondo", COLOR.error, COLOR.fondo, AA_TEXTO],
    ["error sobre superficie", COLOR.error, COLOR.superficie, AA_TEXTO],
    ["texto sobre acento", COLOR.sobreAcento, COLOR.acento, AA_TEXTO],
    [
      "texto sobre acento fuerte",
      COLOR.sobreAcento,
      COLOR.acentoFuerte,
      AA_TEXTO,
    ],
    ["texto sobre acento 2", COLOR.sobreAcento, COLOR.acento2, AA_TEXTO],
    [
      "borde de control sobre fondo",
      COLOR.bordeControl,
      COLOR.fondo,
      AA_NO_TEXTO,
    ],
    [
      "borde de control sobre superficie",
      COLOR.bordeControl,
      COLOR.superficie,
      AA_NO_TEXTO,
    ],
    [
      "borde de control sobre superficie alta",
      COLOR.bordeControl,
      COLOR.superficieAlta,
      AA_NO_TEXTO,
    ],
  ]

  for (const [nombre, primerPlano, fondo, minimo] of pares) {
    it(`${nombre} cumple ${minimo}:1`, () => {
      expect(ratio(primerPlano, fondo)).toBeGreaterThanOrEqual(minimo)
    })
  }

  it("el separador es decorativo: no se le exige 3:1 (WCAG 1.4.11 no aplica)", () => {
    expect(ratio(COLOR.separador, COLOR.fondo)).toBeLessThan(AA_NO_TEXTO)
  })
})

/** V-03 — tokens.css y tokens.ts no pueden divergir. */
describe("V-03 integridad CSS ↔ TS", () => {
  const enCss = new Map<string, string>()
  for (const coincidencia of cssTokens.matchAll(
    /(--[a-z0-9-]+):\s*([^;]+);/g,
  )) {
    enCss.set(coincidencia[1], coincidencia[2].trim())
  }

  it("declaran exactamente los mismos tokens", () => {
    expect([...enCss.keys()].sort()).toEqual(Object.keys(TOKENS).sort())
  })

  it("no hay valores divergentes", () => {
    const divergentes = Object.entries(TOKENS).filter(
      ([nombre, valor]) => enCss.get(nombre) !== valor,
    )
    expect(divergentes).toEqual([])
  })
})

/** V-04 — la deuda de colores sueltos no puede volver. */
describe("V-04 sin colores literales fuera del sistema", () => {
  const EXCLUIDOS = ["ui", "panel-ui", "engine", "content"]
  const EXTENSIONES = [".astro", ".svelte", ".css", ".ts", ".mjs", ".js"]
  const HEX = /#[0-9a-fA-F]{3,8}\b/g

  function ficheros(dir: string): string[] {
    const salida: string[] = []
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const ruta = join(dir, entrada.name)
      if (entrada.isDirectory()) salida.push(...ficheros(ruta))
      else salida.push(ruta)
    }
    return salida
  }

  it("ningún literal hex en las superficies migradas", () => {
    const infracciones: string[] = []
    for (const ruta of ficheros(RUTA_SRC)) {
      const relativa = relative(RUTA_SRC, ruta).replace(/\\/g, "/")
      const carpeta = relativa.split("/")[0]
      if (EXCLUIDOS.includes(carpeta)) continue
      if (!EXTENSIONES.some((ext) => ruta.endsWith(ext))) continue

      readFileSync(ruta, "utf8")
        .split("\n")
        .forEach((linea, indice) => {
          for (const coincidencia of linea.matchAll(HEX)) {
            infracciones.push(`${relativa}:${indice + 1} → ${coincidencia[0]}`)
          }
        })
    }
    expect(infracciones).toEqual([])
  })
})

/** V-05 — escala tipográfica sana. */
describe("V-05 escala tipográfica", () => {
  const enRem = (valor: string) => Number.parseFloat(valor.replace("rem", ""))

  it("el cuerpo nunca baja de 1rem", () => {
    expect(enRem(TIPOGRAFIA["--texto-base"])).toBeGreaterThanOrEqual(1)
  })

  it("la escala crece de forma monótona", () => {
    const orden = [
      "--texto-xs",
      "--texto-sm",
      "--texto-base",
      "--texto-lg",
      "--texto-xl",
      "--texto-2xl",
    ] as const
    const valores = orden.map((token) => enRem(TIPOGRAFIA[token]))
    for (let i = 1; i < valores.length; i++) {
      expect(valores[i]).toBeGreaterThan(valores[i - 1])
    }
    const minimoHero = enRem(
      TIPOGRAFIA["--texto-3xl"].replace("clamp(", "").split(",")[0].trim(),
    )
    expect(minimoHero).toBeGreaterThan(valores[valores.length - 1])
  })
})

/** V-06 — anchos de la constitución. */
describe("V-06 anchos de layout", () => {
  it("el marco mide 680px", () => {
    expect(TOKENS["--ancho-marco"]).toBe("680px")
  })

  it("el bucle jugable se queda entre 420px y 480px", () => {
    const bucle = Number.parseFloat(TOKENS["--ancho-bucle"].replace("px", ""))
    expect(bucle).toBeGreaterThanOrEqual(420)
    expect(bucle).toBeLessThanOrEqual(480)
  })
})

/** V-07 — movimiento breve y desactivable. */
describe("V-07 movimiento", () => {
  it("ninguna duración supera los 300ms de docs/05 §1", () => {
    const duraciones = ["--dur-1", "--dur-2", "--dur-3"].map((token) =>
      Number.parseFloat(
        MOVIMIENTO[token as keyof typeof MOVIMIENTO].replace("ms", ""),
      ),
    )
    expect(Math.max(...duraciones)).toBeLessThanOrEqual(300)
  })

  it("base.css neutraliza el movimiento", () => {
    expect(cssBase).toMatch(/prefers-reduced-motion:\s*reduce/)
    expect(cssBase).toMatch(/transition-duration:\s*0\.01ms\s*!important/)
  })
})

/** V-08 — fuentes autoalojadas con reserva. */
describe("V-08 fuentes", () => {
  const caras = [...cssBase.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(
    (m) => m[1],
  )

  it("hay una cara por familia y peso (Anton 400, Atkinson 400 y 700)", () => {
    expect(caras.length).toBe(6)
  })

  it("todas usan font-display: swap", () => {
    for (const cara of caras) expect(cara).toMatch(/font-display:\s*swap/)
  })

  it("todas las woff2 declaradas existen en public/fonts/", () => {
    const woff2 = caras
      .map((cara) => /url\("([^"]+\.woff2)"\)/.exec(cara)?.[1])
      .filter((url): url is string => Boolean(url))
    expect(woff2.length).toBe(6)
    for (const url of woff2) {
      expect(existsSync(join(RUTA_PUBLIC, url.replace("/fonts/", "")))).toBe(
        true,
      )
    }
  })

  it("siempre hay pila de reserva local", () => {
    expect(TOKENS["--fuente-reserva"]).toMatch(/system-ui/)
  })
})
