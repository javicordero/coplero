import type { ParametrosMotor } from "./parametros"
import type { Atributos, Destino, FaseCOAC, NivelCOAC } from "./types"
import { FASES_COAC, NIVELES_COAC } from "./types"

export function indiceFase(fase: FaseCOAC): number {
  return FASES_COAC.indexOf(fase)
}

export function indiceNivel(nivel: NivelCOAC): number {
  return NIVELES_COAC.indexOf(nivel)
}

/** Las fases visibles del COAC: podio y primer premio se resuelven dentro de la final. */
export function nivelAFase(nivel: NivelCOAC): FaseCOAC {
  return nivel === "podio" || nivel === "primer_premio" ? "final" : nivel
}

export function nivelPorPuntuacion(
  puntuacion: number,
  params: ParametrosMotor,
): NivelCOAC {
  const u = params.umbralesNivel
  if (puntuacion >= u.primer_premio) return "primer_premio"
  if (puntuacion >= u.podio) return "podio"
  if (puntuacion >= u.final) return "final"
  if (puntuacion >= u.semifinales) return "semifinales"
  if (puntuacion >= u.cuartos) return "cuartos"
  return "preliminares"
}

function acotarEntreNiveles(
  nivel: NivelCOAC,
  suelo: NivelCOAC,
  techo: NivelCOAC,
): NivelCOAC {
  const i = indiceNivel(nivel)
  const s = indiceNivel(suelo)
  const t = indiceNivel(techo)
  return NIVELES_COAC[Math.max(s, Math.min(t, i))]
}

function entre(valor: number, lo: number, hi: number): number {
  if (hi <= lo) return 1
  return Math.max(0, Math.min(1, (valor - lo) / (hi - lo)))
}

/**
 * Puesto dentro del nivel alcanzado. Dentro del podio, la puntuación decide
 * entre el 1.º y el 3.º; el nivel `primer_premio` gana siempre.
 */
function puestoDe(
  nivel: NivelCOAC,
  puntuacion: number,
  params: ParametrosMotor,
): number {
  const u = params.umbralesNivel
  switch (nivel) {
    case "preliminares":
      return 50 - Math.round(entre(puntuacion, 0, u.cuartos) * 33)
    case "cuartos":
      return 16 - Math.round(entre(puntuacion, u.cuartos, u.semifinales) * 5)
    case "semifinales":
      return 10 - Math.round(entre(puntuacion, u.semifinales, u.final) * 5)
    case "podio":
      return 3 - Math.round(entre(puntuacion, u.podio, u.primer_premio) * 2)
    case "final":
      return 4
    default:
      return 1
  }
}

export interface ResolucionCoac {
  fase: FaseCOAC
  nivel: NivelCOAC
  puesto: number
  puntuacion: number
  milagro: boolean
}

/**
 * Resuelve la fase, el nivel y el puesto de una temporada.
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

  let nivel = acotarEntreNiveles(
    nivelPorPuntuacion(puntuacion, params),
    destino.suelo,
    destino.techo,
  )

  // Batacazo: puede atravesar el suelo.
  if (rng() < params.batacazo) {
    nivel = NIVELES_COAC[Math.max(0, indiceNivel(nivel) - 1)]
  }

  // Milagro: rompe el techo una única vez en toda la carrera.
  let milagro = false
  if (destino.milagro && !args.milagroUsado) {
    const objetivo = Math.min(
      NIVELES_COAC.length - 1,
      Math.max(indiceNivel(nivel), indiceNivel(destino.techo)) + 1,
    )
    nivel = NIVELES_COAC[objetivo]
    milagro = true
  }

  return {
    fase: nivelAFase(nivel),
    nivel,
    puesto: puestoDe(nivel, puntuacion, params),
    puntuacion,
    milagro,
  }
}
