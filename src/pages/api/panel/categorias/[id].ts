import type { APIRoute } from "astro"
import {
  categoriasEnUso,
  ErrorCategorias,
  gestorCategorias,
} from "../../../../panel/categorias"
import { bloqueoFueraDeDesarrollo } from "../../../../panel/guard"

export const prerender = false

const json = (datos: unknown, status = 200): Response =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })

export const DELETE: APIRoute = ({ params }) => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  const id = params.id ?? ""
  try {
    gestorCategorias.eliminar(id, categoriasEnUso())
    return json({ id })
  } catch (error) {
    if (error instanceof ErrorCategorias) {
      return json({ errores: [{ ruta: "id", mensaje: error.message }] }, 422)
    }
    throw error
  }
}
