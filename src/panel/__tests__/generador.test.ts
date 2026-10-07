import { describe, expect, it } from "vitest"
import { bancoContenido } from "../../content"
import type { Condicional, Situacion } from "../../content/schema"
import { type Almacen, VERSION_ALMACEN } from "../esquema"
import {
  agruparPorMomento,
  ErrorVolcado,
  FICHEROS_CONDICIONALES,
  FICHEROS_SITUACIONES,
  serializar,
  volcar,
} from "../generador"

const base = (): Almacen => ({
  version: VERSION_ALMACEN,
  situaciones: [...bancoContenido.situaciones],
  condicionales: [...(bancoContenido.condicionales ?? [])],
})

const nueva = (id: string, overrides: Partial<Situacion> = {}): Situacion => ({
  id,
  momento: "verano",
  titulo: `Título ${id}`,
  texto: "",
  opciones: [
    { id: "a", titulo: "A", subtitulo: "a" },
    { id: "b", titulo: "B", subtitulo: "b" },
  ],
  ...overrides,
})

describe("generador del volcado", () => {
  it("agruparPorMomento no pierde ninguna situación (SC-005)", () => {
    const almacen = base()
    const grupos = agruparPorMomento(almacen.situaciones)
    const recuperadas = [...grupos.verano, ...grupos.febrero]
    const ordenar = (xs: Situacion[]) =>
      [...xs].sort((a, b) => a.id.localeCompare(b.id))
    expect(ordenar(recuperadas)).toEqual(ordenar(almacen.situaciones))
  })

  it("agruparPorMomento no pierde ningún condicional", () => {
    const almacen = base()
    const grupos = agruparPorMomento(almacen.condicionales)
    expect([...grupos.verano, ...grupos.febrero]).toHaveLength(
      almacen.condicionales.length,
    )
  })

  it("cada entidad cae en el fichero de su momento", () => {
    const grupos = agruparPorMomento(base().situaciones)
    for (const fichero of FICHEROS_SITUACIONES) {
      for (const situacion of grupos[fichero.momento]) {
        expect(situacion.momento).toBe(fichero.momento)
      }
    }
  })

  it("serializar es determinista y ordena por id (SC-006)", () => {
    const fichero = FICHEROS_SITUACIONES.find((f) => f.momento === "verano")
    if (!fichero) throw new Error("sin fichero de verano")
    const situaciones = [nueva("zeta"), nueva("alfa")]
    const grupos = agruparPorMomento(situaciones)
    const primera = serializar(fichero, grupos[fichero.momento])
    const segunda = serializar(fichero, grupos[fichero.momento])
    expect(primera).toBe(segunda)
    expect(primera.indexOf('"alfa"')).toBeLessThan(primera.indexOf('"zeta"'))
  })

  it("escapa caracteres especiales en los textos (tildes, comillas, llaves)", () => {
    const fichero = FICHEROS_SITUACIONES[0]
    if (!fichero) throw new Error("sin ficheros")
    const titulo = 'Ni "flamenco" ni {nada}: ¡caña al carnaval!'
    const texto = serializar(fichero, [nueva("especial", { titulo })])
    expect(texto).toContain(JSON.stringify(titulo))
  })

  it("un banco inválido no genera contenido (SC-004)", () => {
    const almacen = base()
    const almacenRoto: Almacen = {
      ...almacen,
      situaciones: almacen.situaciones.filter((s) => s.momento !== "verano"),
    }
    expect(() => volcar(almacenRoto)).toThrow(ErrorVolcado)
  })

  it("un condicional inválido tampoco genera contenido", () => {
    const almacen = base()
    const primero = almacen.condicionales[0]
    if (!primero) throw new Error("sin condicionales")
    const roto: Condicional = { ...primero, probabilidad: 2 }
    const almacenRoto: Almacen = {
      ...almacen,
      condicionales: [roto, ...almacen.condicionales.slice(1)],
    }
    expect(() => volcar(almacenRoto)).toThrow(ErrorVolcado)
  })

  it("el volcado válido incluye los cuatro ficheros con cabecera", () => {
    const resultado = volcar(base())
    expect(resultado.ficheros).toHaveLength(
      FICHEROS_SITUACIONES.length + FICHEROS_CONDICIONALES.length,
    )
    for (const { contenido } of resultado.ficheros) {
      expect(contenido).toContain("no editar a mano")
    }
  })

  it("serializa las variantes femeninas rellenas y omite las vacías (FR-012)", () => {
    const fichero = FICHEROS_SITUACIONES.find((f) => f.momento === "verano")
    if (!fichero) throw new Error("sin fichero de verano")
    const entidad = nueva("con_femenino", {
      tituloFemenino: "Título femenino",
      opciones: [
        { id: "a", titulo: "A", subtitulo: "a", tituloFemenino: "A fem" },
        { id: "b", titulo: "B", subtitulo: "b" },
      ],
    })
    const texto = serializar(fichero, [entidad])
    expect(texto).toContain('tituloFemenino: "Título femenino"')
    expect(texto).toContain('tituloFemenino: "A fem"')
    expect(texto).not.toContain("textoFemenino")
    expect(texto).not.toContain("subtituloFemenino")
  })

  it("volcar conserva las variantes femeninas de una situación (FR-011)", () => {
    const almacen = base()
    almacen.situaciones = [
      ...almacen.situaciones,
      nueva("con_femenino", { tituloFemenino: "T fem" }),
    ]
    const resultado = volcar(almacen)
    const verano = resultado.ficheros.find(
      (f) =>
        f.fichero.momento === "verano" &&
        f.fichero.tipoImportado === "Situacion",
    )
    const entidad = verano?.entidades.find(
      (e) => (e as Situacion).id === "con_femenino",
    ) as Situacion | undefined
    expect(entidad?.tituloFemenino).toBe("T fem")
  })
})
