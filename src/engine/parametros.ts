import type { Atributo, NivelCOAC, PremioTipo } from "./types"

export interface DefinicionPremio {
  tipo: PremioTipo
  umbralPuesto: number
  probabilidadBase: number
  pesosAtributos: Partial<Record<Atributo, number>>
  flagsAfinidad: Record<string, number>
  /**
   * Tramo excepcional: si no se alcanza `umbralPuesto` pero sí este umbral
   * (p. ej. llegar solo a semifinales), se sortea con `probabilidadExcepcional`.
   */
  umbralPuestoExcepcional?: number
  probabilidadExcepcional?: number
}

export interface ModificadoresCreacion {
  carismaPorLocalidad: Record<string, number>
}

export interface ParametrosMotor {
  pesosTecho: Record<NivelCOAC, number>
  umbralesNivel: {
    cuartos: number
    semifinales: number
    final: number
    podio: number
    primer_premio: number
  }
  bonoAnoPico: number
  volatilidadMin: number
  volatilidadMax: number
  pesosPuntuacion: {
    letra: number
    musica: number
    puestaEnEscena: number
    cohesion: number
    popularidad: number
  }
  batacazo: number
  milagro: number
  /** Probabilidad, por carrera, de nacer como "crack" (carisma extra que genera carreras dominantes). */
  probabilidadCrack: number
  /** Carisma extra que recibe una carrera "crack". */
  bonusCrack: number
  anosCarreraPorDefecto: number
  decisionesPorAno: number
  premios: DefinicionPremio[]
  modificadoresCreacion: ModificadoresCreacion
  multiplicadorRuido: number
  atributosIniciales: number
}

/**
 * Valores por defecto PROVISIONALES, a calibrar con el simulador masivo (FR-021).
 * Todos son inyectables y sustituibles sin tocar el motor.
 */
export const PARAMETROS_POR_DEFECTO: ParametrosMotor = {
  pesosTecho: {
    preliminares: 7,
    cuartos: 3,
    semifinales: 47,
    final: 16,
    podio: 18,
    primer_premio: 9,
  },
  umbralesNivel: {
    cuartos: 42,
    semifinales: 45,
    final: 48,
    podio: 54,
    primer_premio: 57,
  },
  bonoAnoPico: 14,
  volatilidadMin: 0.4,
  volatilidadMax: 1.3,
  pesosPuntuacion: {
    letra: 0.4,
    musica: 0.3,
    puestaEnEscena: 0.2,
    cohesion: 0.06,
    popularidad: 0.04,
  },
  batacazo: 0.03,
  milagro: 0.02,
  probabilidadCrack: 0.003,
  bonusCrack: 12,
  anosCarreraPorDefecto: 20,
  decisionesPorAno: 2,
  premios: [
    {
      tipo: "aguja_de_oro",
      umbralPuesto: 4,
      probabilidadBase: 0.21,
      pesosAtributos: {},
      flagsAfinidad: {},
      umbralPuestoExcepcional: 10,
      probabilidadExcepcional: 0.005,
    },
    {
      tipo: "copla_para_andalucia",
      umbralPuesto: 10,
      probabilidadBase: 0.15,
      pesosAtributos: {},
      flagsAfinidad: {},
    },
    {
      tipo: "candela_y_espino",
      umbralPuesto: 10,
      probabilidadBase: 0.15,
      pesosAtributos: {},
      flagsAfinidad: {},
    },
  ],
  modificadoresCreacion: {
    carismaPorLocalidad: { cádiz: 3, cadiz: 3 },
  },
  multiplicadorRuido: 6,
  atributosIniciales: 50,
}

export function resolverParametros(
  parcial?: Partial<ParametrosMotor>,
): ParametrosMotor {
  return parcial
    ? { ...PARAMETROS_POR_DEFECTO, ...parcial }
    : PARAMETROS_POR_DEFECTO
}
