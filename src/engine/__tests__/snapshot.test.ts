import { describe, expect, it } from "vitest"
import { resumen, serializar } from "../index"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { jugarCarrera, primerOpcion } from "./helpers"

describe("snapshot de partida de referencia", () => {
  it("mantiene estable una carrera de referencia", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    expect(serializar(fin)).toMatchSnapshot()
    expect(resumen(fin)).toMatchSnapshot()
  })
})
