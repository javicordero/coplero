import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { Situacion } from "../../content/schema"
import { almacenVacio, crearAlmacenEnDisco, ErrorAlmacen } from "../almacen"
import { type Almacen, VERSION_ALMACEN } from "../esquema"

const situacion = (id: string): Situacion => ({
  id,
  momento: "verano",
  tipo: "personaje",
  categoria: "dinero",
  titulo: `Título ${id}`,
  texto: "",
  opciones: [
    { id: "a", titulo: "A", subtitulo: "a" },
    { id: "b", titulo: "B", subtitulo: "b" },
  ],
})

const conSituaciones = (...ids: string[]): Almacen => ({
  version: VERSION_ALMACEN,
  situaciones: ids.map(situacion),
})

describe("almacén local", () => {
  let dir: string
  let ruta: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coplero-almacen-"))
    ruta = join(dir, "situaciones.json")
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it("devuelve un almacén vacío si el fichero no existe", () => {
    const disco = crearAlmacenEnDisco(ruta)
    expect(disco.existe()).toBe(false)
    expect(disco.leer()).toEqual(almacenVacio())
  })

  it("escribe y vuelve a leer sin pérdida", () => {
    const disco = crearAlmacenEnDisco(ruta)
    const almacen = conSituaciones("s1", "s2")
    disco.escribir(almacen)
    expect(disco.existe()).toBe(true)
    expect(disco.leer()).toEqual(almacen)
  })

  it("no escribe y lanza si el contenido no valida", () => {
    const disco = crearAlmacenEnDisco(ruta)
    disco.escribir(conSituaciones("s1"))
    const previo = readFileSync(ruta, "utf8")
    const invalido = {
      version: VERSION_ALMACEN,
      situaciones: [
        {
          ...situacion("s2"),
          opciones: [{ id: "a", titulo: "A", subtitulo: "a" }],
        },
      ],
    }
    expect(() => disco.escribir(invalido as never)).toThrow(ErrorAlmacen)
    expect(readFileSync(ruta, "utf8")).toBe(previo)
  })

  it("crea copia de seguridad al sobrescribir", () => {
    const disco = crearAlmacenEnDisco(ruta)
    disco.escribir(conSituaciones("s1"))
    disco.escribir(conSituaciones("s1", "s2"))
    const backups = join(dir, "backups")
    expect(existsSync(backups)).toBe(true)
    expect(readdirSync(backups)).toHaveLength(1)
  })

  it("avisa de JSON corrupto sin tocar el fichero", () => {
    writeFileSync(ruta, "{ esto no es json", "utf8")
    const disco = crearAlmacenEnDisco(ruta)
    expect(() => disco.leer()).toThrow(/corrupto/)
    expect(readFileSync(ruta, "utf8")).toBe("{ esto no es json")
  })

  it("rechaza ids de situación duplicados", () => {
    const disco = crearAlmacenEnDisco(ruta)
    expect(() => disco.escribir(conSituaciones("s1", "s1"))).toThrow(
      /duplicado/,
    )
  })
})
