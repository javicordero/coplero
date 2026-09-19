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
  TipoDecision,
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
  tipo: TipoDecision
  situacionId: string
  opcionId: string
  flags: string[]
  consume: string[]
  saltaCOAC: boolean
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
  hallazgos: HallazgoEstadoImposible[]
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
