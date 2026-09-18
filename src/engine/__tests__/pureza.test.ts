import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const RAIZ = path.resolve(process.cwd(), "src/engine")

const PROHIBIDOS: { patron: RegExp; motivo: string }[] = [
  { patron: /Math\.random\s*\(/, motivo: "Math.random" },
  { patron: /Date\.now\s*\(/, motivo: "Date.now" },
  { patron: /\bnew Date\s*\(/, motivo: "new Date" },
  { patron: /from\s+["']astro/, motivo: "import de astro" },
  { patron: /from\s+["']svelte/, motivo: "import de svelte" },
  { patron: /@astrojs/, motivo: "@astrojs" },
  { patron: /\bdocument\./, motivo: "document" },
  { patron: /\bwindow\./, motivo: "window" },
  { patron: /from\s+["'][^"']*content[^"']*["']/, motivo: "import de content" },
  { patron: /from\s+["'][^"']*\.\.\/web/, motivo: "import de web" },
]

function ficherosFuente(dir: string): string[] {
  const salida: string[] = []
  for (const entrada of readdirSync(dir)) {
    const completo = path.join(dir, entrada)
    if (statSync(completo).isDirectory()) {
      if (entrada === "__tests__") continue
      salida.push(...ficherosFuente(completo))
    } else if (entrada.endsWith(".ts")) {
      salida.push(completo)
    }
  }
  return salida
}

describe("pureza del engine", () => {
  it("no contiene azar/tiempo implícitos, ni UI, ni imports de content/web", () => {
    const ficheros = ficherosFuente(RAIZ)
    expect(ficheros.length).toBeGreaterThan(0)
    for (const fichero of ficheros) {
      const contenido = readFileSync(fichero, "utf8")
      for (const { patron, motivo } of PROHIBIDOS) {
        expect(
          patron.test(contenido),
          `${path.basename(fichero)} usa ${motivo}`,
        ).toBe(false)
      }
    }
  })
})
