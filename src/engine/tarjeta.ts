// Generación de la tarjeta final. TS puro, determinista y sin datos ocultos.
// No importa de `content` ni de `web`: los textos llegan por el banco.

import { indiceFase } from "./coac"
import type {
  BancoContenido,
  BucketFrase,
  FaseCOAC,
  HitoProgreso,
  HitoTarjeta,
  LogroCOAC,
  Partida,
  PremioResumen,
  PremioTipo,
  TarjetaFinal,
  TextosTarjeta,
  TipoHito,
} from "./types"

const PRIORIDAD: readonly TipoHito[] = [
  "ganar_coac",
  "podio",
  "final",
  "premio_aguja",
  "premio_copla",
  "premio_candela",
  "cambio_modalidad",
  "cambio_variante",
  "anos_sin_concursar",
]

const NEUTROS: readonly TipoHito[] = ["debut", "duracion", "mejor_resultado"]

const TIPO_POR_PREMIO: Record<PremioTipo, TipoHito> = {
  aguja_de_oro: "premio_aguja",
  copla_para_andalucia: "premio_copla",
  candela_y_espino: "premio_candela",
}

/** Textos neutros internos, usados si el banco no aporta catálogo. */
const TEXTOS_FALLBACK: TextosTarjeta = {
  hitos: {
    ganar_coac: ["Ganaste el COAC en {ano}"],
    podio: ["Podio en el COAC en {ano}"],
    final: ["Finalista en {ano}"],
    premio_aguja: ["Premio en {ano}"],
    premio_copla: ["Premio en {ano}"],
    premio_candela: ["Premio en {ano}"],
    cambio_modalidad: ["Cambiaste de modalidad en {ano}"],
    cambio_variante: ["Cambió tu estilo en {ano}"],
    anos_sin_concursar: ["Un año fuera de concurso: {ano}"],
    debut: ["Debutaste en {ano}"],
    duracion: ["{n} años de carrera"],
    mejor_resultado: ["Tu mejor resultado fue {fase}"],
  },
  frases: {
    campeon: ["Lo tocaste todo."],
    podio: ["Entre los mejores."],
    finalista: ["Llegaste a la final."],
    semifinales: ["Media carrera en semifinales."],
    cuartos: ["Los cuartos fueron tu casa."],
    preliminares: ["Cada febrero, ahí estabas."],
    retirada: ["Una carrera a tu manera."],
  },
}

/** Hash FNV-1a de 32 bits: puro y estable entre plataformas. */
export function hashEstable(texto: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

interface ValoresTexto {
  ano: number | null
  n: number
  fase: FaseCOAC
}

function sustituir(texto: string, valores: ValoresTexto): string {
  return texto
    .replace(/\{ano\}/g, valores.ano === null ? "" : String(valores.ano))
    .replace(/\{n\}/g, String(valores.n))
    .replace(/\{fase\}/g, valores.fase)
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim()
}

function elegirTexto(
  plantillas: string[] | undefined,
  clave: string,
  valores: ValoresTexto,
): string {
  if (!plantillas || plantillas.length === 0) return ""
  const indice = hashEstable(clave) % plantillas.length
  return sustituir(plantillas[indice], valores)
}

/** Progresión: debut (primera temporada) y primera vez en cada fase (récord). */
function hitosProgresoDe(p: Partida): HitoProgreso[] {
  const temporadas = [...p.temporadas].sort((a, b) => a.ano - b.ano)
  const primera = temporadas[0]
  if (!primera) return []

  const hitos: HitoProgreso[] = [
    { ano: primera.ano, fase: primera.fase, debut: true },
  ]
  let maxFase: FaseCOAC = "preliminares"
  for (const temporada of temporadas) {
    if (temporada.fueraDeConcurso) continue
    if (indiceFase(temporada.fase) > indiceFase(maxFase)) {
      hitos.push({ ano: temporada.ano, fase: temporada.fase, debut: false })
      maxFase = temporada.fase
    }
  }
  return hitos
}

function agruparPremios(p: Partida): PremioResumen[] {
  const mapa = new Map<PremioTipo, number[]>()
  for (const premio of p.premios) {
    const anos = mapa.get(premio.tipo) ?? []
    anos.push(premio.ano)
    mapa.set(premio.tipo, anos)
  }
  return [...mapa.entries()]
    .map(([tipo, anos]) => ({
      tipo,
      veces: anos.length,
      anos: [...anos].sort((a, b) => a - b),
    }))
    .filter((resumen) => resumen.veces > 0)
    .sort((a, b) => (a.anos[0] ?? 0) - (b.anos[0] ?? 0))
}

function bucketDe(
  enConcurso: number,
  primeros: LogroCOAC[],
  mejorFase: FaseCOAC,
): BucketFrase {
  if (enConcurso === 0) return "retirada"
  if (primeros.some((l) => l.tipo === "primer_premio")) return "campeon"
  if (primeros.some((l) => l.tipo === "podio")) return "podio"
  if (mejorFase === "final") return "finalista"
  if (mejorFase === "semifinales") return "semifinales"
  if (mejorFase === "cuartos") return "cuartos"
  return "preliminares"
}

/** Primer año en que cambia la modalidad respecto al estado anterior. */
function anoTipoCambio(
  p: Partida,
  campo: "modalidad" | "variante",
): number | null {
  const cambios = p.trayectoria.cambios
  for (let i = 0; i < cambios.length; i++) {
    const anterior =
      i === 0
        ? campo === "modalidad"
          ? p.trayectoria.modalidadInicial
          : p.trayectoria.varianteInicial
        : cambios[i - 1][campo]
    if (cambios[i][campo] !== anterior) return cambios[i].ano
  }
  return null
}

function construirHitos(
  p: Partida,
  textos: TextosTarjeta,
  canon: string,
  mejorFase: FaseCOAC,
  primerosPremios: LogroCOAC[],
  otrosPremios: PremioResumen[],
  anosSinConcursar: number[],
  enConcurso: Partida["temporadas"],
): HitoTarjeta[] {
  const candidato = new Map<TipoHito, number | null>()
  const add = (tipo: TipoHito, ano: number | null) => {
    if (!candidato.has(tipo)) candidato.set(tipo, ano)
  }

  const campeon = primerosPremios.find((l) => l.tipo === "primer_premio")
  const podio = primerosPremios.find((l) => l.tipo === "podio")
  if (campeon) add("ganar_coac", campeon.ano)
  if (podio) add("podio", podio.ano)
  if (!campeon && !podio) {
    const final = enConcurso.find((t) => t.fase === "final")
    if (final) add("final", final.ano)
  }
  for (const premio of otrosPremios) {
    add(TIPO_POR_PREMIO[premio.tipo], premio.anos[0] ?? null)
  }
  const cambioMod = anoTipoCambio(p, "modalidad")
  if (cambioMod !== null) add("cambio_modalidad", cambioMod)
  const cambioVar = anoTipoCambio(p, "variante")
  if (cambioVar !== null) add("cambio_variante", cambioVar)
  if (anosSinConcursar.length > 0)
    add("anos_sin_concursar", anosSinConcursar[0])

  const elegidos: TipoHito[] = []
  for (const tipo of PRIORIDAD) {
    if (elegidos.length >= 3) break
    if (candidato.has(tipo)) elegidos.push(tipo)
  }
  for (const tipo of NEUTROS) {
    if (elegidos.length >= 3) break
    elegidos.push(tipo)
  }

  return elegidos.slice(0, 3).map((tipo) => {
    const ano =
      tipo === "debut"
        ? (candidato.get(tipo) ?? p.anoInicio)
        : (candidato.get(tipo) ?? null)
    const plantillas = textos.hitos[tipo] ?? TEXTOS_FALLBACK.hitos[tipo]
    const texto = elegirTexto(plantillas, `${canon}|${tipo}`, {
      ano,
      n: p.temporadas.length,
      fase: mejorFase,
    })
    return { tipo, ano, texto }
  })
}

/** Construye la tarjeta final a partir del estado terminado. Nunca lee `destino`. */
export function construirTarjeta(
  p: Partida,
  banco: BancoContenido,
): TarjetaFinal {
  const textos = banco.textosTarjeta ?? TEXTOS_FALLBACK
  const enConcurso = p.temporadas.filter((t) => !t.fueraDeConcurso)

  let mejorFase: FaseCOAC = "preliminares"
  for (const temporada of enConcurso) {
    if (indiceFase(temporada.fase) > indiceFase(mejorFase))
      mejorFase = temporada.fase
  }

  const puestos = enConcurso
    .map((t) => t.puesto)
    .filter((puesto): puesto is number => typeof puesto === "number")
  const mejorPuesto = puestos.length > 0 ? Math.min(...puestos) : null

  const anosSinConcursar = p.temporadas
    .filter((t) => t.fueraDeConcurso)
    .map((t) => t.ano)

  const primerosPremios: LogroCOAC[] = enConcurso
    .filter(
      (t) =>
        t.fase === "final" && typeof t.puesto === "number" && t.puesto <= 3,
    )
    .map((t) => ({
      ano: t.ano,
      puesto: t.puesto as number,
      tipo: t.puesto === 1 ? "primer_premio" : "podio",
    }))

  const otrosPremios = agruparPremios(p)

  const canon = [
    mejorFase,
    p.temporadas.length,
    enConcurso.length,
    primerosPremios.length,
    otrosPremios.reduce((total, premio) => total + premio.veces, 0),
    p.trayectoria.cambios.length,
  ].join("|")

  const hitos = construirHitos(
    p,
    textos,
    canon,
    mejorFase,
    primerosPremios,
    otrosPremios,
    anosSinConcursar,
    enConcurso,
  )

  const bucket = bucketDe(enConcurso.length, primerosPremios, mejorFase)
  const fraseCierre = elegirTexto(
    textos.frases[bucket] ?? TEXTOS_FALLBACK.frases[bucket],
    `${canon}|frase`,
    { ano: null, n: p.temporadas.length, fase: mejorFase },
  )

  return {
    nombre: p.personaje.nombre,
    modalidadInicial: p.trayectoria.modalidadInicial,
    modalidadFinal: p.modalidad,
    varianteInicial: p.trayectoria.varianteInicial,
    varianteFinal: p.variante,
    cambios: p.trayectoria.cambios.map((cambio) => ({ ...cambio })),
    anosDeCarrera: p.temporadas.length,
    anosEnActivo: enConcurso.length,
    anosSinConcursar,
    mejorFase,
    mejorPuesto,
    primerosPremios,
    hitosProgreso: hitosProgresoDe(p),
    otrosPremios,
    hitos,
    fraseCierre,
  }
}
