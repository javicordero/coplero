// Cálculos estáticos del informe de integridad del banco de contenido.
// Sin lógica de juego: solo recuentos y análisis de los datos.

import {
  MODALIDADES,
  MOMENTOS,
  type Momento,
  type TipoDecision,
} from "./modalidades"
import { type BancoContenido, flagsDeRequisito } from "./schema"

export interface InformeContenido {
  situacionesPorMomento: Record<Momento, number>
  totalSituaciones: number
  totalCondicionales: number
  flagsDeclaradas: string[]
  flagsReferenciadas: string[]
  flagsSinDeclarar: string[]
  situacionesInalcanzablesEstaticas: string[]
}

function todas(banco: BancoContenido) {
  return [...banco.situaciones, ...(banco.condicionales ?? [])]
}

export function contarSituacionesPorMomento(
  banco: BancoContenido,
): Record<Momento, number> {
  const conteo = { verano: 0, febrero: 0 } as Record<Momento, number>
  for (const s of banco.situaciones) conteo[s.momento] += 1
  return conteo
}

export function flagsDeclaradas(banco: BancoContenido): string[] {
  const flags = new Set<string>()
  for (const s of todas(banco)) {
    for (const opcion of s.opciones) {
      for (const flag of opcion.flags ?? []) flags.add(flag)
    }
  }
  return [...flags].sort()
}

export function flagsReferenciadas(banco: BancoContenido): string[] {
  const flags = new Set<string>()
  for (const c of banco.condicionales ?? []) {
    for (const flag of flagsDeRequisito(c.requiere)) flags.add(flag)
  }
  return [...flags].sort()
}

export function flagsSinDeclarar(banco: BancoContenido): string[] {
  const declaradas = new Set(flagsDeclaradas(banco))
  return flagsReferenciadas(banco).filter((flag) => !declaradas.has(flag))
}

/**
 * Situaciones inalcanzables por análisis estático: sus filtros no admiten
 * ninguna configuración posible (listas vacías o modalidades imposibles).
 */
export function situacionesInalcanzablesEstaticas(
  banco: BancoContenido,
): string[] {
  const resultado: string[] = []
  for (const s of banco.situaciones) {
    if (s.modalidades) {
      const validas = s.modalidades.filter((m) => MODALIDADES.includes(m))
      if (validas.length === 0) resultado.push(s.id)
      continue
    }
    if (s.variantes && s.variantes.length === 0) resultado.push(s.id)
  }
  return resultado.sort()
}

/** Cobertura estática por momento y tipo (situaciones comunes, sin filtros). */
export function cobertura(
  banco: BancoContenido,
): Record<Momento, Record<TipoDecision, number>> {
  const mapa = {} as Record<Momento, Record<TipoDecision, number>>
  for (const momento of MOMENTOS) {
    mapa[momento] = { contenido: 0, personaje: 0 }
  }
  for (const s of banco.situaciones) {
    if (s.modalidades?.length || s.variantes?.length) continue
    mapa[s.momento][s.tipo] += 1
  }
  return mapa
}

export function construirInformeContenido(
  banco: BancoContenido,
): InformeContenido {
  return {
    situacionesPorMomento: contarSituacionesPorMomento(banco),
    totalSituaciones: banco.situaciones.length,
    totalCondicionales: (banco.condicionales ?? []).length,
    flagsDeclaradas: flagsDeclaradas(banco),
    flagsReferenciadas: flagsReferenciadas(banco),
    flagsSinDeclarar: flagsSinDeclarar(banco),
    situacionesInalcanzablesEstaticas: situacionesInalcanzablesEstaticas(banco),
  }
}
