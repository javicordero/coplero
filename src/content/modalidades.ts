// Catálogos cerrados del banco de contenido.
// Valores permitidos; no definen reglas de juego (son datos de referencia).

// Las categorías viven en su propio fichero (gestionable desde el panel): ver `categorias.ts`.
export { CATEGORIAS, type Categoria } from "./categorias"

export const MOMENTOS = ["verano", "febrero"] as const
export const TIPOS_DECISION = ["contenido", "personaje"] as const
export const ATRIBUTOS = [
  "letra",
  "musica",
  "puestaEnEscena",
  "popularidad",
  "cohesion",
  "dinero",
] as const
export const MODALIDADES = ["comparsista", "chirigotero"] as const
export const FASES_COAC = [
  "preliminares",
  "cuartos",
  "semifinales",
  "final",
] as const

export type Momento = (typeof MOMENTOS)[number]
export type TipoDecision = (typeof TIPOS_DECISION)[number]
export type Atributo = (typeof ATRIBUTOS)[number]
export type Modalidad = (typeof MODALIDADES)[number]
export type FaseCOAC = (typeof FASES_COAC)[number]
