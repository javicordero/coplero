import { describe, expect, it } from "vitest"
import { bancoContenido } from "../../content"
import type { Situacion } from "../../content/schema"
import { type Almacen, VERSION_ALMACEN } from "../esquema"
import {
  agrupar,
  ErrorVolcado,
  FICHEROS,
  serializar,
  volcar,
} from "../generador"

const base = (): Almacen => ({
  version: VERSION_ALMACEN,
  situaciones: [...bancoContenido.situaciones],
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
  it("agrupar no pierde ninguna situación (SC-005)", () => {
    const almacen = base()
    const grupos = agrupar(almacen.situaciones)
    const recuperadas = FICHEROS.flatMap((f) => grupos[f.clave] ?? [])
    const ordenar = (xs: Situacion[]) =>
      [...xs].sort((a, b) => a.id.localeCompare(b.id))
    expect(ordenar(recuperadas)).toEqual(ordenar(almacen.situaciones))
  })

  it("cada situación cae en el fichero de su momento", () => {
    const grupos = agrupar(base().situaciones)
    for (const fichero of FICHEROS) {
      for (const situacion of grupos[fichero.clave] ?? []) {
        expect(situacion.momento).toBe(fichero.momento)
      }
    }
  })

  it("serializar es determinista y ordena por id (SC-006)", () => {
    const fichero = FICHEROS.find((f) => f.clave === "verano")
    if (!fichero) throw new Error("sin fichero de verano")
    const situaciones = [nueva("zeta"), nueva("alfa")]
    const primera = serializar(
      fichero,
      agrupar(situaciones)[fichero.clave] ?? [],
    )
    const segunda = serializar(
      fichero,
      agrupar(situaciones)[fichero.clave] ?? [],
    )
    expect(primera).toBe(segunda)
    expect(primera.indexOf('"alfa"')).toBeLessThan(primera.indexOf('"zeta"'))
  })

  it("escapa caracteres especiales en los textos (tildes, comillas, llaves)", () => {
    const fichero = FICHEROS[0]
    if (!fichero) throw new Error("sin ficheros")
    const titulo = 'Ni "flamenco" ni {nada}: ¡caña al carnaval!'
    const texto = serializar(fichero, [nueva("especial", { titulo })])
    expect(texto).toContain(JSON.stringify(titulo))
  })

  it("un banco inválido no genera contenido (SC-004)", () => {
    const almacen = base()
    // Sin ninguna situación de verano se rompe la cobertura común del momento.
    const almacenRoto: Almacen = {
      ...almacen,
      situaciones: almacen.situaciones.filter((s) => s.momento !== "verano"),
    }
    expect(() => volcar(almacenRoto)).toThrow(ErrorVolcado)
  })

  it("el volcado válido incluye los dos ficheros", () => {
    const resultado = volcar(base())
    expect(resultado.ficheros.map((f) => f.fichero.clave)).toEqual(
      FICHEROS.map((f) => f.clave),
    )
    for (const { contenido } of resultado.ficheros) {
      expect(contenido).toContain("no editar a mano")
    }
  })
})
