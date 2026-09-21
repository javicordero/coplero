import { describe, expect, it } from "vitest"
import { bancoContenido } from "../../content"
import { posicionesDistintas, rachaMaxima, tieneArco } from "../forma-carrera"
import { simular } from "../simular"
import type { PasoDeSecuencia } from "../tipos"

const CARRERAS = 10_000
// Con el banco real: es el juego que se mide, no un banco de fixture.
const informe = simular({
  banco: bancoContenido,
  n: CARRERAS,
  seedBase: "forma-carrera",
})

// La carrera plana que el motor producía: 20 años en la misma posición.
const PLANA: PasoDeSecuencia[] = Array.from({ length: 20 }, (_, i) => ({
  ano: 1 + i,
  fase: "semifinales" as const,
  puesto: 5,
}))

describe("las métricas de forma reconocen la regresión", () => {
  it("una carrera plana tiene racha máxima igual a su duración", () => {
    expect(rachaMaxima(PLANA)).toBe(20)
    expect(posicionesDistintas(PLANA)).toBe(1)
    expect(tieneArco(PLANA)).toBe(false)
  })

  it("una carrera con arco no es plana", () => {
    const conArco: PasoDeSecuencia[] = [
      45, 40, 34, 30, 25, 22, 20, 18, 19, 24, 28, 33, 38,
    ].map((puesto, i) => ({
      ano: 1 + i,
      fase: "preliminares" as const,
      puesto,
    }))
    expect(rachaMaxima(conArco)).toBe(1)
    expect(posicionesDistintas(conArco)).toBe(13)
    expect(tieneArco(conArco)).toBe(true)
  })
})

describe("S-01 a S-03 y S-05 a S-07 · forma de la carrera simulada", () => {
  it("S-01 · ninguna carrera repite la misma posición más de 8 años", () => {
    expect(informe.forma.rachaMaximaPeor).toBeLessThanOrEqual(8)
  })

  it("S-02 · la racha máxima no supera 4 años en al menos el 90 % de las carreras", () => {
    expect(informe.forma.carrerasConRachaLarga).toBeLessThanOrEqual(10)
  })

  it("S-03 · cada carrera muestra de media 6 o más posiciones distintas", () => {
    expect(informe.forma.posicionesDistintasMedia).toBeGreaterThanOrEqual(6)
  })

  it("S-05 · las cinco secuencias más repetidas suman menos del 15 %", () => {
    const suma = informe.forma.diversidad.reduce((s, x) => s + x.pct, 0)
    expect(suma).toBeLessThan(15)
  })

  it("S-06 · dentro de un mismo techo, la secuencia más repetida es < 5 %", () => {
    const techos = Object.keys(informe.forma.diversidadPorTecho)
    expect(techos.length).toBeGreaterThan(0)
    for (const [techo, secuencia] of Object.entries(
      informe.forma.diversidadPorTecho,
    )) {
      expect(secuencia.pct, techo).toBeLessThan(5)
    }
  })

  it("S-07 · la auditoría no encuentra ninguna carrera plana", () => {
    const planas = informe.estadosImposibles.filter(
      (h) => h.regla === "carreraPlana",
    )
    expect(planas).toEqual([])
  })

  it("S-04 · en la mayoría de carreras hay ascenso visible", () => {
    // 60 % y no 70 %: `docs/01` §7 pide también ascensos rápidos y éxitos
    // tempranos, así que una parte de las carreras pica en el primer tercio
    // a propósito. El motor antiguo daba ~0 %.
    expect(informe.forma.carrerasConArco).toBeGreaterThanOrEqual(60)
  })
})

describe("S-08 a S-14 · la dificultad no se ha movido", () => {
  // Guardia de calibración: la curva y la forma no pueden ablandar ni endurecer
  // el juego. Los objetivos son los de docs/01 §7 y la medición de §3.
  it("S-16 · 10.000 carreras siguen siendo rápidas", () => {
    const inicio = performance.now()
    simular({ banco: bancoContenido, n: 10_000, seedBase: "rendimiento" })
    expect(performance.now() - inicio).toBeLessThan(30_000)
  }, 60_000)

  it("S-08/S-09/S-10 · fases alcanzadas", () => {
    expect(informe.fases.pisanFinal).toBeGreaterThanOrEqual(42)
    expect(informe.fases.pisanFinal).toBeLessThanOrEqual(48)
    expect(informe.fases.noSuperanCuartos).toBeGreaterThanOrEqual(7)
    expect(informe.fases.noSuperanCuartos).toBeLessThanOrEqual(16)
    expect(informe.fases.noSuperanPreliminares).toBeGreaterThanOrEqual(4)
    expect(informe.fases.noSuperanPreliminares).toBeLessThanOrEqual(11)
  })

  it("S-11 · gana al menos un primer premio", () => {
    expect(informe.premios.acumuladoPrimeros.alMenos1).toBeGreaterThanOrEqual(
      22,
    )
    expect(informe.premios.acumuladoPrimeros.alMenos1).toBeLessThanOrEqual(31)
  })

  it("S-12/S-13 · carreras con varios primeros premios", () => {
    expect(informe.premios.acumuladoPrimeros.alMenos3).toBeGreaterThanOrEqual(5)
    expect(informe.premios.acumuladoPrimeros.alMenos3).toBeLessThanOrEqual(16)
    expect(informe.premios.acumuladoPrimeros.alMenos5).toBeLessThanOrEqual(10)
  })

  it("S-14 · los premios ajenos mantienen su frecuencia", () => {
    const porCarrera = (tipo: string) =>
      (informe.premios.porTipo[tipo] ?? 0) / informe.meta.n
    expect(porCarrera("aguja_de_oro")).toBeGreaterThan(0.6)
    expect(porCarrera("aguja_de_oro")).toBeLessThan(0.9)
    expect(porCarrera("copla_para_andalucia")).toBeGreaterThan(1.6)
    expect(porCarrera("copla_para_andalucia")).toBeLessThan(2.4)
    expect(porCarrera("candela_y_espino")).toBeGreaterThan(1.6)
    expect(porCarrera("candela_y_espino")).toBeLessThan(2.4)
  })
})
