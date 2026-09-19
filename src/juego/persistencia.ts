// Guardado local de la partida. Almacén inyectable para poder testear sin DOM.

import {
  deserializar,
  type Partida,
  serializar,
  VERSION_PARTIDA,
} from "../engine/index"

export const CLAVE_GUARDADO = "coplero:partida"
export const VERSION_GUARDADO = VERSION_PARTIDA

export interface Almacen {
  getItem(clave: string): string | null
  setItem(clave: string, valor: string): void
  removeItem(clave: string): void
}

interface ContenidoGuardado {
  version: number
  partida: string
}

export interface ResultadoCarga {
  partida: Partida | null
  descartado: boolean
}

export function guardar(almacen: Almacen, partida: Partida): void {
  const contenido: ContenidoGuardado = {
    version: VERSION_GUARDADO,
    partida: serializar(partida),
  }
  almacen.setItem(CLAVE_GUARDADO, JSON.stringify(contenido))
}

export function cargar(almacen: Almacen): ResultadoCarga {
  const crudo = almacen.getItem(CLAVE_GUARDADO)
  if (crudo === null) return { partida: null, descartado: false }

  let contenido: unknown
  try {
    contenido = JSON.parse(crudo)
  } catch {
    almacen.removeItem(CLAVE_GUARDADO)
    return { partida: null, descartado: true }
  }

  const valor = contenido as Partial<ContenidoGuardado> | null
  if (
    !valor ||
    valor.version !== VERSION_GUARDADO ||
    typeof valor.partida !== "string"
  ) {
    almacen.removeItem(CLAVE_GUARDADO)
    return { partida: null, descartado: true }
  }

  const resultado = deserializar(valor.partida)
  if (!resultado.ok) {
    almacen.removeItem(CLAVE_GUARDADO)
    return { partida: null, descartado: true }
  }

  return { partida: resultado.valor, descartado: false }
}

export function borrar(almacen: Almacen): void {
  almacen.removeItem(CLAVE_GUARDADO)
}
