// Textos de presentación. Funciones puras: traducen valores del motor a etiquetas.
// No contienen lógica de juego.

import { VARIANTES } from "../content/index"
import type { Modalidad } from "../content/modalidades"
import type {
  ErrorMotor,
  FaseCOAC,
  Genero,
  HitoProgreso,
  LogroCOAC,
  Momento,
  PremioTipo,
  VarianteId,
} from "../engine/index"

const TITULOS_POR_GENERO: Record<Genero, string> = {
  masculino: "Coplero",
  femenino: "Coplera",
  no_binario: "Coplere",
}

const MOMENTOS: Record<Momento | "resultado", string> = {
  verano: "Verano",
  febrero: "Febrero",
  resultado: "Resultado",
}

const FASES: Record<FaseCOAC, string> = {
  preliminares: "Preliminares",
  cuartos: "Cuartos de final",
  semifinales: "Semifinales",
  final: "Final",
}

const PREMIOS: Record<PremioTipo, string> = {
  copla_para_andalucia: "Coplas por Andalucía",
  aguja_de_oro: "Aguja de oro",
  candela_y_espino: "Candela y espino",
}

export function tituloDelJuego(genero: Genero): string {
  return TITULOS_POR_GENERO[genero]
}

export function etiquetaMomento(momento: Momento | "resultado"): string {
  return MOMENTOS[momento]
}

/** Año del primer carnaval de una carrera: los años son naturales, no índices. */
export const ANO_PRIMER_CARNAVAL = 2027

/**
 * Año natural visible en un momento. La decisión de verano pertenece al año
 * anterior al carnaval y la de febrero al año del carnaval (docs/01 §4); el
 * resultado cierra el año del carnaval.
 */
export function anoDelMomento(
  ano: number,
  momento: Momento | "resultado",
): number {
  return momento === "verano" ? ano - 1 : ano
}

export function etiquetaFase(fase: FaseCOAC): string {
  return FASES[fase]
}

export function etiquetaPremio(tipo: PremioTipo): string {
  return PREMIOS[tipo]
}

/** Roseta propia de cada distinción (una por victoria). */
export const ROSETAS: Record<PremioTipo, string> = {
  copla_para_andalucia: "/rosetas/roseta_andalucia.svg",
  aguja_de_oro: "/rosetas/roseta_aguja_oro.svg",
  candela_y_espino: "/rosetas/roseta_candela.svg",
}

/** Orden canónico de presentación: la Coplas por Andalucía va siempre al final. */
const ORDEN_DISTINCION: Record<PremioTipo, number> = {
  aguja_de_oro: 0,
  candela_y_espino: 1,
  copla_para_andalucia: 2,
}

/** Ordena las distinciones por su orden canónico de presentación. */
export function ordenarDistinciones<T extends { tipo: PremioTipo }>(
  premios: T[],
): T[] {
  return [...premios].sort(
    (a, b) => ORDEN_DISTINCION[a.tipo] - ORDEN_DISTINCION[b.tipo],
  )
}

/** Recorta, colapsa espacios y limita a 24 caracteres. Nunca HTML. */
export function normalizarNombre(valor: string): string {
  return valor.trim().replace(/\s+/g, " ").slice(0, 24)
}

export interface GeneroInfo {
  id: Genero
  titulo: string
}

/** Géneros disponibles para crear el personaje. */
export const GENEROS_INFO: GeneroInfo[] = [
  { id: "masculino", titulo: "Masculino" },
  { id: "femenino", titulo: "Femenino" },
  { id: "no_binario", titulo: "No binario" },
]

export interface ModalidadInfo {
  id: Modalidad
  titulo: string
  subtitulo: string
}

export interface Indicador {
  ano: number
  /** Momento de juego durante las decisiones; `resultado` cierra el año. */
  momento: Momento | "resultado"
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
    titulo: "Comparsa",
    subtitulo: "¡Pasión, decía Paco Alba, la comparsa es pasión!",
  },
  {
    id: "chirigotero",
    titulo: "Chirigota",
    subtitulo: "Humor, tipo y crítica desde la calle.",
  },
]

/** Enunciado del paso de cambio de variante tras cambiar de modalidad. */
export const TITULO_CAMBIO_VARIANTE = "Tu nueva forma de trabajar"

/** Subtítulo de la pantalla de selección de modalidad (017). */
export const SUBTITULO_MODALIDAD = "Purpurina o plumero"

/** Subtítulo de la pantalla de selección de variante (017). */
export const SUBTITULO_VARIANTE = "Elige tu estilo"

/** Dirección del juego para la marca de agua de la tarjeta y las imágenes. */
export const DIRECCION_JUEGO = "coplero.app"

/**
 * Versión del diseño de la imagen OG. Súbela al cambiar el aspecto de la
 * tarjeta para invalidar la caché `immutable` (navegador y crawlers).
 */
export const VERSION_OG = "4"

/** URL de la imagen OG de un código, con formato opcional (`og`, `9x16`, `1x1`). */
export function urlImagenOg(
  origen: string | URL,
  codigo: string,
  formato?: "og" | "9x16" | "1x1",
): string {
  const url = new URL(`/api/og/${codigo}.png`, origen)
  if (formato) url.searchParams.set("t", formato)
  url.searchParams.set("v", VERSION_OG)
  return url.href
}

/** Título del estilo (variante) para la tarjeta final. */
export function etiquetaEstilo(id: VarianteId): string {
  return VARIANTES.find((variante) => variante.id === id)?.titulo ?? id
}

/** Texto del puesto del COAC («1º», «2º», «3º»). */
export function textoPuesto(puesto: number): string {
  return `${puesto}º`
}

/** Reparte una lista en filas de `columnas` elementos. */
export function enFilas<T>(items: T[], columnas: number): T[][] {
  const filas: T[][] = []
  for (let i = 0; i < items.length; i += columnas) {
    filas.push(items.slice(i, i + columnas))
  }
  return filas
}

/** Etiqueta corta de un hito de progresión (`null` = sin hito). */
const ETIQUETA_HITO: Record<FaseCOAC, string | null> = {
  preliminares: null,
  cuartos: "CF",
  semifinales: "SF",
  final: "F",
}

/** Tono de un evento: medalla (1º/2º/3º) o color de fase. */
export type TonoTrayectoria = "oro" | "plata" | "bronce" | FaseCOAC

/** Un año de la línea temporal con sus eventos (premio y/o hito). */
export interface EventoTrayectoria {
  ano: number
  /** Puesto del COAC (1-3) si ese año hubo premio. */
  puesto: number | null
  /** Hito de progresión del año (Debut/CF/SF/F). */
  hito: string | null
  /** Fase del hito. */
  fase: FaseCOAC | null
  /** Tono para pintar etiqueta y nodo. */
  tono: TonoTrayectoria
}

/** Tono de un evento: medalla si hubo premio; si no, el color de su fase. */
function tonoDeEvento(evento: EventoTrayectoria): TonoTrayectoria {
  if (evento.puesto === 1) return "oro"
  if (evento.puesto === 2) return "plata"
  if (evento.puesto === 3) return "bronce"
  return evento.fase ?? "preliminares"
}

/**
 * Línea temporal: premios del COAC + hitos de progresión, agrupados por año
 * y en orden cronológico. En un año con premio, el premio prevalece.
 */
export function trayectoria(
  premios: LogroCOAC[],
  hitos: HitoProgreso[],
): EventoTrayectoria[] {
  const porAno = new Map<number, EventoTrayectoria>()
  const evento = (ano: number): EventoTrayectoria => {
    let actual = porAno.get(ano)
    if (!actual) {
      actual = {
        ano,
        puesto: null,
        hito: null,
        fase: null,
        tono: "preliminares",
      }
      porAno.set(ano, actual)
    }
    return actual
  }

  for (const hito of hitos) {
    const etiqueta = hito.debut ? "Debut" : ETIQUETA_HITO[hito.fase]
    if (!etiqueta) continue
    const actual = evento(hito.ano)
    actual.hito = etiqueta
    actual.fase = hito.fase
  }
  for (const premio of premios) evento(premio.ano).puesto = premio.puesto

  for (const actual of porAno.values()) {
    // El premio del COAC prevalece: un año con premio no lleva hito.
    if (actual.puesto !== null) {
      actual.hito = null
      actual.fase = null
    }
    actual.tono = tonoDeEvento(actual)
  }

  return [...porAno.values()].sort((a, b) => a.ano - b.ano)
}

/** Frase de cierre por defecto de la pantalla final. */
export const FRASE_CIERRE = "La copla termina. La historia queda."

export function mensajeError(error: ErrorMotor): string {
  switch (error.codigo) {
    case "VERSION_INCOMPATIBLE":
      return "La partida guardada no es compatible con esta versión."
    case "OPCION_INVALIDA":
      return "Esa opción ya no está disponible."
    case "VARIANTE_INVALIDA":
      return "Esa variante ya no está disponible."
    case "CONTENIDO_INSUFICIENTE":
      return `No hay contenido disponible para ${etiquetaMomento(error.momento)}.`
  }
}
