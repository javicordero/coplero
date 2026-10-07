import { describe, expect, it } from "vitest"
import { crearPartida, siguientePaso } from "../partida"
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

  it("V-01 · la secuencia de resultados por año es reproducible", () => {
    const primera = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    const segunda = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    expect(segunda.temporadas).toEqual(primera.temporadas)

    // Y sobre muchas semillas: cada una da siempre la misma carrera.
    for (let i = 0; i < 40; i++) {
      const input = { ...inputPrueba, seed: `determinismo-${i}` }
      const a = jugarCarrera(input, bancoPrueba, primerOpcion)
      const b = jugarCarrera(input, bancoPrueba, primerOpcion)
      expect(serializar(b)).toEqual(serializar(a))
      expect(
        b.temporadas.map((t) => `${t.ano}:${t.fase}:${t.puesto ?? "X"}`),
      ).toEqual(
        a.temporadas.map((t) => `${t.ano}:${t.fase}:${t.puesto ?? "X"}`),
      )
    }
  })
})

describe("determinismo con género (feature 028)", () => {
  const inputNoBinario = {
    ...inputPrueba,
    personaje: { ...inputPrueba.personaje, genero: "no_binario" as const },
  }

  it("misma semilla + decisiones + género no binario → misma secuencia de pasos", () => {
    const pasoA = siguientePaso(
      crearPartida(inputNoBinario, bancoPrueba),
      bancoPrueba,
    )
    const pasoB = siguientePaso(
      crearPartida(inputNoBinario, bancoPrueba),
      bancoPrueba,
    )
    expect(pasoA).toEqual(pasoB)
  })

  it("la carrera no binaria es reproducible de principio a fin", () => {
    const a = jugarCarrera(inputNoBinario, bancoPrueba, primerOpcion)
    const b = jugarCarrera(inputNoBinario, bancoPrueba, primerOpcion)
    expect(serializar(a)).toEqual(serializar(b))
  })
})
