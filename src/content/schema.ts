// Esquema del banco de contenido (Zod). Son datos, no lógica de juego.
// Este módulo es autocontenido: no importa del motor ni de la web.

import { z } from "zod"
import {
  ATRIBUTOS,
  type Atributo,
  CATEGORIAS,
  type Categoria,
  FASES_COAC,
  type FaseCOAC,
  MODALIDADES,
  MOMENTOS,
  type Modalidad,
  type Momento,
  TIPOS_DECISION,
  type TipoDecision,
} from "./modalidades"

export interface Opcion {
  id: string
  titulo: string
  subtitulo: string
  efectos?: Partial<Record<Atributo, number>>
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
  tipo: TipoDecision
  categoria: Categoria
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

export interface BancoContenido {
  situaciones: Situacion[]
  condicionales?: Condicional[]
  modalidades?: Modalidad[]
  variantes?: CatalogoVariante[]
}

const EfectosSchema = z.strictObject({
  letra: z.number().int().optional(),
  musica: z.number().int().optional(),
  puestaEnEscena: z.number().int().optional(),
  popularidad: z.number().int().optional(),
  cohesion: z.number().int().optional(),
  dinero: z.number().int().optional(),
})

export const OpcionSchema: z.ZodType<Opcion> = z.strictObject({
  id: z.string().min(1),
  titulo: z.string().min(1),
  subtitulo: z.string().min(1),
  efectos: EfectosSchema.optional(),
  flags: z.array(z.string().min(1)).optional(),
  consume: z.array(z.string().min(1)).optional(),
  peso: z.number().optional(),
  saltaCOAC: z.boolean().optional(),
  cambiaModalidad: z.enum(MODALIDADES).optional(),
  cambiaVariante: z.string().min(1).optional(),
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
  tipo: z.enum(TIPOS_DECISION),
  categoria: z.enum(CATEGORIAS),
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
      for (const tipo of TIPOS_DECISION) {
        const comunes = banco.situaciones.filter(
          (s) =>
            s.momento === momento &&
            s.tipo === tipo &&
            !s.modalidades?.length &&
            !s.variantes?.length,
        )
        if (comunes.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["situaciones"],
            message: `no hay ninguna situación común (sin filtros) para ${momento}/${tipo}`,
          })
        }
      }
    }
  })

export type { Atributo, Categoria, FaseCOAC, Modalidad, Momento, TipoDecision }
