// Esquema del almacén local del panel (009). Reutiliza el esquema del juego:
// no duplica reglas. Ver specs/009-content-admin/data-model.md.

import { z } from "zod"
import { type Situacion, SituacionSchema } from "../content/schema"

export const VERSION_ALMACEN = 1

export interface Almacen {
  version: typeof VERSION_ALMACEN
  situaciones: Situacion[]
}

export const AlmacenSchema: z.ZodType<Almacen> = z
  .strictObject({
    version: z.literal(VERSION_ALMACEN),
    situaciones: z.array(SituacionSchema),
  })
  .superRefine((almacen, ctx) => {
    const ids = new Set<string>()
    for (const situacion of almacen.situaciones) {
      if (ids.has(situacion.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["situaciones"],
          message: `id de situación duplicado en el almacén: "${situacion.id}"`,
        })
      }
      ids.add(situacion.id)
    }
  })

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
