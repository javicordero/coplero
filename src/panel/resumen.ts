// Agrupado por momento para el panel (009). Módulo PURO (sin node:fs y sin Zod
// en runtime): la isla puede importarlo. Ver specs/009-content-admin/data-model.md.

import { MOMENTOS, type Momento } from "../content/modalidades"
import type { Situacion } from "../content/schema"

export interface GrupoMomento {
  momento: Momento
  situaciones: Situacion[]
  total: number
}

/** Devuelve un grupo por cada momento (aunque esté vacío), con su recuento. */
export function agruparPorMomento(situaciones: Situacion[]): GrupoMomento[] {
  return MOMENTOS.map((momento) => {
    const delGrupo = situaciones.filter((s) => s.momento === momento)
    return { momento, situaciones: delGrupo, total: delGrupo.length }
  })
}
