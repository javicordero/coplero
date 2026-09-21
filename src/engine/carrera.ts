import type { ParametrosMotor } from "./parametros"
import type { Destino, NivelCOAC } from "./types"

/**
 * Curva de carrera (013, R2). Sustituye a la base constante de la puntuación:
 * la carrera empieza por debajo de su potencial, toca su cima en el año pico
 * y declina hasta el final. Funciones puras y deterministas.
 */

export interface Banda {
  base: number
  tope: number
}

/** Banda de puntuación que corresponde a cada nivel del techo. */
export function bandaDe(nivel: NivelCOAC, params: ParametrosMotor): Banda {
  const u = params.umbralesNivel
  switch (nivel) {
    case "preliminares":
      return { base: 0, tope: u.cuartos }
    case "cuartos":
      return { base: u.cuartos, tope: u.semifinales }
    case "semifinales":
      return { base: u.semifinales, tope: u.final }
    case "final":
      return { base: u.final, tope: u.podio }
    case "podio":
      return { base: u.podio, tope: u.primer_premio }
    default:
      return { base: u.primer_premio, tope: 100 }
  }
}

/**
 * Puntuación a la que aspira la carrera en su mejor momento.
 *
 * Es el ancla de la cima (013, R6). Se coloca dentro de la banda del techo,
 * pero con un ancho máximo (`anchoObjetivo`): la banda de `primer_premio` es
 * `[57, 100]` y anclar al 60 % de *toda* ella dejaría la cima en 83, por encima
 * del umbral ya en el primer año, y la carrera sería plana en el puesto 1.
 *
 * El techo de preliminares es el caso opuesto: su banda es enorme (0..corte) y
 * anclar la cima a una fracción dejaría al personaje naufragando siempre; se
 * ancla a las puertas del corte.
 */
export function puntuacionObjetivo(
  techo: NivelCOAC,
  params: ParametrosMotor,
): number {
  const { base, tope } = bandaDe(techo, params)
  if (techo === "preliminares") {
    return Math.max(base, tope - params.margenPreliminares)
  }
  const ancho = Math.min(tope - base, params.anchoObjetivo)
  return base + params.objetivoEnTecho * ancho
}

export interface EntradaAptitud {
  ano: number
  anoInicio: number
  destino: Destino
  params: ParametrosMotor
}

/**
 * Aptitud de la carrera en un año: un arco con el máximo exacto en `anoPico`.
 * `aptitud(anoInicio) = inicio` y `aptitud(ultimoAno) = fin`.
 *
 * El exponente afila la cima: con 1 el arco es lineal y la meseta alta dura
 * demasiados años, de modo que la carrera se queda pegada a su techo; con 2
 * la cima se estrecha y el techo se toca unos pocos años, que es lo que
 * convierte "20 años en el puesto 4" en un pico reconocible.
 */
export function aptitud(args: EntradaAptitud): number {
  const { ano, anoInicio, destino, params } = args
  const cima = puntuacionObjetivo(destino.techo, params)
  const subida = Math.max(1e-6, params.curvaSubida)
  const inicio = cima - params.curvaSubida
  const exponente = Math.max(1, params.curvaExponente)

  const total = Math.max(1, destino.anosCarrera - 1)
  const pico = Math.min(total, Math.max(0, destino.anoPico - anoInicio))
  const t = Math.min(total, Math.max(0, ano - anoInicio))

  // Si no hay declive, el final coincide con el inicio de la rampa de bajada.
  const uFin = Math.min(1, Math.max(0, (subida - params.curvaDeclive) / subida))

  let u: number
  if (t <= pico) {
    u = pico === 0 ? 1 : (t / pico) ** exponente
  } else {
    const bajada = total - pico
    const x = bajada === 0 ? 1 : (t - pico) / bajada
    u = uFin + (1 - uFin) * (1 - x) ** exponente
  }

  return inicio + (cima - inicio) * u
}

/** Puntuación mínima que la curva puede alcanzar: sirve para normalizar el mérito. */
export function baseCarrera(args: EntradaAptitud): number {
  const { destino, params } = args
  const cima = puntuacionObjetivo(destino.techo, params)
  if (destino.anoPico - args.anoInicio <= 0) {
    return Math.min(cima, cima - params.curvaDeclive)
  }
  return cima - params.curvaSubida
}
