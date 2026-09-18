import { describe, expect, it } from "vitest"
import {
  actualizarFlags,
  consumirFlagsDeRequisito,
  dentroDeVentana,
  requisitoCumplido,
} from "../condicionales"
import type { Flag, Opcion, Requisito } from "../types"

const sinFlags = { flags: {}, atributos: {}, temporadas: [] }

describe("condicionales", () => {
  it("evalúa flag, todas, alguna, ninguna y atributo", () => {
    const estado = {
      flags: { tema_social: flag(1, 1) },
      atributos: { letra: 60 },
      temporadas: [],
    }
    expect(
      requisitoCumplido({ tipo: "flag", flag: "tema_social" }, estado),
    ).toBe(true)
    expect(requisitoCumplido({ tipo: "flag", flag: "otra" }, estado)).toBe(
      false,
    )
    expect(
      requisitoCumplido(
        {
          tipo: "todas",
          de: [
            { tipo: "flag", flag: "tema_social" },
            { tipo: "atributo", atributo: "letra", min: 50 },
          ],
        },
        estado,
      ),
    ).toBe(true)
    expect(
      requisitoCumplido(
        {
          tipo: "alguna",
          de: [
            { tipo: "flag", flag: "x" },
            { tipo: "flag", flag: "tema_social" },
          ],
        },
        estado,
      ),
    ).toBe(true)
    expect(
      requisitoCumplido(
        { tipo: "ninguna", de: [{ tipo: "flag", flag: "x" }] },
        estado,
      ),
    ).toBe(true)
    expect(
      requisitoCumplido(
        { tipo: "atributo", atributo: "letra", min: 70 },
        estado,
      ),
    ).toBe(false)
  })

  it("flagRepetida distingue total y consecutivos", () => {
    const total: Requisito = {
      tipo: "flagRepetida",
      flag: "tema_social",
      veces: 2,
    }
    const conse: Requisito = {
      tipo: "flagRepetida",
      flag: "tema_social",
      veces: 2,
      consecutivos: true,
    }
    const noConsecutivo = {
      flags: {
        tema_social: {
          ano: 5,
          veces: 2,
          consumida: false,
          anosConsecutivos: 1,
        },
      },
      atributos: {},
      temporadas: [],
    }
    expect(requisitoCumplido(total, noConsecutivo)).toBe(true)
    expect(requisitoCumplido(conse, noConsecutivo)).toBe(false)
    const consecutivo = {
      flags: {
        tema_social: {
          ano: 6,
          veces: 2,
          consumida: false,
          anosConsecutivos: 2,
        },
      },
      atributos: {},
      temporadas: [],
    }
    expect(requisitoCumplido(conse, consecutivo)).toBe(true)
  })

  it("faseAlcanzada mira la misma partida", () => {
    const estado = {
      flags: {},
      atributos: {},
      temporadas: [
        {
          ano: 1,
          fase: "semifinales" as const,
          premios: [],
          fueraDeConcurso: false,
        },
      ],
    }
    expect(
      requisitoCumplido({ tipo: "faseAlcanzada", fase: "cuartos" }, estado),
    ).toBe(true)
    expect(
      requisitoCumplido({ tipo: "faseAlcanzada", fase: "final" }, estado),
    ).toBe(false)
  })

  it("ventana: expira y deja de abrir", () => {
    const req: Requisito = { tipo: "flag", flag: "x" }
    expect(
      dentroDeVentana(req, { flags: { x: flag(10, 1) }, anoActual: 12 }, 2),
    ).toBe(true)
    expect(
      dentroDeVentana(req, { flags: { x: flag(10, 1) }, anoActual: 13 }, 2),
    ).toBe(false)
  })

  it("consumir no borra la flag", () => {
    const flags = { x: flag(3, 2) }
    const consumidas = consumirFlagsDeRequisito(flags, {
      tipo: "flag",
      flag: "x",
    })
    expect(consumidas.x).toBeDefined()
    expect(consumidas.x.consumida).toBe(true)
    expect(
      requisitoCumplido(
        { tipo: "flag", flag: "x" },
        { ...sinFlags, flags: consumidas },
      ),
    ).toBe(true)
  })

  it("actualizarFlags acumula veces y consecutivos", () => {
    const opcion: Opcion = {
      id: "o",
      titulo: "t",
      subtitulo: "s",
      flags: ["f"],
    }
    const uno = actualizarFlags({}, opcion, 1)
    expect(uno.f.veces).toBe(1)
    const dos = actualizarFlags(uno, opcion, 2)
    expect(dos.f.veces).toBe(2)
    expect(dos.f.anosConsecutivos).toBe(2)
    const tres = actualizarFlags(dos, opcion, 4)
    expect(tres.f.anosConsecutivos).toBe(1)
  })
})

function flag(ano: number, veces: number): Flag {
  return { ano, veces, consumida: false, anosConsecutivos: 1 }
}
