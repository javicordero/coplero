// Agrupado por categoría para el panel (009). Módulo PURO (sin node:fs y sin Zod
// en runtime): la isla puede importarlo. Ver specs/009-content-admin/data-model.md.

import { CATEGORIAS, type Categoria } from "../content/modalidades"
import type { Situacion } from "../content/schema"

export interface GrupoCategoria {
  categoria: Categoria
  situaciones: Situacion[]
  total: number
}

/** Devuelve un grupo por cada categoría (aunque esté vacía), con su recuento. */
export function agruparPorCategoria(
  situaciones: Situacion[],
): GrupoCategoria[] {
  return CATEGORIAS.map((categoria) => {
    const delGrupo = situaciones.filter((s) => s.categoria === categoria)
    return { categoria, situaciones: delGrupo, total: delGrupo.length }
  })
}
