// Guardado local de la partida. Almacén inyectable para poder testear sin DOM.
// Ninguna función de este módulo propaga excepciones (FR-012).

import { deserializar, type Partida, serializar } from "../engine/index"

export const CLAVE_GUARDADO = "coplero:partida"
/** Versión del formato del sobre, independiente de `VERSION_PARTIDA`. */
export const VERSION_GUARDADO = 1

export interface Almacen {
  getItem(clave: string): string | null
  setItem(clave: string, valor: string): void
  removeItem(clave: string): void
}

interface ContenidoGuardado {
  version: number
  partida: string
}

export type EstadoGuardado = "ninguno" | "en-curso" | "terminada"

export interface ResultadoCarga {
  partida: Partida | null
  descartado: boolean
}

function descartar(almacen: Almacen): ResultadoCarga {
  try {
    almacen.removeItem(CLAVE_GUARDADO)
  } catch {
    // sin almacenamiento: nada que borrar
  }
  return { partida: null, descartado: true }
}

export function guardar(almacen: Almacen, partida: Partida): void {
  try {
    const contenido: ContenidoGuardado = {
      version: VERSION_GUARDADO,
      partida: serializar(partida),
    }
    almacen.setItem(CLAVE_GUARDADO, JSON.stringify(contenido))
  } catch {
    // cuota/permiso: se ignora en silencio (FR-012)
  }
}

export function cargar(almacen: Almacen): ResultadoCarga {
  let crudo: string | null
  try {
    crudo = almacen.getItem(CLAVE_GUARDADO)
  } catch {
    return { partida: null, descartado: false }
  }
  if (crudo === null) return { partida: null, descartado: false }

  let contenido: unknown
  try {
    contenido = JSON.parse(crudo)
  } catch {
    return descartar(almacen)
  }

  const valor = contenido as Partial<ContenidoGuardado> | null
  if (
    !valor ||
    valor.version !== VERSION_GUARDADO ||
    typeof valor.partida !== "string"
  ) {
    return descartar(almacen)
  }

  const resultado = deserializar(valor.partida)
  if (!resultado.ok) return descartar(almacen)

  return { partida: resultado.valor, descartado: false }
}

export function borrar(almacen: Almacen): void {
  try {
    almacen.removeItem(CLAVE_GUARDADO)
  } catch {
    // sin almacenamiento: nada que borrar
  }
}

export function estadoGuardado(partida: Partida | null): EstadoGuardado {
  if (!partida) return "ninguno"
  return partida.fase === "fin" ? "terminada" : "en-curso"
}

/**
 * `localStorage` si está disponible; si no (modo privado, permisos, SSR),
 * un almacén no-op que nunca lanza y nunca finge tener datos.
 */
export function almacenNavegador(): Almacen {
  const noop: Almacen = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
  try {
    if (typeof localStorage === "undefined") return noop
    const prueba = "coplero:prueba"
    localStorage.setItem(prueba, "1")
    localStorage.removeItem(prueba)
    return localStorage
  } catch {
    return noop
  }
}
