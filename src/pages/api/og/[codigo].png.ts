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
import {
  COLOR,
  FAMILIA_DISPLAY,
  FAMILIA_TEXTO,
  FUENTES_OG,
} from "../../../ui/tokens"

export const prerender = false

/**
 * Formatos de la imagen OG (007). `escala` ajusta tipografía y espaciado para
 * que ningún formato recorte contenido (FR-013, T033).
 */
const FORMATOS: Record<
  string,
  { width: number; height: number; escala: number }
> = {
  og: { width: 1200, height: 630, escala: 1 },
  "9x16": { width: 1080, height: 1920, escala: 0.95 },
  "1x1": { width: 1080, height: 1080, escala: 0.78 },
}

interface FuenteSatori {
  name: string
  data: ArrayBuffer
  weight: 400 | 700
  style: "normal"
}

let fuentesCache: FuenteSatori[] | null = null

async function cargarFuentes(base: string): Promise<FuenteSatori[]> {
  if (!fuentesCache) {
    fuentesCache = await Promise.all(
      FUENTES_OG.map(async (fuente) => {
        const respuesta = await fetch(new URL(`/fonts/${fuente.fichero}`, base))
        return {
          name: fuente.name,
          data: await respuesta.arrayBuffer(),
          weight: fuente.weight as 400 | 700,
          style: "normal" as const,
        }
      }),
    )
  }
  return fuentesCache
}

function tituloVariante(id: string): string {
  return VARIANTES.find((v) => v.id === id)?.titulo ?? id
}

interface Nodo {
  type: string
  props: { style?: Record<string, unknown>; children?: unknown }
}

type Estilo = Record<string, unknown>

function nodo(type: string, style: Estilo, children?: unknown): Nodo {
  return { type, props: { style: { display: "flex", ...style }, children } }
}

function texto(valor: string, style: Estilo): Nodo {
  return nodo("div", style, valor)
}

function fila(children: Nodo[], style: Estilo = {}): Nodo {
  return nodo("div", { flexDirection: "row", ...style }, children)
}

function tarjetaElemento(tarjeta: TarjetaFinal, escala: number): Nodo {
  const esc = (valor: number) => Math.round(valor * escala)
  const nombre = tarjeta.nombre
  const premiosCoac =
    tarjeta.primerosPremios.length > 0
      ? `${tarjeta.primerosPremios.length} premio(s) del COAC`
      : etiquetaFase(tarjeta.mejorFase)
  const otros = tarjeta.otrosPremios
    .map((p) => `${etiquetaPremio(p.tipo)}: ${p.veces}`)
    .join("  ·  ")

  const tile = (etiqueta: string, valor: string, conMargen = false) =>
    nodo(
      "div",
      {
        fontFamily: FAMILIA_TEXTO,
        flexDirection: "column",
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 0,
        padding: `${esc(16)}px ${esc(20)}px`,
        border: `1px solid ${COLOR.separador}`,
        borderRadius: esc(12),
        marginRight: conMargen ? esc(12) : 0,
      },
      [
        texto(etiqueta, {
          fontFamily: FAMILIA_TEXTO,
          fontSize: esc(22),
          color: COLOR.textoSuave,
        }),
        texto(valor, {
          fontFamily: FAMILIA_TEXTO,
          fontSize: esc(34),
          fontWeight: 700,
          color: COLOR.texto,
        }),
      ],
    )

  return nodo(
    "div",
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      background: COLOR.fondo,
      color: COLOR.texto,
      padding: esc(56),
      fontFamily: FAMILIA_TEXTO,
    },
    [
      nodo("div", { flexDirection: "column" }, [
        texto(nombre, {
          fontFamily: FAMILIA_DISPLAY,
          fontSize: esc(68),
          color: COLOR.texto,
        }),
        texto(
          `${etiquetaModalidad(tarjeta.modalidadFinal)} · ${tituloVariante(tarjeta.varianteFinal)}`,
          {
            fontFamily: FAMILIA_TEXTO,
            fontSize: esc(32),
            color: COLOR.acento,
            marginTop: esc(8),
          },
        ),
        texto(`${tarjeta.anosEnActivo} años en activo`, {
          fontFamily: FAMILIA_TEXTO,
          fontSize: esc(26),
          color: COLOR.textoSuave,
          marginTop: esc(8),
        }),
      ]),
      fila(
        [
          tile("Premios COAC", premiosCoac, true),
          tile("Otros premios", otros || "—"),
        ],
        { width: "100%" },
      ),
      nodo("div", { flexDirection: "column" }, [
        ...tarjeta.hitos.map((hito) =>
          texto(`· ${hito.texto}`, {
            fontFamily: FAMILIA_TEXTO,
            fontSize: esc(28),
            color: COLOR.texto,
            marginBottom: esc(8),
          }),
        ),
        texto(tarjeta.fraseCierre, {
          fontFamily: FAMILIA_TEXTO,
          fontSize: esc(26),
          fontStyle: "italic",
          color: COLOR.textoSuave,
          marginTop: esc(12),
        }),
      ]),
      fila(
        [
          texto("Juega tu carrera en", {
            fontFamily: FAMILIA_TEXTO,
            fontSize: esc(24),
            color: COLOR.textoSuave,
          }),
          texto(DIRECCION_JUEGO, {
            fontFamily: FAMILIA_TEXTO,
            fontSize: esc(24),
            color: COLOR.acento,
          }),
        ],
        {
          justifyContent: "space-between",
          borderTop: `1px solid ${COLOR.separador}`,
          paddingTop: esc(20),
        },
      ),
    ],
  )
}

function genericoElemento(mensaje: string, escala: number): Nodo {
  const esc = (valor: number) => Math.round(valor * escala)
  return nodo(
    "div",
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: COLOR.fondo,
      color: COLOR.texto,
      padding: esc(56),
      fontFamily: FAMILIA_TEXTO,
    },
    [
      texto("Coplero", {
        fontFamily: FAMILIA_DISPLAY,
        fontSize: esc(80),
        color: COLOR.texto,
      }),
      texto(mensaje, {
        fontFamily: FAMILIA_TEXTO,
        fontSize: esc(32),
        color: COLOR.textoSuave,
        marginTop: esc(24),
      }),
      texto(`Juega en ${DIRECCION_JUEGO}`, {
        fontFamily: FAMILIA_TEXTO,
        fontSize: esc(28),
        color: COLOR.acento,
        marginTop: esc(24),
      }),
    ],
  )
}

async function renderPng(
  elemento: Nodo,
  formato: { width: number; height: number },
  base: string,
) {
  const fuentes = await cargarFuentes(base)
  const svg = await satori(
    elemento as unknown as Parameters<typeof satori>[0],
    {
      width: formato.width,
      height: formato.height,
      fonts: fuentes,
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
    ? tarjetaElemento(resultado.valor, formato.escala)
    : genericoElemento("Esta tarjeta no está disponible", formato.escala)

  const png = await renderPng(elemento, formato, request.url)
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
