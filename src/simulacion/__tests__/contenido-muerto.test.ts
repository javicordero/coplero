import { describe, expect, it } from "vitest"
import type { BancoContenido } from "../../engine/index"
import { construirInforme } from "../estadisticas"
import { registroFalso } from "./helpers"

const banco: BancoContenido = {
  situaciones: ["A", "B", "C"].map((id) => ({
    id,
    momento: "verano",
    tipo: "contenido",
    categoria: "letra",
    titulo: id,
    texto: "",
    opciones: [{ id: `${id}_o`, titulo: id, subtitulo: "" }],
  })),
  condicionales: [
    {
      id: "D",
      momento: "verano",
      tipo: "personaje",
      categoria: "dinero",
      titulo: "D",
      texto: "",
      opciones: [{ id: "D_o", titulo: "D", subtitulo: "" }],
      requiere: { tipo: "flag", flag: "x" },
      ventanaAnos: 1,
      probabilidad: 0.5,
      consumeFlag: false,
    },
  ],
}

describe("contenido muerto", () => {
  it("ordena frecuencias y detecta lo nunca visto", () => {
    const informe = construirInforme({
      registros: [
        registroFalso({ situacionesVistas: ["A", "A"] }),
        registroFalso({ situacionesVistas: ["B"] }),
      ],
      banco,
      seedBase: "t",
      perfiles: ["aleatorio"],
      configuraciones: ["comparsista"],
    })
    expect(informe.situaciones.totalDecisiones).toBe(3)
    expect(informe.situaciones.masFrecuentes[0].id).toBe("A")
    expect(informe.situaciones.masFrecuentes[0].n).toBe(2)
    expect(informe.situaciones.menosFrecuentes[0].id).toBe("B")
    expect(informe.situaciones.nuncaVistas).toEqual(["C"])
    expect(informe.condicionales.nuncaDisparados).toEqual(["D"])
    expect(informe.condicionales.disparados).toEqual([])
  })

  it("marca condicionales disparados", () => {
    const informe = construirInforme({
      registros: [registroFalso({ situacionesVistas: ["D"] })],
      banco,
      seedBase: "t",
      perfiles: ["aleatorio"],
      configuraciones: ["comparsista"],
    })
    expect(informe.condicionales.disparados).toEqual(["D"])
    expect(informe.condicionales.nuncaDisparados).toEqual([])
  })
})
