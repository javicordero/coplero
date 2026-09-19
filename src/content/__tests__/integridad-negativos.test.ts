import { describe, expect, it } from "vitest"
import { bancoContenido, parsearBanco } from "../index"
import type { Requisito, Situacion } from "../schema"

function clon(): {
  situaciones: Situacion[]
  condicionales: NonNullable<typeof bancoContenido.condicionales>
} {
  return structuredClone({
    situaciones: bancoContenido.situaciones,
    condicionales: bancoContenido.condicionales ?? [],
  })
}

describe("casos negativos de integridad", () => {
  it("rechaza un id de situación duplicado", () => {
    const b = clon()
    b.situaciones[1].id = b.situaciones[0].id
    expect(() => parsearBanco(b)).toThrow(/id duplicado/)
  })

  it("rechaza una situación sin momento", () => {
    const b = clon()
    Reflect.deleteProperty(b.situaciones[0], "momento")
    expect(() => parsearBanco(b)).toThrow(/momento/)
  })

  it("rechaza una situación sin tipo", () => {
    const b = clon()
    Reflect.deleteProperty(b.situaciones[0], "tipo")
    expect(() => parsearBanco(b)).toThrow(/tipo/)
  })

  it("rechaza una situación sin categoría", () => {
    const b = clon()
    Reflect.deleteProperty(b.situaciones[0], "categoria")
    expect(() => parsearBanco(b)).toThrow(/categoria/)
  })

  it("rechaza una flag referenciada que no declara ninguna opción", () => {
    const b = clon()
    const inexistente: Requisito = { tipo: "flag", flag: "flag_inexistente" }
    b.condicionales[0].requiere = inexistente
    expect(() => parsearBanco(b)).toThrow(/flag referenciada/)
  })

  it("rechaza una modalidad no permitida", () => {
    const b = clon()
    Reflect.set(b.situaciones[0], "modalidades", ["trio"])
    expect(() => parsearBanco(b)).toThrow()
  })

  it("rechaza una situación con menos de dos opciones", () => {
    const b = clon()
    b.situaciones[0].opciones = [b.situaciones[0].opciones[0]]
    expect(() => parsearBanco(b)).toThrow()
  })

  it("rechaza un id de opción duplicado dentro de la situación", () => {
    const b = clon()
    b.situaciones[0].opciones[1].id = b.situaciones[0].opciones[0].id
    expect(() => parsearBanco(b)).toThrow(/id duplicado/)
  })

  it("rechaza un banco sin cobertura común para un momento y tipo", () => {
    const b = clon()
    b.situaciones = b.situaciones.filter(
      (s) => !(s.momento === "verano" && s.tipo === "contenido"),
    )
    expect(() => parsearBanco(b)).toThrow(/no hay ninguna situación común/)
  })
})

describe("casos negativos comprobados en la capa de contenido", () => {
  const esperadas: [string, string][] = [
    ["v_enfado_coac", "calle"],
    ["v_enfado_coac", "gira"],
    ["f_jurado", "no_ir"],
  ]

  function exigirSaltaCOAC(
    situaciones: Situacion[],
    pares: [string, string][],
  ): void {
    for (const [situacionId, opcionId] of pares) {
      const opcion = situaciones
        .find((s) => s.id === situacionId)
        ?.opciones.find((o) => o.id === opcionId)
      if (opcion?.saltaCOAC !== true) {
        throw new Error(
          `la opción que no concursa ${situacionId}/${opcionId} no lleva saltaCOAC`,
        )
      }
    }
  }

  it("detecta la falta de saltaCOAC en una opción que no concursa", () => {
    expect(() =>
      exigirSaltaCOAC(bancoContenido.situaciones, esperadas),
    ).not.toThrow()
    const b = clon()
    const opcion = b.situaciones
      .find((s) => s.id === "f_jurado")
      ?.opciones.find((o) => o.id === "no_ir")
    Reflect.deleteProperty(opcion as object, "saltaCOAC")
    expect(() => exigirSaltaCOAC(b.situaciones, esperadas)).toThrow(/saltaCOAC/)
  })

  it("detecta un recuento de contenido distinto del documentado", () => {
    const contar = (s: Situacion[]) =>
      s.filter((x) => x.momento === "verano").length
    expect(contar(bancoContenido.situaciones)).toBe(18)
    const b = clon()
    b.situaciones = b.situaciones.filter((s) => s.id !== "v_letra_tema")
    expect(contar(b.situaciones)).not.toBe(18)
  })
})
