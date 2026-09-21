import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const RAIZ = process.cwd()
const leer = (relativo: string) => readFileSync(join(RAIZ, relativo), "utf8")

describe("landing estática (0 kB de JS)", () => {
  it("las fuentes de la landing no usan islas ni scripts", () => {
    for (const fichero of [
      "src/pages/index.astro",
      "src/components/Footer.astro",
    ]) {
      const fuente = leer(fichero)
      expect(
        fuente,
        `${fichero} no debe usar directivas de cliente`,
      ).not.toMatch(/client:/)
      expect(fuente, `${fichero} no debe tener <script>`).not.toMatch(
        /<script/i,
      )
    }
  })

  it("el HTML construido no incluye <script> (cuando existe dist/)", () => {
    const dist = join(RAIZ, "dist", "index.html")
    if (!existsSync(dist)) return
    expect(leer("dist/index.html")).not.toMatch(/<script/i)
  })
})
