import { describe, expect, it } from "vitest"
import { codificar, decodificar } from "../../engine/index"
import { EJEMPLO_TARJETA } from "../ejemploTarjeta"

describe("EJEMPLO_TARJETA (portada)", () => {
  it("tiene exactamente tres hitos y sobrevive al códec", () => {
    expect(EJEMPLO_TARJETA.hitos).toHaveLength(3)

    const resultado = decodificar(codificar(EJEMPLO_TARJETA))
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.valor).toEqual(EJEMPLO_TARJETA)
  })

  it("mantiene la coherencia de la carrera 2027–2040", () => {
    const progresion = EJEMPLO_TARJETA.hitosProgreso
    expect(progresion[0]).toEqual({
      ano: 2027,
      fase: "preliminares",
      debut: true,
    })
    expect(progresion.map((h) => [h.ano, h.fase])).toEqual([
      [2027, "preliminares"],
      [2029, "cuartos"],
      [2032, "semifinales"],
      [2035, "final"],
    ])
    expect(EJEMPLO_TARJETA.mejorFase).toBe("final")
    expect(EJEMPLO_TARJETA.mejorPuesto).toBe(1)
    expect(EJEMPLO_TARJETA.anosDeCarrera).toBe(14)
  })

  it("resume las distinciones pedidas con veces = nº de años", () => {
    for (const premio of EJEMPLO_TARJETA.otrosPremios) {
      expect(premio.anos).toHaveLength(premio.veces)
    }

    const aguja = EJEMPLO_TARJETA.otrosPremios.find(
      (p) => p.tipo === "aguja_de_oro",
    )
    const coplas = EJEMPLO_TARJETA.otrosPremios.find(
      (p) => p.tipo === "copla_para_andalucia",
    )
    expect(aguja?.veces).toBe(2)
    expect(coplas?.veces).toBe(1)

    const primerPremio = EJEMPLO_TARJETA.primerosPremios.find(
      (p) => p.tipo === "primer_premio",
    )
    expect(primerPremio?.ano).toBe(2038)
  })
})
