// Tipos del dominio del motor de Coplero.
// TS puro, serializable, sin clases y sin dependencias de UI.

export type Atributo =
  | "letra"
  | "musica"
  | "puestaEnEscena"
  | "popularidad"
  | "cohesion"
  | "dinero"

export type Atributos = Record<Atributo, number>

export const ATRIBUTOS: readonly Atributo[] = [
  "letra",
  "musica",
  "puestaEnEscena",
  "popularidad",
  "cohesion",
  "dinero",
] as const

export type Momento = "verano" | "febrero"
export type TipoDecision = "contenido" | "personaje"

export type Categoria =
  | "letra"
  | "musica"
  | "puestaEnEscena"
  | "jurado"
  | "dinero"
  | "grupo"
  | "prensa"
  | "carrera"
  | "concurso"

export type Genero = "masculino" | "femenino" | "no_binario"
export type Modalidad = "comparsista" | "chirigotero"
export type VarianteId = string

export type FaseCOAC = "preliminares" | "cuartos" | "semifinales" | "final"
export type FasePartida = "creacion" | "decision" | "coac" | "fin"

export const FASES_COAC: readonly FaseCOAC[] = [
  "preliminares",
  "cuartos",
  "semifinales",
  "final",
] as const

export interface Personaje {
  nombre: string
  edad: number
  localidad: string
  genero: Genero
}

export interface Opcion {
  id: string
  titulo: string
  subtitulo: string
  efectos?: Partial<Atributos>
  flags?: string[]
  consume?: string[]
  peso?: number
  saltaCOAC?: boolean
}

export interface Situacion {
  id: string
  momento: Momento
  tipo: TipoDecision
  categoria: Categoria
  titulo: string
  texto: string
  opciones: Opcion[]
  modalidades?: Modalidad[]
  variantes?: VarianteId[]
  minAno?: number
  unicaVez?: boolean
}

export type Requisito =
  | { tipo: "flag"; flag: string }
  | {
      tipo: "flagRepetida"
      flag: string
      veces: number
      consecutivos?: boolean
    }
  | { tipo: "faseAlcanzada"; fase: FaseCOAC }
  | { tipo: "todas"; de: Requisito[] }
  | { tipo: "alguna"; de: Requisito[] }
  | { tipo: "ninguna"; de: Requisito[] }
  | { tipo: "atributo"; atributo: Atributo; min?: number; max?: number }

export interface Condicional extends Situacion {
  requiere: Requisito
  ventanaAnos: number
  probabilidad: number
  consumeFlag: boolean
  prioridad?: number
}

export interface BancoContenido {
  situaciones: Situacion[]
  condicionales?: Condicional[]
  modalidades?: Modalidad[]
}

export interface Flag {
  ano: number
  veces: number
  consumida: boolean
  anosConsecutivos: number
}

export type PremioTipo =
  | "copla_para_andalucia"
  | "aguja_de_oro"
  | "candela_y_espino"

export interface Premio {
  tipo: PremioTipo
  ano: number
}

export interface Temporada {
  ano: number
  fase: FaseCOAC
  puesto?: number
  premios: Premio[]
  fueraDeConcurso: boolean
}

export interface EventoHistorial {
  ano: number
  momento: Momento
  tipo: "decision" | "resultado" | "hito"
  situacionId?: string
  opcionId?: string
  descripcion: string
}

export interface Destino {
  techo: FaseCOAC
  suelo: FaseCOAC
  anoPico: number
  anosCarrera: number
  volatilidad: number
  carisma: number
}

export interface ResultadoTemporada {
  fase: FaseCOAC
  puesto: number
  premios: Premio[]
  fueraDeConcurso: boolean
  milagro: boolean
}

export interface Partida {
  version: number
  seed: string
  personaje: Personaje
  modalidad: Modalidad
  variante: VarianteId
  anoInicio: number
  anoActual: number
  momento: Momento
  fase: FasePartida
  atributos: Atributos
  flags: Record<string, Flag>
  vistas: string[]
  historial: EventoHistorial[]
  temporadas: Temporada[]
  premios: Premio[]
  decisionesPorAno: number
  decisionesTomadasAno: number
  contador: number
  milagroUsado: boolean
  saltaTemporada: boolean
  resultadoPendiente: ResultadoTemporada | null
  destino: Destino
}

export interface CrearPartidaInput {
  seed: string
  personaje: Personaje
  modalidad: Modalidad
  variante: VarianteId
  anoInicio?: number
  decisionesPorAno?: number
}

export interface OpcionPublica {
  id: string
  titulo: string
  subtitulo: string
}

export interface SituacionPublica {
  id: string
  momento: Momento
  tipo: TipoDecision
  categoria: Categoria
  titulo: string
  texto: string
  opciones: OpcionPublica[]
}

export interface ResumenCarrera {
  nombre: string
  modalidad: Modalidad
  variante: VarianteId
  anosEnActivos: number
  mejorFase: FaseCOAC
  premios: Premio[]
}

export type Paso =
  | { tipo: "decision"; momento: Momento; situacion: SituacionPublica }
  | { tipo: "resultado"; temporada: Temporada }
  | { tipo: "fin"; resumen: ResumenCarrera }
  | { tipo: "error"; error: ErrorMotor }

export type ErrorMotor =
  | {
      codigo: "VERSION_INCOMPATIBLE"
      versionRecibida: number
      versionEsperada: number
    }
  | { codigo: "OPCION_INVALIDA"; opcionId: string }
  | { codigo: "CONTENIDO_INSUFICIENTE"; momento: Momento; tipo: TipoDecision }

export type Resultado<T, E> = { ok: true; valor: T } | { ok: false; error: E }

export const VERSION_PARTIDA = 1
export const ANO_BASE = 1
