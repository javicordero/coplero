import { describe, expect, it } from "vitest"
import { aptitud, bandaDe, puntuacionObjetivo } from "../carrera"
import { PARAMETROS_POR_DEFECTO } from "../parametros"
import type { Destino, NivelCOAC } from "../types"
import { NIVELES_COAC } from "../types"

const params = PARAMETROS_POR_DEFECTO

function destino(parcial: Partial<Destino> = {}): Destino {
  return {
    techo: "semifinales",
    suelo: "preliminares",
    anoPico: 8,
    anosCarrera: 20,
    volatilidad: 1,
    carisma: 0,
    milagro: false,
    ...parcial,
  }
}

/** V-02 · la curva de carrera (013, E1). */
describe("bandas y objetivo", () => {
  it("las bandas son contiguas y respetan los umbrales", () => {
    let anterior = bandaDe("preliminares", params)
    expect(anterior.base).toBe(0)
    for (const nivel of NIVELES_COAC) {
      const banda = bandaDe(nivel, params)
      expect(banda.tope).toBeGreaterThan(banda.base)
      if (nivel !== "preliminares") {
        expect(banda.base).toBe(anterior.tope)
      }
      anterior = banda
    }
    expect(bandaDe("preliminares", params).tope).toBe(
      params.umbralesNivel.cuartos,
    )
    expect(bandaDe("primer_premio", params).base).toBe(
      params.umbralesNivel.primer_premio,
    )
  })

  it("la cima cae siempre dentro de la banda de su techo", () => {
    for (const nivel of NIVELES_COAC) {
      const { base, tope } = bandaDe(nivel, params)
      const objetivo = puntuacionObjetivo(nivel, params)
      expect(objetivo, nivel).toBeGreaterThanOrEqual(base)
      expect(objetivo, nivel).toBeLessThanOrEqual(tope)
    }
  })

  it("con techo de preliminares la cima se queda a las puertas del corte", () => {
    const { tope } = bandaDe("preliminares", params)
    const objetivo = puntuacionObjetivo("preliminares", params)
    expect(tope - objetivo).toBeLessThanOrEqual(params.margenPreliminares)
    expect(objetivo).toBeGreaterThan(tope * 0.9)
  })
})

describe("curva de carrera", () => {
  it("clava los extremos: inicio en el primer año y cima en el año pico", () => {
    const d = destino({ anoPico: 8, anosCarrera: 20 })
    const entrada = { anoInicio: 1, destino: d, params }
    const cima = puntuacionObjetivo(d.techo, params)

    expect(aptitud({ ...entrada, ano: 1 })).toBeCloseTo(
      cima - params.curvaSubida,
      9,
    )
    expect(aptitud({ ...entrada, ano: 8 })).toBeCloseTo(cima, 9)
    expect(aptitud({ ...entrada, ano: 20 })).toBeCloseTo(
      cima - params.curvaDeclive,
      9,
    )
  })

  it("sube hasta el pico y baja después, sin saltos", () => {
    const d = destino({ anoPico: 8, anosCarrera: 20 })
    const anos = Array.from({ length: 20 }, (_, i) => 1 + i)
    const valores = anos.map((ano) =>
      aptitud({ ano, anoInicio: 1, destino: d, params }),
    )
    const pico = anos.indexOf(8)
    for (let i = 1; i <= pico; i++) {
      expect(valores[i]).toBeGreaterThanOrEqual(valores[i - 1] - 1e-9)
    }
    for (let i = pico + 1; i < valores.length; i++) {
      expect(valores[i]).toBeLessThanOrEqual(valores[i - 1] + 1e-9)
    }
    expect(valores[pico]).toBe(Math.max(...valores))
    // Con `curvaSubida` > `curvaDeclive` el punto más bajo es el arranque:
    // se empieza humilde y se acaba por encima de donde se empezó.
    expect(valores[0]).toBe(Math.min(...valores))
    expect(valores[valores.length - 1]).toBeLessThan(valores[pico])
  })

  it("está definida con el pico en los bordes de la carrera", () => {
    for (const anoPico of [1, 2, 20]) {
      const d = destino({ anoPico, anosCarrera: 20 })
      for (const ano of [1, 10, 20]) {
        const valor = aptitud({ ano, anoInicio: 1, destino: d, params })
        expect(Number.isFinite(valor), `pico ${anoPico} ano ${ano}`).toBe(true)
      }
    }
  })

  it("no depende del azar ni del reloj: es una función pura", () => {
    const d = destino()
    const a = aptitud({ ano: 5, anoInicio: 1, destino: d, params })
    const b = aptitud({ ano: 5, anoInicio: 1, destino: d, params })
    expect(a).toBe(b)
  })

  it("respeta la curva declarada para cada nivel de techo", () => {
    for (const nivel of NIVELES_COAC as NivelCOAC[]) {
      const d = destino({ techo: nivel, anoPico: 6 })
      const cima = puntuacionObjetivo(nivel, params)
      expect(aptitud({ ano: 6, anoInicio: 1, destino: d, params })).toBeCloseTo(
        cima,
        9,
      )
    }
  })
})
