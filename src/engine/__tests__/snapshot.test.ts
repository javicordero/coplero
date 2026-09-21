import { describe, expect, it } from "vitest"
import { resumen, serializar } from "../index"
import { bancoPrueba, inputPrueba } from "./fixtures"
import { jugarCarrera, primerOpcion } from "./helpers"

/**
 * Snapshot de la partida de referencia.
 *
 * Actualizado en la feature 013 porque el resultado de cada año cambia: la
 * puntuación ya no es una base constante recortada contra el techo, sino una
 * **curva de carrera** (arco con el máximo en el año pico) más una **forma con
 * memoria**, y el puesto se calcula por mérito relativo en vez de saturarse en
 * el extremo de la banda. La carrera de referencia ya no es plana: ese es el
 * cambio que este snapshot fija.
 */
describe("snapshot de partida de referencia", () => {
  it("mantiene estable una carrera de referencia", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    expect(serializar(fin)).toMatchSnapshot()
    expect(resumen(fin, bancoPrueba)).toMatchSnapshot()
  })

  it("la carrera de referencia no es plana", () => {
    const fin = jugarCarrera(inputPrueba, bancoPrueba, primerOpcion)
    const puestos = fin.temporadas
      .filter((t) => !t.fueraDeConcurso)
      .map((t) => t.puesto)
    const distintos = new Set(puestos).size
    let racha = 0
    let maxRacha = 0
    let previo: number | undefined
    for (const puesto of puestos) {
      racha = puesto === previo ? racha + 1 : 1
      previo = puesto
      if (racha > maxRacha) maxRacha = racha
    }
    expect(distintos).toBeGreaterThanOrEqual(5)
    expect(maxRacha).toBeLessThanOrEqual(8)
  })
})
