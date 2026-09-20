import { Resvg } from "@resvg/resvg-js"
import type { APIRoute } from "astro"
import satori from "satori"
import { VARIANTES } from "../../../content/index"
import { decodificar, type TarjetaFinal } from "../../../engine/index"
import {
  DIRECCION_JUEGO,
  etiquetaFase,
  etiquetaModalidad,
  etiquetaPremio,
} from "../../../juego/presentacion"

export const prerender = false

const FORMATOS: Record<string, { width: number; height: number }> = {
  og: { width: 1200, height: 630 },
  "9x16": { width: 1080, height: 1920 },
  "1x1": { width: 1080, height: 1080 },
}

let fuenteCache: ArrayBuffer | null = null

async function cargarFuente(base: string): Promise<ArrayBuffer> {
  if (!fuenteCache) {
    const respuesta = await fetch(new URL("/fonts/Coplero.ttf", base))
    fuenteCache = await respuesta.arrayBuffer()
  }
  return fuenteCache
}

function tituloVariante(id: string): string {
  return VARIANTES.find((v) => v.id === id)?.titulo ?? id
}

interface Nodo {
  type: string
  props: { style?: Record<string, unknown>; children?: unknown }
}

function nodo(
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
): Nodo {
  return { type, props: { style: { display: "flex", ...style }, children } }
}

function texto(valor: string, style: Record<string, unknown>): Nodo {
  return nodo("div", style, valor)
}

function fila(children: Nodo[], style: Record<string, unknown> = {}): Nodo {
  return nodo("div", { flexDirection: "row", ...style }, children)
}

function tarjetaElemento(tarjeta: TarjetaFinal): Nodo {
  const nombre = tarjeta.nombre ?? "Anónimo"
  const premiosCoac =
    tarjeta.primerosPremios.length > 0
      ? `${tarjeta.primerosPremios.length} premio(s) del COAC`
      : etiquetaFase(tarjeta.mejorFase)
  const otros = tarjeta.otrosPremios
    .map((p) => `${etiquetaPremio(p.tipo)}: ${p.veces}`)
    .join("  ·  ")

  const tile = (etiqueta: string, valor: string) =>
    nodo(
      "div",
      {
        flexDirection: "column",
        flexGrow: 1,
        padding: "16px 20px",
        border: "1px solid #333",
        borderRadius: 12,
        marginRight: 12,
      },
      [
        texto(etiqueta, { fontSize: 22, color: "#a0aec0" }),
        texto(valor, { fontSize: 34, fontWeight: 700 }),
      ],
    )

  return nodo(
    "div",
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      background: "#0a0a0a",
      color: "#ededed",
      padding: 56,
    },
    [
      nodo("div", { flexDirection: "column" }, [
        texto(nombre, { fontSize: 64, fontWeight: 700 }),
        texto(
          `${etiquetaModalidad(tarjeta.modalidadFinal)} · ${tituloVariante(tarjeta.varianteFinal)}`,
          { fontSize: 32, color: "#f6ad55", marginTop: 8 },
        ),
        texto(`${tarjeta.anosEnActivo} años en activo`, {
          fontSize: 26,
          color: "#a0aec0",
          marginTop: 8,
        }),
      ]),
      fila([
        tile("Premios COAC", premiosCoac),
        tile("Otros premios", otros || "—"),
      ]),
      nodo("div", { flexDirection: "column" }, [
        ...tarjeta.hitos.map((hito) =>
          texto(`· ${hito.texto}`, { fontSize: 28, marginBottom: 8 }),
        ),
        texto(tarjeta.fraseCierre, {
          fontSize: 26,
          fontStyle: "italic",
          color: "#e2e8f0",
          marginTop: 12,
        }),
      ]),
      fila(
        [
          texto("Juega tu carrera en", { fontSize: 24, color: "#a0aec0" }),
          texto(DIRECCION_JUEGO, { fontSize: 24, color: "#f6ad55" }),
        ],
        {
          justifyContent: "space-between",
          borderTop: "1px solid #333",
          paddingTop: 20,
        },
      ),
    ],
  )
}

function genericoElemento(mensaje: string): Nodo {
  return nodo(
    "div",
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#0a0a0a",
      color: "#ededed",
      padding: 56,
    },
    [
      texto("Coplero", { fontSize: 72, fontWeight: 700 }),
      texto(mensaje, { fontSize: 32, color: "#a0aec0", marginTop: 24 }),
      texto(`Juega en ${DIRECCION_JUEGO}`, {
        fontSize: 28,
        color: "#f6ad55",
        marginTop: 24,
      }),
    ],
  )
}

async function renderPng(
  elemento: Nodo,
  formato: { width: number; height: number },
  base: string,
) {
  const fuente = await cargarFuente(base)
  const svg = await satori(
    elemento as unknown as Parameters<typeof satori>[0],
    {
      width: formato.width,
      height: formato.height,
      fonts: [
        { name: "Coplero", data: fuente, weight: 400, style: "normal" },
        { name: "Coplero", data: fuente, weight: 700, style: "normal" },
      ],
    },
  )
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: formato.width },
  })
  return resvg.render().asPng()
}

export const GET: APIRoute = async ({ params, request }) => {
  const formatoParam = new URL(request.url).searchParams.get("t") ?? "og"
  const formato = FORMATOS[formatoParam] ?? FORMATOS.og

  const resultado = decodificar(params.codigo ?? "")
  const elemento = resultado.ok
    ? tarjetaElemento(resultado.valor)
    : genericoElemento("Esta tarjeta no está disponible")

  const png = await renderPng(elemento, formato, request.url)
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
