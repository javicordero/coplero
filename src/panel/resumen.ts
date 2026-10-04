// Agrupado por momento para el panel (009/024). Módulo PURO (sin node:fs y sin
// Zod en runtime): la isla puede importarlo. Genérico para situaciones y
// condicionales. Ver specs/024-form-ux-improvements/data-model.md.

import { MOMENTOS, type Momento } from "../content/modalidades"

export interface GrupoMomento<T> {
  momento: Momento
  entidades: T[]
  total: number
}

/** Devuelve un grupo por cada momento (aunque esté vacío), con su recuento. */
export function agruparPorMomento<T extends { momento: Momento }>(
  items: T[],
): GrupoMomento<T>[] {
  return MOMENTOS.map((momento) => {
    const entidades = items.filter((item) => item.momento === momento)
    return { momento, entidades, total: entidades.length }
  })
}
