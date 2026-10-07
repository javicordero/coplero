import { describe, expect, it } from "vitest"
import { resolverTexto, rngPara } from "../index"
import type { Genero } from "../types"

/** Azar fijo bajo (→ femenino) y alto (→ por defecto). */
const azarFemenino = () => 0
const azarPorDefecto = () => 0.99

describe("resolverTexto", () => {
  it("femenino con variante válida usa la variante", () => {
    expect(resolverTexto("D", "F", "femenino", "titulo", azarFemenino)).toBe(
      "F",
    )
  })

  it("femenino sin variante usa la forma por defecto", () => {
    expect(
      resolverTexto("D", undefined, "femenino", "titulo", azarFemenino),
    ).toBe("D")
  })

  it("masculino usa siempre la forma por defecto, haya o no variante", () => {
    expect(resolverTexto("D", "F", "masculino", "titulo", azarFemenino)).toBe(
      "D",
    )
    expect(
      resolverTexto("D", undefined, "masculino", "titulo", azarFemenino),
    ).toBe("D")
  })

  it("una variante vacía o con solo espacios cuenta como ausente", () => {
    for (const genero of ["femenino", "masculino", "no_binario"] as Genero[]) {
      expect(resolverTexto("D", "", genero, "titulo", azarFemenino)).toBe("D")
      expect(resolverTexto("D", "   ", genero, "titulo", azarFemenino)).toBe(
        "D",
      )
    }
  })

  it("no binario sin variante usa la forma por defecto", () => {
    expect(
      resolverTexto("D", undefined, "no_binario", "titulo", azarFemenino),
    ).toBe("D")
  })

  it("no binario elige entre ambas formas según el azar", () => {
    expect(resolverTexto("D", "F", "no_binario", "titulo", azarFemenino)).toBe(
      "F",
    )
    expect(
      resolverTexto("D", "F", "no_binario", "titulo", azarPorDefecto),
    ).toBe("D")
  })

  it("no binario es determinista por campo con la misma semilla", () => {
    const campo = "opcion:a:titulo"
    const tirada = () => rngPara("seed", "genero", "s1", campo)()
    const a = resolverTexto("D", "F", "no_binario", campo, tirada)
    const b = resolverTexto("D", "F", "no_binario", campo, tirada)
    expect(a).toBe(b)
  })

  it("no binario muestra ambas formas a lo largo de 100 campos (SC-003)", () => {
    const campos = Array.from({ length: 100 }, (_, i) => `campo-${i}`)
    const resultados = campos.map((campo) =>
      resolverTexto("D", "F", "no_binario", campo, () =>
        rngPara("seed-028", "genero", "sit", campo)(),
      ),
    )
    expect(resultados).toContain("D")
    expect(resultados).toContain("F")
  })
})
