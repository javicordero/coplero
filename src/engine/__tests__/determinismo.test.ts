import { describe, expect, it } from "vitest"
import { crearPartida } from "../partida"
import { serializar } from "../serializar"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { jugarCarrera, primerOpcion } from "./helpers"

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

  it("los atributos finales quedan dentro de rango", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    for (const valor of Object.values(fin.atributos)) {
      expect(valor).toBeGreaterThanOrEqual(0)
      expect(valor).toBeLessThanOrEqual(100)
    }
  })
})
