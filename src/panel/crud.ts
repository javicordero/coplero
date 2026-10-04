// Operaciones de creación/edición/borrado sobre un almacén en memoria (009/024).
// Reutiliza la validación del juego: SituacionSchema, CondicionalSchema y
// BancoContenidoSchema. Ver specs/024-form-ux-improvements/contracts/ui-panel.md.

import {
  BancoContenidoSchema,
  bancoContenido,
  type Condicional,
  CondicionalSchema,
  type Situacion,
  SituacionSchema,
} from "../content"
import { type Almacen, type ErrorValidacion, mensajesDeError } from "./esquema"

export type ResultadoCrud =
  | { ok: true; almacen: Almacen; situacion: Situacion }
  | { ok: false; status: 404 | 422; errores: ErrorValidacion[] }

export type ResultadoCrudCondicional =
  | { ok: true; almacen: Almacen; condicional: Condicional }
  | { ok: false; status: 404 | 422; errores: ErrorValidacion[] }

const noEncontrada = (id: string, tipo = "entidad"): ResultadoCrud => ({
  ok: false,
  status: 404,
  errores: [{ ruta: "id", mensaje: `no existe la ${tipo} "${id}"` }],
})

const error = (mensaje: string): ResultadoCrud => ({
  ok: false,
  status: 422,
  errores: [{ ruta: "id", mensaje }],
})

const errorCondicional = (mensaje: string): ResultadoCrudCondicional => ({
  ok: false,
  status: 422,
  errores: [{ ruta: "id", mensaje }],
})

/** Reglas cruzadas del banco completo, reutilizando el esquema del juego. */
function erroresDelBanco(almacen: Almacen): ErrorValidacion[] {
  const resultado = BancoContenidoSchema.safeParse({
    situaciones: almacen.situaciones,
    condicionales: almacen.condicionales,
    variantes: bancoContenido.variantes,
    modalidades: bancoContenido.modalidades,
    textosTarjeta: bancoContenido.textosTarjeta,
  })
  return resultado.success ? [] : mensajesDeError(resultado.error)
}

function idEnUso(almacen: Almacen, id: string): boolean {
  return (
    almacen.situaciones.some((s) => s.id === id) ||
    almacen.condicionales.some((c) => c.id === id)
  )
}

function validarSituacion(
  almacen: Almacen,
  situacion: unknown,
):
  | { ok: true; situacion: Situacion }
  | { ok: false; errores: ErrorValidacion[] } {
  const propia = SituacionSchema.safeParse(situacion)
  if (!propia.success)
    return { ok: false, errores: mensajesDeError(propia.error) }
  const cruzados = erroresDelBanco(almacen)
  if (cruzados.length > 0) return { ok: false, errores: cruzados }
  return { ok: true, situacion: propia.data }
}

function validarCondicional(
  almacen: Almacen,
  condicional: unknown,
):
  | { ok: true; condicional: Condicional }
  | { ok: false; errores: ErrorValidacion[] } {
  const propia = CondicionalSchema.safeParse(condicional)
  if (!propia.success)
    return { ok: false, errores: mensajesDeError(propia.error) }
  const cruzados = erroresDelBanco(almacen)
  if (cruzados.length > 0) return { ok: false, errores: cruzados }
  return { ok: true, condicional: propia.data }
}

export function crear(almacen: Almacen, situacion: unknown): ResultadoCrud {
  const propia = SituacionSchema.safeParse(situacion)
  if (!propia.success) {
    return { ok: false, status: 422, errores: mensajesDeError(propia.error) }
  }
  if (idEnUso(almacen, propia.data.id)) {
    return error(`ya existe una entidad con id "${propia.data.id}"`)
  }
  const candidato: Almacen = {
    ...almacen,
    situaciones: [...almacen.situaciones, propia.data],
  }
  const validada = validarSituacion(candidato, propia.data)
  if (!validada.ok) return { ok: false, status: 422, errores: validada.errores }
  return { ok: true, almacen: candidato, situacion: validada.situacion }
}

export function actualizar(
  almacen: Almacen,
  id: string,
  situacion: unknown,
): ResultadoCrud {
  const indice = almacen.situaciones.findIndex((s) => s.id === id)
  if (indice === -1) return noEncontrada(id, "situación")
  const propia = SituacionSchema.safeParse(situacion)
  if (!propia.success) {
    return { ok: false, status: 422, errores: mensajesDeError(propia.error) }
  }
  if (propia.data.id !== id) {
    return error(
      `el id es inmutable: no puede pasar de "${id}" a "${propia.data.id}"`,
    )
  }
  const situaciones = [...almacen.situaciones]
  situaciones[indice] = propia.data
  const candidato: Almacen = { ...almacen, situaciones }
  const validada = validarSituacion(candidato, propia.data)
  if (!validada.ok) return { ok: false, status: 422, errores: validada.errores }
  return { ok: true, almacen: candidato, situacion: validada.situacion }
}

export function eliminar(almacen: Almacen, id: string): ResultadoCrud {
  const situacion = almacen.situaciones.find((s) => s.id === id)
  if (!situacion) return noEncontrada(id, "situación")
  const candidato: Almacen = {
    ...almacen,
    situaciones: almacen.situaciones.filter((s) => s.id !== id),
  }
  const cruzados = erroresDelBanco(candidato)
  if (cruzados.length > 0) return { ok: false, status: 422, errores: cruzados }
  return { ok: true, almacen: candidato, situacion }
}

export function crearCondicional(
  almacen: Almacen,
  condicional: unknown,
): ResultadoCrudCondicional {
  const propia = CondicionalSchema.safeParse(condicional)
  if (!propia.success) {
    return { ok: false, status: 422, errores: mensajesDeError(propia.error) }
  }
  if (idEnUso(almacen, propia.data.id)) {
    return errorCondicional(`ya existe una entidad con id "${propia.data.id}"`)
  }
  const candidato: Almacen = {
    ...almacen,
    condicionales: [...almacen.condicionales, propia.data],
  }
  const validada = validarCondicional(candidato, propia.data)
  if (!validada.ok) return { ok: false, status: 422, errores: validada.errores }
  return { ok: true, almacen: candidato, condicional: validada.condicional }
}

export function actualizarCondicional(
  almacen: Almacen,
  id: string,
  condicional: unknown,
): ResultadoCrudCondicional {
  const indice = almacen.condicionales.findIndex((c) => c.id === id)
  if (indice === -1)
    return {
      ok: false,
      status: 404,
      errores: [{ ruta: "id", mensaje: `no existe el condicional "${id}"` }],
    }
  const propia = CondicionalSchema.safeParse(condicional)
  if (!propia.success) {
    return { ok: false, status: 422, errores: mensajesDeError(propia.error) }
  }
  if (propia.data.id !== id) {
    return errorCondicional(
      `el id es inmutable: no puede pasar de "${id}" a "${propia.data.id}"`,
    )
  }
  const condicionales = [...almacen.condicionales]
  condicionales[indice] = propia.data
  const candidato: Almacen = { ...almacen, condicionales }
  const validada = validarCondicional(candidato, propia.data)
  if (!validada.ok) return { ok: false, status: 422, errores: validada.errores }
  return { ok: true, almacen: candidato, condicional: validada.condicional }
}

export function eliminarCondicional(
  almacen: Almacen,
  id: string,
): ResultadoCrudCondicional {
  const condicional = almacen.condicionales.find((c) => c.id === id)
  if (!condicional)
    return {
      ok: false,
      status: 404,
      errores: [{ ruta: "id", mensaje: `no existe el condicional "${id}"` }],
    }
  const candidato: Almacen = {
    ...almacen,
    condicionales: almacen.condicionales.filter((c) => c.id !== id),
  }
  const cruzados = erroresDelBanco(candidato)
  if (cruzados.length > 0) return { ok: false, status: 422, errores: cruzados }
  return { ok: true, almacen: candidato, condicional }
}
