import { describe, expect, it } from "vitest"
import type { Condicional, Situacion } from "../../content/schema"
import { AlmacenSchema, migrarAlmacen, VERSION_ALMACEN } from "../esquema"

const situacion = (id: string): Situacion => ({
  id,
  momento: "verano",
  titulo: `Título ${id}`,
  texto: "",
  opciones: [
    { id: "a", titulo: "A", subtitulo: "a" },
    { id: "b", titulo: "B", subtitulo: "b" },
  ],
})

const condicional = (id: string): Condicional => ({
  ...situacion(id),
  requiere: { tipo: "flag", flag: "x" },
  ventanaAnos: 1,
  probabilidad: 0.5,
})

describe("AlmacenSchema (v3)", () => {
  it("acepta un almacén v3 válido con ambas entidades", () => {
    const resultado = AlmacenSchema.safeParse({
      version: VERSION_ALMACEN,
      situaciones: [situacion("s1")],
      condicionales: [condicional("c1")],
    })
    expect(resultado.success).toBe(true)
  })

  it("acepta listas vacías", () => {
    const resultado = AlmacenSchema.safeParse({
      version: VERSION_ALMACEN,
      situaciones: [],
      condicionales: [],
    })
    expect(resultado.success).toBe(true)
  })

  it("rechaza un id duplicado entre situación y condicional", () => {
    const resultado = AlmacenSchema.safeParse({
      version: VERSION_ALMACEN,
      situaciones: [situacion("mismo")],
      condicionales: [condicional("mismo")],
    })
    expect(resultado.success).toBe(false)
    if (resultado.success) return
    expect(
      resultado.error.issues.some((i) => /duplicado/.test(i.message)),
    ).toBe(true)
  })

  it("rechaza una versión desconocida", () => {
    const resultado = AlmacenSchema.safeParse({
      version: 99,
      situaciones: [],
      condicionales: [],
    })
    expect(resultado.success).toBe(false)
  })

  it("rechaza campos desconocidos (objeto estricto)", () => {
    const resultado = AlmacenSchema.safeParse({
      version: VERSION_ALMACEN,
      situaciones: [],
      condicionales: [],
      extra: true,
    })
    expect(resultado.success).toBe(false)
  })
})

describe("migrarAlmacen", () => {
  it("migra un almacén v1 a v3 con condicionales vacíos", () => {
    const v1 = { version: 1, situaciones: [situacion("s1")] }
    expect(migrarAlmacen(v1)).toEqual({
      version: VERSION_ALMACEN,
      situaciones: [situacion("s1")],
      condicionales: [],
    })
  })

  it("migra un almacén v2 quitando consume y consumeFlag", () => {
    const v2 = {
      version: 2,
      situaciones: [
        {
          ...situacion("s1"),
          opciones: [
            { id: "a", titulo: "A", subtitulo: "a", consume: ["x"] },
            { id: "b", titulo: "B", subtitulo: "b" },
          ],
        },
      ],
      condicionales: [{ ...condicional("c1"), consumeFlag: true }],
    }
    const migrado = migrarAlmacen(v2)
    const json = JSON.stringify(migrado)
    expect(json).not.toContain("consume")
    expect((migrado as { version: number }).version).toBe(VERSION_ALMACEN)
  })

  it("normaliza un almacén ya en v3", () => {
    const v3 = {
      version: VERSION_ALMACEN,
      situaciones: [situacion("s1")],
      condicionales: [],
    }
    expect(migrarAlmacen(v3)).toEqual(v3)
  })
})
