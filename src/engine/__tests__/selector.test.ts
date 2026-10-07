import { describe, expect, it } from "vitest"
import {
  crearPartida,
  elegir,
  elegirVarianteDeCambio,
  siguientePaso,
} from "../partida"
import { seleccionarSituacion, toPublica } from "../selector"
import type { BancoContenido, Condicional, Situacion } from "../types"
import { bancoPrueba, inputPrueba } from "./fixtures"

describe("selector", () => {
  it("el momento nunca se cruza: en verano no salen situaciones de febrero", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const s = seleccionarSituacion(p, bancoPrueba)
    expect(s).not.toBeNull()
    expect(s?.momento).toBe("verano")
  })

  it("el filtro de modalidad manda mientras haya alternativa común", () => {
    const base = bancoPrueba.situaciones[0]
    const banco: BancoContenido = {
      situaciones: [
        { ...base, id: "comun" },
        {
          ...base,
          id: "solo_chirigotero",
          modalidades: ["chirigotero"],
        },
      ],
    }
    for (let i = 0; i < 50; i++) {
      const p = crearPartida({ ...inputPrueba, seed: `modalidad-${i}` }, banco) // modalidad comparsista
      expect(seleccionarSituacion(p, banco)?.id).toBe("comun")
    }
  })

  it("degrada y recicla cuando el pool se agota", () => {
    const base = bancoPrueba.situaciones.find((s) => s.momento === "verano")
    if (!base) throw new Error("fixtures sin situación de verano")
    const banco: BancoContenido = { situaciones: [base] }
    const p = crearPartida(inputPrueba, banco)
    const s1 = seleccionarSituacion(p, banco)
    expect(s1).not.toBeNull()
    const vistas = { ...p, vistas: [s1?.id ?? ""] }
    const s2 = seleccionarSituacion(vistas, banco)
    expect(s2?.id).toBe(s1?.id) // reciclado
  })

  it("tras cambiar de modalidad, la selección usa la nueva", () => {
    const base = bancoPrueba.situaciones[0]
    const opcionesCambio = [
      { id: "seguir", titulo: "Seguir", subtitulo: "x" },
      {
        id: "cambiar",
        titulo: "Cambiar",
        subtitulo: "x",
        cambiaModalidad: "chirigotero" as const,
      },
    ]
    const banco: BancoContenido = {
      situaciones: [
        {
          ...base,
          id: "cambio_c",
          modalidades: ["comparsista"],
          opciones: opcionesCambio,
        },
        {
          ...base,
          id: "chiri_c",
          momento: "febrero",
          modalidades: ["chirigotero"],
        },
        {
          ...base,
          id: "chiri_p",
          momento: "febrero",
          modalidades: ["chirigotero"],
        },
      ],
      variantes: [
        { id: "c_a", modalidad: "comparsista" },
        { id: "ch_a", modalidad: "chirigotero" },
      ],
    }
    const p = crearPartida(inputPrueba, banco)
    const r1 = elegir(p, "cambiar", banco)
    if (!r1.ok) throw new Error("no cambió de modalidad")
    const r2 = elegirVarianteDeCambio(r1.valor, "ch_a", banco)
    if (!r2.ok) throw new Error("variante inválida")
    const s = seleccionarSituacion(r2.valor, banco)
    expect(s).not.toBeNull()
    expect(s?.modalidades).toEqual(["chirigotero"])
    expect(s?.id.startsWith("chiri_")).toBe(true)
  })

  it("pondera la selección por `peso`", () => {
    const base = bancoPrueba.situaciones[0]
    const banco: BancoContenido = {
      situaciones: [
        { ...base, id: "frecuente", peso: 100 },
        { ...base, id: "raro", peso: 1 },
      ],
    }
    let frecuente = 0
    let raro = 0
    for (let i = 0; i < 400; i++) {
      const p = crearPartida({ ...inputPrueba, seed: `peso-${i}` }, banco)
      const s = seleccionarSituacion(p, banco)
      if (s?.id === "frecuente") frecuente++
      else if (s?.id === "raro") raro++
    }
    expect(frecuente).toBeGreaterThan(0)
    expect(frecuente).toBeGreaterThan(raro)
  })

  it("el filtro de variantes manda mientras haya alternativa", () => {
    const base = bancoPrueba.situaciones[0]
    const banco: BancoContenido = {
      situaciones: [
        { ...base, id: "comun" },
        {
          ...base,
          id: "solo_nueva",
          variantes: ["nueva_escuela"],
        },
      ],
    }
    for (let i = 0; i < 50; i++) {
      const p = crearPartida({ ...inputPrueba, seed: `variante-${i}` }, banco) // variante "clasico"
      expect(seleccionarSituacion(p, banco)?.id).toBe("comun")
    }
  })

  it("el flujo alterna verano y febrero", () => {
    const p = crearPartida(inputPrueba, bancoPrueba)
    const paso1 = siguientePaso(p, bancoPrueba)
    expect(paso1.tipo).toBe("decision")
    if (paso1.tipo !== "decision") return
    expect(paso1.momento).toBe("verano")
    const res = elegir(p, paso1.situacion.opciones[0].id, bancoPrueba)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.valor.momento).toBe("febrero")
    expect(res.valor.decisionesTomadasAno).toBe(1)
  })
})

describe("toPublica con contexto de género", () => {
  const situacion: Situacion = {
    id: "s1",
    momento: "verano",
    titulo: "Título",
    texto: "Texto",
    tituloFemenino: "Título femenino",
    textoFemenino: "Texto femenino",
    opciones: [
      {
        id: "a",
        titulo: "A",
        subtitulo: "a",
        tituloFemenino: "A fem",
        subtituloFemenino: "a fem",
      },
      { id: "b", titulo: "B", subtitulo: "b" },
    ],
  }
  const azar = () => 0

  it("sin contexto devuelve las formas por defecto", () => {
    const pub = toPublica(situacion)
    expect(pub.titulo).toBe("Título")
    expect(pub.texto).toBe("Texto")
    expect(pub.opciones[0].titulo).toBe("A")
    expect(pub.opciones[0].subtitulo).toBe("a")
  })

  it("con género femenino usa las variantes escritas y cae a la por defecto", () => {
    const pub = toPublica(situacion, { genero: "femenino", azar })
    expect(pub.titulo).toBe("Título femenino")
    expect(pub.texto).toBe("Texto femenino")
    expect(pub.opciones[0].titulo).toBe("A fem")
    expect(pub.opciones[0].subtitulo).toBe("a fem")
    expect(pub.opciones[1].titulo).toBe("B")
  })

  it("con género masculino usa siempre las formas por defecto", () => {
    const pub = toPublica(situacion, { genero: "masculino", azar })
    expect(pub.titulo).toBe("Título")
    expect(pub.opciones[0].titulo).toBe("A")
  })

  it("un condicional (que extiende Situacion) resuelve igual (FR-009)", () => {
    const condicional: Condicional = {
      ...situacion,
      requiere: { tipo: "flag", flag: "x" },
      ventanaAnos: 2,
      probabilidad: 0.5,
    }
    const pub = toPublica(condicional, { genero: "femenino", azar })
    expect(pub.titulo).toBe("Título femenino")
  })
})
