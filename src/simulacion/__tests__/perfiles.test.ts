import { describe, expect, it } from "vitest"
import { bancoPrueba } from "../../engine/__tests__/fixtures"
import type { Paso, Situacion } from "../../engine/index"
import { rngPara, toPublica } from "../../engine/index"
import {
  PERFIL_ALEATORIO,
  PERFIL_CODICIOSO,
  PERFIL_ERRATICO,
  PERFILES_POR_DEFECTO,
} from "../perfiles"
import type { ContextoDecision, PerfilJugador } from "../tipos"
import { partidaFalsa } from "./helpers"

function contextoDe(
  idSituacion: string,
  perfil: PerfilJugador,
  contador = 0,
): ContextoDecision {
  const situacion = bancoPrueba.situaciones.find((s) => s.id === idSituacion)
  if (!situacion) throw new Error(`situacion no encontrada: ${idSituacion}`)
  const paso: Extract<Paso, { tipo: "decision" }> = {
    tipo: "decision",
    momento: situacion.momento,
    situacion: toPublica(situacion as Situacion),
  }
  return {
    paso,
    situacion,
    partida: partidaFalsa(),
    rng: rngPara("semilla-perfiles", "jugador", perfil.id, contador),
  }
}

describe("perfiles", () => {
  it("expone los tres perfiles por defecto", () => {
    expect(PERFILES_POR_DEFECTO.map((p) => p.id)).toEqual([
      "aleatorio",
      "codicioso",
      "erratico",
    ])
  })

  it("elige siempre una opcion valida", () => {
    for (const perfil of PERFILES_POR_DEFECTO) {
      const ctx = contextoDe("v_letra_duro", perfil)
      const opcionId = perfil.elegir(ctx)
      expect(ctx.situacion.opciones.map((o) => o.id)).toContain(opcionId)
    }
  })

  it("es determinista con la misma seed y contador", () => {
    for (const perfil of PERFILES_POR_DEFECTO) {
      const a = perfil.elegir(contextoDe("v_musica_tipo", perfil, 4))
      const b = perfil.elegir(contextoDe("v_musica_tipo", perfil, 4))
      expect(a).toBe(b)
    }
  })

  it("el codicioso maximiza los atributos artisticos", () => {
    const ctx = contextoDe("v_letra_duro", PERFIL_CODICIOSO)
    expect(PERFIL_CODICIOSO.elegir(ctx)).toBe("mantener")
  })

  it("el aleatorio reparte entre las opciones disponibles", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 40; i++) {
      ids.add(
        PERFIL_ALEATORIO.elegir(
          contextoDe("v_letra_tema", PERFIL_ALEATORIO, i),
        ),
      )
    }
    expect(ids.size).toBeGreaterThan(1)
  })

  it("el erratico es una funcion valida y estable", () => {
    const ctx = contextoDe("v_grupo_historico", PERFIL_ERRATICO, 7)
    expect(PERFIL_ERRATICO.elegir(ctx)).toBe(PERFIL_ERRATICO.elegir(ctx))
  })
})
