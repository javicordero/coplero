import type {
  Atributo,
  Atributos,
  BancoContenido,
  FaseCOAC,
  Genero,
  Modalidad,
  Momento,
  ParametrosMotor,
  Partida,
  Paso,
  Premio,
  Situacion,
  TarjetaFinal,
  VarianteId,
} from "../engine/index"

export interface Bucket {
  n: number
  pct: number
}

export type Distribucion = Record<string, Bucket>

export interface ContextoDecision {
  paso: Extract<Paso, { tipo: "decision" }>
  situacion: Situacion
  partida: Partida
  rng: () => number
}

export interface PerfilJugador {
  id: string
  descripcion: string
  elegir(contexto: ContextoDecision): string
}

export interface ConfiguracionPartida {
  id: string
  modalidad: Modalidad
  variante: VarianteId
  genero: Genero
  localidad: string
  edad: number
}

export type ReglaEstadoImposible =
  | "premioSinConcurso"
  | "temporadasExcedidas"
  | "mejorFaseIncoherente"
  | "flagConsumidaSinRegistro"
  | "atributoFueraDeRango"
  | "puestoIncoherente"
  | "temporadasDesordenadas"
  | "premioAnoInexistente"
  | "finIncoherente"
  | "modalidadVarianteInvalida"
  | "faseEnNoConcurso"
  | "composicionAnualIncorrecta"
  | "saltaCOACIncoherente"
  | "trayectoriaIncoherente"
  | "varianteInvalida"
  | "tarjetaIncoherente"
  | "carreraPlana"

export interface HallazgoEstadoImposible {
  regla: ReglaEstadoImposible
  seed: string
  perfilId: string
  detalle: string
}

export interface ErrorAgregable {
  codigo: string
  n: number
}

export interface DecisionRegistrada {
  ano: number
  momento: Momento
  situacionId: string
  opcionId: string
  flags: string[]
  consume: string[]
  saltaCOAC: boolean
}

/** Un año resuelto de la carrera, en orden. Es lo que permite medir la forma (013, E5). */
export interface PasoDeSecuencia {
  ano: number
  fase: FaseCOAC
  puesto?: number
}

export interface RegistroCarrera {
  seed: string
  perfilId: string
  configuracionId: string
  partida: Partida
  decisiones: DecisionRegistrada[]
  situacionesVistas: string[]
  errores: ErrorAgregable[]
  mejorFase: FaseCOAC
  participo: boolean
  duracion: number
  primerosPremios: number
  premios: Premio[]
  atributosFinales: Atributos
  anoPico: number
  secuencia: PasoDeSecuencia[]
  hallazgos: HallazgoEstadoImposible[]
  tarjeta?: TarjetaFinal
}

export interface MetricasPrincipales {
  n: number
  pisanFinal: number
  distribucionMejorFase: Distribucion
  mediaPrimerosPremios: number
  carrerasConPremio: number
  duracionMedia: number
}

export interface MetricasAgregadas extends MetricasPrincipales {
  noSuperanCuartos: number
  noSuperanPreliminares: number
  noConcurso: number
  premiosPorTipo: Record<string, number>
}

export interface SituacionFrecuencia {
  id: string
  n: number
  pct: number
}

export interface AtributoResumen {
  min: number
  max: number
  media: number
}

export interface SecuenciaFrecuente {
  secuencia: string
  n: number
  pct: number
}

/** Métricas de forma de la carrera (013, E6). */
export interface MetricasForma {
  rachaMaximaMedia: number
  rachaMaximaP95: number
  rachaMaximaPeor: number
  /** % de carreras cuya racha máxima supera `umbralRacha`. */
  carrerasConRachaLarga: number
  umbralRacha: number
  /** Carreras "crack" (legendarias por diseño) excluidas de las métricas de forma. */
  cracksExcluidos: number
  posicionesDistintasMedia: number
  /** % de carreras cuyo mejor tramo de 3 años llega después del primer tercio. */
  carrerasConArco: number
  /** Las secuencias de resultados más repetidas de todo el conjunto. */
  diversidad: SecuenciaFrecuente[]
  /** Dentro de cada techo, la secuencia más repetida. Compartir techo no es compartir carrera. */
  diversidadPorTecho: Record<string, SecuenciaFrecuente>
}

export interface OpcionesSimulacion {
  banco: BancoContenido
  n: number
  seedBase: string
  perfiles?: PerfilJugador[]
  configuraciones?: ConfiguracionPartida[]
  parametros?: Partial<ParametrosMotor>
}

export interface InformeSimulacion {
  meta: {
    n: number
    seedBase: string
    perfiles: string[]
    configuraciones: string[]
    generadoConError: boolean
    usoInterno: true
  }
  fases: {
    pisanFinal: number
    noSuperanCuartos: number
    noSuperanPreliminares: number
    noConcurso: number
    distribucion: Distribucion
  }
  premios: {
    mediaPrimerosPremios: number
    totalPrimerosPremios: number
    porTipo: Record<string, number>
    carrerasConPremio: number
    acumuladoPrimeros: {
      alMenos1: number
      alMenos3: number
      alMenos5: number
      alMenos10: number
      alMenos15: number
    }
  }
  duracionMedia: number
  anosPico: Distribucion
  forma: MetricasForma
  situaciones: {
    totalDecisiones: number
    masFrecuentes: SituacionFrecuencia[]
    menosFrecuentes: SituacionFrecuencia[]
    nuncaVistas: string[]
  }
  condicionales: {
    disparados: string[]
    nuncaDisparados: string[]
  }
  atributos: Record<Atributo, AtributoResumen>
  estadosImposibles: HallazgoEstadoImposible[]
  porPerfil: Record<string, MetricasAgregadas>
  porConfiguracion: Record<string, MetricasPrincipales>
  errores: ErrorAgregable[]
}
