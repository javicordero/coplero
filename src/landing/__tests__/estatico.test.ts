import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const RAIZ = process.cwd()
const leer = (relativo: string) => readFileSync(join(RAIZ, relativo), "utf8")

const FUENTES_ESTATICAS = [
  "src/pages/index.astro",
  "src/pages/como-jugar.astro",
  "src/pages/colaborar.astro",
  "src/pages/politicas/politica-de-privacidad.astro",
  "src/pages/politicas/politica-de-cookies.astro",
  "src/components/Header.astro",
  "src/components/Footer.astro",
]

const HTML_CONSTRUIDO = [
  "dist/index.html",
  "dist/como-jugar/index.html",
  "dist/colaborar/index.html",
  "dist/politicas/politica-de-privacidad/index.html",
  "dist/politicas/politica-de-cookies/index.html",
]

describe("páginas estáticas (0 kB de JS)", () => {
  it("sus fuentes no usan islas ni scripts", () => {
    for (const fichero of FUENTES_ESTATICAS) {
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
    for (const fichero of HTML_CONSTRUIDO) {
      if (!existsSync(join(RAIZ, fichero))) continue
      expect(leer(fichero), `${fichero} no debe tener <script>`).not.toMatch(
        /<script/i,
      )
    }
  })
})
