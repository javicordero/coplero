import type { APIRoute } from "astro"
import { ErrorAlmacen } from "../../../panel/almacen"
import { bloqueoFueraDeDesarrollo } from "../../../panel/guard"
import { importarBancoActual } from "../../../panel/importador"

export const prerender = false

const json = (datos: unknown, status = 200): Response =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })

export const POST: APIRoute = () => {
  const bloqueo = bloqueoFueraDeDesarrollo()
  if (bloqueo) return bloqueo
  try {
    const { importadas } = importarBancoActual()
    return json({ importadas })
  } catch (error) {
    if (error instanceof ErrorAlmacen) {
      return json(
        { errores: [{ ruta: "(almacén)", mensaje: error.message }] },
        500,
      )
    }
    throw error
  }
}
