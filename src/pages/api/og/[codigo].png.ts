import { Resvg } from "@resvg/resvg-js"
import type { APIRoute } from "astro"
import satori from "satori"
import { decodificar, type TarjetaFinal } from "../../../engine/index"
import {
  DIRECCION_JUEGO,
  enFilas,
  etiquetaEstilo,
  etiquetaFase,
  etiquetaModalidad,
  textoPuesto,
  trayectoria,
} from "../../../juego/presentacion"
import {
  COLOR,
  COLORES,
  FAMILIA_DISPLAY,
  FAMILIA_TEXTO,
  FUENTES_OG,
} from "../../../ui/tokens"

export const prerender = false

/**
 * 1rem de la web, en píxeles. Todo el palmarés se define en `rem` (los mismos
 * valores que `Tarjeta.svelte` y `tokens.css`) y se multiplica por la escala
 * del formato, para que la imagen calque el componente final.
 */
const REM = 16

const FORMATOS: Record<
  string,
  { width: number; height: number; escala: number; horizontal?: boolean }
> = {
  og: { width: 1200, height: 630, escala: 1.35, horizontal: true },
  "9x16": { width: 1080, height: 1920, escala: 2.7 },
  "1x1": { width: 1080, height: 1080, escala: 1.5 },
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

/** Rosetas de las distinciones, embebidas como data URI (una por tipo). */
const FICHEROS_ROSETAS: Record<string, string> = {
  copla_para_andalucia: "roseta_andalucia",
  aguja_de_oro: "roseta_aguja_oro",
  candela_y_espino: "roseta_candela",
}

let rosetasCache: Record<string, string> | null = null

function aBase64(texto: string): string {
  const bytes = new TextEncoder().encode(texto)
  let binario = ""
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario)
}

async function cargarRosetas(base: string): Promise<Record<string, string>> {
  if (!rosetasCache) {
    const entradas = await Promise.all(
      Object.entries(FICHEROS_ROSETAS).map(async ([tipo, fichero]) => {
        const respuesta = await fetch(new URL(`/rosetas/${fichero}.svg`, base))
        const svg = await respuesta.text()
        return [tipo, `data:image/svg+xml;base64,${aBase64(svg)}`] as const
      }),
    )
    rosetasCache = Object.fromEntries(entradas)
  }
  return rosetasCache
}

interface Nodo {
  type: string
  props: {
    style?: Record<string, unknown>
    children?: unknown
    src?: string
    width?: number
    height?: number
  }
}

type Estilo = Record<string, unknown>
type Esc = (rem: number) => number

function nodo(type: string, style: Estilo, children?: unknown): Nodo {
  return { type, props: { style: { display: "flex", ...style }, children } }
}

function texto(valor: string, style: Estilo): Nodo {
  return nodo("div", style, valor)
}

function fila(children: Nodo[], style: Estilo = {}): Nodo {
  return nodo("div", { flexDirection: "row", ...style }, children)
}

function imagen(
  src: string,
  ancho: number,
  alto: number,
  style: Estilo = {},
): Nodo {
  return {
    type: "img",
    props: {
      src,
      width: ancho,
      height: alto,
      style: { display: "flex", ...style },
    },
  }
}

/** Colores de carnaval (espejo de tokens.css; el endpoint no lee CSS). */
const TONO = {
  oro: COLORES["--c-carnaval-oro"],
  plata: COLORES["--c-carnaval-plata"],
  bronce: COLORES["--c-carnaval-bronce"],
  preliminares: COLORES["--c-carnaval-verde-claro"],
  cuartos: COLORES["--c-carnaval-azul-claro"],
  semifinales: COLORES["--c-carnaval-azul"],
  final: COLORES["--c-carnaval-violeta"],
} as const

/** Halo del nodo (medallas): ancho en px web y opacidad (Tarjeta.svelte). */
const HALO: Record<string, { ancho: number; alfa: number } | undefined> = {
  oro: { ancho: 3, alfa: 0.22 },
  plata: { ancho: 2.5, alfa: 0.18 },
  bronce: { ancho: 2.5, alfa: 0.16 },
}

/** Geometría de la línea temporal (Tarjeta.svelte, en rem). */
const CELDA_MIN = 3.2
const ALTO_HITO = 2.9
const HUECO_FILA = 0.75
const NODO_Y = 1.45
const RADIO_NODO = 0.35

/** Puesto protagonista: clamp(2.5rem, 12vw, 3rem) y clamp(1.75rem, 9vw, 2.25rem). */
const PUESTO_TAM = 2.925
const PUESTO_TAM_FASE = 2.25
const ORDINAL_RATIO = 0.4
const ORDINAL_ELEVA = 0.55

/** Hex + alfa → `rgba(...)` (satori no entiende `color-mix`). */
function conAlfa(hex: string, alfa: number): string {
  const valor = hex.replace("#", "")
  const r = Number.parseInt(valor.slice(0, 2), 16)
  const g = Number.parseInt(valor.slice(2, 4), 16)
  const b = Number.parseInt(valor.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alfa})`
}

function tonoMejor(tarjeta: TarjetaFinal): string {
  if (tarjeta.mejorFase === "final") {
    if (tarjeta.mejorPuesto === 1) return TONO.oro
    if (tarjeta.mejorPuesto === 2) return TONO.plata
    if (tarjeta.mejorPuesto === 3) return TONO.bronce
    return TONO.final
  }
  return TONO[tarjeta.mejorFase]
}

/** Radio del nodo (nodo + halo) para recortar el carril, como el SVG web. */
function radioNodo(puesto: number | null): number {
  if (puesto === 1) return RADIO_NODO + (HALO.oro?.ancho ?? 0) / REM
  if (puesto === 2) return RADIO_NODO + (HALO.plata?.ancho ?? 0) / REM
  if (puesto === 3) return RADIO_NODO + (HALO.bronce?.ancho ?? 0) / REM
  return RADIO_NODO
}

/** Ornamento editorial: línea — rombo — línea (`.mejor__ornamento`). */
function ornamento(
  esc: Esc,
  color: string,
  margenArriba = 0,
  ancho = esc(12),
): Nodo {
  return fila(
    [
      nodo("div", { flexGrow: 1, height: 1, background: COLOR.separador }),
      nodo("div", {
        width: esc(0.4),
        height: esc(0.4),
        background: conAlfa(color, 0.75),
        transform: "rotate(45deg)",
      }),
      nodo("div", { flexGrow: 1, height: 1, background: COLOR.separador }),
    ],
    {
      width: "100%",
      maxWidth: ancho,
      alignItems: "center",
      gap: esc(0.5),
      marginTop: margenArriba,
    },
  )
}

/** Identidad: modalidad (700), nombre (Anton) y estilo (400). */
function identidad(tarjeta: TarjetaFinal, esc: Esc): Nodo {
  return nodo(
    "div",
    {
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      width: "100%",
    },
    [
      texto(etiquetaModalidad(tarjeta.modalidadFinal), {
        fontFamily: FAMILIA_TEXTO,
        fontWeight: 700,
        fontSize: esc(1),
        lineHeight: 1.2,
        textTransform: "uppercase",
        letterSpacing: esc(0.08),
        color: COLOR.acentoFuerte,
      }),
      texto(tarjeta.nombre, {
        fontFamily: FAMILIA_DISPLAY,
        fontSize: esc(1.75),
        lineHeight: 1.15,
        color: COLOR.textoFuerte,
        marginTop: esc(0.25),
      }),
      texto(etiquetaEstilo(tarjeta.varianteFinal), {
        fontFamily: FAMILIA_TEXTO,
        fontWeight: 400,
        fontSize: esc(1),
        lineHeight: 1.2,
        color: COLOR.acentoFuerte,
      }),
    ],
  )
}

/** Placa de honor: ornamento + etiqueta + puesto (o fase). */
function mejorPosicion(tarjeta: TarjetaFinal, esc: Esc, ancho: number): Nodo {
  const color = tonoMejor(tarjeta)
  const puesto = tarjeta.mejorPuesto
  const anchoOrnamento = Math.min(ancho, esc(12))

  const protagonista =
    puesto === null
      ? texto(etiquetaFase(tarjeta.mejorFase), {
          fontFamily: FAMILIA_DISPLAY,
          fontSize: esc(PUESTO_TAM_FASE),
          lineHeight: 1,
          color,
        })
      : fila(
          [
            texto(String(puesto), {
              fontFamily: FAMILIA_DISPLAY,
              fontSize: esc(PUESTO_TAM),
              lineHeight: 1,
              color,
            }),
            // Anton dibuja el ordinal a tamaño completo: se reduce y se eleva
            // (`.mejor__ordinal`: 0.4em, vertical-align 0.55em).
            texto("º", {
              fontFamily: FAMILIA_DISPLAY,
              fontSize: esc(PUESTO_TAM * ORDINAL_RATIO),
              lineHeight: 1,
              color,
              transform: `translateY(${-esc(PUESTO_TAM * ORDINAL_RATIO * ORDINAL_ELEVA)}px)`,
            }),
          ],
          { alignItems: "baseline", justifyContent: "center" },
        )

  return nodo(
    "div",
    {
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: esc(0.25),
      width: "100%",
    },
    [
      ornamento(esc, color, 0, anchoOrnamento),
      texto("Mejor posición", {
        fontFamily: FAMILIA_TEXTO,
        fontWeight: 500,
        fontSize: esc(0.75),
        textTransform: "uppercase",
        letterSpacing: esc(0.12),
        color: COLOR.textoSuave,
      }),
      protagonista,
    ],
  )
}

/** Título de sección: Anton en mayúsculas + filete (`.seccion__titulo`). */
function tituloSeccion(label: string, esc: Esc): Nodo {
  return fila(
    [
      texto(label, {
        fontFamily: FAMILIA_DISPLAY,
        fontSize: esc(0.75),
        textTransform: "uppercase",
        letterSpacing: esc(0.12),
        color: COLOR.textoSuave,
      }),
      nodo("div", { flexGrow: 1, height: 1, background: COLOR.separador }),
    ],
    {
      width: "100%",
      alignItems: "center",
      gap: esc(0.75),
      marginBottom: esc(0.75),
    },
  )
}

/** Un hito de la línea temporal: etiqueta (1rem) + nodo (0.9rem) + año (1rem). */
function hito(
  evento: ReturnType<typeof trayectoria>[number],
  esc: Esc,
  celda: number,
): Nodo {
  const color = TONO[evento.tono]
  const esMedalla = evento.puesto !== null
  const etiqueta =
    evento.puesto !== null ? textoPuesto(evento.puesto) : (evento.hito ?? "")

  const estiloEtiqueta: Estilo = {
    fontFamily: FAMILIA_TEXTO,
    fontWeight: 700,
    fontSize: esc(esMedalla ? 0.875 : 0.68),
    lineHeight: 1,
    color,
  }
  if (esMedalla) {
    // El «º» alarga la caja por la derecha (`.hito__puesto { left: 2px }`).
    estiloEtiqueta.transform = `translateX(${esc(2 / REM)}px)`
  } else {
    estiloEtiqueta.textTransform = "uppercase"
    estiloEtiqueta.letterSpacing = esc(0.68 * 0.02)
    estiloEtiqueta.whiteSpace = "nowrap"
  }

  const estiloNodo: Estilo = {
    width: esc(0.7),
    height: esc(0.7),
    borderRadius: 999,
    background: color,
  }
  const halo = HALO[evento.tono]
  if (halo) {
    estiloNodo.boxShadow = `0 0 0 ${esc(halo.ancho / REM)}px ${conAlfa(color, halo.alfa)}`
  }

  return nodo(
    "div",
    {
      width: celda,
      height: esc(ALTO_HITO),
      flexDirection: "column",
      alignItems: "center",
    },
    [
      nodo(
        "div",
        { height: esc(1), alignItems: "center", justifyContent: "center" },
        [texto(etiqueta, estiloEtiqueta)],
      ),
      nodo(
        "div",
        { height: esc(0.9), alignItems: "center", justifyContent: "center" },
        [nodo("div", estiloNodo)],
      ),
      nodo(
        "div",
        { height: esc(1), alignItems: "center", justifyContent: "center" },
        [
          texto(String(evento.ano), {
            fontFamily: FAMILIA_TEXTO,
            fontSize: esc(0.875),
            lineHeight: 1,
            color: COLOR.textoSuave,
            fontVariantNumeric: "tabular-nums",
          }),
        ],
      ),
    ],
  )
}

/** Tramos del carril: de borde de nodo a borde de nodo (como el SVG web). */
function carrilSegmentos(
  filas: ReturnType<typeof trayectoria>[],
  esc: Esc,
  celda: number,
): Nodo[] {
  const pitch = esc(ALTO_HITO) + esc(HUECO_FILA)
  const segmentos: Nodo[] = []
  filas.forEach((filaEventos, r) => {
    const y = r * pitch + esc(NODO_Y)
    for (let c = 0; c < filaEventos.length - 1; c++) {
      const x1 = (c + 0.5) * celda + esc(radioNodo(filaEventos[c].puesto))
      const x2 = (c + 1.5) * celda - esc(radioNodo(filaEventos[c + 1].puesto))
      segmentos.push(
        nodo("div", {
          position: "absolute",
          top: y,
          left: Math.round(x1),
          width: Math.max(0, Math.round(x2 - x1)),
          height: 1,
          background: COLOR.separador,
        }),
      )
    }
  })
  return segmentos
}

/** Trayectoria: título + carril + filas de hitos. */
function timelineElemento(
  tarjeta: TarjetaFinal,
  esc: Esc,
  ancho: number,
): Nodo | null {
  const eventos = trayectoria(
    tarjeta.primerosPremios,
    tarjeta.hitosProgreso ?? [],
  )
  if (eventos.length === 0) return null

  const columnas = Math.max(1, Math.floor(ancho / esc(CELDA_MIN)))
  const rellena = eventos.length >= columnas
  const celda = rellena ? ancho / columnas : esc(CELDA_MIN)
  const filas = enFilas(eventos, columnas)

  return nodo("div", { flexDirection: "column", width: "100%" }, [
    tituloSeccion("Trayectoria", esc),
    nodo(
      "div",
      { position: "relative", flexDirection: "column", width: "100%" },
      [
        ...carrilSegmentos(filas, esc, celda),
        ...filas.map((filaEventos, i) =>
          fila(
            filaEventos.map((evento) => hito(evento, esc, celda)),
            {
              width: "100%",
              marginBottom: i < filas.length - 1 ? esc(HUECO_FILA) : 0,
            },
          ),
        ),
      ],
    ),
  ])
}

/** Distinciones: una roseta por victoria, agrupadas por tipo. */
function distincionesElemento(
  tarjeta: TarjetaFinal,
  esc: Esc,
  rosetas: Record<string, string>,
): Nodo | null {
  if (tarjeta.otrosPremios.length === 0) return null

  const anchoRoseta = esc(2.8)
  const altoRoseta = Math.round(anchoRoseta * (560 / 480))

  return nodo("div", { flexDirection: "column", width: "100%" }, [
    tituloSeccion("Distinciones", esc),
    fila(
      tarjeta.otrosPremios.map((premio) =>
        fila(
          Array.from({ length: premio.veces }, (_, i) =>
            imagen(rosetas[premio.tipo], anchoRoseta, altoRoseta, {
              marginLeft: i > 0 ? -esc(0.7) : 0,
            }),
          ),
          // `gap` de satori es de un solo valor: el hueco de fila (0.75rem) se
          // completa con este margen sobre el de columna (0.5rem).
          { alignItems: "flex-start", marginBottom: esc(0.25) },
        ),
      ),
      {
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: esc(0.5),
      },
    ),
  ])
}

/** Pie de marca, dentro de la tarjeta y separado por un filete. */
function pieElemento(esc: Esc): Nodo {
  return fila(
    [
      texto("Juega tu carrera en", {
        fontFamily: FAMILIA_TEXTO,
        fontSize: esc(0.875),
        color: COLOR.textoSuave,
      }),
      texto(DIRECCION_JUEGO, {
        fontFamily: FAMILIA_TEXTO,
        fontWeight: 700,
        fontSize: esc(0.875),
        color: COLOR.acento,
      }),
    ],
    {
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: `1px solid ${COLOR.separador}`,
      paddingTop: esc(0.75),
    },
  )
}

/** Tarjeta (`.palmares`): fondo, borde y radio translúcidos. */
function palmares(esc: Esc, children: Nodo[]): Nodo {
  return nodo(
    "div",
    {
      flexDirection: "column",
      gap: esc(1),
      padding: esc(1),
      background: conAlfa(COLOR.textoFuerte, 0.05),
      border: `1px solid ${conAlfa(COLOR.textoFuerte, 0.12)}`,
      borderRadius: esc(0.75),
      width: "100%",
    },
    children,
  )
}

function tarjetaElemento(
  tarjeta: TarjetaFinal,
  formato: {
    width: number
    height: number
    escala: number
    horizontal?: boolean
  },
  rosetas: Record<string, string>,
): Nodo {
  const esc: Esc = (rem) => Math.round(rem * REM * formato.escala)
  const contenido = formato.width - 4 * esc(1)

  const cuerpo = formato.horizontal
    ? fila(
        [
          nodo(
            "div",
            {
              flexDirection: "column",
              justifyContent: "center",
              gap: esc(1),
              width: "40%",
            },
            [identidad(tarjeta, esc), mejorPosicion(tarjeta, esc, esc(14))],
          ),
          nodo(
            "div",
            {
              flexDirection: "column",
              justifyContent: "center",
              gap: esc(1),
              width: "56%",
            },
            [
              timelineElemento(tarjeta, esc, contenido * 0.56),
              distincionesElemento(tarjeta, esc, rosetas),
            ],
          ),
        ],
        { width: "100%", flexGrow: 1, alignItems: "center" },
      )
    : nodo(
        "div",
        {
          flexDirection: "column",
          justifyContent: "center",
          gap: esc(1),
          width: "100%",
          flexGrow: 1,
        },
        [
          identidad(tarjeta, esc),
          mejorPosicion(tarjeta, esc, contenido),
          timelineElemento(tarjeta, esc, contenido),
          distincionesElemento(tarjeta, esc, rosetas),
        ],
      )

  const tarjetaNodo = palmares(esc, [cuerpo, pieElemento(esc)])

  return nodo(
    "div",
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      background: COLOR.fondo,
      color: COLOR.texto,
      padding: esc(1),
      fontFamily: FAMILIA_TEXTO,
    },
    [tarjetaNodo],
  )
}

function genericoElemento(mensaje: string, escala: number): Nodo {
  const esc: Esc = (rem) => Math.round(rem * REM * escala)
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
      padding: esc(2),
      fontFamily: FAMILIA_TEXTO,
    },
    [
      texto("Coplero", {
        fontFamily: FAMILIA_DISPLAY,
        fontSize: esc(3.5),
        color: COLOR.texto,
      }),
      texto(mensaje, {
        fontFamily: FAMILIA_TEXTO,
        fontSize: esc(1.25),
        color: COLOR.textoSuave,
        marginTop: esc(0.75),
      }),
      texto(`Juega en ${DIRECCION_JUEGO}`, {
        fontFamily: FAMILIA_TEXTO,
        fontSize: esc(1),
        color: COLOR.acento,
        marginTop: esc(0.75),
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
  const rosetas = await cargarRosetas(request.url)
  const elemento = resultado.ok
    ? tarjetaElemento(resultado.valor, formato, rosetas)
    : genericoElemento("Esta tarjeta no está disponible", formato.escala)

  const png = await renderPng(elemento, formato, request.url)
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
