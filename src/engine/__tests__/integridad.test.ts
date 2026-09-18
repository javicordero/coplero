import { describe, expect, it } from "vitest"
import type { Situacion } from "../types"
import { bancoPrueba } from "./fixtures"

const todas = () => [
  ...bancoPrueba.situaciones,
  ...(bancoPrueba.condicionales ?? []),
]

describe("integridad del banco de fixtures", () => {
  it("los ids son únicos", () => {
    const ids = todas().map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("toda situación declara momento y tipo", () => {
    for (const s of todas()) {
      expect(["verano", "febrero"]).toContain(s.momento)
      expect(["contenido", "personaje"]).toContain(s.tipo)
    }
  })

  it("cada opción tiene título y subtítulo y al menos una opción", () => {
    for (const s of todas()) {
      expect(s.opciones.length).toBeGreaterThanOrEqual(2)
      for (const o of s.opciones) {
        expect(o.titulo.length).toBeGreaterThan(0)
        expect(o.subtitulo.length).toBeGreaterThan(0)
      }
    }
  })

  it("toda flag referenciada en un requisito existe en alguna opción", () => {
    const flagsDisponibles = new Set<string>()
    for (const s of bancoPrueba.situaciones) {
      for (const o of s.opciones)
        for (const f of o.flags ?? []) flagsDisponibles.add(f)
    }
    for (const c of bancoPrueba.condicionales ?? []) {
      for (const f of flagsDeRequisito(c.requiere)) {
        expect(flagsDisponibles.has(f)).toBe(true)
      }
    }
  })

  it("hay cobertura para cada momento y tipo (sin filtros restrictivos)", () => {
    for (const momento of ["verano", "febrero"] as const) {
      for (const tipo of ["contenido", "personaje"] as const) {
        const candidatas = bancoPrueba.situaciones.filter(
          (s: Situacion) =>
            s.momento === momento &&
            s.tipo === tipo &&
            !s.modalidades &&
            !s.variantes,
        )
        expect(candidatas.length).toBeGreaterThan(0)
      }
    }
  })
})

function flagsDeRequisito(req: unknown): string[] {
  const r = req as {
    tipo: string
    flag?: string
    de?: unknown[]
  }
  if (r.tipo === "flag" || r.tipo === "flagRepetida")
    return r.flag ? [r.flag] : []
  if (r.tipo === "todas" || r.tipo === "alguna" || r.tipo === "ninguna") {
    return (r.de ?? []).flatMap(flagsDeRequisito)
  }
  return []
}
