import { dentroDeVentana, requisitoCumplido } from "./condicionales"
import { elegirPonderado, rngPara } from "./seed"
import type {
  BancoContenido,
  Partida,
  Situacion,
  SituacionPublica,
} from "./types"

function esVista(p: Partida, id: string): boolean {
  return p.vistas.includes(id)
}

function noVistaPermitida(s: Situacion, p: Partida): boolean {
  return s.unicaVez === false || !esVista(p, s.id)
}

function cumpleEstricto(s: Situacion, p: Partida): boolean {
  if (s.momento !== p.momento) return false
  if (s.modalidades && !s.modalidades.includes(p.modalidad)) return false
  if (s.variantes && !s.variantes.includes(p.variante)) return false
  if (s.minAno !== undefined && p.anoActual - p.anoInicio + 1 < s.minAno)
    return false
  return noVistaPermitida(s, p)
}

function elegirDe(candidatas: Situacion[], p: Partida): Situacion {
  const rng = rngPara(p.seed, "seleccion", p.anoActual, p.momento, p.contador)
  return elegirPonderado(
    rng,
    candidatas.map((s) => ({ valor: s, peso: s.peso ?? 1 })),
  )
}

/**
 * Selecciona la situación del momento actual.
 * Degradación en cadena (FR-018): estricto → relajar filtros → reciclar.
 * Devuelve `null` solo si el banco no tiene ninguna situación para el momento.
 */
export function seleccionarSituacion(
  p: Partida,
  banco: BancoContenido,
): Situacion | null {
  const condicionales = (banco.condicionales ?? [])
    .filter(
      (c) =>
        c.momento === p.momento &&
        (!c.modalidades || c.modalidades.includes(p.modalidad)) &&
        (!c.variantes || c.variantes.includes(p.variante)) &&
        (c.minAno === undefined || p.anoActual - p.anoInicio + 1 >= c.minAno) &&
        requisitoCumplido(c.requiere, p) &&
        dentroDeVentana(c.requiere, p, c.ventanaAnos) &&
        noVistaPermitida(c, p),
    )
    .sort((a, b) => (b.prioridad ?? 0) - (a.prioridad ?? 0))

  for (const c of condicionales) {
    const rng = rngPara(p.seed, "condicional", c.id, p.anoActual, p.contador)
    if (rng() < c.probabilidad) return c
  }

  const estricto = banco.situaciones.filter((s) => cumpleEstricto(s, p))
  if (estricto.length > 0) return elegirDe(estricto, p)

  const relajado = banco.situaciones.filter(
    (s) => s.momento === p.momento && noVistaPermitida(s, p),
  )
  if (relajado.length > 0) return elegirDe(relajado, p)

  const reciclado = banco.situaciones.filter((s) => s.momento === p.momento)
  if (reciclado.length > 0) {
    // Reutiliza las vistas hace más tiempo (ignora unicaVez).
    reciclado.sort(
      (a, b) => p.vistas.lastIndexOf(a.id) - p.vistas.lastIndexOf(b.id),
    )
    return reciclado[0]
  }

  return null
}

export function toPublica(s: Situacion): SituacionPublica {
  return {
    id: s.id,
    momento: s.momento,
    titulo: s.titulo,
    texto: s.texto,
    opciones: s.opciones.map((o) => ({
      id: o.id,
      titulo: o.titulo,
      subtitulo: o.subtitulo,
    })),
  }
}
