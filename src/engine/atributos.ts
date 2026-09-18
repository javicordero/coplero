import type { Atributo, Atributos } from "./types"

export const ATRIBUTO_MIN = 0
export const ATRIBUTO_MAX = 100

export function clampAtributo(valor: number): number {
  if (!Number.isFinite(valor)) return ATRIBUTO_MIN
  return Math.max(ATRIBUTO_MIN, Math.min(ATRIBUTO_MAX, Math.round(valor)))
}

/** Devuelve un nuevo mapa de atributos aplicando los efectos con clamp. No muta la entrada. */
export function aplicarEfectos(
  base: Atributos,
  efectos?: Partial<Atributos>,
): Atributos {
  const salida: Atributos = { ...base }
  if (!efectos) return salida
  for (const clave of Object.keys(efectos) as Atributo[]) {
    const delta = efectos[clave]
    if (typeof delta === "number" && delta !== 0) {
      salida[clave] = clampAtributo(salida[clave] + delta)
    }
  }
  return salida
}
