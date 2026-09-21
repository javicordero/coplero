import { describe, expect, it } from "vitest"
import { bancoPrueba, inputPrueba } from "../../engine/__tests__/fixtures"
import { PARAMETROS_POR_DEFECTO } from "../../engine/parametros"
import { jugarCarrera } from "../jugar"
import { PERFILES_POR_DEFECTO } from "../perfiles"
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

  it("S-15 · el reparto de techos es el de docs/01 §7 y no se toca", () => {
    // Los pesos del techo materializan los objetivos de dificultad:
    // P(preliminares) 7 %, P(cuartos) 3 %, P(>= final) 43 %, P(>= podio) 27 %.
    expect(PARAMETROS_POR_DEFECTO.pesosTecho).toEqual({
      preliminares: 7,
      cuartos: 3,
      semifinales: 47,
      final: 16,
      podio: 18,
      primer_premio: 9,
    })

    const conteo = new Map<string, number>()
    const n = 3000
    for (let i = 0; i < n; i++) {
      const r = jugarCarrera({
        input: { ...inputPrueba, seed: `techo-${i}` },
        banco: bancoPrueba,
        perfil: PERFILES_POR_DEFECTO[0],
        configuracionId: "comparsista",
      })
      const techo = r.partida.destino.techo
      conteo.set(techo, (conteo.get(techo) ?? 0) + 1)
    }
    const pct = (clave: string) => ((conteo.get(clave) ?? 0) / n) * 100
    expect(pct("preliminares")).toBeGreaterThan(4)
    expect(pct("preliminares")).toBeLessThan(11)
    expect(pct("preliminares") + pct("cuartos")).toBeGreaterThan(6)
    expect(pct("preliminares") + pct("cuartos")).toBeLessThan(15)
    const altos = pct("final") + pct("podio") + pct("primer_premio")
    expect(altos).toBeGreaterThan(35)
    expect(altos).toBeLessThan(51)
  })
})
