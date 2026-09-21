// Gestión del catálogo de categorías desde el panel (009, FR-023).
// El catálogo vive en `src/content/categorias.ts` (generado y gestionado por el
// panel). La validación de integridad del contenido sigue en Zod.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { bancoContenido } from "../content"
import { leerAlmacen } from "./almacen"

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

export const RUTA_CATEGORIAS = join(RAIZ, "src", "content", "categorias.ts")

const FORMATO_ID = /^[a-z][A-Za-z0-9_]*$/

export class ErrorCategorias extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = "ErrorCategorias"
  }
}

/** Genera el texto del fichero de categorías (formato estable, compatible con Biome). */
export function generarCategorias(categorias: string[]): string {
  const items = categorias.map((categoria) => `  ${JSON.stringify(categoria)},`)
  return [
    "// GENERADO por el panel de contenido — no editar a mano.",
    "",
    "export const CATEGORIAS = [",
    ...items,
    "] as const",
    "",
    "export type Categoria = (typeof CATEGORIAS)[number]",
    "",
  ].join("\n")
}

/** Lee la lista de categorías desde el texto del fichero generado. */
export function leerCategoriasDe(texto: string): string[] {
  const inicio = texto.indexOf("= [")
  const fin = texto.indexOf("] as const")
  if (inicio === -1 || fin === -1 || fin < inicio) {
    throw new ErrorCategorias(
      "El fichero de categorías no tiene el formato esperado",
    )
  }
  const cuerpo = texto.slice(inicio + 3, fin).replace(/,\s*$/, "")
  let lista: unknown
  try {
    lista = JSON.parse(`[${cuerpo}]`)
  } catch (error) {
    throw new ErrorCategorias(
      `No se pudo leer la lista de categorías: ${error instanceof Error ? error.message : error}`,
    )
  }
  if (!Array.isArray(lista) || lista.some((x) => typeof x !== "string")) {
    throw new ErrorCategorias(
      "La lista de categorías no es una lista de textos",
    )
  }
  return lista as string[]
}

function validarLista(categorias: string[]): void {
  if (categorias.length === 0) {
    throw new ErrorCategorias("El catálogo de categorías no puede quedar vacío")
  }
  const vistas = new Set<string>()
  for (const categoria of categorias) {
    if (!FORMATO_ID.test(categoria)) {
      throw new ErrorCategorias(`id de categoría inválido: "${categoria}"`)
    }
    if (vistas.has(categoria)) {
      throw new ErrorCategorias(`categoría duplicada: "${categoria}"`)
    }
    vistas.add(categoria)
  }
}

export interface GestorCategorias {
  ruta: string
  leer(): string[]
  escribir(categorias: string[]): void
  agregar(id: string): string[]
  eliminar(id: string, enUso: Set<string>): string[]
}

export function crearGestorCategorias(
  ruta: string = RUTA_CATEGORIAS,
): GestorCategorias {
  const leer = (): string[] => {
    if (!existsSync(ruta)) {
      throw new ErrorCategorias(`No existe el fichero de categorías: ${ruta}`)
    }
    return leerCategoriasDe(readFileSync(ruta, "utf8"))
  }

  const escribir = (categorias: string[]): void => {
    validarLista(categorias)
    writeFileSync(ruta, generarCategorias(categorias), "utf8")
  }

  const agregar = (id: string): string[] => {
    const normalizado = id.trim()
    if (!FORMATO_ID.test(normalizado)) {
      throw new ErrorCategorias(
        `id de categoría inválido: "${id}" (empieza en minúscula; letras, números y guion bajo)`,
      )
    }
    const actuales = leer()
    if (actuales.includes(normalizado)) {
      throw new ErrorCategorias(`la categoría "${normalizado}" ya existe`)
    }
    const siguientes = [...actuales, normalizado]
    escribir(siguientes)
    return siguientes
  }

  const eliminar = (id: string, enUso: Set<string>): string[] => {
    const actuales = leer()
    if (!actuales.includes(id)) {
      throw new ErrorCategorias(`no existe la categoría "${id}"`)
    }
    if (enUso.has(id)) {
      throw new ErrorCategorias(
        `no se puede borrar la categoría "${id}": hay situaciones que la usan`,
      )
    }
    const siguientes = actuales.filter((categoria) => categoria !== id)
    escribir(siguientes)
    return siguientes
  }

  return { ruta, leer, escribir, agregar, eliminar }
}

export const gestorCategorias = crearGestorCategorias()

/** Categorías que usan las situaciones del almacén o los condicionales del banco. */
export function categoriasEnUso(): Set<string> {
  const enUso = new Set<string>()
  for (const situacion of leerAlmacen().situaciones)
    enUso.add(situacion.categoria)
  for (const situacion of bancoContenido.situaciones)
    enUso.add(situacion.categoria)
  for (const condicional of bancoContenido.condicionales ?? []) {
    enUso.add(condicional.categoria)
  }
  return enUso
}
