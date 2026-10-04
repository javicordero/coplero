import { describe, expect, it } from "vitest"
import { PARAMETROS_POR_DEFECTO, type ParametrosMotor } from "../parametros"
import { resolverPremios } from "../premios"
import type { Atributos, Flag } from "../types"

const atributos: Atributos = {
  letra: 50,
  musica: 50,
  puestaEnEscena: 50,
  popularidad: 50,
  cohesion: 50,
  dinero: 50,
}

const sinFlags: Record<string, Flag> = {}

describe("premios ajenos", () => {
  it("sin participación no hay premios", () => {
    const premios = resolverPremios({
      temporada: { fase: "final", puesto: 1, fueraDeConcurso: true },
      atributos,
      flags: sinFlags,
      ano: 1,
      seed: "s",
      params: PARAMETROS_POR_DEFECTO,
    })
    expect(premios).toEqual([])
  })

  it("no otorga premios por encima del umbral de puesto", () => {
    const premios = resolverPremios({
      temporada: { fase: "preliminares", puesto: 30, fueraDeConcurso: false },
      atributos,
      flags: sinFlags,
      ano: 1,
      seed: "s",
      params: PARAMETROS_POR_DEFECTO,
    })
    expect(premios).toEqual([])
  })

  it("con probabilidad 1 otorga los elegibles", () => {
    const params: ParametrosMotor = {
      ...PARAMETROS_POR_DEFECTO,
      premios: PARAMETROS_POR_DEFECTO.premios.map((p) => ({
        ...p,
        probabilidadBase: 1,
      })),
    }
    const premios = resolverPremios({
      temporada: { fase: "final", puesto: 1, fueraDeConcurso: false },
      atributos,
      flags: sinFlags,
      ano: 1,
      seed: "s",
      params,
    })
    expect(premios).toHaveLength(PARAMETROS_POR_DEFECTO.premios.length)
  })

  it("la afinidad por flag aumenta la probabilidad", () => {
    const params: ParametrosMotor = {
      ...PARAMETROS_POR_DEFECTO,
      premios: [
        {
          tipo: "candela_y_espino",
          umbralPuesto: 10,
          probabilidadBase: 0,
          pesosAtributos: {},
          flagsAfinidad: { tema_social: 1 },
        },
      ],
    }
    const sinFlag = resolverPremios({
      temporada: { fase: "semifinales", puesto: 6, fueraDeConcurso: false },
      atributos,
      flags: sinFlags,
      ano: 1,
      seed: "s",
      params,
    })
    expect(sinFlag).toEqual([])

    const conFlag = resolverPremios({
      temporada: { fase: "semifinales", puesto: 6, fueraDeConcurso: false },
      atributos,
      flags: {
        tema_social: {
          ano: 1,
          veces: 1,
          consumidaPor: [],
          anosConsecutivos: 1,
        },
      },
      ano: 1,
      seed: "s",
      params,
    })
    expect(conFlag.map((p) => p.tipo)).toContain("candela_y_espino")
  })
})
