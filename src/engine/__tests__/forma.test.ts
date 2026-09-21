import { describe, expect, it } from "vitest"
import { forma } from "../forma"
import { PARAMETROS_POR_DEFECTO } from "../parametros"

const params = PARAMETROS_POR_DEFECTO

function conRho(rho: number) {
  return { ...PARAMETROS_POR_DEFECTO, memoriaForma: rho }
}

/** Autocorrelación de lag 1 promediada sobre muchas semillas y años. */
function autocorrelacion(rho: number): number {
  const p = conRho(rho)
  let numerador = 0
  let denominador = 0
  for (let s = 0; s < 300; s++) {
    const seed = `forma-${s}`
    for (let t = 0; t < 19; t++) {
      const a = forma({ ano: 1 + t, anoInicio: 1, seed, params: p })
      const b = forma({ ano: 2 + t, anoInicio: 1, seed, params: p })
      numerador += a * b
      denominador += a * a
    }
  }
  return numerador / denominador
}

/** V-03 · la forma del año (013, E2). */
describe("forma", () => {
  it("es determinista y no depende del orden de las llamadas", () => {
    const args = { ano: 7, anoInicio: 1, seed: "abc", params }
    expect(forma(args)).toBe(forma(args))
    const primero = forma({ ...args, ano: 12 })
    forma({ ...args, ano: 3 })
    expect(forma({ ...args, ano: 12 })).toBe(primero)
  })

  it("está acotada por la serie geométrica", () => {
    const rho = 0.5
    const p = conRho(rho)
    const techo = params.amplitudForma / (1 - rho)
    for (let s = 0; s < 200; s++) {
      for (const ano of [1, 5, 12, 20]) {
        const valor = forma({
          ano,
          anoInicio: 1,
          seed: `limite-${s}`,
          params: p,
        })
        expect(Math.abs(valor)).toBeLessThanOrEqual(techo + 1e-9)
      }
    }
  })

  it("tiene memoria: un año se parece al anterior cuando ρ > 0", () => {
    const correlacion = autocorrelacion(0.5)
    expect(correlacion).toBeGreaterThan(0.4)
    expect(correlacion).toBeLessThan(0.65)
  })

  it("la memoria decae al crecer la distancia", () => {
    const rho = 0.6
    const p = conRho(rho)
    const lag = (d: number) => {
      let num = 0
      let den = 0
      for (let s = 0; s < 400; s++) {
        const seed = `decae-${s}`
        for (let t = 0; t + d < 20; t++) {
          const a = forma({ ano: 1 + t, anoInicio: 1, seed, params: p })
          const b = forma({ ano: 1 + t + d, anoInicio: 1, seed, params: p })
          num += a * b
          den += a * a
        }
      }
      return num / den
    }
    const corto = lag(1)
    const largo = lag(6)
    expect(corto).toBeGreaterThan(largo)
    expect(largo).toBeLessThan(corto * 0.5)
  })

  it("con ρ = 0 degrada a ruido blanco", () => {
    expect(Math.abs(autocorrelacion(0))).toBeLessThan(0.1)
  })

  it("con amplitud 0 la forma no aporta nada", () => {
    const p = { ...PARAMETROS_POR_DEFECTO, amplitudForma: 0 }
    expect(
      Math.abs(forma({ ano: 9, anoInicio: 1, seed: "x", params: p })),
    ).toBe(0)
  })
})
