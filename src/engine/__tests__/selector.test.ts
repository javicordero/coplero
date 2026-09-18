import { describe, expect, it } from "vitest"
import { crearPartida, elegir, siguientePaso } from "../partida"
import { seleccionarSituacion, tipoActual, tiposDelAno } from "../selector"
import type { BancoContenido } from "../types"
import { bancoPrueba, inputPrueba } from "./fixtures"

describe("selector", () => {
  it("asigna una decisión de contenido y una de personaje por año", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const [primero, segundo] = tiposDelAno(p)
    expect(primero).not.toEqual(segundo)
    expect(new Set([primero, segundo])).toEqual(
      new Set(["contenido", "personaje"]),
    )
  })

  it("el momento nunca se cruza: en verano no salen situaciones de febrero", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const s = seleccionarSituacion(p, bancoPrueba)
    expect(s).not.toBeNull()
    expect(s?.momento).toBe("verano")
    expect(s?.tipo).toBe(tipoActual(p))
  })

  it("respeta el filtro de modalidad", () => {
    const banco: BancoContenido = {
      situaciones: [
        {
          ...bancoPrueba.situaciones[0],
          id: "solo_chirigotero",
          modalidades: ["chirigotero"],
        },
      ],
    }
    const p = crearPartida(inputPrueba, banco) // modalidad comparsista
    expect(seleccionarSituacion(p, banco)).toBeNull()
  })

  it("degrada y recicla cuando el pool se agota", () => {
    const referencia = crearPartida(inputPrueba, bancoPrueba)
    const tipo = tipoActual(referencia)
    const base = bancoPrueba.situaciones.find(
      (s) => s.momento === "verano" && s.tipo === tipo,
    )
    if (!base) throw new Error("fixtures sin situación para el tipo del año")
    const banco: BancoContenido = { situaciones: [base] }
    const p = crearPartida(inputPrueba, banco)
    const s1 = seleccionarSituacion(p, banco)
    expect(s1).not.toBeNull()
    const vistas = { ...p, vistas: [s1?.id ?? ""] }
    const s2 = seleccionarSituacion(vistas, banco)
    expect(s2?.id).toBe(s1?.id) // reciclado
  })

  it("el flujo alterna verano y febrero", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const paso1 = siguientePaso(p, bancoPrueba)
    expect(paso1.tipo).toBe("decision")
    if (paso1.tipo !== "decision") return
    expect(paso1.momento).toBe("verano")
    const res = elegir(p, paso1.situacion.opciones[0].id, bancoPrueba)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.valor.momento).toBe("febrero")
    expect(res.valor.decisionesTomadasAno).toBe(1)
  })
})
