// Catálogo de flags declaradas del banco para el panel (024). Reutiliza el
// cálculo del informe de integridad (nada de listas paralelas). Módulo PURO.

import { flagsDeclaradas } from "../content/informe"
import type { BancoContenido } from "../content/schema"

/**
 * Flags declaradas por alguna opción del banco (situaciones + condicionales),
 * ordenadas y sin duplicados. Es el origen del selector múltiple del panel.
 */
export function catalogoFlags(banco: BancoContenido): string[] {
  return flagsDeclaradas(banco)
}
