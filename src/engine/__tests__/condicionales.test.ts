import { describe, expect, it } from "vitest"
import {
  actualizarFlags,
  consumirFlagsDeRequisito,
  dentroDeVentana,
  requisitoCumplido,
} from "../condicionales"
import type { Flag, Opcion, Requisito } from "../types"

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
      flags: { tema_social: flag(5, 2, 1) },
      atributos: {},
      temporadas: [],
    }
    expect(requisitoCumplido(total, noConsecutivo)).toBe(true)
    expect(requisitoCumplido(conse, noConsecutivo)).toBe(false)
    const consecutivo = {
      flags: { tema_social: flag(6, 2, 2) },
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

  it("consumo por condicional: c no vuelve a cumplir; d sí", () => {
    const estado = {
      flags: { compartida: flag(3, 1) },
      atributos: {},
      temporadas: [],
    }
    const req: Requisito = { tipo: "flag", flag: "compartida" }
    const consumidas = consumirFlagsDeRequisito(estado.flags, req, "c")

    // El condicional c ya no la ve; d (y sin consumidor) sí.
    expect(requisitoCumplido(req, { ...estado, flags: consumidas }, "c")).toBe(
      false,
    )
    expect(requisitoCumplido(req, { ...estado, flags: consumidas }, "d")).toBe(
      true,
    )
    expect(requisitoCumplido(req, { ...estado, flags: consumidas })).toBe(true)
    // La flag no se borra.
    expect(consumidas.compartida).toBeDefined()
    expect(consumidas.compartida.consumidaPor).toEqual(["c"])
  })

  it("no duplica el id del condicional en consumidaPor", () => {
    const flags = { x: flag(1, 1) }
    const req: Requisito = { tipo: "flag", flag: "x" }
    const una = consumirFlagsDeRequisito(flags, req, "c")
    const dos = consumirFlagsDeRequisito(una, req, "c")
    expect(dos.x.consumidaPor).toEqual(["c"])
  })

  it("alguna consume solo la flag activa", () => {
    const estado = { flags: { a: flag(1, 1) }, atributos: {}, temporadas: [] }
    const req: Requisito = {
      tipo: "alguna",
      de: [
        { tipo: "flag", flag: "a" },
        { tipo: "flag", flag: "b" },
      ],
    }
    const consumidas = consumirFlagsDeRequisito(estado.flags, req, "c")
    expect(consumidas.a.consumidaPor).toEqual(["c"])
    expect(consumidas.b).toBeUndefined()
  })

  it("ninguna y requisito vacío no consumen nada", () => {
    const flags = { x: flag(1, 1) }
    const ninguna: Requisito = {
      tipo: "ninguna",
      de: [{ tipo: "flag", flag: "x" }],
    }
    const vacio: Requisito = { tipo: "ninguna", de: [] }
    expect(
      consumirFlagsDeRequisito(flags, ninguna, "c").x.consumidaPor,
    ).toEqual([])
    expect(consumirFlagsDeRequisito(flags, vacio, "c").x.consumidaPor).toEqual(
      [],
    )
  })

  it("re-ganar una flag no limpia consumidaPor", () => {
    const opcion: Opcion = {
      id: "o",
      titulo: "t",
      subtitulo: "s",
      flags: ["f"],
    }
    const uno = actualizarFlags({}, opcion, 1)
    const consumidas = consumirFlagsDeRequisito(
      uno,
      { tipo: "flag", flag: "f" },
      "c",
    )
    const dos = actualizarFlags(consumidas, opcion, 2)
    expect(dos.f.consumidaPor).toEqual(["c"])
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
    expect(uno.f.consumidaPor).toEqual([])
    const dos = actualizarFlags(uno, opcion, 2)
    expect(dos.f.veces).toBe(2)
    expect(dos.f.anosConsecutivos).toBe(2)
    const tres = actualizarFlags(dos, opcion, 4)
    expect(tres.f.anosConsecutivos).toBe(1)
  })
})

function flag(ano: number, veces: number, anosConsecutivos = 1): Flag {
  return { ano, veces, consumidaPor: [], anosConsecutivos }
}
