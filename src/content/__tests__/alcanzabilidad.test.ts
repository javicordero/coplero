import { describe, expect, it } from "vitest"
import { simular } from "../../simulacion/index"
import { bancoContenido } from "../index"
import { situacionesInalcanzablesEstaticas } from "../informe"

describe("alcanzabilidad del contenido (Principio III)", () => {
  it("no hay situaciones estáticamente inalcanzables", () => {
    expect(situacionesInalcanzablesEstaticas(bancoContenido)).toEqual([])
  })

  it("todas las situaciones y condicionales aparecen en 10.000 carreras", () => {
    const informe = simular({
      banco: bancoContenido,
      n: 10_000,
      seedBase: "alcanzabilidad",
    })
    expect(informe.meta.generadoConError).toBe(false)
    expect(informe.situaciones.nuncaVistas).toEqual([])
    expect(informe.condicionales.nuncaDisparados).toEqual([])
  }, 60_000)
})
