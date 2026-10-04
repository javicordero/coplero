import type { APIRoute } from "astro"
import {
  ErrorAlmacen,
  escribirAlmacen,
  leerAlmacen,
} from "../../../panel/almacen"
import { crear } from "../../../panel/crud"
import { catalogoFlags } from "../../../panel/flags"
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
    const almacen = leerAlmacen()
    return json({
      situaciones: almacen.situaciones,
      condicionales: almacen.condicionales,
      flags: catalogoFlags(almacen),
    })
  } catch (error) {
    if (error instanceof ErrorAlmacen) return errorAlmacen(error)
    throw error
  }
}

export const POST: APIRoute = async ({ request }) => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  try {
    const cuerpo = (await request.json()) as { situacion?: unknown }
    const resultado = crear(leerAlmacen(), cuerpo.situacion)
    if (!resultado.ok)
      return json({ errores: resultado.errores }, resultado.status)
    escribirAlmacen(resultado.almacen)
    return json({ situacion: resultado.situacion }, 201)
  } catch (error) {
    if (error instanceof ErrorAlmacen) return errorAlmacen(error)
    throw error
  }
}
