import { describe, expect, it } from "vitest"
import { bancoPrueba } from "../../engine/__tests__/fixtures"
import { construirInforme } from "../estadisticas"
import { informeAJson } from "../informe"
import { partidaFalsa, registroFalso } from "./helpers"

const informe = construirInforme({
  registros: [
    registroFalso({
      partida: partidaFalsa({
        personaje: {
          nombre: "NombreSecreto",
          edad: 30,
          localidad: "Cádiz",
          genero: "masculino",
        },
      }),
    }),
  ],
  banco: bancoPrueba,
  seedBase: "t",
  perfiles: ["aleatorio"],
  configuraciones: ["comparsista"],
})

describe("informe interno (FR-026)", () => {
  it("se marca como de uso interno", () => {
    expect(informe.meta.usoInterno).toBe(true)
  })

  it("no expone el destino ni el nombre del personaje", () => {
    const json = informeAJson(informe)
    expect(json).not.toContain('"destino"')
    expect(json).not.toContain("NombreSecreto")
  })
})
