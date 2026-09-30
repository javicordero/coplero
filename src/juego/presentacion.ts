// Textos de presentación. Funciones puras: traducen valores del motor a etiquetas.
// No contienen lógica de juego.

import type { Modalidad } from "../content/modalidades"
import type {
  ErrorMotor,
  FaseCOAC,
  Genero,
  Momento,
  PremioTipo,
  TipoDecision,
} from "../engine/index"

const TITULOS_POR_GENERO: Record<Genero, string> = {
  masculino: "Coplero",
  femenino: "Coplera",
  no_binario: "Coplere",
}

const MOMENTOS: Record<Momento, string> = {
  verano: "Verano",
  febrero: "Febrero",
}

const TIPOS: Record<TipoDecision, string> = {
  contenido: "Contenido",
  personaje: "Personaje",
}

const FASES: Record<FaseCOAC, string> = {
  preliminares: "Preliminares",
  cuartos: "Cuartos de final",
  semifinales: "Semifinales",
  final: "Final",
}

const PREMIOS: Record<PremioTipo, string> = {
  copla_para_andalucia: "Copla para Andalucía",
  aguja_de_oro: "Aguja de oro",
  candela_y_espino: "Candela y espino",
}

export function tituloDelJuego(genero: Genero): string {
  return TITULOS_POR_GENERO[genero]
}

export function etiquetaMomento(momento: Momento): string {
  return MOMENTOS[momento]
}

export function etiquetaTipo(tipo: TipoDecision): string {
  return TIPOS[tipo]
}

export function etiquetaFase(fase: FaseCOAC): string {
  return FASES[fase]
}

export function etiquetaPremio(tipo: PremioTipo): string {
  return PREMIOS[tipo]
}

/** Recorta, colapsa espacios y limita a 24 caracteres. Nunca HTML. */
export function normalizarNombre(valor: string): string {
  return valor.trim().replace(/\s+/g, " ").slice(0, 24)
}

export interface ModalidadInfo {
  id: Modalidad
  titulo: string
  subtitulo: string
}

export interface Indicador {
  ano: number
  momento: Momento
}

const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  comparsista: "Comparsista",
  chirigotero: "Chirigotero",
}

export function etiquetaModalidad(modalidad: Modalidad): string {
  return ETIQUETA_MODALIDAD[modalidad]
}

/** Textos de las modalidades para la pantalla de elección. */
export const MODALIDADES_INFO: ModalidadInfo[] = [
  {
    id: "comparsista",
    titulo: "Comparsista",
    subtitulo: "Letra seria, música cuidada y puesta en escena.",
  },
  {
    id: "chirigotero",
    titulo: "Chirigotero",
    subtitulo: "Humor, tipo y crítica desde la calle.",
  },
]

/** Enunciado del paso de cambio de variante tras cambiar de modalidad. */
export const TITULO_CAMBIO_VARIANTE = "Tu nueva forma de trabajar"

/** Dirección del juego para la marca de agua de la tarjeta y las imágenes. */
export const DIRECCION_JUEGO = "coplero.app"

/** Aviso puntual cuando un guardado no se pudo restaurar (FR-008). */
export const AVISO_GUARDADO_DESCARTADO =
  "La partida guardada ya no se ha podido recuperar con esta versión. Puedes empezar una carrera nueva."

export function mensajeError(error: ErrorMotor): string {
  switch (error.codigo) {
    case "VERSION_INCOMPATIBLE":
      return "La partida guardada no es compatible con esta versión."
    case "OPCION_INVALIDA":
      return "Esa opción ya no está disponible."
    case "VARIANTE_INVALIDA":
      return "Esa variante ya no está disponible."
    case "CONTENIDO_INSUFICIENTE":
      return `No hay contenido disponible para ${etiquetaMomento(error.momento)} / ${etiquetaTipo(error.tipo)}.`
  }
}
