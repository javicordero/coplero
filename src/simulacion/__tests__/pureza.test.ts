import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const raizModulo = join(dirname(fileURLToPath(import.meta.url)), "..")

function ficherosProduccion(): string[] {
  return readdirSync(raizModulo).filter((f) => f.endsWith(".ts"))
}

describe("pureza del modulo", () => {
  it("no usa Math.random ni Date.now", () => {
    const infractores: string[] = []
    for (const fichero of ficherosProduccion()) {
      const contenido = readFileSync(join(raizModulo, fichero), "utf8")
      if (
        /\bMath\.random\b/.test(contenido) ||
        /\bDate\.now\b/.test(contenido)
      ) {
        infractores.push(fichero)
      }
    }
    expect(infractores).toEqual([])
  })
})
