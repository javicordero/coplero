// Importación del banco actual de contenido (.ts) al almacén local del panel.
// Ver specs/009-content-admin/contracts/importador.md.

import { bancoContenido } from "../content"
import type { Situacion } from "../content/schema"
import { type AlmacenEnDisco, almacen } from "./almacen"
import { type Almacen, VERSION_ALMACEN } from "./esquema"

/** Situaciones del banco actual, ordenadas por id (determinista). */
export function leerBancoActual(): Situacion[] {
  return [...bancoContenido.situaciones].sort((a, b) =>
    a.id.localeCompare(b.id),
  )
}

/**
 * Vuelca el banco actual al almacén (con copia de seguridad previa, delegada en
 * `escribir`). Devuelve cuántas situaciones se importaron.
 */
export function importarBancoActual(destino: AlmacenEnDisco = almacen): {
  importadas: number
} {
  const situaciones = leerBancoActual()
  const nuevo: Almacen = { version: VERSION_ALMACEN, situaciones }
  destino.escribir(nuevo)
  return { importadas: situaciones.length }
}
