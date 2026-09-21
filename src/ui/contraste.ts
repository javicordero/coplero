/**
 * Contraste según WCAG 2.2 (012). Funciones puras, sin dependencias.
 * Se usan en los tests de tokens y en la validación de la paleta.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

export const AA_TEXTO = 4.5
export const AA_TEXTO_GRANDE = 3
export const AA_NO_TEXTO = 3
export const AAA_TEXTO = 7

const HEX = /^#([0-9a-fA-F]{6})$/

export function parseHex(hex: string): Rgb {
  const coincidencia = HEX.exec(hex.trim())
  if (!coincidencia) {
    throw new Error(`Hex inválido: "${hex}". Se espera #rrggbb de 6 dígitos.`)
  }
  const valor = Number.parseInt(coincidencia[1], 16)
  return {
    r: (valor >> 16) & 0xff,
    g: (valor >> 8) & 0xff,
    b: valor & 0xff,
  }
}

function canalSrgb(componente: number): number {
  const c = componente / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminancia(hex: string): number {
  const { r, g, b } = parseHex(hex)
  return 0.2126 * canalSrgb(r) + 0.7152 * canalSrgb(g) + 0.0722 * canalSrgb(b)
}

export function ratio(a: string, b: string): number {
  const la = luminancia(a)
  const lb = luminancia(b)
  const claro = Math.max(la, lb)
  const oscuro = Math.min(la, lb)
  return (claro + 0.05) / (oscuro + 0.05)
}

export function cumple(ratios: number, minimo: number): boolean {
  return ratios >= minimo
}
