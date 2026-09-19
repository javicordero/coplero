// Catálogos cerrados del banco de contenido.
// Valores permitidos; no definen reglas de juego (son datos de referencia).

export const MOMENTOS = ["verano", "febrero"] as const
export const TIPOS_DECISION = ["contenido", "personaje"] as const
export const CATEGORIAS = [
  "letra",
  "musica",
  "puestaEnEscena",
  "jurado",
  "dinero",
  "grupo",
  "prensa",
  "carrera",
  "concurso",
] as const
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
export type Categoria = (typeof CATEGORIAS)[number]
export type Atributo = (typeof ATRIBUTOS)[number]
export type Modalidad = (typeof MODALIDADES)[number]
export type FaseCOAC = (typeof FASES_COAC)[number]
