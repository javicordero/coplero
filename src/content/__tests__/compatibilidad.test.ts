import { describe, expect, it } from "vitest"
import type { BancoContenido } from "../../engine/index"
import { bancoContenido } from "../index"

describe("compatibilidad estructural con el motor", () => {
  it("el banco de contenido satisface el tipo BancoContenido del motor", () => {
    const comoBanco: BancoContenido = bancoContenido
    expect(comoBanco.situaciones.length).toBeGreaterThan(0)
    expect(comoBanco.condicionales?.length ?? 0).toBeGreaterThan(0)
  })
})
