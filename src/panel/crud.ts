// Operaciones de creación/edición/borrado sobre un almacén en memoria (009).
// Reutiliza la validación del juego: SituacionSchema + BancoContenidoSchema.
// Ver specs/009-content-admin/contracts/panel.md.

import {
  BancoContenidoSchema,
  bancoContenido,
  type Situacion,
  SituacionSchema,
} from "../content"
import { type Almacen, type ErrorValidacion, mensajesDeError } from "./esquema"

export type ResultadoCrud =
  | { ok: true; almacen: Almacen; situacion: Situacion }
  | { ok: false; status: 404 | 422; errores: ErrorValidacion[] }

const noEncontrada = (id: string): ResultadoCrud => ({
  ok: false,
  status: 404,
  errores: [{ ruta: "id", mensaje: `no existe la situación "${id}"` }],
})

const error = (mensaje: string): ResultadoCrud => ({
  ok: false,
  status: 422,
  errores: [{ ruta: "id", mensaje }],
})

/** Reglas cruzadas del banco completo, reutilizando el esquema del juego. */
function erroresDelBanco(almacen: Almacen): ErrorValidacion[] {
  const resultado = BancoContenidoSchema.safeParse({
    situaciones: almacen.situaciones,
    condicionales: bancoContenido.condicionales,
    variantes: bancoContenido.variantes,
    modalidades: bancoContenido.modalidades,
    textosTarjeta: bancoContenido.textosTarjeta,
  })
  return resultado.success ? [] : mensajesDeError(resultado.error)
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

export function crear(almacen: Almacen, situacion: unknown): ResultadoCrud {
  const propia = SituacionSchema.safeParse(situacion)
  if (!propia.success) {
    return { ok: false, status: 422, errores: mensajesDeError(propia.error) }
  }
  if (almacen.situaciones.some((s) => s.id === propia.data.id)) {
    return error(`ya existe una situación con id "${propia.data.id}"`)
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
  if (indice === -1) return noEncontrada(id)
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
  if (!situacion) return noEncontrada(id)
  const candidato: Almacen = {
    ...almacen,
    situaciones: almacen.situaciones.filter((s) => s.id !== id),
  }
  const cruzados = erroresDelBanco(candidato)
  if (cruzados.length > 0) return { ok: false, status: 422, errores: cruzados }
  return { ok: true, almacen: candidato, situacion }
}
