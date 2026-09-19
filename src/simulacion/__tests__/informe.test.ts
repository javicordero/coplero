import { describe, expect, it } from "vitest"
import { bancoPrueba } from "../../engine/__tests__/fixtures"
import { construirInforme } from "../estadisticas"
import { formatearInforme } from "../informe"
import { registroFalso } from "./helpers"

const informe = construirInforme({
  registros: [
    registroFalso({
      perfilId: "aleatorio",
      configuracionId: "comparsista",
      mejorFase: "final",
      participo: true,
      duracion: 20,
      anoPico: 3,
      situacionesVistas: ["v_letra_tema"],
    }),
  ],
  banco: bancoPrueba,
  seedBase: "t",
  perfiles: ["aleatorio"],
  configuraciones: ["comparsista"],
})

describe("formatearInforme", () => {
  it("incluye todos los bloques minimos", () => {
    const texto = formatearInforme(informe)
    for (const etiqueta of [
      "pisa final",
      "no supera cuartos",
      "no supera preliminares",
      "Duracion",
      "ano pico",
      "Situaciones",
      "Condicionales",
      "Atributos",
      "Estados imposibles",
      "Errores",
      "Desglose por perfil",
      "Desglose por configuracion",
    ]) {
      expect(texto).toContain(etiqueta)
    }
  })

  it("dice explicitamente cuando no hay estados imposibles", () => {
    expect(formatearInforme(informe)).toContain("ninguno detectado")
  })
})
