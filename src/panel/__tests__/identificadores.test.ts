import { describe, expect, it } from "vitest"
import { derivarId, derivarIdUnico } from "../identificadores"

describe("derivarId", () => {
  it("pasa a minúsculas y une palabras con guion bajo", () => {
    expect(derivarId("Te dejan fuera por un punto")).toBe(
      "te_dejan_fuera_por_un_punto",
    )
  })

  it("quita acentos, mayúsculas y signos", () => {
    expect(derivarId("¿Vas a ir al Falla?")).toBe("vas_a_ir_al_falla")
    expect(derivarId("Un cuplé no ha entrado")).toBe("un_cuple_no_ha_entrado")
  })

  it("colapsa separadores y recorta los extremos", () => {
    expect(derivarId("  ¡Hola   ---   mundo!  ")).toBe("hola_mundo")
  })

  it("devuelve cadena vacía si no queda nada válido", () => {
    expect(derivarId("")).toBe("")
    expect(derivarId("   ...   ")).toBe("")
    expect(derivarId("¡¿?!")).toBe("")
  })
})

describe("derivarIdUnico", () => {
  it("devuelve la base si está libre", () => {
    expect(derivarIdUnico("tema_social", new Set())).toBe("tema_social")
  })

  it("añade sufijo numérico ante colisión", () => {
    expect(derivarIdUnico("tema", new Set(["tema"]))).toBe("tema_2")
    expect(derivarIdUnico("tema", new Set(["tema", "tema_2"]))).toBe("tema_3")
  })

  it("reutiliza un hueco libre", () => {
    expect(derivarIdUnico("tema", new Set(["tema", "tema_3"]))).toBe("tema_2")
  })

  it("no inventa nada si la base está vacía", () => {
    expect(derivarIdUnico("", new Set(["x"]))).toBe("")
  })

  it("es determinista", () => {
    const usados = new Set(["tema", "tema_2"])
    expect(derivarIdUnico("tema", usados)).toBe(derivarIdUnico("tema", usados))
  })
})
