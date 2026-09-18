import { describe, expect, it } from "vitest"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { chooserSimulado, jugarCarrera } from "./helpers"

const CARRERAS = 10_000

describe("simulación masiva", () => {
  it(`ejecuta ${CARRERAS} carreras sin errores en menos de 30 s`, () => {
    const inicio = performance.now()
    const fases = new Map<string, number>()
    for (let i = 0; i < CARRERAS; i++) {
      const fin = jugarCarrera(
        { ...inputPrueba, seed: `sim-${i}` },
        bancoPrueba,
        chooserSimulado,
      )
      expect(fin.fase).toBe("fin")
      for (const t of fin.temporadas) {
        fases.set(t.fase, (fases.get(t.fase) ?? 0) + 1)
      }
    }
    const duracion = performance.now() - inicio
    expect(fases.size).toBeGreaterThan(0)
    expect(duracion).toBeLessThan(30_000)
  }, 60_000)
})
