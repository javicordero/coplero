import { describe, expect, it } from "vitest"
import {
  BANDA_PUESTO,
  indiceNivel,
  nivelPorPuntuacion,
  resolverCoac,
} from "../coac"
import { PARAMETROS_POR_DEFECTO } from "../parametros"
import type { Atributos, Destino } from "../types"
import { NIVELES_COAC } from "../types"
import { rngDe } from "./helpers"

const atributos = (v: number): Atributos => ({
  letra: v,
  musica: v,
  puestaEnEscena: v,
  popularidad: v,
  cohesion: v,
  dinero: v,
})

const destino = (parcial: Partial<Destino>): Destino => ({
  techo: "final",
  suelo: "preliminares",
  anoPico: 0,
  anosCarrera: 20,
  volatilidad: 0,
  carisma: 0,
  milagro: false,
  ...parcial,
})

// Sin válvulas ni memoria: el nivel depende solo de la curva, los atributos y
// el rng controlado, para que las aserciones no dependan de la suerte.
const sinValvulas = {
  ...PARAMETROS_POR_DEFECTO,
  batacazo: 0,
  milagro: 0,
  amplitudForma: 0,
}

describe("resolución del COAC", () => {
  it("mapea puntuación a nivel por umbrales", () => {
    expect(nivelPorPuntuacion(85, PARAMETROS_POR_DEFECTO)).toBe("primer_premio")
    expect(nivelPorPuntuacion(65, PARAMETROS_POR_DEFECTO)).toBe("primer_premio")
    expect(nivelPorPuntuacion(56, PARAMETROS_POR_DEFECTO)).toBe("podio")
    expect(nivelPorPuntuacion(50, PARAMETROS_POR_DEFECTO)).toBe("final")
    expect(nivelPorPuntuacion(46, PARAMETROS_POR_DEFECTO)).toBe("semifinales")
    expect(nivelPorPuntuacion(43, PARAMETROS_POR_DEFECTO)).toBe("cuartos")
    expect(nivelPorPuntuacion(10, PARAMETROS_POR_DEFECTO)).toBe("preliminares")
  })

  it("acota al techo", () => {
    const r = resolverCoac({
      atributos: atributos(100),
      destino: destino({ techo: "cuartos" }),
      anoActual: 1,
      anoInicio: 1,
      seed: "test",
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(r.fase).toBe("cuartos")
  })

  it("acota al suelo por defecto", () => {
    // Primer año con el pico lejos: la curva está abajo y los atributos son
    // pésimos, así que sin suelo la carrera caería por debajo de semifinales.
    const r = resolverCoac({
      atributos: atributos(0),
      destino: destino({ suelo: "semifinales", anoPico: 10 }),
      anoActual: 1,
      anoInicio: 1,
      seed: "test",
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(r.fase).toBe("semifinales")
  })

  it("el batacazo puede atravesar el suelo", () => {
    const params = {
      ...PARAMETROS_POR_DEFECTO,
      batacazo: 1,
      milagro: 0,
      amplitudForma: 0,
    }
    const r = resolverCoac({
      atributos: atributos(100),
      destino: destino({ techo: "final", suelo: "final" }),
      anoActual: 1,
      anoInicio: 1,
      seed: "test",
      rng: rngDe([0.5, 0.0]),
      params,
      milagroUsado: false,
    })
    expect(r.fase).toBe("semifinales")
    expect(indiceNivel(r.nivel)).toBeLessThan(indiceNivel("final"))
  })

  it("el milagro rompe el techo una sola vez", () => {
    const params = { ...PARAMETROS_POR_DEFECTO, batacazo: 0, amplitudForma: 0 }
    // Año pico: la carrera está en su cima, así que su techo es el techo real.
    const primera = resolverCoac({
      atributos: atributos(50),
      destino: destino({ techo: "cuartos", anoPico: 2, milagro: true }),
      anoActual: 2,
      anoInicio: 1,
      seed: "test",
      rng: rngDe([0.5, 0.5]),
      params,
      milagroUsado: false,
    })
    expect(primera.milagro).toBe(true)
    expect(primera.fase).toBe("semifinales")

    const segunda = resolverCoac({
      atributos: atributos(50),
      destino: destino({ techo: "cuartos", anoPico: 2, milagro: true }),
      anoActual: 2,
      anoInicio: 1,
      seed: "test",
      rng: rngDe([0.5, 0.5]),
      params,
      milagroUsado: true,
    })
    expect(segunda.milagro).toBe(false)
    expect(segunda.fase).toBe("cuartos")
  })

  it("el nivel primer_premio da el puesto 1", () => {
    const r = resolverCoac({
      atributos: atributos(100),
      destino: destino({ techo: "primer_premio" }),
      anoActual: 1,
      anoInicio: 1,
      seed: "test",
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(r.fase).toBe("final")
    expect(r.nivel).toBe("primer_premio")
    expect(r.puesto).toBe(1)
  })

  it("el techo podio también puede ganar", () => {
    const r = resolverCoac({
      atributos: atributos(100),
      destino: destino({ techo: "podio" }),
      anoActual: 1,
      anoInicio: 1,
      seed: "test",
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(r.fase).toBe("final")
    expect(r.nivel).toBe("podio")
    expect(r.puesto).toBe(1)
  })

  it("V-06 · el puesto cae siempre en la banda de su nivel", () => {
    for (const techo of NIVELES_COAC) {
      for (const anoPico of [1, 5, 12, 20]) {
        for (const ano of [1, 7, 20]) {
          const p = resolverCoac({
            atributos: atributos(50),
            destino: destino({ techo, anoPico }),
            anoActual: ano,
            anoInicio: 1,
            seed: `banda-${techo}-${anoPico}-${ano}`,
            rng: rngDe([0.5]),
            params: sinValvulas,
            milagroUsado: false,
          })
          const [mejor, peor] = BANDA_PUESTO[p.nivel]
          expect(p.puesto, `${techo}/${anoPico}/${ano}`).toBeGreaterThanOrEqual(
            mejor,
          )
          expect(p.puesto, `${techo}/${anoPico}/${ano}`).toBeLessThanOrEqual(
            peor,
          )
          expect(p.puesto).toBeGreaterThanOrEqual(1)
          expect(p.puesto).toBeLessThanOrEqual(50)
        }
      }
    }
  })

  it("V-04 · la puntuación no es constante a lo largo de la carrera", () => {
    const d = destino({ techo: "semifinales", anoPico: 8, volatilidad: 1 })
    const valores = Array.from({ length: 20 }, (_, i) => 1 + i).map(
      (ano) =>
        resolverCoac({
          atributos: atributos(50),
          destino: d,
          anoActual: ano,
          anoInicio: 1,
          seed: "varia",
          rng: rngDe([0.5]),
          params: PARAMETROS_POR_DEFECTO,
          milagroUsado: false,
        }).puntuacion,
    )
    expect(new Set(valores).size).toBeGreaterThan(1)
    expect(Math.max(...valores) - Math.min(...valores)).toBeGreaterThan(5)
  })

  it("V-07 · ninguna carrera supera su techo salvo por el milagro", () => {
    for (const techo of NIVELES_COAC) {
      for (let i = 0; i < 60; i++) {
        const r = resolverCoac({
          atributos: atributos(100),
          destino: destino({ techo, anoPico: 5, volatilidad: 1.3 }),
          anoActual: 1 + ((i * 7) % 20),
          anoInicio: 1,
          seed: `techo-${techo}-${i}`,
          rng: rngDe([0.9]),
          params: { ...PARAMETROS_POR_DEFECTO, batacazo: 0 },
          milagroUsado: false,
        })
        if (r.milagro) continue
        expect(
          indiceNivel(r.nivel),
          `${techo} intento ${i}: ${r.nivel}`,
        ).toBeLessThanOrEqual(indiceNivel(techo))
      }
    }
  })

  it("V-06 · un mérito mayor nunca da peor puesto dentro del nivel", () => {
    const d = destino({ techo: "preliminares", anoPico: 10 })
    const puestos = Array.from({ length: 20 }, (_, i) => 1 + i)
      .map((ano) =>
        resolverCoac({
          atributos: atributos(50),
          destino: d,
          anoActual: ano,
          anoInicio: 1,
          seed: "merito",
          rng: rngDe([0.5]),
          params: sinValvulas,
          milagroUsado: false,
        }),
      )
      .filter((r) => r.nivel === "preliminares")
      .sort((a, b) => a.puntuacion - b.puntuacion)
    for (let i = 1; i < puestos.length; i++) {
      expect(puestos[i].puesto).toBeLessThanOrEqual(puestos[i - 1].puesto)
    }
  })
})
