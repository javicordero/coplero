import type { Atributo, FaseCOAC, PremioTipo } from "./types"

export interface DefinicionPremio {
  tipo: PremioTipo
  umbralPuesto: number
  probabilidadBase: number
  pesosAtributos: Partial<Record<Atributo, number>>
  flagsAfinidad: Record<string, number>
}

export interface ModificadoresCreacion {
  carismaPorLocalidad: Record<string, number>
}

export interface ParametrosMotor {
  pesosTecho: Record<FaseCOAC, number>
  umbralesFase: { final: number; semifinales: number; cuartos: number }
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
  pesosTecho: { preliminares: 5, cuartos: 12, semifinales: 20, final: 63 },
  umbralesFase: { final: 78, semifinales: 62, cuartos: 42 },
  bonoAnoPico: 10,
  volatilidadMin: 0.2,
  volatilidadMax: 0.6,
  pesosPuntuacion: {
    letra: 0.4,
    musica: 0.3,
    puestaEnEscena: 0.2,
    cohesion: 0.06,
    popularidad: 0.04,
  },
  batacazo: 0.03,
  milagro: 0.02,
  anosCarreraPorDefecto: 20,
  decisionesPorAno: 2,
  premios: [
    {
      tipo: "aguja_de_oro",
      umbralPuesto: 7,
      probabilidadBase: 0.25,
      pesosAtributos: { puestaEnEscena: 0.05 },
      flagsAfinidad: { vestuario_caro: 0.3, tipo_cambiado: 0.2 },
    },
    {
      tipo: "copla_para_andalucia",
      umbralPuesto: 10,
      probabilidadBase: 0.15,
      pesosAtributos: { letra: 0.05 },
      flagsAfinidad: {},
    },
    {
      tipo: "candela_y_espino",
      umbralPuesto: 10,
      probabilidadBase: 0.15,
      pesosAtributos: { letra: 0.03 },
      flagsAfinidad: {
        tema_social: 0.3,
        pasodoble_duro: 0.25,
        rechazo_patrocinio: 0.2,
      },
    },
  ],
  modificadoresCreacion: {
    carismaPorLocalidad: { cádiz: 3, cadiz: 3 },
  },
  multiplicadorRuido: 15,
  atributosIniciales: 50,
}

export function resolverParametros(
  parcial?: Partial<ParametrosMotor>,
): ParametrosMotor {
  return parcial
    ? { ...PARAMETROS_POR_DEFECTO, ...parcial }
    : PARAMETROS_POR_DEFECTO
}
