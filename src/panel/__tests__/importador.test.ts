import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { bancoContenido } from "../../content"
import { crearAlmacenEnDisco } from "../almacen"
import { importarBancoActual, leerBancoActual } from "../importador"

describe("importación del banco actual", () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coplero-import-"))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it("importa situaciones y condicionales, ordenados por id", () => {
    const disco = crearAlmacenEnDisco(join(dir, "situaciones.json"))
    const { importadas } = importarBancoActual(disco)
    const esperadasSituaciones = [...bancoContenido.situaciones].sort((a, b) =>
      a.id.localeCompare(b.id),
    )
    const esperadosCondicionales = [
      ...(bancoContenido.condicionales ?? []),
    ].sort((a, b) => a.id.localeCompare(b.id))
    expect(importadas).toBe(
      esperadasSituaciones.length + esperadosCondicionales.length,
    )
    expect(disco.leer().situaciones).toEqual(esperadasSituaciones)
    expect(disco.leer().condicionales).toEqual(esperadosCondicionales)
  })

  it("es determinista: dos importaciones producen el mismo JSON", () => {
    const ruta = join(dir, "situaciones.json")
    importarBancoActual(crearAlmacenEnDisco(ruta))
    const primera = readFileSync(ruta, "utf8")
    importarBancoActual(crearAlmacenEnDisco(ruta))
    expect(readFileSync(ruta, "utf8")).toBe(primera)
  })

  it("leerBancoActual devuelve ambas listas ordenadas por id", () => {
    const { situaciones, condicionales } = leerBancoActual()
    const idsSituaciones = situaciones.map((s) => s.id)
    const idsCondicionales = condicionales.map((c) => c.id)
    expect([...idsSituaciones].sort()).toEqual(idsSituaciones)
    expect([...idsCondicionales].sort()).toEqual(idsCondicionales)
  })
})
