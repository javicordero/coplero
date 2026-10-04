import { condicionalesFebrero } from "./condicionales/febrero"
import { condicionalesVerano } from "./condicionales/verano"
import { situacionesFebrero } from "./decisiones/febrero"
import { situacionesVerano } from "./decisiones/verano"
import {
  type BancoContenido,
  BancoContenidoSchema,
  CondicionalSchema,
  OpcionSchema,
  RequisitoSchema,
  SituacionSchema,
  TextosTarjetaSchema,
} from "./schema"
import { TEXTOS_TARJETA } from "./textos/tarjeta"
import { VARIANTES } from "./variantes"

export * from "./informe"
export * from "./modalidades"
export type {
  Atributo,
  BancoContenido,
  Condicional,
  FaseCOAC,
  Modalidad,
  Momento,
  Opcion,
  Requisito,
  Situacion,
} from "./schema"
export * from "./variantes"
export {
  BancoContenidoSchema,
  CondicionalSchema,
  OpcionSchema,
  RequisitoSchema,
  SituacionSchema,
  TextosTarjetaSchema,
}

/** Datos crudos del banco, sin validar. */
export const bancoContenidoBruto: unknown = {
  situaciones: [...situacionesVerano, ...situacionesFebrero],
  condicionales: [...condicionalesVerano, ...condicionalesFebrero],
  variantes: VARIANTES.map((v) => ({ id: v.id, modalidad: v.modalidad })),
  textosTarjeta: TEXTOS_TARJETA,
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
