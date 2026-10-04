// Generación de los ficheros de contenido del juego a partir del almacén (009).
// Reutiliza la validación del banco y produce una salida determinista.
// Ver specs/009-content-admin/contracts/generador.md.

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  type BancoContenido,
  BancoContenidoSchema,
  bancoContenido,
} from "../content"
import type { Momento } from "../content/modalidades"
import type { Situacion } from "../content/schema"
import {
  type Almacen,
  type ErrorValidacion,
  formatearErrores,
  mensajesDeError,
} from "./esquema"

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

export const DIRECTORIO_DECISIONES = join(RAIZ, "src", "content", "decisiones")

export type Fichero = "verano" | "febrero"

export interface DefinicionFichero {
  clave: Fichero
  momento: Momento
  ruta: string
  exportacion: string
}

export const FICHEROS: DefinicionFichero[] = [
  {
    clave: "verano",
    momento: "verano",
    ruta: "verano.ts",
    exportacion: "situacionesVerano",
  },
  {
    clave: "febrero",
    momento: "febrero",
    ruta: "febrero.ts",
    exportacion: "situacionesFebrero",
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
export function agrupar(
  situaciones: Situacion[],
): Record<Fichero, Situacion[]> {
  const grupos = {} as Record<Fichero, Situacion[]>
  for (const fichero of FICHEROS) {
    grupos[fichero.clave] = situaciones
      .filter((s) => s.momento === fichero.momento)
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
  }
  return grupos
}

export function serializar(
  fichero: DefinicionFichero,
  situaciones: Situacion[],
): string {
  const cabecera = "// GENERADO por `npm run panel:volcar` — no editar a mano."
  const importacion = 'import type { Situacion } from "../schema"'
  const declaracion = `export const ${fichero.exportacion}: Situacion[] = ${serializarValor(situaciones, 0)}`
  return `${[cabecera, importacion, "", declaracion].join("\n")}\n`
}

export interface ResultadoVolcado {
  banco: BancoContenido
  ficheros: {
    fichero: DefinicionFichero
    contenido: string
    situaciones: Situacion[]
  }[]
}

/** Valida el banco completo y devuelve los ficheros a escribir (sin tocar disco). */
export function volcar(almacen: Almacen): ResultadoVolcado {
  const resultado = BancoContenidoSchema.safeParse({
    situaciones: almacen.situaciones,
    condicionales: bancoContenido.condicionales,
    variantes: bancoContenido.variantes,
    modalidades: bancoContenido.modalidades,
    textosTarjeta: bancoContenido.textosTarjeta,
  })
  if (!resultado.success)
    throw new ErrorVolcado(mensajesDeError(resultado.error))

  const grupos = agrupar(almacen.situaciones)
  return {
    banco: resultado.data,
    ficheros: FICHEROS.map((fichero) => ({
      fichero,
      contenido: serializar(fichero, grupos[fichero.clave] ?? []),
      situaciones: grupos[fichero.clave] ?? [],
    })),
  }
}

export function escribirVolcado(resultado: ResultadoVolcado): string[] {
  const escritos: string[] = []
  for (const { fichero, contenido } of resultado.ficheros) {
    const destino = join(DIRECTORIO_DECISIONES, fichero.ruta)
    mkdirSync(dirname(destino), { recursive: true })
    writeFileSync(destino, contenido, "utf8")
    escritos.push(destino)
  }
  return escritos
}
