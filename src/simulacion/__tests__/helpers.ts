import type { Atributos, Partida } from "../../engine/index"
import { ANO_BASE, VERSION_PARTIDA } from "../../engine/index"
import type { RegistroCarrera } from "../tipos"

export const ATRIBUTOS_BASE: Atributos = {
  letra: 50,
  musica: 50,
  puestaEnEscena: 50,
  popularidad: 50,
  cohesion: 50,
  dinero: 50,
}

export function partidaFalsa(over: Partial<Partida> = {}): Partida {
  return {
    version: VERSION_PARTIDA,
    seed: "s",
    personaje: {
      nombre: "X",
      edad: 30,
      localidad: "Cádiz",
      genero: "masculino",
    },
    modalidad: "comparsista",
    variante: "clasico",
    anoInicio: ANO_BASE,
    anoActual: ANO_BASE,
    momento: "verano",
    fase: "decision",
    atributos: { ...ATRIBUTOS_BASE },
    flags: {},
    vistas: [],
    historial: [],
    temporadas: [],
    premios: [],
    decisionesPorAno: 2,
    decisionesTomadasAno: 0,
    contador: 0,
    milagroUsado: false,
    saltaTemporada: false,
    resultadoPendiente: null,
    destino: {
      techo: "final",
      suelo: "preliminares",
      anoPico: 3,
      anosCarrera: 20,
      volatilidad: 0.4,
      carisma: 0,
      milagro: false,
    },
    ...over,
  }
}

export function registroFalso(
  over: Partial<RegistroCarrera> = {},
): RegistroCarrera {
  const partida = over.partida ?? partidaFalsa()
  return {
    seed: "s",
    perfilId: "aleatorio",
    configuracionId: "comparsista",
    partida,
    decisiones: [],
    situacionesVistas: [],
    errores: [],
    mejorFase: "preliminares",
    participo: false,
    duracion: 0,
    primerosPremios: 0,
    premios: [],
    atributosFinales: partida.atributos,
    anoPico: partida.destino.anoPico,
    hallazgos: [],
    ...over,
  }
}
