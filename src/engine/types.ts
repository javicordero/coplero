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
export type FasePartida = "creacion" | "decision" | "variante" | "coac" | "fin"

export const FASES_COAC: readonly FaseCOAC[] = [
  "preliminares",
  "cuartos",
  "semifinales",
  "final",
] as const

/** Niveles del techo: las 4 fases más podio y primer premio (docs/02 §8). */
export type NivelCOAC =
  | "preliminares"
  | "cuartos"
  | "semifinales"
  | "final"
  | "podio"
  | "primer_premio"

export const NIVELES_COAC: readonly NivelCOAC[] = [
  "preliminares",
  "cuartos",
  "semifinales",
  "final",
  "podio",
  "primer_premio",
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
  /** Efecto interno: cambia la modalidad vigente y abre la elección de variante. */
  cambiaModalidad?: Modalidad
  /** Efecto interno: desplaza la variante vigente sin mostrarlo como mecánica. */
  cambiaVariante?: VarianteId
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
  /** Peso relativo para la selección; ausente equivale a 1. */
  peso?: number
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

export interface CatalogoVariante {
  id: VarianteId
  modalidad: Modalidad
}

export interface BancoContenido {
  situaciones: Situacion[]
  condicionales?: Condicional[]
  modalidades?: Modalidad[]
  /** Catálogo de variantes válidas; permite al motor validar la elección tras un cambio. */
  variantes?: CatalogoVariante[]
  /** Textos de la tarjeta final (hitos y frases), inyectados desde `content`. */
  textosTarjeta?: TextosTarjeta
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
  techo: NivelCOAC
  suelo: NivelCOAC
  anoPico: number
  anosCarrera: number
  volatilidad: number
  carisma: number
  /** El milagro se sortea una sola vez por carrera (docs/02 §8). */
  milagro: boolean
}

/** Estado resultante tras un cambio de modalidad o variante. */
export interface CambioTrayectoria {
  ano: number
  modalidad: Modalidad
  variante: VarianteId
}

/** Recorrido de la carrera en cuanto a modalidad y variante. */
export interface Trayectoria {
  modalidadInicial: Modalidad
  varianteInicial: VarianteId
  cambios: CambioTrayectoria[]
}

/** Categoría de un hito de la tarjeta final. */
export type TipoHito =
  | "ganar_coac"
  | "podio"
  | "final"
  | "premio_aguja"
  | "premio_copla"
  | "premio_candela"
  | "cambio_modalidad"
  | "cambio_variante"
  | "anos_sin_concursar"
  | "debut"
  | "duracion"
  | "mejor_resultado"

/** Bucket de desenlace para elegir la frase de cierre. */
export type BucketFrase =
  | "campeon"
  | "podio"
  | "finalista"
  | "semifinales"
  | "cuartos"
  | "preliminares"
  | "retirada"

/** Resultado destacado del COAC (primer premio o podio). */
export interface LogroCOAC {
  ano: number
  puesto: number
  tipo: "primer_premio" | "podio"
}

/** Premio ajeno agrupado por tipo, con su recuento y años. */
export interface PremioResumen {
  tipo: PremioTipo
  veces: number
  anos: number[]
}

/** Suceso narrado en la tarjeta final. */
export interface HitoTarjeta {
  tipo: TipoHito
  ano: number | null
  texto: string
}

/** Agregado de solo lectura con la historia visible de una carrera terminada. */
export interface TarjetaFinal {
  nombre: string | null
  modalidadInicial: Modalidad
  modalidadFinal: Modalidad
  varianteInicial: VarianteId
  varianteFinal: VarianteId
  cambios: CambioTrayectoria[]
  anosDeCarrera: number
  anosEnActivo: number
  anosSinConcursar: number[]
  mejorFase: FaseCOAC
  mejorPuesto: number | null
  primerosPremios: LogroCOAC[]
  otrosPremios: PremioResumen[]
  hitos: HitoTarjeta[]
  fraseCierre: string
}

/** Catálogo de textos de la tarjeta (datos inyectados desde `content`). */
export interface TextosTarjeta {
  hitos: Record<TipoHito, string[]>
  frases: Record<BucketFrase, string[]>
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
  trayectoria: Trayectoria
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

export type Paso =
  | { tipo: "decision"; momento: Momento; situacion: SituacionPublica }
  | { tipo: "variante"; modalidad: Modalidad }
  | { tipo: "resultado"; temporada: Temporada }
  | { tipo: "fin"; tarjeta: TarjetaFinal }
  | { tipo: "error"; error: ErrorMotor }

export type ErrorMotor =
  | {
      codigo: "VERSION_INCOMPATIBLE"
      versionRecibida: number
      versionEsperada: number
    }
  | { codigo: "OPCION_INVALIDA"; opcionId: string }
  | { codigo: "VARIANTE_INVALIDA"; varianteId: VarianteId }
  | { codigo: "CONTENIDO_INSUFICIENTE"; momento: Momento; tipo: TipoDecision }

export type Resultado<T, E> = { ok: true; valor: T } | { ok: false; error: E }

export const VERSION_PARTIDA = 2
export const VERSION_TARJETA = 1
export const ANO_BASE = 1
