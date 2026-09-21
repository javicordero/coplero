import type { FaseCOAC } from "../engine/index"
import { BANDA_PUESTO, indiceFase } from "../engine/index"
import type { PasoDeSecuencia, RegistroCarrera } from "./tipos"

/**
 * Métricas de forma de la carrera (013, E6).
 *
 * El simulador medía el *qué* (cuántos llegan a la final) y no el *cómo*
 * (en qué orden). Ese hueco dejó pasar que todas las carreras fueran planas.
 * Estas funciones puras trabajan sobre la secuencia registrada.
 */

/**
 * Carisma a partir del cual la carrera es un "crack" (`bonusCrack` del motor).
 * Un crack está diseñado para dominar: repetir primeros puestos muchos años
 * seguidos es su relato, no un fallo. Queda fuera de las métricas de forma.
 */
export const CARISMA_CRACK = 12

export function esCrack(registro: RegistroCarrera): boolean {
  return registro.partida.destino.carisma >= CARISMA_CRACK
}

/** Banda de puestos de cada fase, tomada del motor para no duplicarla. */
const BANDAS: Record<FaseCOAC, readonly [number, number]> = {
  preliminares: BANDA_PUESTO.preliminares,
  cuartos: BANDA_PUESTO.cuartos,
  semifinales: BANDA_PUESTO.semifinales,
  final: BANDA_PUESTO.final,
}

/** Cuánto de bueno fue un año, en una escala continua: mejor = mayor. */
export function valorAno(paso: PasoDeSecuencia): number {
  const [mejor, peor] = BANDAS[paso.fase]
  const puesto = paso.puesto ?? peor
  const rango = peor - mejor
  const dentro = rango === 0 ? 1 : (peor - puesto) / rango
  return indiceFase(paso.fase) + Math.min(1, Math.max(0, dentro))
}

function valores(secuencia: PasoDeSecuencia[]): number[] {
  return secuencia.map(valorAno)
}

/** Racha más larga repitiendo exactamente la misma posición. */
export function rachaMaxima(secuencia: PasoDeSecuencia[]): number {
  let maximo = 0
  let actual = 0
  let previo: number | undefined
  for (const paso of secuencia) {
    if (paso.puesto === undefined) {
      actual = 0
      previo = undefined
      continue
    }
    actual = paso.puesto === previo ? actual + 1 : 1
    previo = paso.puesto
    if (actual > maximo) maximo = actual
  }
  return maximo
}

/** Cuántas posiciones distintas se vieron en toda la carrera. */
export function posicionesDistintas(secuencia: PasoDeSecuencia[]): number {
  const vistas = new Set<number>()
  for (const paso of secuencia) {
    if (paso.puesto !== undefined) vistas.add(paso.puesto)
  }
  return vistas.size
}

/** Índice del primer año del mejor tramo de `ventana` años consecutivos. */
export function mejorTramo(secuencia: PasoDeSecuencia[], ventana = 3): number {
  const v = valores(secuencia)
  if (v.length < ventana) return 0
  let mejorIndice = 0
  let mejorMedia = Number.NEGATIVE_INFINITY
  for (let i = 0; i + ventana <= v.length; i++) {
    let suma = 0
    for (let k = 0; k < ventana; k++) suma += v[i + k]
    const media = suma / ventana
    if (media > mejorMedia) {
      mejorMedia = media
      mejorIndice = i
    }
  }
  return mejorIndice
}

/**
 * ¿La carrera asciende? El mejor tramo llega después del primer tercio.
 * Ojo: `docs/01` §7 quiere también ascensos rápidos y éxitos tempranos, así
 * que una parte de las carreras pica en el primer tercio **a propósito**.
 */
export function tieneArco(secuencia: PasoDeSecuencia[], ventana = 3): boolean {
  const n = secuencia.length
  if (n < ventana * 2) return false
  return mejorTramo(secuencia, ventana) >= Math.floor(n / 3)
}

/** Firma compacta de la carrera: permite medir diversidad. */
export function claveSecuencia(secuencia: PasoDeSecuencia[]): string {
  return secuencia
    .map((paso) => (paso.puesto === undefined ? "X" : String(paso.puesto)))
    .join("-")
}
