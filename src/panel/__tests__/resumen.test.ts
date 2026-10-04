import { describe, expect, it } from "vitest"
import type { Condicional, Situacion } from "../../content/schema"
import { agruparPorMomento } from "../resumen"

const situacion = (id: string, momento: Situacion["momento"]): Situacion => ({
  id,
  momento,
  titulo: `Título ${id}`,
  texto: "",
  opciones: [
    { id: "a", titulo: "A", subtitulo: "a" },
    { id: "b", titulo: "B", subtitulo: "b" },
  ],
})

const condicional = (
  id: string,
  momento: Situacion["momento"],
): Condicional => ({
  ...situacion(id, momento),
  requiere: { tipo: "flag", flag: "x" },
  ventanaAnos: 1,
  probabilidad: 0.5,
})

describe("agruparPorMomento (situaciones)", () => {
  const situaciones = [
    situacion("s1", "verano"),
    situacion("s2", "verano"),
    situacion("s3", "febrero"),
  ]

  it("cubre todos los momentos en orden", () => {
    expect(agruparPorMomento(situaciones).map((g) => g.momento)).toEqual([
      "verano",
      "febrero",
    ])
  })

  it("la suma de recuentos iguala el total (SC-001)", () => {
    const grupos = agruparPorMomento(situaciones)
    expect(grupos.reduce((n, g) => n + g.total, 0)).toBe(situaciones.length)
  })

  it("cada entidad aparece exactamente una vez", () => {
    const ids = agruparPorMomento(situaciones).flatMap((g) =>
      g.entidades.map((s) => s.id),
    )
    expect(ids.sort()).toEqual(["s1", "s2", "s3"])
    expect(new Set(ids).size).toBe(situaciones.length)
  })

  it("cuenta bien por momento", () => {
    const grupos = agruparPorMomento(situaciones)
    expect(grupos.find((g) => g.momento === "verano")?.total).toBe(2)
    expect(grupos.find((g) => g.momento === "febrero")?.total).toBe(1)
  })
})

describe("agruparPorMomento (condicionales)", () => {
  const condicionales = [
    condicional("c1", "verano"),
    condicional("c2", "febrero"),
    condicional("c3", "febrero"),
  ]

  it("cuenta y agrupa condicionales por momento", () => {
    const grupos = agruparPorMomento(condicionales)
    expect(grupos.reduce((n, g) => n + g.total, 0)).toBe(condicionales.length)
    expect(grupos.find((g) => g.momento === "verano")?.total).toBe(1)
    expect(grupos.find((g) => g.momento === "febrero")?.total).toBe(2)
  })
})
