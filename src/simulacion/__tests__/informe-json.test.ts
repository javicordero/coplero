import { describe, expect, it } from "vitest"
import { bancoPrueba } from "../../engine/__tests__/fixtures"
import { informeAJson } from "../informe"
import { simular } from "../simular"

const opciones = { banco: bancoPrueba, n: 6, seedBase: "json" }

describe("informeAJson", () => {
  it("es JSON parseable y estable", () => {
    const informe = simular(opciones)
    const a = informeAJson(informe)
    const b = informeAJson(simular(opciones))
    expect(a).toBe(b)
    expect(() => JSON.parse(a)).not.toThrow()
  })

  it("no incluye el tiempo de ejecucion", () => {
    const json = informeAJson(simular(opciones))
    expect(json).not.toContain('"tiempo"')
    expect(json).not.toContain('"ms"')
  })
})
