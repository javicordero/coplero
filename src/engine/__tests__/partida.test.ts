import { describe, expect, it } from "vitest"
import { aplicarEfectos } from "../atributos"
import { continuar, crearPartida, elegir, siguientePaso } from "../partida"
import type { Atributos, BancoContenido, Opcion } from "../types"
import { bancoPrueba, inputPrueba } from "./fixtures"

const base: Atributos = {
  letra: 50,
  musica: 50,
  puestaEnEscena: 50,
  popularidad: 50,
  cohesion: 50,
  dinero: 50,
}

describe("flujo de partida", () => {
  it("verano → febrero → coac → siguiente año", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const pasoVerano = siguientePaso(p, bancoPrueba)
    expect(pasoVerano.tipo).toBe("decision")
    if (pasoVerano.tipo !== "decision") return
    const r1 = elegir(p, pasoVerano.situacion.opciones[0].id, bancoPrueba)
    expect(r1.ok).toBe(true)
    if (!r1.ok) return
    const trasVerano = r1.valor
    expect(trasVerano.momento).toBe("febrero")

    const pasoFebrero = siguientePaso(trasVerano, bancoPrueba)
    expect(pasoFebrero.tipo).toBe("decision")
    if (pasoFebrero.tipo !== "decision") return
    const r2 = elegir(
      trasVerano,
      pasoFebrero.situacion.opciones[0].id,
      bancoPrueba,
    )
    expect(r2.ok).toBe(true)
    if (!r2.ok) return
    expect(r2.valor.fase).toBe("coac")

    const pasoResultado = siguientePaso(r2.valor, bancoPrueba)
    expect(pasoResultado.tipo).toBe("resultado")

    const siguiente = continuar(r2.valor)
    expect(siguiente.anoActual).toBe(p.anoActual + 1)
    expect(siguiente.momento).toBe("verano")
    expect(siguiente.fase).toBe("decision")
  })

  it("opción inválida devuelve error y no muta el estado", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const copia = JSON.stringify(p)
    const res = elegir(p, "no-existe", bancoPrueba)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.codigo).toBe("OPCION_INVALIDA")
    expect(JSON.stringify(p)).toEqual(copia)
  })

  it("elegir no muta la partida de entrada", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const copia = JSON.parse(JSON.stringify(p))
    const paso = siguientePaso(p, bancoPrueba)
    if (paso.tipo !== "decision") throw new Error("esperaba decisión")
    const res = elegir(p, paso.situacion.opciones[0].id, bancoPrueba)
    expect(res.ok).toBe(true)
    expect(JSON.parse(JSON.stringify(p))).toEqual(copia)
  })

  it("saltaCOAC marca la temporada fuera de concurso y sin premios", () => {
    const opcionSalta: Opcion = {
      id: "salta",
      titulo: "Pa la calle",
      subtitulo: "No concursas",
      efectos: { popularidad: 1 },
      flags: ["ano_callejero"],
      saltaCOAC: true,
    }
    const conSalta: BancoContenido = {
      situaciones: bancoPrueba.situaciones.map((s) => ({
        ...s,
        opciones: [opcionSalta],
      })),
      condicionales: [],
    }
    const p = crearPartida(inputPrueba, conSalta)
    const paso = siguientePaso(p, conSalta)
    if (paso.tipo !== "decision") throw new Error("esperaba decisión")
    const r1 = elegir(p, "salta", conSalta)
    if (!r1.ok) throw new Error("elegir falló")
    const pFeb = r1.valor
    const paso2 = siguientePaso(pFeb, conSalta)
    if (paso2.tipo !== "decision")
      throw new Error("esperaba decisión de febrero")
    const r2 = elegir(pFeb, paso2.situacion.opciones[0].id, conSalta)
    if (!r2.ok) throw new Error("elegir falló")
    const temporada = r2.valor.temporadas[0]
    expect(temporada.fueraDeConcurso).toBe(true)
    expect(temporada.premios).toEqual([])
    expect(r2.valor.premios).toEqual([])
  })

  it("clamp de atributos a 0..100", () => {
    expect(aplicarEfectos(base, { letra: 200 }).letra).toBe(100)
    expect(aplicarEfectos(base, { letra: -200 }).letra).toBe(0)
  })

  it("CONTENIDO_INSUFICIENTE cuando no hay situación para el momento", () => {
    const vacio: BancoContenido = { situaciones: [] }
    const p = crearPartida(inputPrueba, vacio)
    const paso = siguientePaso(p, vacio)
    expect(paso.tipo).toBe("error")
    const res = elegir(p, "x", vacio)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.codigo).toBe("CONTENIDO_INSUFICIENTE")
  })
})
