import { describe, expect, it } from "vitest"
import { bancoPrueba } from "../../engine/__tests__/fixtures"
import { informeAJson } from "../informe"
import { simular } from "../simular"

describe("simular", () => {
  it("completa las carreras sin errores", () => {
    const informe = simular({ banco: bancoPrueba, n: 9, seedBase: "sim" })
    expect(informe.meta.n).toBe(9)
    expect(informe.errores).toEqual([])
    expect(informe.meta.generadoConError).toBe(false)
    expect(informe.estadosImposibles).toEqual([])
  })

  it("es determinista: mismas opciones, mismo informe", () => {
    const opciones = { banco: bancoPrueba, n: 9, seedBase: "determinismo" }
    expect(informeAJson(simular(opciones))).toBe(
      informeAJson(simular(opciones)),
    )
  })

  it("genera seeds distintas por carrera", () => {
    const informe = simular({ banco: bancoPrueba, n: 3, seedBase: "s" })
    expect(informe.duracionMedia).toBeGreaterThan(0)
  })
})
