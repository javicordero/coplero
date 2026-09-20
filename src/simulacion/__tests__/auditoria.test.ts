import { describe, expect, it } from "vitest"
import type { Partida } from "../../engine/index"
import { auditarCarrera, REGLAS_ESTADO_IMPOSIBLE } from "../auditoria"
import type { DecisionRegistrada, RegistroCarrera } from "../tipos"
import { ATRIBUTOS_BASE, partidaFalsa, registroFalso } from "./helpers"

function reglas(registro: RegistroCarrera): string[] {
  return auditarCarrera(registro).map((h) => h.regla)
}

function decision(over: Partial<DecisionRegistrada> = {}): DecisionRegistrada {
  return {
    ano: 1,
    momento: "verano",
    tipo: "contenido",
    situacionId: "s",
    opcionId: "o",
    flags: [],
    consume: [],
    saltaCOAC: false,
    ...over,
  }
}

describe("auditarCarrera", () => {
  it("expone el catalogo completo de reglas", () => {
    expect(REGLAS_ESTADO_IMPOSIBLE).toHaveLength(15)
  })

  it("no marca nada en una carrera coherente", () => {
    expect(reglas(registroFalso())).toEqual([])
  })

  it("detecta un premio sin haber concursado", () => {
    const partida = partidaFalsa({
      temporadas: [
        { ano: 1, fase: "preliminares", premios: [], fueraDeConcurso: true },
      ],
      premios: [{ tipo: "aguja_de_oro", ano: 1 }],
    })
    expect(reglas(registroFalso({ partida }))).toContain("premioSinConcurso")
  })

  it("detecta un premio de un ano inexistente", () => {
    const partida = partidaFalsa({
      premios: [{ tipo: "aguja_de_oro", ano: 5 }],
    })
    expect(reglas(registroFalso({ partida }))).toContain("premioAnoInexistente")
  })

  it("detecta temporadas por encima de la duracion", () => {
    const base = partidaFalsa()
    const partida: Partida = {
      ...base,
      destino: { ...base.destino, anosCarrera: 1 },
      temporadas: [
        { ano: 1, fase: "preliminares", premios: [], fueraDeConcurso: false },
        { ano: 2, fase: "preliminares", premios: [], fueraDeConcurso: false },
      ],
    }
    expect(reglas(registroFalso({ partida }))).toContain("temporadasExcedidas")
  })

  it("detecta mejor fase incoherente", () => {
    const r = registroFalso({ mejorFase: "final" })
    expect(reglas(r)).toContain("mejorFaseIncoherente")
  })

  it("detecta flag consumida sin registro", () => {
    const partida = partidaFalsa({
      flags: {
        perdida: { ano: 1, veces: 1, consumida: true, anosConsecutivos: 1 },
      },
    })
    expect(reglas(registroFalso({ partida }))).toContain(
      "flagConsumidaSinRegistro",
    )
  })

  it("detecta atributos fuera de rango", () => {
    const partida = partidaFalsa({
      atributos: { ...ATRIBUTOS_BASE, letra: 150 },
    })
    expect(reglas(registroFalso({ partida }))).toContain("atributoFueraDeRango")
  })

  it("detecta puesto incoherente con la fase", () => {
    const partida = partidaFalsa({
      temporadas: [
        {
          ano: 1,
          fase: "final",
          puesto: 20,
          premios: [],
          fueraDeConcurso: false,
        },
      ],
    })
    expect(reglas(registroFalso({ partida }))).toContain("puestoIncoherente")
  })

  it("detecta temporadas desordenadas", () => {
    const partida = partidaFalsa({
      temporadas: [
        {
          ano: 1,
          fase: "preliminares",
          puesto: 20,
          premios: [],
          fueraDeConcurso: false,
        },
        {
          ano: 3,
          fase: "preliminares",
          puesto: 20,
          premios: [],
          fueraDeConcurso: false,
        },
      ],
    })
    expect(reglas(registroFalso({ partida }))).toContain(
      "temporadasDesordenadas",
    )
  })

  it("detecta estado fin con resultado pendiente", () => {
    const partida = partidaFalsa({
      fase: "fin",
      resultadoPendiente: {
        fase: "preliminares",
        puesto: 20,
        premios: [],
        fueraDeConcurso: false,
        milagro: false,
      },
    })
    expect(reglas(registroFalso({ partida }))).toContain("finIncoherente")
  })

  it("detecta modalidad o variante invalidas", () => {
    const partida = partidaFalsa({ modalidad: "otra" as never })
    expect(reglas(registroFalso({ partida }))).toContain(
      "modalidadVarianteInvalida",
    )
  })

  it("detecta fase en una temporada sin concurso", () => {
    const partida = partidaFalsa({
      temporadas: [
        { ano: 1, fase: "final", premios: [], fueraDeConcurso: true },
      ],
    })
    expect(reglas(registroFalso({ partida }))).toContain("faseEnNoConcurso")
  })

  it("detecta composicion anual incorrecta", () => {
    const r = registroFalso({
      decisiones: [
        decision({ tipo: "contenido" }),
        decision({ tipo: "contenido" }),
      ],
    })
    expect(reglas(r)).toContain("composicionAnualIncorrecta")
  })

  it("detecta no-concurso sin saltaCOAC", () => {
    const partida = partidaFalsa({
      temporadas: [
        { ano: 1, fase: "preliminares", premios: [], fueraDeConcurso: true },
      ],
    })
    expect(reglas(registroFalso({ partida }))).toContain("saltaCOACIncoherente")
  })

  it("detecta una trayectoria incoherente", () => {
    const partida = partidaFalsa({
      modalidad: "chirigotero",
      variante: "ch_a",
      trayectoria: {
        modalidadInicial: "comparsista",
        varianteInicial: "c_a",
        cambios: [],
      },
    })
    expect(reglas(registroFalso({ partida }))).toContain(
      "trayectoriaIncoherente",
    )
  })

  it("detecta una variante fuera del catálogo", () => {
    const registro = registroFalso()
    const hallazgos = auditarCarrera(registro, [
      { id: "otra", modalidad: "comparsista" },
    ])
    expect(hallazgos.map((h) => h.regla)).toContain("varianteInvalida")
  })
})
