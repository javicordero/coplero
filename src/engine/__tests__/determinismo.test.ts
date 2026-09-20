import { describe, expect, it } from "vitest"
import { crearPartida } from "../partida"
import { serializar } from "../serializar"
import type { BancoContenido } from "../types"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { jugarCarrera, primerOpcion } from "./helpers"

/** Banco con cambio de variante en la primera opción de cada situación. */
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

describe("determinismo", () => {
  it("misma semilla e input producen el mismo estado", () => {
    const a = crearPartida(inputPrueba, bancoPrueba)
    const b = crearPartida(inputPrueba, bancoPrueba)
    expect(serializar(a)).toEqual(serializar(b))
  })

  it("misma semilla y mismas decisiones producen el mismo estado final", () => {
    const a = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    const b = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    expect(serializar(a)).toEqual(serializar(b))
  })

  it("la trayectoria es determinista con cambios de variante", () => {
    const banco = bancoConCambioDeVariante()
    const a = jugarCarrera(inputPrueba, banco, primerOpcion)
    const b = jugarCarrera(inputPrueba, banco, primerOpcion)
    expect(serializar(a)).toEqual(serializar(b))
    expect(a.trayectoria).toEqual(b.trayectoria)
    expect(a.trayectoria.cambios.length).toBeGreaterThan(0)
    expect(a.variante).toBe("otra_variante")
  })

  it("los atributos finales quedan dentro de rango", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    for (const valor of Object.values(fin.atributos)) {
      expect(valor).toBeGreaterThanOrEqual(0)
      expect(valor).toBeLessThanOrEqual(100)
    }
  })
})
