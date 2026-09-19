import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const raizRepo = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..")

describe("integración de la simulación con el banco real (T17)", () => {
  it("scripts/simular.ts usa el banco de content y no el de pruebas", () => {
    const fuente = readFileSync(join(raizRepo, "scripts", "simular.ts"), "utf8")
    expect(fuente).toContain("bancoContenido")
    expect(fuente).not.toContain("engine/__tests__/fixtures")
  })
})
