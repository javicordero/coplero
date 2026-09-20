import { describe, expect, it } from "vitest"
import { construirTarjeta, sinNombre } from "../tarjeta"
import type { BancoContenido } from "../types"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { chooserSimulado, jugarCarrera, primerOpcion } from "./helpers"

const CLAVES_OCULTAS = [
  "destino",
  "techo",
  "suelo",
  "anoPico",
  "anosCarrera",
  "volatilidad",
  "carisma",
  "milagro",
]

function bancoConCambioDeVariante(): BancoContenido {
  return {
    ...bancoPrueba,
    situaciones: bancoPrueba.situaciones.map((s) => ({
      ...s,
      opciones: s.opciones.map((o, i) =>
        i === 0 ? { ...o, cambiaVariante: "otra_variante" } : o,
      ),
    })),
  }
}

describe("tarjeta final", () => {
  it("incluye los campos mínimos y no expone datos ocultos", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
    const tarjeta = construirTarjeta(fin, bancoPrueba)

    expect(tarjeta.nombre).toBe(inputPrueba.personaje.nombre)
    expect(tarjeta.modalidadInicial).toBe(inputPrueba.modalidad)
    expect(tarjeta.varianteInicial).toBe(inputPrueba.variante)
    expect(tarjeta.anosDeCarrera).toBeGreaterThan(0)
    expect(tarjeta.anosEnActivo).toBeGreaterThan(0)
    expect(typeof tarjeta.mejorFase).toBe("string")
    expect(typeof tarjeta.fraseCierre).toBe("string")
    expect(Array.isArray(tarjeta.otrosPremios)).toBe(true)

    for (const clave of CLAVES_OCULTAS) {
      expect(clave in tarjeta).toBe(false)
    }
  })

  it("produce exactamente tres hitos", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
    const tarjeta = construirTarjeta(fin, bancoPrueba)
    expect(tarjeta.hitos).toHaveLength(3)
    for (const hito of tarjeta.hitos) {
      expect(hito.texto.length).toBeGreaterThan(0)
    }
  })

  it("agrupa los otros premios por tipo y nunca con ceros", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
    const tarjeta = construirTarjeta(fin, bancoPrueba)
    for (const premio of tarjeta.otrosPremios) {
      expect(premio.veces).toBeGreaterThan(0)
      expect(premio.anos).toHaveLength(premio.veces)
    }
    // Los primeros premios del COAC van separados de los otros premios.
    expect(Array.isArray(tarjeta.primerosPremios)).toBe(true)
  })

  it("sinNombre oculta el nombre sin tocar el resto", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
    const tarjeta = construirTarjeta(fin, bancoPrueba)
    const anonima = sinNombre(tarjeta)
    expect(anonima.nombre).toBeNull()
    expect(anonima.fraseCierre).toBe(tarjeta.fraseCierre)
    expect(anonima.hitos).toEqual(tarjeta.hitos)
    expect(JSON.stringify(anonima)).not.toContain(inputPrueba.personaje.nombre)
  })

  it("es determinista: misma partida ⇒ misma tarjeta", () => {
    const a = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
    const b = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
    expect(construirTarjeta(a, bancoPrueba)).toEqual(
      construirTarjeta(b, bancoPrueba),
    )
  })

  it("refleja la evolución de variante y narra el cambio", () => {
    const banco = bancoConCambioDeVariante()
    const fin = jugarCarrera(inputPrueba, banco, primerOpcion)
    const tarjeta = construirTarjeta(fin, banco)
    expect(tarjeta.cambios.length).toBeGreaterThan(0)
    expect(tarjeta.varianteFinal).not.toBe(tarjeta.varianteInicial)
    expect(tarjeta.hitos.some((h) => h.tipo === "cambio_variante")).toBe(true)
  })

  it("no inventa cambios cuando no los hay", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    const tarjeta = construirTarjeta(fin, bancoPrueba)
    expect(tarjeta.cambios).toHaveLength(0)
    expect(tarjeta.modalidadFinal).toBe(tarjeta.modalidadInicial)
    expect(
      tarjeta.hitos.some(
        (h) => h.tipo === "cambio_variante" || h.tipo === "cambio_modalidad",
      ),
    ).toBe(false)
  })

  it("mejorPuesto es el menor puesto en concurso", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
    const tarjeta = construirTarjeta(fin, bancoPrueba)
    const puestos = fin.temporadas
      .filter((t) => !t.fueraDeConcurso)
      .map((t) => t.puesto)
      .filter((p): p is number => typeof p === "number")
    if (puestos.length > 0) {
      expect(tarjeta.mejorPuesto).toBe(Math.min(...puestos))
    } else {
      expect(tarjeta.mejorPuesto).toBeNull()
    }
  })
})
