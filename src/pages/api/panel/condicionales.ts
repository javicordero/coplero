import type { APIRoute } from "astro"
import {
  ErrorAlmacen,
  escribirAlmacen,
  leerAlmacen,
} from "../../../panel/almacen"
import { crearCondicional } from "../../../panel/crud"
import { bloqueoFueraDeDesarrollo } from "../../../panel/guard"

export const prerender = false

const json = (datos: unknown, status = 200): Response =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })

const errorAlmacen = (error: ErrorAlmacen): Response =>
  json({ errores: [{ ruta: "(almacén)", mensaje: error.message }] }, 500)

export const GET: APIRoute = () => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  try {
    return json({ condicionales: leerAlmacen().condicionales })
  } catch (error) {
    if (error instanceof ErrorAlmacen) return errorAlmacen(error)
    throw error
  }
}

export const POST: APIRoute = async ({ request }) => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  try {
    const cuerpo = (await request.json()) as { condicional?: unknown }
    const resultado = crearCondicional(leerAlmacen(), cuerpo.condicional)
    if (!resultado.ok)
      return json({ errores: resultado.errores }, resultado.status)
    escribirAlmacen(resultado.almacen)
    return json({ condicional: resultado.condicional }, 201)
  } catch (error) {
    if (error instanceof ErrorAlmacen) return errorAlmacen(error)
    throw error
  }
}
