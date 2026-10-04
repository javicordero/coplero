import { describe, expect, it } from "vitest"
import { codificar, decodificar } from "../../engine/index"
import {
  arranqueFinDesdeUrl,
  CASOS_FIN,
  tarjetaFinDev,
} from "../dev/fixturesFin"

describe("fixtures de la pantalla final (dev)", () => {
  it("cada caso tiene tres hitos y sobrevive al codec", () => {
    for (const caso of CASOS_FIN) {
      const tarjeta = tarjetaFinDev(caso)
      expect(tarjeta.hitos).toHaveLength(3)
      const resultado = decodificar(codificar(tarjeta))
      expect(resultado.ok).toBe(true)
      if (resultado.ok) expect(resultado.valor).toEqual(tarjeta)
    }
  })

  it("un caso desconocido cae en el caso por defecto", () => {
    expect(tarjetaFinDev("inexistente")).toEqual(tarjetaFinDev(null))
  })
})

describe("arranqueFinDesdeUrl", () => {
  it("solo se activa con dev=fin", () => {
    expect(arranqueFinDesdeUrl("")).toBeNull()
    expect(arranqueFinDesdeUrl("?dev=1")).toBeNull()
    expect(arranqueFinDesdeUrl("?dev=otra")).toBeNull()
  })

  it("reconoce el caso y el momento de la URL", () => {
    const arranque = arranqueFinDesdeUrl(
      "?dev=fin&caso=retirada&momento=verano",
    )
    expect(arranque?.momento).toBe("verano")
    expect(arranque?.tarjeta).toEqual(tarjetaFinDev("retirada"))
  })

  it("usa el caso y el momento por defecto", () => {
    const arranque = arranqueFinDesdeUrl("?dev=fin")
    expect(arranque?.momento).toBe("febrero")
    expect(arranque?.tarjeta).toEqual(tarjetaFinDev("campeon"))
  })
})
