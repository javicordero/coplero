import type { APIRoute } from "astro"
import {
  ErrorAlmacen,
  escribirAlmacen,
  leerAlmacen,
} from "../../../../panel/almacen"
import { actualizar, eliminar } from "../../../../panel/crud"
import { bloqueoFueraDeDesarrollo } from "../../../../panel/guard"

export const prerender = false

const json = (datos: unknown, status = 200): Response =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })

const errorAlmacen = (error: ErrorAlmacen): Response =>
  json({ errores: [{ ruta: "(almacén)", mensaje: error.message }] }, 500)

export const PUT: APIRoute = async ({ params, request }) => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  try {
    const id = params.id ?? ""
    const cuerpo = (await request.json()) as { situacion?: unknown }
    const resultado = actualizar(leerAlmacen(), id, cuerpo.situacion)
    if (!resultado.ok)
      return json({ errores: resultado.errores }, resultado.status)
    escribirAlmacen(resultado.almacen)
    return json({ situacion: resultado.situacion })
  } catch (error) {
    if (error instanceof ErrorAlmacen) return errorAlmacen(error)
    throw error
  }
}

export const DELETE: APIRoute = ({ params }) => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  try {
    const id = params.id ?? ""
    const resultado = eliminar(leerAlmacen(), id)
    if (!resultado.ok)
      return json({ errores: resultado.errores }, resultado.status)
    escribirAlmacen(resultado.almacen)
    return json({ id })
  } catch (error) {
    if (error instanceof ErrorAlmacen) return errorAlmacen(error)
    throw error
  }
}
