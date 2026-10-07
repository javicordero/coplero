// Resolución pura del texto visible según el género del personaje.
// Sin DOM y sin azar implícito: el azar del modo no binario entra inyectado.

import type { Genero } from "./types"

/** Función de azar determinista por campo: devuelve un número en [0, 1). */
export type FuenteAzarGenero = (campo: string) => number

/** Una variante solo cuenta si no está ausente, vacía ni en blanco. */
function varianteValida(femenino: string | undefined): string | undefined {
  return femenino !== undefined && femenino.trim() !== "" ? femenino : undefined
}

/**
 * Elige el texto mostrado (FR-003…FR-007):
 * - Femenino con variante válida → femenino; sin variante → forma por defecto.
 * - Masculino → siempre la forma por defecto.
 * - No binario → azar determinista por campo entre femenino y por defecto.
 *
 * `campo` identifica el texto (p. ej. `"titulo"`, `"opcion:<id>:subtitulo"`) para
 * que cada campo tenga su propia tirada y el resultado sea reproducible.
 */
export function resolverTexto(
  porDefecto: string,
  femenino: string | undefined,
  genero: Genero,
  campo: string,
  azar: FuenteAzarGenero,
): string {
  const fem = varianteValida(femenino)
  if (fem === undefined) return porDefecto
  if (genero === "femenino") return fem
  if (genero === "masculino") return porDefecto
  // No binario: mezcla determinista por campo.
  return azar(campo) < 0.5 ? fem : porDefecto
}
