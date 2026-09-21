import type { APIRoute } from "astro"
import {
  categoriasEnUso,
  ErrorCategorias,
  gestorCategorias,
} from "../../../panel/categorias"
import { bloqueoFueraDeDesarrollo } from "../../../panel/guard"

export const prerender = false

const json = (datos: unknown, status = 200): Response =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })

function listar(): { id: string; enUso: boolean }[] {
  const enUso = categoriasEnUso()
  return gestorCategorias.leer().map((id) => ({ id, enUso: enUso.has(id) }))
}

export const GET: APIRoute = () => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  try {
    return json({ categorias: listar() })
  } catch (error) {
    if (error instanceof ErrorCategorias) {
      return json(
        { errores: [{ ruta: "(categorías)", mensaje: error.message }] },
        500,
      )
    }
    throw error
  }
}

export const POST: APIRoute = async ({ request }) => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  try {
    const cuerpo = (await request.json()) as { id?: string }
    gestorCategorias.agregar(cuerpo.id ?? "")
    return json({ categorias: listar() }, 201)
  } catch (error) {
    if (error instanceof ErrorCategorias) {
      return json({ errores: [{ ruta: "id", mensaje: error.message }] }, 422)
    }
    throw error
  }
}
