import { describe, expect, it } from "vitest"
import { bancoPrueba } from "../../engine/__tests__/fixtures"
import { simular } from "../simular"

describe("parametros inyectables (SC-008)", () => {
  it("cambiar parametros altera el informe sin tocar codigo", () => {
    const base = simular({ banco: bancoPrueba, n: 9, seedBase: "param" })
    const empujado = simular({
      banco: bancoPrueba,
      n: 9,
      seedBase: "param",
      parametros: {
        umbralesNivel: {
          cuartos: 0,
          semifinales: 0,
          final: 0,
          podio: 0,
          primer_premio: 0,
        },
        pesosTecho: {
          preliminares: 0,
          cuartos: 0,
          semifinales: 0,
          final: 0,
          podio: 0,
          primer_premio: 100,
        },
      },
    })
    expect(empujado.meta.n).toBe(base.meta.n)
    expect(empujado.fases.pisanFinal).toBeGreaterThan(base.fases.pisanFinal)
  })
})
