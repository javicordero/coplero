// Generación de los ficheros de contenido del juego a partir del almacén (009/024).
// Reutiliza la validación del banco y produce una salida determinista.
// Ver specs/024-form-ux-improvements/contracts/generador.md.

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  type BancoContenido,
  BancoContenidoSchema,
  bancoContenido,
} from "../content"
import type { Momento } from "../content/modalidades"
import {
  type Almacen,
  type ErrorValidacion,
  formatearErrores,
  mensajesDeError,
} from "./esquema"

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

export const DIRECTORIO_DECISIONES = join(RAIZ, "src", "content", "decisiones")
export const DIRECTORIO_CONDICIONALES = join(
  RAIZ,
  "src",
  "content",
  "condicionales",
)

export interface FicheroPorMomento {
  momento: Momento
  directorio: string
  ruta: string
  exportacion: string
  tipoImportado: "Situacion" | "Condicional"
}

export const FICHEROS_SITUACIONES: FicheroPorMomento[] = [
  {
    momento: "verano",
    directorio: DIRECTORIO_DECISIONES,
    ruta: "verano.ts",
    exportacion: "situacionesVerano",
    tipoImportado: "Situacion",
  },
  {
    momento: "febrero",
    directorio: DIRECTORIO_DECISIONES,
    ruta: "febrero.ts",
    exportacion: "situacionesFebrero",
    tipoImportado: "Situacion",
  },
]

export const FICHEROS_CONDICIONALES: FicheroPorMomento[] = [
  {
    momento: "verano",
    directorio: DIRECTORIO_CONDICIONALES,
    ruta: "verano.ts",
    exportacion: "condicionalesVerano",
    tipoImportado: "Condicional",
  },
  {
    momento: "febrero",
    directorio: DIRECTORIO_CONDICIONALES,
    ruta: "febrero.ts",
    exportacion: "condicionalesFebrero",
    tipoImportado: "Condicional",
  },
]

export class ErrorVolcado extends Error {
  readonly errores: ErrorValidacion[]

  constructor(errores: ErrorValidacion[]) {
    super(`El volcado no es válido:\n${formatearErrores(errores)}`)
    this.name = "ErrorVolcado"
    this.errores = errores
  }
}

const INDENT = "  "

const esIdentificador = (clave: string): boolean =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(clave)

function serializarValor(valor: unknown, nivel: number): string {
  if (valor === null) return "null"
  if (typeof valor === "string") return JSON.stringify(valor)
  if (typeof valor === "number" || typeof valor === "boolean") {
    return String(valor)
  }
  if (Array.isArray(valor)) {
    if (valor.length === 0) return "[]"
    const hijos = valor.map(
      (hijo) =>
        `${INDENT.repeat(nivel + 1)}${serializarValor(hijo, nivel + 1)}`,
    )
    return `[\n${hijos.join(",\n")},\n${INDENT.repeat(nivel)}]`
  }
  if (typeof valor === "object") {
    const entradas = Object.entries(valor as Record<string, unknown>).filter(
      ([, v]) => v !== undefined,
    )
    if (entradas.length === 0) return "{}"
    const hijos = entradas.map(([clave, v]) => {
      const nombre = esIdentificador(clave) ? clave : JSON.stringify(clave)
      return `${INDENT.repeat(nivel + 1)}${nombre}: ${serializarValor(v, nivel + 1)}`
    })
    return `{\n${hijos.join(",\n")},\n${INDENT.repeat(nivel)}}`
  }
  return "undefined"
}

/** Agrupa por momento y ordena por id (determinista). */
export function agruparPorMomento<T extends { momento: Momento; id: string }>(
  entidades: T[],
): Record<Momento, T[]> {
  return {
    verano: entidades
      .filter((e) => e.momento === "verano")
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id)),
    febrero: entidades
      .filter((e) => e.momento === "febrero")
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id)),
  }
}

export function serializar(
  fichero: FicheroPorMomento,
  entidades: unknown[],
): string {
  const cabecera = "// GENERADO por `npm run panel:volcar` — no editar a mano."
  const importacion = `import type { ${fichero.tipoImportado} } from "../schema"`
  const declaracion = `export const ${fichero.exportacion}: ${fichero.tipoImportado}[] = ${serializarValor(entidades, 0)}`
  return `${[cabecera, importacion, "", declaracion].join("\n")}\n`
}

export interface FicheroVolcado {
  fichero: FicheroPorMomento
  contenido: string
  entidades: unknown[]
}

export interface ResultadoVolcado {
  banco: BancoContenido
  ficheros: FicheroVolcado[]
}

/** Valida el banco completo y devuelve los ficheros a escribir (sin tocar disco). */
export function volcar(almacen: Almacen): ResultadoVolcado {
  const resultado = BancoContenidoSchema.safeParse({
    situaciones: almacen.situaciones,
    condicionales: almacen.condicionales,
    variantes: bancoContenido.variantes,
    modalidades: bancoContenido.modalidades,
    textosTarjeta: bancoContenido.textosTarjeta,
  })
  if (!resultado.success)
    throw new ErrorVolcado(mensajesDeError(resultado.error))

  const gruposSituaciones = agruparPorMomento(almacen.situaciones)
  const gruposCondicionales = agruparPorMomento(almacen.condicionales)

  const ficheros: FicheroVolcado[] = [
    ...FICHEROS_SITUACIONES.map((fichero) => ({
      fichero,
      contenido: serializar(fichero, gruposSituaciones[fichero.momento]),
      entidades: gruposSituaciones[fichero.momento],
    })),
    ...FICHEROS_CONDICIONALES.map((fichero) => ({
      fichero,
      contenido: serializar(fichero, gruposCondicionales[fichero.momento]),
      entidades: gruposCondicionales[fichero.momento],
    })),
  ]

  return { banco: resultado.data, ficheros }
}

export function escribirVolcado(resultado: ResultadoVolcado): string[] {
  const escritos: string[] = []
  for (const { fichero, contenido } of resultado.ficheros) {
    const destino = join(fichero.directorio, fichero.ruta)
    mkdirSync(dirname(destino), { recursive: true })
    writeFileSync(destino, contenido, "utf8")
    escritos.push(destino)
  }
  return escritos
}
