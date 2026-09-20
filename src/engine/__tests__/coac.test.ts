import { describe, expect, it } from "vitest"
import { indiceNivel, nivelPorPuntuacion, resolverCoac } from "../coac"
import { PARAMETROS_POR_DEFECTO } from "../parametros"
import type { Atributos, Destino } from "../types"
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

const sinValvulas = { ...PARAMETROS_POR_DEFECTO, batacazo: 0, milagro: 0 }

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
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(r.fase).toBe("cuartos")
  })

  it("acota al suelo por defecto", () => {
    const r = resolverCoac({
      atributos: atributos(0),
      destino: destino({ suelo: "semifinales" }),
      anoActual: 1,
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(r.fase).toBe("semifinales")
  })

  it("el batacazo puede atravesar el suelo", () => {
    const params = { ...PARAMETROS_POR_DEFECTO, batacazo: 1, milagro: 0 }
    const r = resolverCoac({
      atributos: atributos(100),
      destino: destino({ techo: "final", suelo: "final" }),
      anoActual: 1,
      rng: rngDe([0.5, 0.0]),
      params,
      milagroUsado: false,
    })
    expect(r.fase).toBe("semifinales")
    expect(indiceNivel(r.nivel)).toBeLessThan(indiceNivel("final"))
  })

  it("el milagro rompe el techo una sola vez", () => {
    const params = { ...PARAMETROS_POR_DEFECTO, batacazo: 0 }
    const primera = resolverCoac({
      atributos: atributos(50),
      destino: destino({ techo: "cuartos", milagro: true }),
      anoActual: 1,
      rng: rngDe([0.5, 0.5]),
      params,
      milagroUsado: false,
    })
    expect(primera.milagro).toBe(true)
    expect(primera.fase).toBe("semifinales")

    const segunda = resolverCoac({
      atributos: atributos(50),
      destino: destino({ techo: "cuartos", milagro: true }),
      anoActual: 2,
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
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(r.fase).toBe("final")
    expect(r.nivel).toBe("podio")
    expect(r.puesto).toBe(1)
  })

  it("el puesto cae en la banda de su nivel", () => {
    const p = resolverCoac({
      atributos: atributos(43),
      destino: destino({ techo: "final" }),
      anoActual: 1,
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(p.fase).toBe("cuartos")
    expect(p.puesto).toBeGreaterThanOrEqual(11)
    expect(p.puesto).toBeLessThanOrEqual(16)
  })
})
