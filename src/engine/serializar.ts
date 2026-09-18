import type { ErrorMotor, Partida, Resultado } from "./types"
import { VERSION_PARTIDA } from "./types"

export function serializar(p: Partida): string {
  return JSON.stringify(p)
}

export function deserializar(json: string): Resultado<Partida, ErrorMotor> {
  let crudo: unknown
  try {
    crudo = JSON.parse(json)
  } catch {
    return {
      ok: false,
      error: {
        codigo: "VERSION_INCOMPATIBLE",
        versionRecibida: -1,
        versionEsperada: VERSION_PARTIDA,
      },
    }
  }
  const version = (crudo as { version?: unknown } | null)?.version
  if (typeof version !== "number" || version !== VERSION_PARTIDA) {
    return {
      ok: false,
      error: {
        codigo: "VERSION_INCOMPATIBLE",
        versionRecibida: typeof version === "number" ? version : -1,
        versionEsperada: VERSION_PARTIDA,
      },
    }
  }
  return { ok: true, valor: crudo as Partida }
}
