// Utilidades SOLO de desarrollo para abrir la pantalla final sin jugar una
// carrera completa. No debe importarse desde producción: `Juego.svelte` solo
// las referencia dentro de una rama `import.meta.env.DEV`.
//
// Uso: /jugar?dev=fin[&caso=<caso>][&momento=verano|febrero]
//   - sin `caso`, se muestra el caso por defecto (`campeon`), siempre completo.
//   - sin `momento`, se usa `febrero` (el momento real al terminar la carrera).

import type { Momento, TarjetaFinal } from "../../engine/index"

export const CASOS_FIN = [
  "campeon",
  "podio",
  "finalista",
  "retirada",
  "cambios",
  "sin-premios",
  "distinciones",
] as const

export type CasoFin = (typeof CASOS_FIN)[number]

export const CASO_FIN_POR_DEFECTO: CasoFin = "campeon"

function esCasoFin(valor: string | null): valor is CasoFin {
  return valor !== null && (CASOS_FIN as readonly string[]).includes(valor)
}

/** Tarjeta de ejemplo: carrera ganadora, larga y con distinciones. */
const CAMPEON: TarjetaFinal = {
  nombre: "El Bauti",
  modalidadInicial: "comparsista",
  modalidadFinal: "comparsista",
  varianteInicial: "clasico_comparsista",
  varianteFinal: "evolucion_con_raices",
  cambios: [
    { ano: 2031, modalidad: "comparsista", variante: "evolucion_con_raices" },
  ],
  anosDeCarrera: 14,
  anosEnActivo: 14,
  anosSinConcursar: [],
  mejorFase: "final",
  mejorPuesto: 1,
  primerosPremios: [
    { ano: 2037, puesto: 3, tipo: "podio" },
    { ano: 2038, puesto: 1, tipo: "primer_premio" },
    { ano: 2040, puesto: 2, tipo: "podio" },
  ],
  hitosProgreso: [
    { ano: 2027, fase: "preliminares", debut: true },
    { ano: 2029, fase: "cuartos", debut: false },
    { ano: 2032, fase: "semifinales", debut: false },
    { ano: 2035, fase: "final", debut: false },
  ],
  otrosPremios: [
    { tipo: "aguja_de_oro", veces: 2, anos: [2036, 2039] },
    { tipo: "copla_para_andalucia", veces: 1, anos: [2034] },
  ],
  hitos: [
    { tipo: "debut", ano: 2027, texto: "Debutaste en 2027" },
    { tipo: "ganar_coac", ano: 2038, texto: "Ganaste el COAC en 2038" },
    { tipo: "duracion", ano: null, texto: "14 años de carrera" },
  ],
  fraseCierre: "Lo tocaste todo.",
}

/** Subcampeón: llega a la final y pisa el podio, sin primer premio. */
const PODIO: TarjetaFinal = {
  nombre: "La Tere",
  modalidadInicial: "chirigotero",
  modalidadFinal: "chirigotero",
  varianteInicial: "clasico_chirigotero",
  varianteFinal: "interpretar_personaje",
  cambios: [
    { ano: 2032, modalidad: "chirigotero", variante: "interpretar_personaje" },
  ],
  anosDeCarrera: 9,
  anosEnActivo: 9,
  anosSinConcursar: [],
  mejorFase: "final",
  mejorPuesto: 2,
  primerosPremios: [{ ano: 2034, puesto: 2, tipo: "podio" }],
  hitosProgreso: [
    { ano: 2026, fase: "preliminares", debut: true },
    { ano: 2032, fase: "cuartos", debut: false },
    { ano: 2033, fase: "semifinales", debut: false },
    { ano: 2034, fase: "final", debut: false },
  ],
  otrosPremios: [{ tipo: "candela_y_espino", veces: 1, anos: [2031] }],
  hitos: [
    { tipo: "debut", ano: 2026, texto: "Debutaste en 2026" },
    { tipo: "final", ano: 2033, texto: "Finalista en 2033" },
    { tipo: "podio", ano: 2034, texto: "Podio en el COAC en 2034" },
  ],
  fraseCierre: "Entre los mejores.",
}

/** Finalista sin podio: ni premio del COAC ni premios ajenos. */
const FINALISTA: TarjetaFinal = {
  nombre: "El Chato",
  modalidadInicial: "comparsista",
  modalidadFinal: "comparsista",
  varianteInicial: "clasico_comparsista",
  varianteFinal: "clasico_comparsista",
  cambios: [],
  anosDeCarrera: 6,
  anosEnActivo: 6,
  anosSinConcursar: [],
  mejorFase: "final",
  mejorPuesto: 5,
  primerosPremios: [],
  hitosProgreso: [
    { ano: 2029, fase: "preliminares", debut: true },
    { ano: 2031, fase: "cuartos", debut: false },
    { ano: 2032, fase: "semifinales", debut: false },
    { ano: 2034, fase: "final", debut: false },
  ],
  otrosPremios: [],
  hitos: [
    { tipo: "debut", ano: 2029, texto: "Debutaste en 2029" },
    { tipo: "duracion", ano: null, texto: "6 años de carrera" },
    { tipo: "final", ano: 2034, texto: "Finalista en 2034" },
  ],
  fraseCierre: "Llegaste a la final.",
}

/** Carrera sin ningún año en concurso: bucket `retirada`. */
const RETIRADA: TarjetaFinal = {
  nombre: "El Nene",
  modalidadInicial: "chirigotero",
  modalidadFinal: "chirigotero",
  varianteInicial: "lolosedismo",
  varianteFinal: "lolosedismo",
  cambios: [],
  anosDeCarrera: 5,
  anosEnActivo: 0,
  anosSinConcursar: [2030, 2031, 2032, 2033, 2034],
  mejorFase: "preliminares",
  mejorPuesto: null,
  primerosPremios: [],
  hitosProgreso: [{ ano: 2030, fase: "preliminares", debut: true }],
  otrosPremios: [],
  hitos: [
    { tipo: "debut", ano: 2030, texto: "Debutaste en 2030" },
    {
      tipo: "anos_sin_concursar",
      ano: 2030,
      texto: "Un año fuera de concurso: 2030",
    },
    { tipo: "duracion", ano: null, texto: "5 años de carrera" },
  ],
  fraseCierre: "Una carrera a tu manera.",
}

/** Cambios de modalidad y de variante, sin llegar a la final. */
const CAMBIOS: TarjetaFinal = {
  nombre: "La Lola",
  modalidadInicial: "comparsista",
  modalidadFinal: "chirigotero",
  varianteInicial: "nueva_escuela",
  varianteFinal: "lolosedismo",
  cambios: [
    { ano: 2031, modalidad: "chirigotero", variante: "clasico_chirigotero" },
    { ano: 2033, modalidad: "chirigotero", variante: "lolosedismo" },
  ],
  anosDeCarrera: 8,
  anosEnActivo: 8,
  anosSinConcursar: [],
  mejorFase: "semifinales",
  mejorPuesto: 7,
  primerosPremios: [],
  hitosProgreso: [
    { ano: 2027, fase: "preliminares", debut: true },
    { ano: 2030, fase: "cuartos", debut: false },
    { ano: 2032, fase: "semifinales", debut: false },
  ],
  otrosPremios: [{ tipo: "aguja_de_oro", veces: 1, anos: [2032] }],
  hitos: [
    { tipo: "debut", ano: 2027, texto: "Debutaste en 2027" },
    {
      tipo: "cambio_modalidad",
      ano: 2031,
      texto: "Cambiaste de modalidad en 2031",
    },
    { tipo: "cambio_variante", ano: 2033, texto: "Cambió tu estilo en 2033" },
  ],
  fraseCierre: "Media carrera en semifinales.",
}

/** Sin premios de ningún tipo: cuartos y nada más. */
const SIN_PREMIOS: TarjetaFinal = {
  nombre: "El Rubio",
  modalidadInicial: "comparsista",
  modalidadFinal: "comparsista",
  varianteInicial: "evolucion_con_raices",
  varianteFinal: "nueva_escuela",
  cambios: [{ ano: 2032, modalidad: "comparsista", variante: "nueva_escuela" }],
  anosDeCarrera: 7,
  anosEnActivo: 7,
  anosSinConcursar: [],
  mejorFase: "cuartos",
  mejorPuesto: 12,
  primerosPremios: [],
  hitosProgreso: [
    { ano: 2028, fase: "preliminares", debut: true },
    { ano: 2030, fase: "cuartos", debut: false },
  ],
  otrosPremios: [],
  hitos: [
    { tipo: "debut", ano: 2028, texto: "Debutaste en 2028" },
    { tipo: "cambio_variante", ano: 2032, texto: "Cambió tu estilo en 2032" },
    { tipo: "duracion", ano: null, texto: "7 años de carrera" },
  ],
  fraseCierre: "Los cuartos fueron tu casa.",
}

/** Muchas distinciones (3-4 por tipo) para probar la retícula de rosetas. */
const DISTINCIONES: TarjetaFinal = {
  nombre: "El Maestro",
  modalidadInicial: "comparsista",
  modalidadFinal: "comparsista",
  varianteInicial: "clasico_comparsista",
  varianteFinal: "evolucion_con_raices",
  cambios: [
    { ano: 2031, modalidad: "comparsista", variante: "evolucion_con_raices" },
  ],
  anosDeCarrera: 12,
  anosEnActivo: 12,
  anosSinConcursar: [],
  mejorFase: "final",
  mejorPuesto: 1,
  primerosPremios: [
    { ano: 2030, puesto: 1, tipo: "primer_premio" },
    { ano: 2033, puesto: 2, tipo: "podio" },
    { ano: 2036, puesto: 1, tipo: "primer_premio" },
    { ano: 2038, puesto: 3, tipo: "podio" },
  ],
  hitosProgreso: [
    { ano: 2027, fase: "preliminares", debut: true },
    { ano: 2029, fase: "cuartos", debut: false },
    { ano: 2031, fase: "semifinales", debut: false },
    { ano: 2032, fase: "final", debut: false },
  ],
  otrosPremios: [
    { tipo: "aguja_de_oro", veces: 4, anos: [2030, 2033, 2035, 2037] },
    {
      tipo: "copla_para_andalucia",
      veces: 3,
      anos: [2029, 2032, 2034],
    },
    { tipo: "candela_y_espino", veces: 4, anos: [2031, 2036, 2038, 2039] },
  ],
  hitos: [
    { tipo: "debut", ano: 2027, texto: "Debutaste en 2027" },
    { tipo: "ganar_coac", ano: 2030, texto: "Ganaste el COAC en 2030" },
    { tipo: "duracion", ano: null, texto: "12 años de carrera" },
  ],
  fraseCierre: "Una vitrina llena de premios.",
}

const POR_CASO: Record<CasoFin, TarjetaFinal> = {
  campeon: CAMPEON,
  podio: PODIO,
  finalista: FINALISTA,
  retirada: RETIRADA,
  cambios: CAMBIOS,
  "sin-premios": SIN_PREMIOS,
  distinciones: DISTINCIONES,
}

/** Devuelve la tarjeta de un caso; si no se reconoce, el caso por defecto. */
export function tarjetaFinDev(caso: string | null): TarjetaFinal {
  return POR_CASO[esCasoFin(caso) ? caso : CASO_FIN_POR_DEFECTO]
}

export interface ArranqueFin {
  tarjeta: TarjetaFinal
  momento: Momento
}

/**
 * Lee el arranque directo de la pantalla final desde la query string.
 * Devuelve `null` salvo que venga `dev=fin`.
 */
export function arranqueFinDesdeUrl(search: string): ArranqueFin | null {
  const params = new URLSearchParams(search)
  if (params.get("dev") !== "fin") return null
  const momento: Momento =
    params.get("momento") === "verano" ? "verano" : "febrero"
  return { tarjeta: tarjetaFinDev(params.get("caso")), momento }
}
