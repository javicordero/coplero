import { describe, expect, it } from "vitest"
import {
  ANO_PRIMER_CARNAVAL,
  anoDelMomento,
  DIRECCION_JUEGO,
  enFilas,
  etiquetaEstilo,
  etiquetaFase,
  etiquetaModalidad,
  etiquetaMomento,
  etiquetaPremio,
  FRASE_CIERRE,
  MODALIDADES_INFO,
  mensajeError,
  normalizarNombre,
  ordenarDistinciones,
  ROSETAS,
  textoPuesto,
  tituloDelJuego,
  trayectoria,
} from "../presentacion"

describe("presentacion", () => {
  it("el título del juego cambia según el género", () => {
    expect(tituloDelJuego("masculino")).toBe("Coplero")
    expect(tituloDelJuego("femenino")).toBe("Coplera")
    expect(tituloDelJuego("no_binario")).toBe("Coplere")
  })

  it("traduce momento, fase, modalidad y premio", () => {
    expect(etiquetaMomento("verano")).toBe("Verano")
    expect(etiquetaMomento("febrero")).toBe("Febrero")
    expect(etiquetaMomento("resultado")).toBe("Resultado")
    expect(etiquetaFase("semifinales")).toBe("Semifinales")
    expect(etiquetaModalidad("chirigotero")).toBe("Chirigotero")
    expect(etiquetaPremio("aguja_de_oro")).toBe("Aguja de oro")
  })

  it("normaliza el nombre: recorta, colapsa y limita a 24", () => {
    expect(normalizarNombre("  El   Chato  ")).toBe("El Chato")
    expect(normalizarNombre("a".repeat(40))).toHaveLength(24)
    expect(normalizarNombre("   ")).toBe("")
  })

  it("el primer carnaval es un año natural (2027)", () => {
    expect(ANO_PRIMER_CARNAVAL).toBe(2027)
  })

  it("el año visible retrasa el verano un año respecto al carnaval", () => {
    expect(anoDelMomento(ANO_PRIMER_CARNAVAL, "verano")).toBe(2026)
    expect(anoDelMomento(ANO_PRIMER_CARNAVAL, "febrero")).toBe(
      ANO_PRIMER_CARNAVAL,
    )
    expect(anoDelMomento(ANO_PRIMER_CARNAVAL, "resultado")).toBe(
      ANO_PRIMER_CARNAVAL,
    )
  })

  it("ofrece las dos modalidades con el nombre de la modalidad y la cita", () => {
    expect(MODALIDADES_INFO).toHaveLength(2)
    expect(MODALIDADES_INFO.map((m) => m.titulo)).toEqual([
      "Comparsa",
      "Chirigota",
    ])

    const comparsa = MODALIDADES_INFO.find((m) => m.id === "comparsista")
    expect(comparsa?.subtitulo).toBe(
      "¡Pasión, decía Paco Alba, la comparsa es pasión!",
    )

    const chirigota = MODALIDADES_INFO.find((m) => m.id === "chirigotero")
    expect(chirigota?.subtitulo).toBe("Humor, tipo y crítica desde la calle.")
  })

  it("define la dirección del juego", () => {
    expect(DIRECCION_JUEGO.length).toBeGreaterThan(0)
  })

  it("traduce el estilo (variante) a su título", () => {
    expect(etiquetaEstilo("evolucion_con_raices")).toBe("Evolución con raíces")
    expect(etiquetaEstilo("lolosedismo")).toBe("Lolosedismo")
    expect(etiquetaEstilo("desconocida")).toBe("desconocida")
  })

  it("asigna una roseta a cada tipo de premio", () => {
    expect(Object.keys(ROSETAS).sort()).toEqual([
      "aguja_de_oro",
      "candela_y_espino",
      "copla_para_andalucia",
    ])
    for (const ruta of Object.values(ROSETAS)) {
      expect(ruta).toMatch(/^\/rosetas\/roseta_.+\.svg$/)
    }
  })

  it("ordena las distinciones dejando la Coplas por Andalucía al final", () => {
    const premios = [
      { tipo: "copla_para_andalucia" as const, ano: 2036 },
      { tipo: "candela_y_espino" as const, ano: 2036 },
      { tipo: "aguja_de_oro" as const, ano: 2036 },
    ]
    expect(ordenarDistinciones(premios).map((p) => p.tipo)).toEqual([
      "aguja_de_oro",
      "candela_y_espino",
      "copla_para_andalucia",
    ])
  })

  it("numera el puesto del COAC", () => {
    expect(textoPuesto(1)).toBe("1º")
    expect(textoPuesto(3)).toBe("3º")
  })

  it("reparte una lista en filas", () => {
    expect(enFilas([1, 2, 3, 4, 5], 4)).toEqual([[1, 2, 3, 4], [5]])
    expect(enFilas([1, 2], 4)).toEqual([[1, 2]])
    expect(enFilas([], 4)).toEqual([])
  })

  it("compone la trayectoria con premios e hitos, agrupando por año", () => {
    const premios = [
      { ano: 2030, puesto: 2, tipo: "podio" as const },
      { ano: 2032, puesto: 1, tipo: "primer_premio" as const },
    ]
    const hitos = [
      { ano: 2027, fase: "preliminares" as const, debut: true },
      { ano: 2028, fase: "cuartos" as const, debut: false },
      { ano: 2029, fase: "semifinales" as const, debut: false },
      { ano: 2030, fase: "final" as const, debut: false },
    ]
    expect(trayectoria(premios, hitos)).toEqual([
      {
        ano: 2027,
        puesto: null,
        hito: "Debut",
        fase: "preliminares",
        tono: "preliminares",
      },
      {
        ano: 2028,
        puesto: null,
        hito: "CF",
        fase: "cuartos",
        tono: "cuartos",
      },
      {
        ano: 2029,
        puesto: null,
        hito: "SF",
        fase: "semifinales",
        tono: "semifinales",
      },
      { ano: 2030, puesto: 2, hito: null, fase: null, tono: "plata" },
      { ano: 2032, puesto: 1, hito: null, fase: null, tono: "oro" },
    ])
  })

  it("si el debut coincide con una fase, prevalece la fase", () => {
    const hitos = [
      { ano: 2027, fase: "preliminares" as const, debut: true },
      { ano: 2027, fase: "semifinales" as const, debut: false },
    ]
    expect(trayectoria([], hitos)).toEqual([
      {
        ano: 2027,
        puesto: null,
        hito: "SF",
        fase: "semifinales",
        tono: "semifinales",
      },
    ])
  })

  it("define una frase de cierre que no afirma victoria", () => {
    expect(FRASE_CIERRE.length).toBeGreaterThan(0)
    expect(FRASE_CIERRE.toLowerCase()).not.toContain("gan")
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
      }),
    ).toContain("Febrero")
  })
})
