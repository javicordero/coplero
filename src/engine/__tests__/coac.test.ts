import { describe, expect, it } from "vitest"
import { fasePorPuntuacion, indiceFase, resolverCoac } from "../coac"
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
  ...parcial,
})

const sinValvulas = { ...PARAMETROS_POR_DEFECTO, batacazo: 0, milagro: 0 }

describe("resolución del COAC", () => {
  it("mapea puntuación a fase por umbrales", () => {
    expect(fasePorPuntuacion(90, PARAMETROS_POR_DEFECTO)).toBe("final")
    expect(fasePorPuntuacion(70, PARAMETROS_POR_DEFECTO)).toBe("semifinales")
    expect(fasePorPuntuacion(50, PARAMETROS_POR_DEFECTO)).toBe("cuartos")
    expect(fasePorPuntuacion(10, PARAMETROS_POR_DEFECTO)).toBe("preliminares")
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
    expect(indiceFase(r.fase)).toBeLessThan(indiceFase("final"))
  })

  it("el milagro rompe el techo una sola vez", () => {
    const params = { ...PARAMETROS_POR_DEFECTO, batacazo: 0, milagro: 1 }
    const primera = resolverCoac({
      atributos: atributos(50),
      destino: destino({ techo: "cuartos" }),
      anoActual: 1,
      rng: rngDe([0.5, 0.5, 0.0]),
      params,
      milagroUsado: false,
    })
    expect(primera.milagro).toBe(true)
    expect(primera.fase).toBe("semifinales")

    const segunda = resolverCoac({
      atributos: atributos(50),
      destino: destino({ techo: "cuartos" }),
      anoActual: 2,
      rng: rngDe([0.5, 0.5, 0.0]),
      params,
      milagroUsado: true,
    })
    expect(segunda.milagro).toBe(false)
    expect(segunda.fase).toBe("cuartos")
  })

  it("el puesto cae en la banda de la fase", () => {
    const r = resolverCoac({
      atributos: atributos(100),
      destino: destino({ techo: "final" }),
      anoActual: 1,
      rng: rngDe([0.5]),
      params: sinValvulas,
      milagroUsado: false,
    })
    expect(r.fase).toBe("final")
    expect(r.puesto).toBeGreaterThanOrEqual(1)
    expect(r.puesto).toBeLessThanOrEqual(4)

    const p = resolverCoac({
      atributos: atributos(50),
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
