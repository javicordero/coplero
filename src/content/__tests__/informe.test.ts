import { describe, expect, it } from "vitest"
import { bancoContenido, parsearBanco } from "../index"
import { construirInformeContenido } from "../informe"
import type { Situacion } from "../schema"

describe("informe de contenido", () => {
  it("cuenta situaciones por momento y condicionales", () => {
    const informe = construirInformeContenido(bancoContenido)
    expect(informe.situacionesPorMomento).toEqual({ verano: 18, febrero: 9 })
    expect(informe.totalSituaciones).toBe(27)
    expect(informe.totalCondicionales).toBe(15)
  })

  it("expone flags declaradas y referenciadas sin huérfanas", () => {
    const informe = construirInformeContenido(bancoContenido)
    expect(informe.flagsDeclaradas.length).toBeGreaterThan(0)
    expect(informe.flagsReferenciadas.length).toBeGreaterThan(0)
    expect(informe.flagsSinDeclarar).toEqual([])
  })

  it("detecta una flag referenciada sin declarar", () => {
    const informe = construirInformeContenido({
      situaciones: structuredClone(bancoContenido.situaciones),
      condicionales: [
        {
          ...structuredClone(bancoContenido.condicionales?.[0]),
          id: "cv_falsa",
          requiere: { tipo: "flag", flag: "no_existe" },
        } as NonNullable<typeof bancoContenido.condicionales>[number],
      ],
    })
    expect(informe.flagsSinDeclarar).toContain("no_existe")
  })

  it("detecta un filtro estático imposible", () => {
    const informe = construirInformeContenido({
      situaciones: [
        {
          id: "x",
          momento: "verano",
          tipo: "contenido",
          categoria: "letra",
          titulo: "x",
          texto: "",
          modalidades: [],
          opciones: [
            { id: "a", titulo: "a", subtitulo: "a" },
            { id: "b", titulo: "b", subtitulo: "b" },
          ],
        } satisfies Situacion,
      ],
    })
    expect(informe.situacionesInalcanzablesEstaticas).toEqual(["x"])
  })

  it("el banco real no tiene flags sin declarar", () => {
    expect(() => parsearBanco(bancoContenido)).not.toThrow()
  })
})
