// Derivación de identificadores del panel (024). Módulo PURO: sin node:fs y sin
// Zod en runtime, para poder usarlo tanto en servidor como en la isla Svelte.
// Ver specs/024-form-ux-improvements/contracts/identificadores.md.

/**
 * Convierte un texto libre (un título) en un identificador corto y legible:
 * minúsculas, sin diacríticos, solo `[a-z0-9]` separado por `_`.
 * Devuelve `""` si no queda ningún carácter válido.
 */
export function derivarId(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
}

/**
 * Devuelve `base` si está libre; si no, `base_2`, `base_3`, … hasta encontrar
 * uno que no esté en `usados`. Con `base` vacío devuelve `""` (no inventa).
 */
export function derivarIdUnico(
  base: string,
  usados: ReadonlySet<string>,
): string {
  if (base === "") return ""
  if (!usados.has(base)) return base
  let n = 2
  while (usados.has(`${base}_${n}`)) n += 1
  return `${base}_${n}`
}
