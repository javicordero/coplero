import { describe, expect, it } from "vitest"
import {
  crearPartida,
  elegir,
  elegirVarianteDeCambio,
  siguientePaso,
} from "../partida"
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

  it("tras cambiar de modalidad, la selección usa la nueva", () => {
    const base = bancoPrueba.situaciones[0]
    const opcionesCambio = [
      { id: "seguir", titulo: "Seguir", subtitulo: "x" },
      {
        id: "cambiar",
        titulo: "Cambiar",
        subtitulo: "x",
        cambiaModalidad: "chirigotero" as const,
      },
    ]
    const banco: BancoContenido = {
      situaciones: [
        {
          ...base,
          id: "cambio_c",
          tipo: "contenido",
          modalidades: ["comparsista"],
          opciones: opcionesCambio,
        },
        {
          ...base,
          id: "cambio_p",
          tipo: "personaje",
          modalidades: ["comparsista"],
          opciones: opcionesCambio,
        },
        {
          ...base,
          id: "chiri_c",
          tipo: "contenido",
          momento: "febrero",
          modalidades: ["chirigotero"],
        },
        {
          ...base,
          id: "chiri_p",
          tipo: "personaje",
          momento: "febrero",
          modalidades: ["chirigotero"],
        },
      ],
      variantes: [
        { id: "c_a", modalidad: "comparsista" },
        { id: "ch_a", modalidad: "chirigotero" },
      ],
    }
    const p = crearPartida(inputPrueba, banco)
    const r1 = elegir(p, "cambiar", banco)
    if (!r1.ok) throw new Error("no cambió de modalidad")
    const r2 = elegirVarianteDeCambio(r1.valor, "ch_a", banco)
    if (!r2.ok) throw new Error("variante inválida")
    const s = seleccionarSituacion(r2.valor, banco)
    expect(s).not.toBeNull()
    expect(s?.modalidades).toEqual(["chirigotero"])
    expect(s?.id.startsWith("chiri_")).toBe(true)
  })

  it("pondera la selección por `peso`", () => {
    const base = bancoPrueba.situaciones[0]
    const banco: BancoContenido = {
      situaciones: [
        { ...base, id: "frecuente", peso: 100 },
        { ...base, id: "raro", peso: 1 },
      ],
    }
    let frecuente = 0
    let raro = 0
    for (let i = 0; i < 400; i++) {
      const p = crearPartida({ ...inputPrueba, seed: `peso-${i}` }, banco)
      const s = seleccionarSituacion(p, banco)
      if (s?.id === "frecuente") frecuente++
      else if (s?.id === "raro") raro++
    }
    expect(frecuente).toBeGreaterThan(0)
    expect(frecuente).toBeGreaterThan(raro)
  })

  it("respeta el filtro de variantes", () => {
    const banco: BancoContenido = {
      situaciones: [
        {
          ...bancoPrueba.situaciones[0],
          id: "solo_nueva",
          variantes: ["nueva_escuela"],
        },
      ],
    }
    const p = crearPartida(inputPrueba, banco) // variante "clasico"
    expect(seleccionarSituacion(p, banco)).toBeNull()
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
