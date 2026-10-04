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

  it("V-09 · la forma del estado y su versión (025)", () => {
    // 025: cambia la forma de `Flag` (consumida → consumidaPor), así que
    // `VERSION_PARTIDA` sube a 3; una partida guardada con la versión anterior
    // se rechaza (no se migra). Las claves de `Partida` no cambian.
    expect(VERSION_PARTIDA).toBe(3)
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

  it("rechaza una partida de la versión anterior", () => {
    const res = deserializar(JSON.stringify({ version: 2, seed: "x" }))
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.codigo).toBe("VERSION_INCOMPATIBLE")
      if (res.error.codigo === "VERSION_INCOMPATIBLE") {
        expect(res.error.versionRecibida).toBe(2)
        expect(res.error.versionEsperada).toBe(3)
      }
    }
  })
})
