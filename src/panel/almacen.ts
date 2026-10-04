// Almacén local del panel (009): fichero JSON en disco, escritura atómica y copias
// de seguridad. SOLO de servidor (usa node:fs). Ver contracts/almacen.md.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  type Almacen,
  AlmacenSchema,
  formatearErrores,
  mensajesDeError,
  migrarAlmacen,
  VERSION_ALMACEN,
} from "./esquema"

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

/** Ruta por defecto del almacén (versionado en git). */
export const RUTA_ALMACEN = join(
  RAIZ,
  "content-admin",
  "data",
  "situaciones.json",
)

export const DIRECTORIO_BACKUPS = join(RAIZ, "content-admin", "data", "backups")

export class ErrorAlmacen extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = "ErrorAlmacen"
  }
}

export function almacenVacio(): Almacen {
  return { version: VERSION_ALMACEN, situaciones: [], condicionales: [] }
}

const mensajeDe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

export interface AlmacenEnDisco {
  ruta: string
  directorioBackups: string
  existe(): boolean
  leer(): Almacen
  escribir(almacen: Almacen): void
  copiaDeSeguridad(): string
}

/**
 * Crea un almacén sobre una ruta concreta. El parámetro permite testear con un
 * directorio temporal sin tocar el almacén real del repositorio.
 */
export function crearAlmacenEnDisco(
  ruta: string,
  directorioBackups: string = join(dirname(ruta), "backups"),
): AlmacenEnDisco {
  const validar = (datos: unknown, contexto: string): Almacen => {
    const resultado = AlmacenSchema.safeParse(datos)
    if (resultado.success) return resultado.data
    throw new ErrorAlmacen(
      `Almacén inválido (${contexto}):\n${formatearErrores(mensajesDeError(resultado.error))}`,
    )
  }

  const existe = (): boolean => existsSync(ruta)

  const copiaDeSeguridad = (): string => {
    if (!existe()) throw new ErrorAlmacen("No hay almacén que copiar todavía")
    mkdirSync(directorioBackups, { recursive: true })
    const sello = new Date().toISOString().replace(/[:.]/g, "-")
    const destino = join(directorioBackups, `situaciones-${sello}.json`)
    copyFileSync(ruta, destino)
    return destino
  }

  const leer = (): Almacen => {
    if (!existe()) return almacenVacio()
    let crudo: string
    try {
      crudo = readFileSync(ruta, "utf8")
    } catch (error) {
      throw new ErrorAlmacen(
        `No se pudo leer el almacén (${ruta}): ${mensajeDe(error)}`,
      )
    }
    let datos: unknown
    try {
      datos = JSON.parse(crudo)
    } catch (error) {
      throw new ErrorAlmacen(
        `El almacén tiene un JSON corrupto (${ruta}): ${mensajeDe(error)}`,
      )
    }
    return validar(migrarAlmacen(datos), ruta)
  }

  const escribir = (almacen: Almacen): void => {
    const contenido = validar(almacen, "a escribir")
    mkdirSync(dirname(ruta), { recursive: true })
    if (existe()) copiaDeSeguridad()
    const temporal = `${ruta}.tmp`
    writeFileSync(temporal, `${JSON.stringify(contenido, null, 2)}\n`, "utf8")
    renameSync(temporal, ruta)
  }

  return { ruta, directorioBackups, existe, leer, escribir, copiaDeSeguridad }
}

/** Almacén real del repositorio. */
export const almacen = crearAlmacenEnDisco(RUTA_ALMACEN)

export const existeAlmacen = (): boolean => almacen.existe()
export const leerAlmacen = (): Almacen => almacen.leer()
export const escribirAlmacen = (a: Almacen): void => almacen.escribir(a)
export const copiaDeSeguridad = (): string => almacen.copiaDeSeguridad()
