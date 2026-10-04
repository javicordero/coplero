// Esquema del banco de contenido (Zod). Son datos, no lógica de juego.
// Este módulo es autocontenido: no importa del motor ni de la web.

import { z } from "zod"
import {
  ATRIBUTOS,
  type Atributo,
  FASES_COAC,
  type FaseCOAC,
  MODALIDADES,
  MOMENTOS,
  type Modalidad,
  type Momento,
} from "./modalidades"

export interface Opcion {
  id: string
  titulo: string
  subtitulo: string
  efectos?: Partial<Record<Atributo, number>>
  /** Marca la opción como excepción: única vía por la que una decisión mueve atributos. */
  excepcion?: boolean
  flags?: string[]
  consume?: string[]
  peso?: number
  saltaCOAC?: boolean
  cambiaModalidad?: Modalidad
  cambiaVariante?: string
}

export type Requisito =
  | { tipo: "flag"; flag: string }
  | {
      tipo: "flagRepetida"
      flag: string
      veces: number
      consecutivos?: boolean
    }
  | { tipo: "faseAlcanzada"; fase: FaseCOAC }
  | { tipo: "todas"; de: Requisito[] }
  | { tipo: "alguna"; de: Requisito[] }
  | { tipo: "ninguna"; de: Requisito[] }
  | { tipo: "atributo"; atributo: Atributo; min?: number; max?: number }

export interface Situacion {
  id: string
  momento: Momento
  titulo: string
  texto: string
  opciones: Opcion[]
  modalidades?: Modalidad[]
  variantes?: string[]
  minAno?: number
  unicaVez?: boolean
  peso?: number
}

export interface Condicional extends Situacion {
  requiere: Requisito
  ventanaAnos: number
  probabilidad: number
  consumeFlag: boolean
  prioridad?: number
}

export interface CatalogoVariante {
  id: string
  modalidad: Modalidad
}

/** Categorías de hito de la tarjeta final (deben coincidir con el motor). */
export const TIPOS_HITO = [
  "ganar_coac",
  "podio",
  "final",
  "premio_aguja",
  "premio_copla",
  "premio_candela",
  "cambio_modalidad",
  "cambio_variante",
  "anos_sin_concursar",
  "debut",
  "duracion",
  "mejor_resultado",
] as const
export type TipoHito = (typeof TIPOS_HITO)[number]

/** Buckets de desenlace para las frases de cierre. */
export const BUCKETS_FRASE = [
  "campeon",
  "podio",
  "finalista",
  "semifinales",
  "cuartos",
  "preliminares",
  "retirada",
] as const
export type BucketFrase = (typeof BUCKETS_FRASE)[number]

export interface TextosTarjeta {
  hitos: Record<TipoHito, string[]>
  frases: Record<BucketFrase, string[]>
}

export interface BancoContenido {
  situaciones: Situacion[]
  condicionales?: Condicional[]
  modalidades?: Modalidad[]
  variantes?: CatalogoVariante[]
  textosTarjeta?: TextosTarjeta
}

const EfectosSchema = z.strictObject({
  letra: z.number().int().optional(),
  musica: z.number().int().optional(),
  puestaEnEscena: z.number().int().optional(),
  popularidad: z.number().int().optional(),
  cohesion: z.number().int().optional(),
  dinero: z.number().int().optional(),
})

export const OpcionSchema: z.ZodType<Opcion> = z
  .strictObject({
    id: z.string().min(1),
    titulo: z.string().min(1),
    subtitulo: z.string().min(1),
    efectos: EfectosSchema.optional(),
    excepcion: z.boolean().optional(),
    flags: z.array(z.string().min(1)).optional(),
    consume: z.array(z.string().min(1)).optional(),
    peso: z.number().optional(),
    saltaCOAC: z.boolean().optional(),
    cambiaModalidad: z.enum(MODALIDADES).optional(),
    cambiaVariante: z.string().min(1).optional(),
  })
  .superRefine((opcion, ctx) => {
    const tieneEfectos =
      opcion.efectos !== undefined && Object.keys(opcion.efectos).length > 0
    if (tieneEfectos && opcion.excepcion !== true) {
      ctx.addIssue({
        code: "custom",
        path: ["excepcion"],
        message: `la opción "${opcion.id}" tiene "efectos" pero no está declarada como excepción (excepcion: true)`,
      })
    }
    if (opcion.excepcion === true && !tieneEfectos) {
      ctx.addIssue({
        code: "custom",
        path: ["efectos"],
        message: `la opción "${opcion.id}" está declarada como excepción pero no tiene "efectos"`,
      })
    }
  })

export const RequisitoSchema: z.ZodType<Requisito> = z.lazy(() =>
  z.discriminatedUnion("tipo", [
    z.strictObject({ tipo: z.literal("flag"), flag: z.string().min(1) }),
    z.strictObject({
      tipo: z.literal("flagRepetida"),
      flag: z.string().min(1),
      veces: z.number().int().positive(),
      consecutivos: z.boolean().optional(),
    }),
    z.strictObject({
      tipo: z.literal("faseAlcanzada"),
      fase: z.enum(FASES_COAC),
    }),
    z.strictObject({ tipo: z.literal("todas"), de: z.array(RequisitoSchema) }),
    z.strictObject({ tipo: z.literal("alguna"), de: z.array(RequisitoSchema) }),
    z.strictObject({
      tipo: z.literal("ninguna"),
      de: z.array(RequisitoSchema),
    }),
    z.strictObject({
      tipo: z.literal("atributo"),
      atributo: z.enum(ATRIBUTOS),
      min: z.number().optional(),
      max: z.number().optional(),
    }),
  ]),
)

const SituacionBase = z.strictObject({
  id: z.string().min(1),
  momento: z.enum(MOMENTOS),
  titulo: z.string().min(1),
  texto: z.string(),
  opciones: z.array(OpcionSchema).min(2),
  modalidades: z.array(z.enum(MODALIDADES)).optional(),
  variantes: z.array(z.string().min(1)).optional(),
  minAno: z.number().int().positive().optional(),
  unicaVez: z.boolean().optional(),
  peso: z.number().positive().optional(),
})

function comprobarIdsDeOpciones(s: Situacion, ctx: z.RefinementCtx): void {
  const vistos = new Set<string>()
  for (const opcion of s.opciones) {
    if (vistos.has(opcion.id)) {
      ctx.addIssue({
        code: "custom",
        path: ["opciones"],
        message: `opción con id duplicado "${opcion.id}" en la situación "${s.id}"`,
      })
    }
    vistos.add(opcion.id)
  }
}

export const SituacionSchema: z.ZodType<Situacion> = SituacionBase.superRefine(
  comprobarIdsDeOpciones,
)

const CondicionalBase = SituacionBase.extend({
  requiere: RequisitoSchema,
  ventanaAnos: z.number().int().positive(),
  probabilidad: z.number().min(0).max(1),
  consumeFlag: z.boolean(),
  prioridad: z.number().optional(),
})

export const CondicionalSchema: z.ZodType<Condicional> =
  CondicionalBase.superRefine(comprobarIdsDeOpciones)

function recordDeTexto<T extends string>(
  claves: readonly T[],
): z.ZodType<Record<T, string[]>> {
  const shape: Record<string, z.ZodArray<z.ZodString>> = {}
  for (const clave of claves) {
    shape[clave] = z.array(z.string().min(1)).min(1)
  }
  return z.strictObject(shape) as unknown as z.ZodType<Record<T, string[]>>
}

export const TextosTarjetaSchema: z.ZodType<TextosTarjeta> = z.strictObject({
  hitos: recordDeTexto(TIPOS_HITO),
  frases: recordDeTexto(BUCKETS_FRASE),
})

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

export const BancoContenidoSchema: z.ZodType<BancoContenido> = z
  .strictObject({
    situaciones: z.array(SituacionSchema),
    condicionales: z.array(CondicionalSchema).optional(),
    modalidades: z.array(z.enum(MODALIDADES)).optional(),
    variantes: z
      .array(
        z.strictObject({
          id: z.string().min(1),
          modalidad: z.enum(MODALIDADES),
        }),
      )
      .optional(),
    textosTarjeta: TextosTarjetaSchema.optional(),
  })
  .superRefine((banco, ctx) => {
    const todas = [...banco.situaciones, ...(banco.condicionales ?? [])]

    const ids = new Set<string>()
    for (const s of todas) {
      if (ids.has(s.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["situaciones"],
          message: `id duplicado en el banco: "${s.id}"`,
        })
      }
      ids.add(s.id)
    }

    const declaradas = new Set<string>()
    for (const s of todas) {
      for (const opcion of s.opciones) {
        for (const flag of opcion.flags ?? []) declaradas.add(flag)
      }
    }
    for (const condicional of banco.condicionales ?? []) {
      for (const flag of flagsDeRequisito(condicional.requiere)) {
        if (!declaradas.has(flag)) {
          ctx.addIssue({
            code: "custom",
            path: ["condicionales"],
            message: `la flag referenciada "${flag}" (en "${condicional.id}") no la declara ninguna opción`,
          })
        }
      }
    }

    const catalogo = new Map<string, Modalidad>()
    for (const v of banco.variantes ?? []) catalogo.set(v.id, v.modalidad)
    const comprobarVariante = (
      varianteId: string,
      lugar: string,
      modalidadesPermitidas: Modalidad[] | undefined,
    ) => {
      if (catalogo.size === 0) return
      const modalidadDe = catalogo.get(varianteId)
      if (modalidadDe === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["situaciones"],
          message: `la variante "${varianteId}" (en ${lugar}) no está en el catálogo`,
        })
        return
      }
      if (
        modalidadesPermitidas &&
        !modalidadesPermitidas.includes(modalidadDe)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["situaciones"],
          message: `la variante "${varianteId}" (en ${lugar}) no pertenece a sus modalidades`,
        })
      }
    }

    for (const s of todas) {
      for (const varianteId of s.variantes ?? []) {
        comprobarVariante(varianteId, `filtro de "${s.id}"`, s.modalidades)
      }
      for (const opcion of s.opciones) {
        if (
          opcion.cambiaModalidad !== undefined &&
          opcion.cambiaVariante !== undefined
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["situaciones"],
            message: `la opción "${opcion.id}" (en "${s.id}") no puede cambiar modalidad y variante a la vez`,
          })
        }
        if (opcion.cambiaModalidad !== undefined && s.momento !== "verano") {
          ctx.addIssue({
            code: "custom",
            path: ["situaciones"],
            message: `la opción "${opcion.id}" (en "${s.id}") cambia de modalidad fuera de verano`,
          })
        }
        if (opcion.cambiaVariante !== undefined) {
          comprobarVariante(
            opcion.cambiaVariante,
            `opción "${opcion.id}" de "${s.id}"`,
            s.modalidades,
          )
        }
      }
    }

    for (const momento of MOMENTOS) {
      const comunes = banco.situaciones.filter(
        (s) =>
          s.momento === momento &&
          !s.modalidades?.length &&
          !s.variantes?.length,
      )
      if (comunes.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["situaciones"],
          message: `no hay ninguna situación común (sin filtros) para ${momento}`,
        })
      }
    }
  })

export type { Atributo, FaseCOAC, Modalidad, Momento }
