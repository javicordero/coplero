import { describe, expect, it } from "vitest"
import { bancoContenido } from "../../content"
import type { Situacion } from "../../content/schema"
import { flagsDeRequisito } from "../../content/schema"
import { actualizar, crear, eliminar } from "../crud"
import { type Almacen, VERSION_ALMACEN } from "../esquema"

const nueva = (id: string, overrides: Partial<Situacion> = {}): Situacion => ({
  id,
  momento: "verano",
  titulo: `Título ${id}`,
  texto: "",
  opciones: [
    { id: "a", titulo: "A", subtitulo: "a" },
    { id: "b", titulo: "B", subtitulo: "b" },
  ],
  ...overrides,
})

/** El banco real importado (sirve de base para no romper reglas cruzadas). */
const base = (): Almacen => ({
  version: VERSION_ALMACEN,
  situaciones: [...bancoContenido.situaciones],
})

describe("CRUD del panel", () => {
  it("crea una situación válida sin mutar el almacén original", () => {
    const almacen = base()
    const antes = almacen.situaciones.length
    const resultado = crear(almacen, nueva("prueba_nueva"))
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.almacen.situaciones).toHaveLength(antes + 1)
    expect(almacen.situaciones).toHaveLength(antes)
  })

  it("rechaza un id de situación duplicado", () => {
    const almacen = base()
    const repetida = almacen.situaciones[0]
    if (!repetida) throw new Error("banco vacío")
    const resultado = crear(almacen, repetida)
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.status).toBe(422)
    expect(resultado.errores[0]?.mensaje).toMatch(/ya existe/)
  })

  it("rechaza menos de dos opciones", () => {
    const almacen = base()
    const resultado = crear(
      almacen,
      nueva("prueba_corta", {
        opciones: [{ id: "a", titulo: "A", subtitulo: "a" }],
      }),
    )
    expect(resultado.ok).toBe(false)
  })

  it("rechaza efectos sin excepcion declarada", () => {
    const almacen = base()
    const resultado = crear(
      almacen,
      nueva("prueba_efecto", {
        opciones: [
          { id: "a", titulo: "A", subtitulo: "a", efectos: { letra: 2 } },
          { id: "b", titulo: "B", subtitulo: "b" },
        ],
      }),
    )
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(
      resultado.errores.some((e) => /excepción|excepcion/i.test(e.mensaje)),
    ).toBe(true)
  })

  it("rechaza una variante fuera del catálogo", () => {
    const almacen = base()
    const resultado = crear(
      almacen,
      nueva("prueba_variante", { variantes: ["no_existe"] }),
    )
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(
      resultado.errores.some((e) => /catálogo|variante/i.test(e.mensaje)),
    ).toBe(true)
  })

  it("actualiza conservando el almacén previo", () => {
    const almacen = base()
    const objetivo = almacen.situaciones[0]
    if (!objetivo) throw new Error("banco vacío")
    const editada = { ...objetivo, titulo: "Título cambiado" }
    const resultado = actualizar(almacen, objetivo.id, editada)
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.almacen.situaciones[0]?.titulo).toBe("Título cambiado")
    expect(almacen.situaciones[0]?.titulo).toBe(objetivo.titulo)
  })

  it("rechaza cambiar el id al actualizar", () => {
    const almacen = base()
    const objetivo = almacen.situaciones[0]
    if (!objetivo) throw new Error("banco vacío")
    const resultado = actualizar(almacen, objetivo.id, {
      ...objetivo,
      id: "otro_id",
    })
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.status).toBe(422)
  })

  it("devuelve 404 si la situación no existe", () => {
    const almacen = base()
    const resultado = eliminar(almacen, "no_existe")
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.status).toBe(404)
  })

  it("elimina una situación creada previamente", () => {
    const almacen = base()
    const creada = crear(almacen, nueva("prueba_borrar"))
    if (!creada.ok) throw new Error("no se pudo crear la situación de prueba")
    const resultado = eliminar(creada.almacen, "prueba_borrar")
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.almacen.situaciones.map((s) => s.id)).not.toContain(
      "prueba_borrar",
    )
  })

  it("rechaza borrar una situación cuya flag usa un condicional (flag huérfana)", () => {
    const almacen = base()
    const condicional = (bancoContenido.condicionales ?? []).find(
      (c) => flagsDeRequisito(c.requiere).length > 0,
    )
    if (!condicional) throw new Error("no hay condicionales con flags")
    const flag = flagsDeRequisito(condicional.requiere)[0]
    const portadora = almacen.situaciones.find((s) =>
      s.opciones.some((o) => o.flags?.includes(flag)),
    )
    if (!portadora) throw new Error("no hay situación que declare la flag")
    const resultado = eliminar(almacen, portadora.id)
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.errores.some((e) => e.mensaje.includes(flag))).toBe(true)
  })
})
