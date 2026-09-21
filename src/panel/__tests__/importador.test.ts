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

  it("importa todas las situaciones campo a campo y ordenadas por id", () => {
    const disco = crearAlmacenEnDisco(join(dir, "situaciones.json"))
    const { importadas } = importarBancoActual(disco)
    const esperadas = [...bancoContenido.situaciones].sort((a, b) =>
      a.id.localeCompare(b.id),
    )
    expect(importadas).toBe(esperadas.length)
    expect(disco.leer().situaciones).toEqual(esperadas)
  })

  it("es determinista: dos importaciones producen el mismo JSON", () => {
    const ruta = join(dir, "situaciones.json")
    importarBancoActual(crearAlmacenEnDisco(ruta))
    const primera = readFileSync(ruta, "utf8")
    importarBancoActual(crearAlmacenEnDisco(ruta))
    expect(readFileSync(ruta, "utf8")).toBe(primera)
  })

  it("leerBancoActual devuelve el banco ordenado por id", () => {
    const ids = leerBancoActual().map((s) => s.id)
    expect([...ids].sort()).toEqual(ids)
  })
})
