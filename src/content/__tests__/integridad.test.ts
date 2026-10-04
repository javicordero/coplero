import { describe, expect, it } from "vitest"
import { bancoContenido } from "../index"
import {
  cobertura,
  contarSituacionesPorMomento,
  flagsDeclaradas,
  flagsReferenciadas,
  flagsSinDeclarar,
  situacionesInalcanzablesEstaticas,
} from "../informe"
import { BUCKETS_FRASE, flagsDeRequisito, TIPOS_HITO } from "../schema"

const TODAS = [
  ...bancoContenido.situaciones,
  ...(bancoContenido.condicionales ?? []),
]

// Nombres reales que nunca deben aparecer. Lista extensible para el futuro.
const NOMBRES_REALES_PROHIBIDOS: string[] = []

describe("integridad del banco real", () => {
  it("los ids son únicos en todo el banco", () => {
    const ids = TODAS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("toda situación declara un momento válido", () => {
    for (const s of TODAS) {
      expect(["verano", "febrero"]).toContain(s.momento)
    }
  })

  it("cada opción tiene título y subtítulo y hay al menos dos", () => {
    for (const s of TODAS) {
      expect(s.opciones.length).toBeGreaterThanOrEqual(2)
      const ids = s.opciones.map((o) => o.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const o of s.opciones) {
        expect(o.titulo.length).toBeGreaterThan(0)
        expect(o.subtitulo.length).toBeGreaterThan(0)
      }
    }
  })

  it("toda flag referenciada existe declarada en alguna opción", () => {
    const declaradas = new Set(flagsDeclaradas(bancoContenido))
    for (const c of bancoContenido.condicionales ?? []) {
      for (const flag of flagsDeRequisito(c.requiere)) {
        expect(declaradas.has(flag)).toBe(true)
      }
    }
    expect(flagsSinDeclarar(bancoContenido)).toEqual([])
  })

  it("las modalidades usadas son válidas", () => {
    for (const s of TODAS) {
      for (const m of s.modalidades ?? []) {
        expect(["comparsista", "chirigotero"]).toContain(m)
      }
    }
  })

  it("hay cobertura común por cada momento", () => {
    const cob = cobertura(bancoContenido)
    for (const momento of ["verano", "febrero"] as const) {
      expect(cob[momento]).toBeGreaterThan(0)
    }
  })

  it("las opciones que implican no concursar llevan saltaCOAC", () => {
    const esperadas = [
      ["v_enfado_coac", "calle"],
      ["v_enfado_coac", "gira"],
      ["f_jurado", "no_ir"],
    ]
    for (const [situacionId, opcionId] of esperadas) {
      const opcion = TODAS.find((s) => s.id === situacionId)?.opciones.find(
        (o) => o.id === opcionId,
      )
      expect(opcion?.saltaCOAC).toBe(true)
    }
  })

  it("no aparecen nombres reales prohibidos", () => {
    for (const s of TODAS) {
      const textos = [
        s.titulo,
        s.texto,
        ...s.opciones.flatMap((o) => [o.titulo, o.subtitulo]),
      ]
      for (const prohibido of NOMBRES_REALES_PROHIBIDOS) {
        expect(textos.some((t) => t.includes(prohibido))).toBe(false)
      }
    }
  })

  it("el recuento documentado es el esperado (18/9/15)", () => {
    expect(contarSituacionesPorMomento(bancoContenido)).toEqual({
      verano: 18,
      febrero: 9,
    })
    expect(bancoContenido.situaciones.length).toBe(27)
    expect(bancoContenido.condicionales?.length).toBe(15)
  })

  it("no hay situaciones estáticamente inalcanzables", () => {
    expect(situacionesInalcanzablesEstaticas(bancoContenido)).toEqual([])
  })

  it("las flags declaradas y referenciadas se exponen en el informe", () => {
    expect(flagsDeclaradas(bancoContenido).length).toBeGreaterThan(0)
    expect(flagsReferenciadas(bancoContenido).length).toBeGreaterThan(0)
  })
})

describe("excepciones declaradas", () => {
  const opciones = TODAS.flatMap((s) => s.opciones.map((o) => ({ s, o })))

  it("ninguna opción tiene efectos sin declararse excepción", () => {
    for (const { o } of opciones) {
      const tieneEfectos =
        o.efectos !== undefined && Object.keys(o.efectos).length > 0
      if (tieneEfectos) expect(o.excepcion).toBe(true)
    }
  })

  it("ninguna excepción está vacía", () => {
    for (const { o } of opciones) {
      if (o.excepcion === true) {
        expect(o.efectos).toBeDefined()
        expect(Object.keys(o.efectos ?? {}).length).toBeGreaterThan(0)
      }
    }
  })

  it("hay pocas excepciones y todas con intercambio (sube y baja)", () => {
    const excepciones = opciones.filter(({ o }) => o.excepcion === true)
    expect(excepciones.length).toBeGreaterThan(0)
    expect(excepciones.length).toBeLessThanOrEqual(6)
    for (const { o } of excepciones) {
      const valores = Object.values(o.efectos ?? {})
      expect(valores.some((v) => v > 0)).toBe(true)
      expect(valores.some((v) => v < 0)).toBe(true)
    }
  })
})

describe("trayectoria: situaciones de cambio", () => {
  const buscar = (id: string) => TODAS.find((s) => s.id === id)

  it("el cambio de modalidad es de verano, con 2 opciones y filtrado por modalidad", () => {
    const aComparsista = buscar("cv_salto_a_comparsista")
    expect(aComparsista?.momento).toBe("verano")
    expect(aComparsista?.modalidades).toEqual(["chirigotero"])
    expect(aComparsista?.opciones).toHaveLength(2)
    expect(
      aComparsista?.opciones.some((o) => o.cambiaModalidad === "comparsista"),
    ).toBe(true)
    expect(aComparsista?.unicaVez).toBe(false)

    const aChirigotero = buscar("cv_salto_a_chirigotero")
    expect(aChirigotero?.momento).toBe("verano")
    expect(aChirigotero?.modalidades).toEqual(["comparsista"])
    expect(aChirigotero?.opciones).toHaveLength(2)
    expect(
      aChirigotero?.opciones.some((o) => o.cambiaModalidad === "chirigotero"),
    ).toBe(true)
    expect(aChirigotero?.unicaVez).toBe(false)
  })

  it("el cambio de variante es de verano, repetible y sin filtro de variante", () => {
    for (const id of ["cv_enfoque_comparsista", "cv_enfoque_chirigotero"]) {
      const s = buscar(id)
      expect(s?.momento).toBe("verano")
      expect(s?.unicaVez).toBe(false)
      expect(s?.variantes).toBeUndefined()
      expect(s?.modalidades).toHaveLength(1)
      const cambian = s?.opciones.filter((o) => o.cambiaVariante) ?? []
      expect(cambian.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("los cambios de variante apuntan a variantes de su propia modalidad", () => {
    const catalogo = new Map(
      (bancoContenido.variantes ?? []).map((v) => [v.id, v.modalidad]),
    )
    for (const s of TODAS) {
      for (const o of s.opciones) {
        if (!o.cambiaVariante) continue
        const modalidad = catalogo.get(o.cambiaVariante)
        expect(modalidad).toBeDefined()
        expect(o.cambiaModalidad).toBeUndefined()
        expect(s.modalidades ?? []).toContain(modalidad)
      }
    }
  })

  it("ninguna opción cambia de modalidad fuera de verano", () => {
    for (const s of TODAS) {
      for (const o of s.opciones) {
        if (o.cambiaModalidad) expect(s.momento).toBe("verano")
      }
    }
  })

  it("el catálogo de variantes del banco cubre las 6 variantes", () => {
    expect(bancoContenido.variantes).toHaveLength(6)
  })

  it("los textos de la tarjeta cubren todos los tipos de hito y buckets", () => {
    const textos = bancoContenido.textosTarjeta
    expect(textos).toBeDefined()
    if (!textos) return
    for (const tipo of TIPOS_HITO) {
      expect(textos.hitos[tipo]?.length).toBeGreaterThan(0)
      for (const plantilla of textos.hitos[tipo]) {
        expect(plantilla.trim().length).toBeGreaterThan(0)
      }
    }
    for (const bucket of BUCKETS_FRASE) {
      expect(textos.frases[bucket]?.length).toBeGreaterThan(0)
      for (const frase of textos.frases[bucket]) {
        expect(frase.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
