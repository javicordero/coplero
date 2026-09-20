import { describe, expect, it } from "vitest"
import { bancoContenido } from "../../content/index"
import { simular } from "../simular"

const MARGEN_PUNTOS = 5

describe("sin estrategia dominante", () => {
  const informe = simular({
    banco: bancoContenido,
    n: 3000,
    seedBase: "dominancia",
  })

  it("los perfiles pisan la final en tasas parecidas", () => {
    const tasas = Object.values(informe.porPerfil).map((m) => m.pisanFinal)
    expect(Math.max(...tasas) - Math.min(...tasas)).toBeLessThanOrEqual(
      MARGEN_PUNTOS,
    )
  })

  it("ningún perfil gana primeros premios de forma sistemática", () => {
    const medias = Object.values(informe.porPerfil).map(
      (m) => m.mediaPrimerosPremios,
    )
    expect(Math.max(...medias) - Math.min(...medias)).toBeLessThanOrEqual(0.1)
  })

  it("la distribución objetivo de fases se mantiene", () => {
    expect(informe.fases.pisanFinal).toBeGreaterThan(35)
    expect(informe.fases.pisanFinal).toBeLessThan(55)
    expect(informe.fases.noSuperanCuartos).toBeLessThan(18)
    expect(informe.fases.noSuperanPreliminares).toBeLessThan(12)
  })
})
