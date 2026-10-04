// Utilidades SOLO de desarrollo para abrir la pantalla de resultado del año sin
// jugar las decisiones. No debe importarse desde producción: `Juego.svelte` solo
// las referencia dentro de una rama `import.meta.env.DEV`.
//
// Uso: /jugar?dev=resultado[&caso=<caso>]
//   - sin `caso`, se muestra el caso por defecto (`campeon`).
//
// Es una instantánea aislada: un `Temporada` de ejemplo y su año, sin partida
// real. «Continuar» queda inerte porque el reducer no avanza sin partida.

import type { Momento, Temporada } from "../../engine/index"

export const CASOS_RESULTADO = [
  "campeon",
  "podio",
  "finalista",
  "preliminares",
  "sin-premios",
  "fuera-de-concurso",
  "distinciones",
  "todas",
] as const

export type CasoResultado = (typeof CASOS_RESULTADO)[number]

export const CASO_RESULTADO_POR_DEFECTO: CasoResultado = "campeon"

function esCasoResultado(valor: string | null): valor is CasoResultado {
  return (
    valor !== null && (CASOS_RESULTADO as readonly string[]).includes(valor)
  )
}

/** Primer premio del COAC y una distinción. */
const CAMPEON: Temporada = {
  ano: 2032,
  fase: "final",
  puesto: 1,
  premios: [{ tipo: "copla_para_andalucia", ano: 2032 }],
  fueraDeConcurso: false,
}

/** Podio sin primer premio. */
const PODIO: Temporada = {
  ano: 2034,
  fase: "final",
  puesto: 2,
  premios: [],
  fueraDeConcurso: false,
}

/** Final sin premios, con puesto. */
const FINALISTA: Temporada = {
  ano: 2031,
  fase: "final",
  puesto: 5,
  premios: [],
  fueraDeConcurso: false,
}

/** Cuartos sin premios, con puesto. */
const SIN_PREMIOS: Temporada = {
  ano: 2030,
  fase: "cuartos",
  puesto: 12,
  premios: [],
  fueraDeConcurso: false,
}

/** No se pasó de preliminares, con puesto. */
const PRELIMINARES: Temporada = {
  ano: 2029,
  fase: "preliminares",
  puesto: 30,
  premios: [],
  fueraDeConcurso: false,
}

/** Año fuera de concurso. */
const FUERA_DE_CONCURSO: Temporada = {
  ano: 2033,
  fase: "preliminares",
  premios: [],
  fueraDeConcurso: true,
}

/** Varios premios ajenos en un mismo año, con puesto. */
const DISTINCIONES: Temporada = {
  ano: 2035,
  fase: "semifinales",
  puesto: 7,
  premios: [
    { tipo: "aguja_de_oro", ano: 2035 },
    { tipo: "candela_y_espino", ano: 2035 },
  ],
  fueraDeConcurso: false,
}

/** Las tres distinciones posibles en un mismo año. */
const TODAS: Temporada = {
  ano: 2036,
  fase: "final",
  puesto: 4,
  premios: [
    { tipo: "aguja_de_oro", ano: 2036 },
    { tipo: "copla_para_andalucia", ano: 2036 },
    { tipo: "candela_y_espino", ano: 2036 },
  ],
  fueraDeConcurso: false,
}

const POR_CASO: Record<CasoResultado, Temporada> = {
  campeon: CAMPEON,
  podio: PODIO,
  finalista: FINALISTA,
  preliminares: PRELIMINARES,
  "sin-premios": SIN_PREMIOS,
  "fuera-de-concurso": FUERA_DE_CONCURSO,
  distinciones: DISTINCIONES,
  todas: TODAS,
}

/** Devuelve el resultado de un caso; si no se reconoce, el caso por defecto. */
export function temporadaResultadoDev(caso: string | null): Temporada {
  return (
    POR_CASO[esCasoResultado(caso) ? caso : CASO_RESULTADO_POR_DEFECTO] ??
    POR_CASO[CASO_RESULTADO_POR_DEFECTO]
  )
}

export interface ArranqueResultado {
  temporada: Temporada
  ano: number
  momento: Momento
}

/**
 * Lee el arranque directo de la pantalla de resultado desde la query string.
 * Devuelve `null` salvo que venga `dev=resultado`.
 */
export function arranqueResultadoDesdeUrl(
  search: string,
): ArranqueResultado | null {
  const params = new URLSearchParams(search)
  if (params.get("dev") !== "resultado") return null
  const momento: Momento =
    params.get("momento") === "verano" ? "verano" : "febrero"
  const temporada = temporadaResultadoDev(params.get("caso"))
  return { temporada, ano: temporada.ano, momento }
}
