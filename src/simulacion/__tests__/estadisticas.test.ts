import { describe, expect, it } from "vitest"
import { bancoPrueba } from "../../engine/__tests__/fixtures"
import { construirInforme } from "../estadisticas"
import { ATRIBUTOS_BASE, registroFalso } from "./helpers"

function informeDePrueba() {
  const registros = [
    registroFalso({
      perfilId: "aleatorio",
      configuracionId: "comparsista",
      mejorFase: "final",
      participo: true,
      duracion: 20,
      primerosPremios: 1,
      premios: [{ tipo: "aguja_de_oro", ano: 1 }],
      atributosFinales: { ...ATRIBUTOS_BASE, letra: 70 },
      anoPico: 3,
      situacionesVistas: ["v_letra_tema"],
    }),
    registroFalso({
      perfilId: "aleatorio",
      configuracionId: "comparsista",
      mejorFase: "cuartos",
      participo: true,
      duracion: 20,
      anoPico: 5,
      situacionesVistas: ["v_letra_tema", "f_cierre"],
    }),
    registroFalso({
      perfilId: "codicioso",
      configuracionId: "chirigotero",
      mejorFase: "preliminares",
      participo: true,
      duracion: 18,
      anoPico: 3,
    }),
    registroFalso({
      perfilId: "codicioso",
      configuracionId: "chirigotero",
      mejorFase: "preliminares",
      participo: false,
      duracion: 20,
      anoPico: 7,
    }),
  ]
  return construirInforme({
    registros,
    banco: bancoPrueba,
    seedBase: "test",
    perfiles: ["aleatorio", "codicioso"],
    configuraciones: ["comparsista", "chirigotero"],
  })
}

describe("construirInforme", () => {
  it("calcula los porcentajes de fase", () => {
    const informe = informeDePrueba()
    expect(informe.meta.n).toBe(4)
    expect(informe.fases.pisanFinal).toBeCloseTo(25)
    expect(informe.fases.noSuperanCuartos).toBeCloseTo(50)
    expect(informe.fases.noSuperanPreliminares).toBeCloseTo(25)
    expect(informe.fases.noConcurso).toBeCloseTo(25)
  })

  it("calcula premios y duracion", () => {
    const informe = informeDePrueba()
    expect(informe.premios.mediaPrimerosPremios).toBeCloseTo(0.25)
    expect(informe.premios.totalPrimerosPremios).toBe(1)
    expect(informe.premios.porTipo.aguja_de_oro).toBe(1)
    expect(informe.premios.carrerasConPremio).toBeCloseTo(25)
    expect(informe.duracionMedia).toBeCloseTo(19.5)
  })

  it("distribuye anos de pico", () => {
    const informe = informeDePrueba()
    expect(informe.anosPico["3"].n).toBe(2)
    expect(informe.anosPico["7"].n).toBe(1)
  })

  it("resume atributos finales", () => {
    const informe = informeDePrueba()
    expect(informe.atributos.letra.max).toBe(70)
    expect(informe.atributos.letra.min).toBe(50)
    expect(informe.atributos.letra.media).toBeCloseTo(55)
  })

  it("lista situaciones nunca vistas y condicionales nunca disparados", () => {
    const informe = informeDePrueba()
    expect(informe.situaciones.nuncaVistas).toContain("v_vestuario")
    expect(informe.situaciones.nuncaVistas).not.toContain("v_letra_tema")
    expect(informe.situaciones.masFrecuentes[0].id).toBe("v_letra_tema")
    expect(informe.condicionales.nuncaDisparados).toContain(
      "c_patrocinador_rival",
    )
  })

  it("agrupa por perfil y por configuracion", () => {
    const informe = informeDePrueba()
    expect(Object.keys(informe.porPerfil).sort()).toEqual([
      "aleatorio",
      "codicioso",
    ])
    expect(informe.porPerfil.aleatorio.n).toBe(2)
    expect(informe.porPerfil.codicioso.n).toBe(2)
    expect(Object.keys(informe.porConfiguracion).sort()).toEqual([
      "chirigotero",
      "comparsista",
    ])
    expect(informe.porConfiguracion.comparsista.n).toBe(2)
  })

  it("marca generadoConError y agrega errores", () => {
    const registros = [
      registroFalso({ errores: [{ codigo: "CONTENIDO_INSUFICIENTE", n: 2 }] }),
      registroFalso({ errores: [{ codigo: "CONTENIDO_INSUFICIENTE", n: 1 }] }),
      registroFalso(),
    ]
    const informe = construirInforme({
      registros,
      banco: bancoPrueba,
      seedBase: "test",
      perfiles: ["aleatorio"],
      configuraciones: ["comparsista"],
    })
    expect(informe.meta.generadoConError).toBe(true)
    expect(informe.errores).toEqual([
      { codigo: "CONTENIDO_INSUFICIENTE", n: 3 },
    ])
  })
})
