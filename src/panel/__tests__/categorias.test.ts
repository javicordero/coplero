import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  crearGestorCategorias,
  ErrorCategorias,
  generarCategorias,
  leerCategoriasDe,
} from "../categorias"

describe("catálogo de categorías", () => {
  let dir: string
  let ruta: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coplero-categorias-"))
    ruta = join(dir, "categorias.ts")
    writeFileSync(ruta, generarCategorias(["letra", "musica"]), "utf8")
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it("genera y vuelve a leer sin pérdida", () => {
    const lista = ["letra", "musica", "puestaEnEscena"]
    expect(leerCategoriasDe(generarCategorias(lista))).toEqual(lista)
  })

  it("sigue el formato esperado (as const y tipo derivado)", () => {
    const texto = generarCategorias(["letra"])
    expect(texto).toContain("] as const")
    expect(texto).toContain(
      "export type Categoria = (typeof CATEGORIAS)[number]",
    )
  })

  it("agrega una categoría y la persiste", () => {
    const gestor = crearGestorCategorias(ruta)
    expect(gestor.agregar("vestuario")).toEqual([
      "letra",
      "musica",
      "vestuario",
    ])
    expect(gestor.leer()).toEqual(["letra", "musica", "vestuario"])
  })

  it("rechaza ids inválidos y duplicados", () => {
    const gestor = crearGestorCategorias(ruta)
    expect(() => gestor.agregar("Con espacios")).toThrow(ErrorCategorias)
    expect(() => gestor.agregar("letra")).toThrow(/ya existe/)
    expect(gestor.leer()).toEqual(["letra", "musica"])
  })

  it("no borra una categoría en uso", () => {
    const gestor = crearGestorCategorias(ruta)
    expect(() => gestor.eliminar("letra", new Set(["letra"]))).toThrow(
      /en uso|usan/,
    )
    expect(gestor.leer()).toEqual(["letra", "musica"])
  })

  it("borra una categoría que no está en uso", () => {
    const gestor = crearGestorCategorias(ruta)
    expect(gestor.eliminar("musica", new Set(["letra"]))).toEqual(["letra"])
    expect(gestor.leer()).toEqual(["letra"])
  })

  it("no permite quedarse sin categorías", () => {
    writeFileSync(ruta, generarCategorias(["letra"]), "utf8")
    const gestor = crearGestorCategorias(ruta)
    expect(() => gestor.eliminar("letra", new Set())).toThrow()
    expect(gestor.leer()).toEqual(["letra"])
  })

  it("avisa si el fichero tiene un formato inesperado", () => {
    writeFileSync(ruta, "esto no es un catalogo", "utf8")
    expect(() => leerCategoriasDe(readFileSync(ruta, "utf8"))).toThrow(
      ErrorCategorias,
    )
  })
})
