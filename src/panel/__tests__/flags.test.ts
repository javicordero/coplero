import { describe, expect, it } from "vitest"
import type {
  BancoContenido,
  Condicional,
  Situacion,
} from "../../content/schema"
import { catalogoFlags } from "../flags"

const situacion = (id: string, flags: string[]): Situacion => ({
  id,
  momento: "verano",
  titulo: id,
  texto: "",
  opciones: [
    { id: "a", titulo: "A", subtitulo: "a", flags },
    { id: "b", titulo: "B", subtitulo: "b" },
  ],
})

describe("catalogoFlags", () => {
  it("devuelve las flags declaradas, ordenadas y sin duplicados", () => {
    const banco: BancoContenido = {
      situaciones: [
        situacion("s1", ["zeta", "alfa"]),
        situacion("s2", ["alfa"]),
      ],
    }
    expect(catalogoFlags(banco)).toEqual(["alfa", "zeta"])
  })

  it("incluye las flags declaradas por condicionales", () => {
    const condicional: Condicional = {
      ...situacion("c1", ["desde_condicional"]),
      requiere: { tipo: "flag", flag: "otra" },
      ventanaAnos: 1,
      probabilidad: 0.5,
    }
    const banco: BancoContenido = {
      situaciones: [situacion("s1", ["desde_situacion"])],
      condicionales: [condicional],
    }
    expect(catalogoFlags(banco)).toEqual([
      "desde_condicional",
      "desde_situacion",
    ])
  })

  it("no inventa flags solo referenciadas en un requisito", () => {
    const condicional: Condicional = {
      ...situacion("c1", []),
      requiere: { tipo: "flag", flag: "solo_referenciada" },
      ventanaAnos: 1,
      probabilidad: 0.5,
    }
    const banco: BancoContenido = {
      situaciones: [],
      condicionales: [condicional],
    }
    expect(catalogoFlags(banco)).toEqual([])
  })

  it("devuelve lista vacía si no hay ninguna flag", () => {
    expect(catalogoFlags({ situaciones: [] })).toEqual([])
  })
})
