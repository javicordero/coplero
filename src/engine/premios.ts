import type { DefinicionPremio, ParametrosMotor } from "./parametros"
import { rngPara } from "./seed"
import type { Atributos, FaseCOAC, Flag, Premio } from "./types"

function afinidadDe(
  def: DefinicionPremio,
  atributos: Atributos,
  flags: Record<string, Flag>,
): number {
  let afinidad = 0
  for (const [atributo, peso] of Object.entries(def.pesosAtributos)) {
    const valor = atributos[atributo as keyof Atributos] ?? 0
    afinidad += (valor / 100) * (peso ?? 0)
  }
  for (const [flag, peso] of Object.entries(def.flagsAfinidad)) {
    if (flags[flag]) afinidad += peso
  }
  return afinidad
}

/**
 * Resuelve los premios ajenos al COAC a partir de definiciones inyectadas.
 * Sin participación no hay premios. Desempate determinista por el RNG contextual.
 */
export function resolverPremios(args: {
  temporada: { fase: FaseCOAC; puesto: number; fueraDeConcurso: boolean }
  atributos: Atributos
  flags: Record<string, Flag>
  ano: number
  seed: string
  params: ParametrosMotor
}): Premio[] {
  const { temporada, atributos, flags, ano, seed, params } = args
  if (temporada.fueraDeConcurso) return []

  const premios: Premio[] = []
  for (const def of params.premios) {
    let probabilidad: number
    if (temporada.puesto <= def.umbralPuesto) {
      probabilidad = Math.max(
        0,
        Math.min(1, def.probabilidadBase + afinidadDe(def, atributos, flags)),
      )
    } else if (
      def.umbralPuestoExcepcional !== undefined &&
      temporada.puesto <= def.umbralPuestoExcepcional
    ) {
      probabilidad = def.probabilidadExcepcional ?? 0
    } else {
      continue
    }
    const rng = rngPara(seed, "premios", def.tipo, ano)
    if (rng() < probabilidad) premios.push({ tipo: def.tipo, ano })
  }
  return premios
}
