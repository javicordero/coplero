import { condicionalesFebrero } from "./condicionales/febrero"
import { condicionalesVerano } from "./condicionales/verano"
import { situacionesFebreroContenido } from "./decisiones/febrero/contenido"
import { situacionesFebreroPersonaje } from "./decisiones/febrero/personaje"
import { situacionesVeranoContenido } from "./decisiones/verano/contenido"
import { situacionesVeranoPersonaje } from "./decisiones/verano/personaje"
import {
  type BancoContenido,
  BancoContenidoSchema,
  CondicionalSchema,
  OpcionSchema,
  RequisitoSchema,
  SituacionSchema,
} from "./schema"
import { VARIANTES } from "./variantes"

export * from "./informe"
export * from "./modalidades"
export type {
  Atributo,
  BancoContenido,
  Categoria,
  Condicional,
  FaseCOAC,
  Modalidad,
  Momento,
  Opcion,
  Requisito,
  Situacion,
  TipoDecision,
} from "./schema"
export * from "./variantes"
export {
  BancoContenidoSchema,
  CondicionalSchema,
  OpcionSchema,
  RequisitoSchema,
  SituacionSchema,
}

/** Datos crudos del banco, sin validar. */
export const bancoContenidoBruto: unknown = {
  situaciones: [
    ...situacionesVeranoContenido,
    ...situacionesVeranoPersonaje,
    ...situacionesFebreroContenido,
    ...situacionesFebreroPersonaje,
  ],
  condicionales: [...condicionalesVerano, ...condicionalesFebrero],
  variantes: VARIANTES.map((v) => ({ id: v.id, modalidad: v.modalidad })),
}

/**
 * Valida el banco con Zod y lanza un error legible con cada problema
 * (id, campo o flag culpable) si el contenido no es válido.
 */
export function parsearBanco(datos: unknown): BancoContenido {
  const resultado = BancoContenidoSchema.safeParse(datos)
  if (resultado.success) return resultado.data
  const detalle = resultado.error.issues
    .map((issue) => {
      const ruta = issue.path.length > 0 ? issue.path.join(".") : "(raíz)"
      return `  - ${ruta}: ${issue.message}`
    })
    .join("\n")
  throw new Error(`Banco de contenido inválido:\n${detalle}`)
}

/** Banco de contenido validado y listo para el motor. */
export const bancoContenido: BancoContenido = parsearBanco(bancoContenidoBruto)
