import {
  continuar,
  crearPartida,
  elegir,
  elegirVarianteDeCambio,
  siguientePaso,
} from "../partida"
import { rngPara } from "../seed"
import type { BancoContenido, CrearPartidaInput, Partida, Paso } from "../types"

export type Chooser = (
  p: Partida,
  paso: Extract<Paso, { tipo: "decision" }>,
  step: number,
) => number

export const primerOpcion: Chooser = () => 0

/** Chooser determinista y variado para simulación. */
export const chooserSimulado: Chooser = (p, paso, step) => {
  const rng = rngPara(p.seed, "jugador", step)
  return Math.floor(rng() * paso.situacion.opciones.length)
}

/** Crea una partida desde el input dado y juega hasta el fin de la carrera. */
export function jugarCarrera(
  input: CrearPartidaInput,
  banco: BancoContenido,
  chooser: Chooser = primerOpcion,
): Partida {
  let actual = crearPartida(input, banco)
  let step = 0
  while (step++ < 5000) {
    const paso = siguientePaso(actual, banco)
    if (paso.tipo === "fin") return actual
    if (paso.tipo === "error") {
      throw new Error(`paso con error: ${JSON.stringify(paso.error)}`)
    }
    if (paso.tipo === "resultado") {
      actual = continuar(actual)
      continue
    }
    if (paso.tipo === "variante") {
      const validas = (banco.variantes ?? []).filter(
        (v) => v.modalidad === paso.modalidad,
      )
      if (validas.length === 0) {
        throw new Error("sin variantes para resolver el cambio de modalidad")
      }
      const res = elegirVarianteDeCambio(actual, validas[0].id, banco)
      if (!res.ok) {
        throw new Error(
          `elegirVarianteDeCambio con error: ${JSON.stringify(res.error)}`,
        )
      }
      actual = res.valor
      continue
    }
    const opciones = paso.situacion.opciones
    const indice = chooser(actual, paso, step)
    const opcion =
      opciones[
        Math.min(opciones.length - 1, Math.abs(indice) % opciones.length)
      ]
    const resultado = elegir(actual, opcion.id, banco)
    if (!resultado.ok) {
      throw new Error(`elegir con error: ${JSON.stringify(resultado.error)}`)
    }
    actual = resultado.valor
  }
  throw new Error("la carrera no terminó")
}

/** RNG controlado para tests: consume la secuencia y luego devuelve 0.5. */
export function rngDe(valores: number[]): () => number {
  let i = 0
  return () => (i < valores.length ? valores[i++] : 0.5)
}
