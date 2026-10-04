import { describe, expect, it } from "vitest"
import type { FaseCOAC } from "../../engine/index"
import { arranqueDevDesdeUrl } from "../dev/arranque"
import {
  arranqueResultadoDesdeUrl,
  CASOS_RESULTADO,
  temporadaResultadoDev,
} from "../dev/fixturesResultado"

const FASES: FaseCOAC[] = ["preliminares", "cuartos", "semifinales", "final"]

describe("fixtures de resultado (dev)", () => {
  it("cada caso es una Temporada válida", () => {
    for (const caso of CASOS_RESULTADO) {
      const temporada = temporadaResultadoDev(caso)
      expect(FASES).toContain(temporada.fase)
      expect(typeof temporada.ano).toBe("number")
      expect(Array.isArray(temporada.premios)).toBe(true)
      expect(typeof temporada.fueraDeConcurso).toBe("boolean")
    }
  })

  it("un caso desconocido cae en el caso por defecto", () => {
    expect(temporadaResultadoDev("inexistente")).toEqual(
      temporadaResultadoDev(null),
    )
  })
})

describe("arranqueResultadoDesdeUrl", () => {
  it("solo se activa con dev=resultado", () => {
    expect(arranqueResultadoDesdeUrl("")).toBeNull()
    expect(arranqueResultadoDesdeUrl("?dev=fin")).toBeNull()
    expect(arranqueResultadoDesdeUrl("?dev=otra")).toBeNull()
  })

  it("reconoce el caso y devuelve el año de la temporada", () => {
    const arranque = arranqueResultadoDesdeUrl(
      "?dev=resultado&caso=sin-premios",
    )
    expect(arranque?.temporada).toEqual(temporadaResultadoDev("sin-premios"))
    expect(arranque?.ano).toBe(temporadaResultadoDev("sin-premios").ano)
  })

  it("usa el caso por defecto sin `caso`", () => {
    const arranque = arranqueResultadoDesdeUrl("?dev=resultado")
    expect(arranque?.temporada).toEqual(temporadaResultadoDev(null))
  })
})

describe("arranqueDevDesdeUrl", () => {
  it("separa el arranque de fin y el de resultado", () => {
    expect(arranqueDevDesdeUrl("?dev=fin")?.pantalla).toBe("fin")
    expect(arranqueDevDesdeUrl("?dev=resultado")?.pantalla).toBe("resultado")
    expect(arranqueDevDesdeUrl("")).toBeNull()
  })
})
