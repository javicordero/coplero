import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const raizModulo = join(dirname(fileURLToPath(import.meta.url)), "..")

function ficherosProduccion(): string[] {
  return readdirSync(raizModulo).filter((f) => f.endsWith(".ts"))
}

describe("imports del modulo (FR-021)", () => {
  it("solo importa la API publica del motor", () => {
    const prohibidos: string[] = []
    for (const fichero of ficherosProduccion()) {
      const contenido = readFileSync(join(raizModulo, fichero), "utf8")
      for (const match of contenido.matchAll(/from\s+"([^"]+)"/g)) {
        const specifier = match[1]
        if (
          specifier.startsWith("../engine/") &&
          specifier !== "../engine/index"
        ) {
          prohibidos.push(`${fichero}: ${specifier}`)
        }
      }
    }
    expect(prohibidos).toEqual([])
  })
})
