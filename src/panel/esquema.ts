// Esquema del almacén local del panel (009/024/025). Reutiliza los esquemas del
// juego: no duplica reglas. Ver specs/025-conditional-consumption/contracts/.

import { z } from "zod"
import {
  type Condicional,
  CondicionalSchema,
  type Situacion,
  SituacionSchema,
} from "../content/schema"

export const VERSION_ALMACEN = 3

export interface Almacen {
  version: typeof VERSION_ALMACEN
  situaciones: Situacion[]
  condicionales: Condicional[]
}

export const AlmacenSchema: z.ZodType<Almacen> = z
  .strictObject({
    version: z.literal(VERSION_ALMACEN),
    situaciones: z.array(SituacionSchema),
    condicionales: z.array(CondicionalSchema),
  })
  .superRefine((almacen, ctx) => {
    const ids = new Set<string>()
    for (const entidad of [...almacen.situaciones, ...almacen.condicionales]) {
      if (ids.has(entidad.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["situaciones"],
          message: `id duplicado en el almacén: "${entidad.id}"`,
        })
      }
      ids.add(entidad.id)
    }
  })

/** Copia un objeto quitándole las claves indicadas (sin mutar el original). */
function sinClaves(obj: unknown, claves: string[]): unknown {
  if (typeof obj !== "object" || obj === null) return obj
  const copia = { ...(obj as Record<string, unknown>) }
  for (const clave of claves) delete copia[clave]
  return copia
}

function limpiarOpcion(opcion: unknown): unknown {
  return sinClaves(opcion, ["consume"])
}

function limpiarSituacion(situacion: unknown): unknown {
  if (typeof situacion !== "object" || situacion === null) return situacion
  const copia = { ...(situacion as Record<string, unknown>) }
  if (Array.isArray(copia.opciones)) {
    copia.opciones = copia.opciones.map(limpiarOpcion)
  }
  return copia
}

function limpiarCondicional(condicional: unknown): unknown {
  return sinClaves(limpiarSituacion(condicional), ["consumeFlag"])
}

/**
 * Normaliza cualquier almacén al formato actual (v3). La feature 025 retiró el
 * consumo manual, así que se quitan `consume` (opciones) y `consumeFlag`
 * (condicionales). v1 no tenía condicionales; se siembran vacíos.
 */
export function migrarAlmacen(datos: unknown): unknown {
  if (typeof datos !== "object" || datos === null) return datos
  const d = datos as {
    situaciones?: unknown
    condicionales?: unknown
  }
  const situaciones = Array.isArray(d.situaciones)
    ? d.situaciones.map(limpiarSituacion)
    : []
  const condicionales = Array.isArray(d.condicionales)
    ? d.condicionales.map(limpiarCondicional)
    : []
  return { version: VERSION_ALMACEN, situaciones, condicionales }
}

export interface ErrorValidacion {
  ruta: string
  mensaje: string
}

/** Convierte los problemas de Zod en una lista legible (misma fuente que el build). */
export function mensajesDeError(error: z.ZodError): ErrorValidacion[] {
  return error.issues.map((issue) => ({
    ruta: issue.path.length > 0 ? issue.path.join(".") : "(raíz)",
    mensaje: issue.message,
  }))
}

export function formatearErrores(errores: ErrorValidacion[]): string {
  return errores
    .map(({ ruta, mensaje }) => `  - ${ruta}: ${mensaje}`)
    .join("\n")
}
