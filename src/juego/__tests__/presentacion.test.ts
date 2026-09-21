import { describe, expect, it } from "vitest"
import {
  DIRECCION_JUEGO,
  etiquetaFase,
  etiquetaModalidad,
  etiquetaMomento,
  etiquetaPremio,
  etiquetaTipo,
  MODALIDADES_INFO,
  mensajeError,
  normalizarNombre,
  tituloDelJuego,
} from "../presentacion"

describe("presentacion", () => {
  it("el título del juego cambia según el género", () => {
    expect(tituloDelJuego("masculino")).toBe("Coplero")
    expect(tituloDelJuego("femenino")).toBe("Coplera")
    expect(tituloDelJuego("no_binario")).toBe("Coplere")
  })

  it("traduce momento, tipo, fase, modalidad y premio", () => {
    expect(etiquetaMomento("verano")).toBe("Verano")
    expect(etiquetaTipo("contenido")).toBe("Contenido")
    expect(etiquetaFase("semifinales")).toBe("Semifinales")
    expect(etiquetaModalidad("chirigotero")).toBe("Chirigotero")
    expect(etiquetaPremio("aguja_de_oro")).toBe("Aguja de oro")
  })

  it("normaliza el nombre: recorta, colapsa y limita a 24", () => {
    expect(normalizarNombre("  El   Chato  ")).toBe("El Chato")
    expect(normalizarNombre("a".repeat(40))).toHaveLength(24)
    expect(normalizarNombre("   ")).toBe("")
  })

  it("ofrece las dos modalidades con título y subtítulo", () => {
    expect(MODALIDADES_INFO).toHaveLength(2)
    for (const modalidad of MODALIDADES_INFO) {
      expect(modalidad.titulo.length).toBeGreaterThan(0)
      expect(modalidad.subtitulo.length).toBeGreaterThan(0)
    }
  })

  it("define la dirección del juego", () => {
    expect(DIRECCION_JUEGO.length).toBeGreaterThan(0)
  })

  it("compone un mensaje legible para cada error del motor", () => {
    expect(
      mensajeError({ codigo: "OPCION_INVALIDA", opcionId: "x" }),
    ).toContain("opción")
    expect(
      mensajeError({
        codigo: "VERSION_INCOMPATIBLE",
        versionRecibida: 0,
        versionEsperada: 1,
      }),
    ).toContain("compatible")
    expect(
      mensajeError({
        codigo: "CONTENIDO_INSUFICIENTE",
        momento: "febrero",
        tipo: "personaje",
      }),
    ).toContain("Febrero")
  })
})
