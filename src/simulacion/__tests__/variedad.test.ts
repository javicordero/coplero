import { describe, expect, it } from "vitest"
import { bancoPrueba } from "../../engine/__tests__/fixtures"
import { simular } from "../simular"

describe("variedad de perfiles y configuraciones", () => {
  const informe = simular({ banco: bancoPrueba, n: 24, seedBase: "variedad" })

  it("reparte las carreras de forma balanceada por perfil", () => {
    expect(Object.keys(informe.porPerfil).sort()).toEqual([
      "aleatorio",
      "codicioso",
      "erratico",
    ])
    for (const m of Object.values(informe.porPerfil)) {
      expect(m.n).toBe(8)
    }
  })

  it("reparte las carreras de forma balanceada por configuracion", () => {
    expect(Object.keys(informe.porConfiguracion)).toHaveLength(4)
    for (const m of Object.values(informe.porConfiguracion)) {
      expect(m.n).toBe(6)
    }
  })
})
