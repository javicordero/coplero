import { deflateSync, strToU8 } from "fflate"
import { describe, expect, it } from "vitest"
import { bytesABase64Url, codificar, decodificar } from "../codec"
import { construirTarjeta } from "../tarjeta"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { chooserSimulado, jugarCarrera } from "./helpers"

function tarjetaDePrueba() {
  const fin = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
  return construirTarjeta(fin, bancoPrueba)
}

function codigoConVersion(version: number): string {
  const payload = JSON.stringify({ v: version, t: tarjetaDePrueba() })
  return bytesABase64Url(deflateSync(strToU8(payload)))
}

describe("codec de la tarjeta", () => {
  it("roundtrip: decodificar(codificar(t)) reproduce la tarjeta", () => {
    const tarjeta = tarjetaDePrueba()
    const resultado = decodificar(codificar(tarjeta))
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.valor).toEqual(tarjeta)
  })

  it("el código es URL-safe y cabe en menos de 2000 caracteres", () => {
    const codigo = codificar(tarjetaDePrueba())
    expect(codigo).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(codigo.length).toBeLessThan(2000)
  })

  it("es determinista: la misma tarjeta produce el mismo código", () => {
    const tarjeta = tarjetaDePrueba()
    expect(codificar(tarjeta)).toBe(codificar(tarjeta))
  })

  it("no contiene el seed ni claves de destino", () => {
    const codigo = codificar(tarjetaDePrueba())
    const resultado = decodificar(codigo)
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    const serializado = JSON.stringify(resultado.valor)
    expect(serializado).not.toContain("seed")
    for (const clave of [
      "destino",
      "techo",
      "suelo",
      "volatilidad",
      "carisma",
      "anoPico",
      "milagro",
    ]) {
      expect(serializado).not.toContain(clave)
    }
  })

  it("rechaza un código corrupto con CODIGO_INVALIDO", () => {
    const resultado = decodificar("no-es-un-codigo-valido!!")
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.error.codigo).toBe("CODIGO_INVALIDO")
  })

  it("rechaza una versión desconocida", () => {
    const resultado = decodificar(codigoConVersion(999))
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("VERSION_CODIGO_INCOMPATIBLE")
    }
  })
})
