import { describe, expect, it } from "vitest"
import { CATEGORIAS } from "../../content/modalidades"
import type { Situacion } from "../../content/schema"
import { agruparPorCategoria } from "../resumen"

const situacion = (
  id: string,
  categoria: Situacion["categoria"],
): Situacion => ({
  id,
  momento: "verano",
  tipo: "contenido",
  categoria,
  titulo: `Título ${id}`,
  texto: "",
  opciones: [
    { id: "a", titulo: "A", subtitulo: "a" },
    { id: "b", titulo: "B", subtitulo: "b" },
  ],
})

describe("agrupar por categoría", () => {
  const situaciones = [
    situacion("s1", "letra"),
    situacion("s2", "letra"),
    situacion("s3", "dinero"),
  ]

  it("cubre todas las categorías en orden", () => {
    expect(agruparPorCategoria(situaciones).map((g) => g.categoria)).toEqual([
      ...CATEGORIAS,
    ])
  })

  it("la suma de recuentos iguala el total (SC-001)", () => {
    const grupos = agruparPorCategoria(situaciones)
    expect(grupos.reduce((n, g) => n + g.total, 0)).toBe(situaciones.length)
  })

  it("cada situación aparece exactamente una vez", () => {
    const ids = agruparPorCategoria(situaciones).flatMap((g) =>
      g.situaciones.map((s) => s.id),
    )
    expect(ids.sort()).toEqual(["s1", "s2", "s3"])
    expect(new Set(ids).size).toBe(situaciones.length)
  })

  it("cuenta bien por categoría", () => {
    const grupos = agruparPorCategoria(situaciones)
    expect(grupos.find((g) => g.categoria === "letra")?.total).toBe(2)
    expect(grupos.find((g) => g.categoria === "dinero")?.total).toBe(1)
    expect(grupos.find((g) => g.categoria === "grupo")?.total).toBe(0)
  })
})
