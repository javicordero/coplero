import { describe, expect, it } from "vitest"
import { crearPartida, siguientePaso } from "../partida"
import type { BancoContenido, Situacion } from "../types"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { chooserSimulado, jugarCarrera } from "./helpers"

const situacionNueva: Situacion = {
  id: "v_extra",
  momento: "verano",
  tipo: "contenido",
  categoria: "letra",
  titulo: "Situación añadida",
  texto: "Añadir contenido no debe tocar el motor.",
  opciones: [
    { id: "a", titulo: "Opción A", subtitulo: "Uno", efectos: { letra: 1 } },
    { id: "b", titulo: "Opción B", subtitulo: "Dos", efectos: { letra: 2 } },
  ],
}

describe("extensibilidad del contenido", () => {
  it("añadir una situación no requiere tocar el engine y la carrera termina", () => {
    const bancoExtendido: BancoContenido = {
      ...bancoPrueba,
      situaciones: [...bancoPrueba.situaciones, situacionNueva],
    }
    const fin = jugarCarrera(inputPrueba, bancoExtendido, chooserSimulado)
    expect(fin.fase).toBe("fin")
    expect(fin.temporadas.length).toBeGreaterThan(0)
  })

  it("la situación nueva es seleccionable", () => {
    const extraContenido: Situacion = {
      ...situacionNueva,
      id: "v_extra_c",
      tipo: "contenido",
    }
    const extraPersonaje: Situacion = {
      ...situacionNueva,
      id: "v_extra_p",
      tipo: "personaje",
    }
    const bancoSoloExtra: BancoContenido = {
      situaciones: [extraContenido, extraPersonaje],
    }
    const p = crearPartida(inputPrueba, bancoSoloExtra)
    const paso = siguientePaso(p, bancoSoloExtra)
    expect(paso.tipo).toBe("decision")
    if (paso.tipo === "decision")
      expect(paso.situacion.id.startsWith("v_extra")).toBe(true)
  })
})
