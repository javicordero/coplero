/**
 * Espejo TypeScript de los tokens (012).
 * Lo consumen los tests (integridad con tokens.css) y el endpoint edge del OG,
 * que no puede leer CSS. Si cambia un valor, cambia en los dos sitios (V-03).
 */

export const COLORES = {
  "--c-fondo": "#0a0a0a",
  "--c-superficie": "#141414",
  "--c-superficie-alta": "#1d1d1d",
  "--c-separador": "#262b33",
  "--c-borde-control": "#6b6b6b",
  "--c-texto": "#ededed",
  "--c-texto-suave": "#b3bdca",
  "--c-acento": "#f6ad55",
  "--c-acento-texto": "#f6ad55",
  "--c-acento-fuerte": "#ffc477",
  "--c-acento-2": "#7fd1c1",
  "--c-sobre-acento": "#1a1206",
  "--c-error": "#fc8181",
  "--c-verano-cielo": "#cfe8ff",
  "--c-verano-arena": "#f0d9a8",
  "--c-verano-sol": "#ffd98a",
  "--c-verano-texto": "#16222e",
  "--c-verano-texto-suave": "#3c4d5e",
  "--c-verano-superficie": "#ffffff",
  "--c-verano-superficie-alta": "#eef4f9",
  "--c-verano-separador": "#d5e2ee",
  "--c-verano-borde-control": "#4a5b6b",
  "--c-verano-acento-texto": "#7a3b00",
  "--c-acta-papel": "#f4efe1",
  "--c-acta-papel-alta": "#e7dfca",
  "--c-acta-tinta": "#1e2226",
  "--c-acta-tinta-suave": "#55606b",
  "--c-acta-linea": "#cdc3a8",
  "--c-acta-sello": "#8a1f2b",
} as const

export const TIPOGRAFIA = {
  "--fuente-reserva": 'system-ui, -apple-system, "Segoe UI", sans-serif',
  "--fuente-display": '"Anton", var(--fuente-reserva)',
  "--fuente-texto": '"Atkinson Hyperlegible", var(--fuente-reserva)',
  "--texto-xs": "0.75rem",
  "--texto-sm": "0.875rem",
  "--texto-base": "1rem",
  "--texto-lg": "1.125rem",
  "--texto-xl": "1.375rem",
  "--texto-2xl": "1.75rem",
  "--texto-3xl": "clamp(2.25rem, 10vw, 3.5rem)",
  "--interlinea-apretada": "1.15",
  "--interlinea-normal": "1.5",
  "--interlinea-holgada": "1.65",
  "--medida": "65ch",
  "--peso-normal": "400",
  "--peso-fuerte": "700",
} as const

export const ESPACIADO = {
  "--esp-1": "0.25rem",
  "--esp-2": "0.5rem",
  "--esp-3": "0.75rem",
  "--esp-4": "1rem",
  "--esp-5": "1.5rem",
  "--esp-6": "2rem",
  "--esp-7": "3rem",
  "--esp-8": "4rem",
  "--radio-sm": "0.375rem",
  "--radio-md": "0.75rem",
  "--radio-lg": "1rem",
  "--radio-pill": "999px",
  "--sombra-1": "0 1px 2px rgba(0, 0, 0, 0.4)",
  "--sombra-2": "0 4px 16px rgba(0, 0, 0, 0.5)",
  "--ancho-marco": "680px",
  "--ancho-bucle": "var(--ancho-marco)",
  "--foco-ancho": "2px",
  "--foco-offset": "2px",
} as const

export const MOVIMIENTO = {
  "--dur-1": "120ms",
  "--dur-2": "200ms",
  "--dur-3": "280ms",
  "--ease-sal": "cubic-bezier(0.2, 0.7, 0.3, 1)",
  "--ease-ent": "cubic-bezier(0.4, 0, 0.8, 0.3)",
} as const

export const TOKENS: Record<string, string> = {
  ...COLORES,
  ...TIPOGRAFIA,
  ...ESPACIADO,
  ...MOVIMIENTO,
}

/** Color con nombre, derivado de COLORES para que no haya dos fuentes de verdad. */
export const COLOR = {
  fondo: COLORES["--c-fondo"],
  superficie: COLORES["--c-superficie"],
  superficieAlta: COLORES["--c-superficie-alta"],
  separador: COLORES["--c-separador"],
  bordeControl: COLORES["--c-borde-control"],
  texto: COLORES["--c-texto"],
  textoSuave: COLORES["--c-texto-suave"],
  acento: COLORES["--c-acento"],
  acentoTexto: COLORES["--c-acento-texto"],
  acentoFuerte: COLORES["--c-acento-fuerte"],
  acento2: COLORES["--c-acento-2"],
  sobreAcento: COLORES["--c-sobre-acento"],
  error: COLORES["--c-error"],
  veranoCielo: COLORES["--c-verano-cielo"],
  veranoArena: COLORES["--c-verano-arena"],
  veranoSol: COLORES["--c-verano-sol"],
  veranoTexto: COLORES["--c-verano-texto"],
  veranoTextoSuave: COLORES["--c-verano-texto-suave"],
  veranoSuperficie: COLORES["--c-verano-superficie"],
  veranoSuperficieAlta: COLORES["--c-verano-superficie-alta"],
  veranoBordeControl: COLORES["--c-verano-borde-control"],
  veranoAcentoTexto: COLORES["--c-verano-acento-texto"],
  actaPapel: COLORES["--c-acta-papel"],
  actaPapelAlta: COLORES["--c-acta-papel-alta"],
  actaTinta: COLORES["--c-acta-tinta"],
  actaTintaSuave: COLORES["--c-acta-tinta-suave"],
  actaLinea: COLORES["--c-acta-linea"],
  actaSello: COLORES["--c-acta-sello"],
} as const

export const FAMILIA_DISPLAY = "Anton"
export const FAMILIA_TEXTO = "Atkinson Hyperlegible"

/** Fuentes TTF para satori (solo servidor). Los nombres casan con FAMILIA_*. */
export const FUENTES_OG = [
  { name: FAMILIA_DISPLAY, fichero: "anton.ttf", weight: 400 },
  { name: FAMILIA_TEXTO, fichero: "atkinson-regular.ttf", weight: 400 },
  { name: FAMILIA_TEXTO, fichero: "atkinson-bold.ttf", weight: 700 },
] as const
