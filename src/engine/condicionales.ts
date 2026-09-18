import type { Flag, Opcion, Requisito, Temporada } from "./types"
import { FASES_COAC } from "./types"

interface EstadoRequisito {
  flags: Record<string, Flag>
  atributos: Record<string, number>
  temporadas: Temporada[]
}

/** Evalúa el árbol de requisitos contra el estado de partida. Puro. */
export function requisitoCumplido(req: Requisito, p: EstadoRequisito): boolean {
  switch (req.tipo) {
    case "flag":
      return Boolean(p.flags[req.flag])
    case "flagRepetida": {
      const f = p.flags[req.flag]
      if (!f) return false
      return req.consecutivos
        ? f.anosConsecutivos >= req.veces
        : f.veces >= req.veces
    }
    case "faseAlcanzada":
      return p.temporadas.some(
        (t) => FASES_COAC.indexOf(t.fase) >= FASES_COAC.indexOf(req.fase),
      )
    case "todas":
      return req.de.every((r) => requisitoCumplido(r, p))
    case "alguna":
      return req.de.some((r) => requisitoCumplido(r, p))
    case "ninguna":
      return !req.de.some((r) => requisitoCumplido(r, p))
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

/** Registra las flags de una opción; nunca borra. Marca consumidas las indicadas. */
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
          consumida: previa.consumida,
          anosConsecutivos:
            previa.ano === ano - 1 ? previa.anosConsecutivos + 1 : 1,
        }
      : { ano, veces: 1, consumida: false, anosConsecutivos: 1 }
  }
  for (const id of opcion.consume ?? []) {
    const previa = salida[id]
    if (previa) salida[id] = { ...previa, consumida: true }
  }
  return salida
}

/** Marca como consumidas (sin borrar) las flags de un requisito. */
export function consumirFlagsDeRequisito(
  flags: Record<string, Flag>,
  req: Requisito,
): Record<string, Flag> {
  const salida: Record<string, Flag> = { ...flags }
  for (const id of flagsDeRequisito(req)) {
    const previa = salida[id]
    if (previa) salida[id] = { ...previa, consumida: true }
  }
  return salida
}
