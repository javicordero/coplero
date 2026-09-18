import { describe, expect, it } from "vitest"
import { crearPartida } from "../partida"
import { deserializar, serializar } from "../serializar"
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
})
