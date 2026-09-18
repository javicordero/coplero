import type { ParametrosMotor } from "./parametros"
import type { Atributos, Destino, FaseCOAC } from "./types"
import { FASES_COAC } from "./types"

export function indiceFase(fase: FaseCOAC): number {
  return FASES_COAC.indexOf(fase)
}

export function fasePorPuntuacion(
  puntuacion: number,
  params: ParametrosMotor,
): FaseCOAC {
  if (puntuacion >= params.umbralesFase.final) return "final"
  if (puntuacion >= params.umbralesFase.semifinales) return "semifinales"
  if (puntuacion >= params.umbralesFase.cuartos) return "cuartos"
  return "preliminares"
}

function acotarEntreFases(
  fase: FaseCOAC,
  suelo: FaseCOAC,
  techo: FaseCOAC,
): FaseCOAC {
  const i = indiceFase(fase)
  const s = indiceFase(suelo)
  const t = indiceFase(techo)
  return FASES_COAC[Math.max(s, Math.min(t, i))]
}

export interface ResolucionCoac {
  fase: FaseCOAC
  puesto: number
  puntuacion: number
  milagro: boolean
}

function bandaDe(fase: FaseCOAC): readonly [number, number] {
  switch (fase) {
    case "final":
      return [1, 4]
    case "semifinales":
      return [5, 10]
    case "cuartos":
      return [11, 16]
    default:
      return [17, 50]
  }
}

function calcularPuesto(fase: FaseCOAC, puntuacion: number): number {
  const [min, max] = bandaDe(fase)
  if (max <= min) return min
  const ratio = Math.max(0, Math.min(1, puntuacion / 100))
  const puesto = min + Math.round((1 - ratio) * (max - min))
  return Math.max(min, Math.min(max, puesto))
}

/**
 * Resuelve la fase y el puesto de una temporada.
 * El batacazo puede atravesar el suelo; el milagro rompe el techo una sola vez por carrera.
 */
export function resolverCoac(args: {
  atributos: Atributos
  destino: Destino
  anoActual: number
  rng: () => number
  params: ParametrosMotor
  milagroUsado: boolean
}): ResolucionCoac {
  const { atributos, destino, anoActual, rng, params } = args
  const w = params.pesosPuntuacion
  let puntuacion =
    w.letra * atributos.letra +
    w.musica * atributos.musica +
    w.puestaEnEscena * atributos.puestaEnEscena +
    w.cohesion * atributos.cohesion +
    w.popularidad * atributos.popularidad
  puntuacion +=
    (rng() * 2 - 1) * destino.volatilidad * params.multiplicadorRuido
  puntuacion += destino.carisma
  if (anoActual === destino.anoPico) puntuacion += params.bonoAnoPico
  puntuacion = Math.max(0, Math.min(100, puntuacion))

  let fase = acotarEntreFases(
    fasePorPuntuacion(puntuacion, params),
    destino.suelo,
    destino.techo,
  )

  // Batacazo: puede atravesar el suelo.
  if (rng() < params.batacazo) {
    fase = FASES_COAC[Math.max(0, indiceFase(fase) - 1)]
  }

  // Milagro: rompe el techo una única vez por carrera.
  let milagro = false
  if (!args.milagroUsado && rng() < params.milagro) {
    const objetivo = Math.min(
      FASES_COAC.length - 1,
      Math.max(indiceFase(fase), indiceFase(destino.techo)) + 1,
    )
    fase = FASES_COAC[objetivo]
    milagro = true
  }

  return { fase, puesto: calcularPuesto(fase, puntuacion), puntuacion, milagro }
}
