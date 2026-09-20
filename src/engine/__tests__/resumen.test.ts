import { describe, expect, it } from "vitest"
import { construirResumen } from "../resumen"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { chooserSimulado, jugarCarrera } from "./helpers"

describe("resumen de carrera", () => {
  it("incluye los campos mínimos y no expone el destino", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, chooserSimulado)
    const resumen = construirResumen(fin)
    expect(resumen.nombre).toBe(inputPrueba.personaje.nombre)
    expect(resumen.modalidad).toBe(inputPrueba.modalidad)
    expect(resumen.anosEnActivos).toBeGreaterThan(0)
    expect(typeof resumen.mejorFase).toBe("string")
    expect(Array.isArray(resumen.premios)).toBe(true)
    expect(resumen.trayectoria.modalidadInicial).toBe(inputPrueba.modalidad)
    expect(resumen.trayectoria.varianteInicial).toBe(inputPrueba.variante)
    expect(Array.isArray(resumen.trayectoria.cambios)).toBe(true)

    const serializado = JSON.stringify(resumen)
    expect(serializado).not.toContain("destino")
    expect(serializado).not.toContain("techo")
    expect(serializado).not.toContain("suelo")
    expect(serializado).not.toContain("volatilidad")
    expect(serializado).not.toContain("carisma")
    expect("destino" in resumen).toBe(false)
  })
})
