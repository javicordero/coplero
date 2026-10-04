import type { Flag, Opcion, Requisito, Temporada } from "./types"
import { FASES_COAC } from "./types"

interface EstadoRequisito {
  flags: Record<string, Flag>
  atributos: Record<string, number>
  temporadas: Temporada[]
}

/** Evalúa el árbol de requisitos contra el estado de partida. Puro. */
export function requisitoCumplido(
  req: Requisito,
  p: EstadoRequisito,
  consumidor?: string,
): boolean {
  switch (req.tipo) {
    case "flag": {
      const f = p.flags[req.flag]
      if (!f) return false
      if (consumidor && f.consumidaPor.includes(consumidor)) return false
      return true
    }
    case "flagRepetida": {
      const f = p.flags[req.flag]
      if (!f) return false
      if (consumidor && f.consumidaPor.includes(consumidor)) return false
      return req.consecutivos
        ? f.anosConsecutivos >= req.veces
        : f.veces >= req.veces
    }
    case "faseAlcanzada":
      return p.temporadas.some(
        (t) => FASES_COAC.indexOf(t.fase) >= FASES_COAC.indexOf(req.fase),
      )
    case "todas":
      return req.de.every((r) => requisitoCumplido(r, p, consumidor))
    case "alguna":
      return req.de.some((r) => requisitoCumplido(r, p, consumidor))
    case "ninguna":
      return !req.de.some((r) => requisitoCumplido(r, p, consumidor))
    case "atributo": {
      const valor = p.atributos[req.atributo] ?? 0
      if (req.min !== undefined && valor < req.min) return false
      if (req.max !== undefined && valor > req.max) return false
      return true
    }
    default:
      return false
  }
}

/** Flags referenciadas por un requisito (para ventanas y consumo). */
export function flagsDeRequisito(req: Requisito): string[] {
  switch (req.tipo) {
    case "flag":
    case "flagRepetida":
      return [req.flag]
    case "todas":
    case "alguna":
    case "ninguna":
      return req.de.flatMap(flagsDeRequisito)
    default:
      return []
  }
}

/**
 * Flags que un requisito puede **consumir**: las de `flag`/`flagRepetida` y de
 * los compuestos `todas`/`alguna`. Un requisito `ninguna` no consume nada (su
 * sentido es que la flag NO esté).
 */
function flagsConsumiblesDeRequisito(req: Requisito): string[] {
  switch (req.tipo) {
    case "flag":
    case "flagRepetida":
      return [req.flag]
    case "todas":
    case "alguna":
      return req.de.flatMap(flagsConsumiblesDeRequisito)
    default:
      return []
  }
}

/** ¿Sigue abierta la ventana de disparo? Los requisitos sin flag no dependen de ventana. */
export function dentroDeVentana(
  req: Requisito,
  p: { flags: Record<string, Flag>; anoActual: number },
  ventanaAnos: number,
): boolean {
  const anios = flagsDeRequisito(req)
    .map((f) => p.flags[f]?.ano)
    .filter((a): a is number => typeof a === "number")
  if (anios.length === 0) return true
  return anios.some((a) => p.anoActual - a <= ventanaAnos)
}

/** Registra las flags de una opción; nunca borra. Consumo automático de condicionales. */
export function actualizarFlags(
  flags: Record<string, Flag>,
  opcion: Opcion,
  ano: number,
): Record<string, Flag> {
  const salida: Record<string, Flag> = { ...flags }
  for (const id of opcion.flags ?? []) {
    const previa = salida[id]
    salida[id] = previa
      ? {
          ano,
          veces: previa.veces + 1,
          consumidaPor: previa.consumidaPor,
          anosConsecutivos:
            previa.ano === ano - 1 ? previa.anosConsecutivos + 1 : 1,
        }
      : { ano, veces: 1, consumidaPor: [], anosConsecutivos: 1 }
  }
  return salida
}

/**
 * Marca como consumidas por el condicional `condicionalId` las flags de su
 * requisito **que existan** en el historial (las activas). Nunca borra flags.
 */
export function consumirFlagsDeRequisito(
  flags: Record<string, Flag>,
  req: Requisito,
  condicionalId: string,
): Record<string, Flag> {
  const salida: Record<string, Flag> = { ...flags }
  for (const id of flagsConsumiblesDeRequisito(req)) {
    const previa = salida[id]
    if (previa && !previa.consumidaPor.includes(condicionalId)) {
      salida[id] = {
        ...previa,
        consumidaPor: [...previa.consumidaPor, condicionalId],
      }
    }
  }
  return salida
}
