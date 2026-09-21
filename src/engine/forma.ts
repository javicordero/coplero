import type { ParametrosMotor } from "./parametros"
import { rngPara } from "./seed"

/**
 * Forma del año (013, R3): ruido con memoria, no ruido blanco.
 *
 * Es un AR(1) — `forma_t = ρ · forma_{t−1} + ε_t` — con las innovaciones
 * derivadas de la semilla, de modo que los años buenos tienden a seguir a
 * años buenos y las rachas se rompen en pocos años.
 *
 * Se calcula, no se guarda: no añade estado a `Partida` ni obliga a versionar
 * el guardado. Es O(años) por año, despreciable con carreras de 20.
 */
export function forma(args: {
  ano: number
  anoInicio: number
  seed: string
  params: ParametrosMotor
}): number {
  const { ano, anoInicio, seed, params } = args
  const rho = Math.min(0.95, Math.max(0, params.memoriaForma))
  const t = Math.max(0, ano - anoInicio)

  let acumulado = 0
  for (let k = 0; k <= t; k++) {
    const rng = rngPara(seed, "forma", anoInicio + k)
    const innovacion = rng() * 2 - 1
    acumulado = acumulado * rho + innovacion
  }
  return acumulado * params.amplitudForma
}
