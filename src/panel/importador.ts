// Importación del banco actual de contenido (.ts) al almacén local del panel.
// Ver specs/024-form-ux-improvements/contracts/almacen.md.

import { bancoContenido } from "../content"
import type { Condicional, Situacion } from "../content/schema"
import { type AlmacenEnDisco, almacen } from "./almacen"
import { type Almacen, VERSION_ALMACEN } from "./esquema"

export interface BancoActual {
  situaciones: Situacion[]
  condicionales: Condicional[]
}

/** Situaciones y condicionales del banco actual, ordenados por id (determinista). */
export function leerBancoActual(): BancoActual {
  const situaciones = [...bancoContenido.situaciones].sort((a, b) =>
    a.id.localeCompare(b.id),
  )
  const condicionales = [...(bancoContenido.condicionales ?? [])].sort((a, b) =>
    a.id.localeCompare(b.id),
  )
  return { situaciones, condicionales }
}

/**
 * Vuelca el banco actual al almacén (con copia de seguridad previa, delegada en
 * `escribir`). Devuelve cuántas entidades (situaciones + condicionales) se
 * importaron.
 */
export function importarBancoActual(destino: AlmacenEnDisco = almacen): {
  importadas: number
} {
  const { situaciones, condicionales } = leerBancoActual()
  const nuevo: Almacen = {
    version: VERSION_ALMACEN,
    situaciones,
    condicionales,
  }
  destino.escribir(nuevo)
  return { importadas: situaciones.length + condicionales.length }
}
