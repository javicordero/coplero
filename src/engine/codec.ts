// Código de partida: tarjeta derivada, comprimida y en base64url.
// TS puro (fflate + base64url propio): sin DOM, sin `btoa` ni `Buffer`.

import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate"
import type { Resultado, TarjetaFinal } from "./types"

export const VERSION_CODIGO = 1

export type ErrorCodigo =
  | { codigo: "CODIGO_INVALIDO" }
  | {
      codigo: "VERSION_CODIGO_INCOMPATIBLE"
      versionRecibida: number
      versionEsperada: number
    }

const ALFABETO =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

const INDICE: Record<string, number> = {}
for (let i = 0; i < ALFABETO.length; i++) INDICE[ALFABETO[i]] = i

export function bytesABase64Url(bytes: Uint8Array): string {
  let salida = ""
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined
    salida += ALFABETO[b0 >> 2]
    salida += ALFABETO[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)]
    if (b1 === undefined) break
    salida += ALFABETO[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)]
    if (b2 === undefined) break
    salida += ALFABETO[b2 & 0x3f]
  }
  return salida
}

export function base64UrlABytes(texto: string): Uint8Array | null {
  const bytes: number[] = []
  for (let i = 0; i < texto.length; i += 4) {
    const c0 = INDICE[texto[i]]
    const c1 = INDICE[texto[i + 1]]
    if (c0 === undefined || c1 === undefined) return null
    bytes.push((c0 << 2) | (c1 >> 4))

    const c2 = texto[i + 2] !== undefined ? INDICE[texto[i + 2]] : undefined
    if (c2 === undefined) break
    bytes.push(((c1 & 0x0f) << 4) | (c2 >> 2))

    const c3 = texto[i + 3] !== undefined ? INDICE[texto[i + 3]] : undefined
    if (c3 === undefined) break
    bytes.push(((c2 & 0x03) << 6) | c3)
  }
  return new Uint8Array(bytes)
}

function esTarjeta(valor: unknown): valor is TarjetaFinal {
  if (typeof valor !== "object" || valor === null) return false
  const t = valor as Record<string, unknown>
  return (
    Array.isArray(t.hitos) &&
    t.hitos.length === 3 &&
    typeof t.fraseCierre === "string" &&
    Array.isArray(t.cambios) &&
    Array.isArray(t.primerosPremios) &&
    Array.isArray(t.otrosPremios) &&
    typeof t.anosEnActivo === "number" &&
    typeof t.modalidadFinal === "string"
  )
}

/** Codifica una tarjeta en un código autocontenido y URL-safe. */
export function codificar(tarjeta: TarjetaFinal): string {
  const payload = JSON.stringify({ v: VERSION_CODIGO, t: tarjeta })
  return bytesABase64Url(deflateSync(strToU8(payload)))
}

/** Reconstruye la tarjeta desde el código; nunca lanza. */
export function decodificar(
  codigo: string,
): Resultado<TarjetaFinal, ErrorCodigo> {
  const bytes = base64UrlABytes(codigo)
  if (!bytes) return { ok: false, error: { codigo: "CODIGO_INVALIDO" } }

  let json: string
  try {
    json = strFromU8(inflateSync(bytes))
  } catch {
    return { ok: false, error: { codigo: "CODIGO_INVALIDO" } }
  }

  let crudo: unknown
  try {
    crudo = JSON.parse(json)
  } catch {
    return { ok: false, error: { codigo: "CODIGO_INVALIDO" } }
  }
  if (typeof crudo !== "object" || crudo === null) {
    return { ok: false, error: { codigo: "CODIGO_INVALIDO" } }
  }

  const { v, t } = crudo as { v?: unknown; t?: unknown }
  if (typeof v !== "number" || v !== VERSION_CODIGO) {
    return {
      ok: false,
      error: {
        codigo: "VERSION_CODIGO_INCOMPATIBLE",
        versionRecibida: typeof v === "number" ? v : -1,
        versionEsperada: VERSION_CODIGO,
      },
    }
  }
  if (!esTarjeta(t)) return { ok: false, error: { codigo: "CODIGO_INVALIDO" } }
  return { ok: true, valor: t }
}
