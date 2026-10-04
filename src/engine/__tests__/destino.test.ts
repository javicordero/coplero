import { describe, expect, it } from "vitest"
import { aptitud } from "../carrera"
import { generarDestino } from "../destino"
import { PARAMETROS_POR_DEFECTO } from "../parametros"
import { ANO_BASE } from "../types"
import { personajePrueba } from "./fixtures"

const params = PARAMETROS_POR_DEFECTO

describe("generarDestino", () => {
  it("sin año de inicio se comporta como ANO_BASE (compatibilidad)", () => {
    const porDefecto = generarDestino("seed-x", personajePrueba, params)
    const explicito = generarDestino(
      "seed-x",
      personajePrueba,
      params,
      ANO_BASE,
    )
    expect(porDefecto).toEqual(explicito)
  })

  it("es determinista: misma semilla, mismo destino", () => {
    const a = generarDestino("seed-y", personajePrueba, params, 2027)
    const b = generarDestino("seed-y", personajePrueba, params, 2027)
    expect(a).toEqual(b)
  })

  it("ancla el año pico al año de inicio (carrera de años naturales)", () => {
    const anoInicio = 2027
    for (let i = 0; i < 50; i++) {
      const seed = `destino-${i}`
      const d = generarDestino(seed, personajePrueba, params, anoInicio)
      const ultimo = anoInicio + d.anosCarrera - 1

      expect(d.anoPico).toBeGreaterThanOrEqual(anoInicio + 1)
      expect(d.anoPico).toBeLessThanOrEqual(ultimo)

      // La curva alcanza su máximo exactamente en el año pico oculto, que ahora
      // es un año natural: si `anoPico` no estuviera anclado a `anoInicio`, el
      // pico caería fuera de la carrera.
      const valores: { ano: number; v: number }[] = []
      for (let ano = anoInicio; ano <= ultimo; ano++) {
        valores.push({
          ano,
          v: aptitud({ ano, anoInicio, destino: d, params }),
        })
      }
      const max = Math.max(...valores.map((x) => x.v))
      expect(valores.find((x) => x.v === max)?.ano, seed).toBe(d.anoPico)
    }
  })
})
