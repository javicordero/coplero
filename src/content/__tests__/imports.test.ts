import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const raizContent = join(dirname(fileURLToPath(import.meta.url)), "..")

function ficherosProduccion(dir: string): string[] {
  const salida: string[] = []
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.isDirectory()) {
      if (entrada.name === "__tests__") continue
      salida.push(...ficherosProduccion(join(dir, entrada.name)))
    } else if (entrada.name.endsWith(".ts")) {
      salida.push(join(dir, entrada.name))
    }
  }
  return salida
}

describe("frontera del contenido (FR-013, SC-006)", () => {
  it("ningún fichero de contenido importa del motor ni de la web", () => {
    const prohibidos: string[] = []
    for (const fichero of ficherosProduccion(raizContent)) {
      const contenido = readFileSync(fichero, "utf8")
      for (const match of contenido.matchAll(/from\s+"([^"]+)"/g)) {
        const specifier = match[1]
        if (specifier.includes("engine") || specifier.includes("/web")) {
          prohibidos.push(`${fichero}: ${specifier}`)
        }
      }
    }
    expect(prohibidos).toEqual([])
  })
})
