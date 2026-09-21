import { aptitud, baseCarrera, puntuacionObjetivo } from "./carrera"
import { forma } from "./forma"
import type { ParametrosMotor } from "./parametros"
import type { Atributos, Destino, FaseCOAC, NivelCOAC } from "./types"
import { FASES_COAC, NIVELES_COAC } from "./types"

/**
 * Banda de puestos de cada nivel, de mejor a peor (013, E4).
 * Es la única fuente de verdad: la comparte la simulación.
 */
export const BANDA_PUESTO: Record<NivelCOAC, readonly [number, number]> = {
  preliminares: [17, 50],
  cuartos: [11, 16],
  semifinales: [5, 10],
  final: [4, 4],
  podio: [1, 3],
  primer_premio: [1, 1],
}

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

export interface ResolucionCoac {
  fase: FaseCOAC
  nivel: NivelCOAC
  puesto: number
  puntuacion: number
  milagro: boolean
}

/**
 * Puesto dentro del nivel a partir del mérito del año (013, R4).
 *
 * Antes se derivaba de `entre(puntuacion, umbralBase, umbralTope)`, que se
 * satura en 1 en cuanto el nivel queda recortado contra el techo: de ahí los
 * veinte años en el puesto 17 o en el 5. Con el mérito referido a la propia
 * carrera, el puesto cuenta el arco (abajo al principio, arriba en el pico)
 * y deja de ser constante.
 */
function puestoPorMerito(nivel: NivelCOAC, merito: number): number {
  const [mejor, peor] = BANDA_PUESTO[nivel]
  const rango = peor - mejor
  if (rango === 0) return mejor
  return mejor + Math.round((1 - merito) * rango)
}

/**
 * Resuelve la fase, el nivel y el puesto de una temporada.
 *
 * La puntuación combina la **curva de carrera** (el arco), la **forma**
 * (memoria entre años), el ruido, el carisma y el bono del año pico.
 * El batacazo puede atravesar el suelo; el milagro rompe el techo una sola
 * vez por carrera.
 */
export function resolverCoac(args: {
  atributos: Atributos
  destino: Destino
  anoActual: number
  anoInicio: number
  seed: string
  rng: () => number
  params: ParametrosMotor
  milagroUsado: boolean
}): ResolucionCoac {
  const { atributos, destino, anoActual, anoInicio, seed, rng, params } = args
  const w = params.pesosPuntuacion
  const entradaCurva = { ano: anoActual, anoInicio, destino, params }

  // Los atributos entran como desviación respecto al valor estándar: con todos
  // los atributos en su valor inicial el aporte es 0 y manda la curva. El tope
  // evita que la acumulación de las excepciones declaradas (pequeñas pero
  // repetidas) desplace la carrera por encima de su techo para siempre.
  const bruto =
    w.letra * atributos.letra +
    w.musica * atributos.musica +
    w.puestaEnEscena * atributos.puestaEnEscena +
    w.cohesion * atributos.cohesion +
    w.popularidad * atributos.popularidad -
    params.atributosIniciales
  const topeAtributos = Math.abs(params.aporteAtributosMax)
  const aporteAtributos = Math.max(
    -topeAtributos,
    Math.min(topeAtributos, bruto),
  )

  let puntuacion =
    aptitud(entradaCurva) +
    aporteAtributos +
    destino.carisma +
    forma({ ano: anoActual, anoInicio, seed, params }) +
    (rng() * 2 - 1) * destino.volatilidad * params.multiplicadorRuido
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

  // El mérito se mide contra el recorrido propio de la carrera, no contra
  // umbrales fijos. El año pico puede llegar hasta la cima más el bono.
  const piso = baseCarrera(entradaCurva)
  const alto = puntuacionObjetivo(destino.techo, params) + params.bonoAnoPico
  const merito =
    alto === piso
      ? 1
      : Math.min(1, Math.max(0, (puntuacion - piso) / (alto - piso)))

  return {
    fase: nivelAFase(nivel),
    nivel,
    puesto: puestoPorMerito(nivel, merito),
    puntuacion,
    milagro,
  }
}
