import { describe, expect, it } from "vitest"
import { crearPartida } from "../partida"
import { deserializar, serializar } from "../serializar"
import { VERSION_PARTIDA } from "../types"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { jugarCarrera, primerOpcion } from "./helpers"

describe("serialización", () => {
  it("round-trip sin pérdida", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const res = deserializar(serializar(p))
    expect(res.ok).toBe(true)
    if (res.ok) expect(serializar(res.valor)).toEqual(serializar(p))
  })

  it("la partida recuperada continúa igual", () => {
    const p = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    const res = deserializar(serializar(p))
    expect(res.ok).toBe(true)
    if (res.ok) expect(serializar(res.valor)).toEqual(serializar(p))
  })

  it("versión incompatible devuelve error explícito", () => {
    const res = deserializar(JSON.stringify({ version: 999, seed: "x" }))
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.codigo).toBe("VERSION_INCOMPATIBLE")
  })

  it("JSON inválido devuelve error explícito", () => {
    const res = deserializar("{no es json")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.codigo).toBe("VERSION_INCOMPATIBLE")
  })

  it("V-09 · la forma del estado no cambia con la curva de carrera", () => {
    // 013: la curva y la forma se calculan, no se guardan. `Partida` conserva
    // exactamente las mismas claves y `VERSION_PARTIDA` sigue siendo 2, así que
    // una partida guardada a medias puede continuar sin migración.
    expect(VERSION_PARTIDA).toBe(2)
    const partida = crearPartida(inputPrueba, bancoPrueba)
    expect(Object.keys(partida).sort()).toEqual([
      "anoActual",
      "anoInicio",
      "atributos",
      "contador",
      "decisionesPorAno",
      "decisionesTomadasAno",
      "destino",
      "fase",
      "flags",
      "historial",
      "milagroUsado",
      "modalidad",
      "momento",
      "personaje",
      "premios",
      "resultadoPendiente",
      "saltaTemporada",
      "seed",
      "temporadas",
      "trayectoria",
      "variante",
      "version",
      "vistas",
    ])
  })
})
