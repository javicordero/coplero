import { describe, expect, it } from "vitest"
import { bancoContenido } from "../../content/index"
import {
  continuar,
  crearPartida,
  elegir,
  type Partida,
  siguientePaso,
} from "../../engine/index"
import {
  type Almacen,
  borrar,
  CLAVE_GUARDADO,
  cargar,
  estadoGuardado,
  guardar,
} from "../persistencia"

function almacenMemoria(): Almacen {
  const mapa = new Map<string, string>()
  return {
    getItem: (clave) => mapa.get(clave) ?? null,
    setItem: (clave, valor) => void mapa.set(clave, valor),
    removeItem: (clave) => void mapa.delete(clave),
  }
}

function almacenQueLanza(): Almacen {
  const boom = () => {
    throw new Error("almacen no disponible")
  }
  return { getItem: boom, setItem: boom, removeItem: boom }
}

function almacenNoop(): Almacen {
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
}

function partidaPrueba(): Partida {
  return crearPartida(
    {
      seed: "seed-persistencia",
      personaje: {
        nombre: "Prueba",
        edad: 30,
        localidad: "Cádiz",
        genero: "masculino",
      },
      modalidad: "comparsista",
      variante: "clasico_comparsista",
    },
    bancoContenido,
  )
}

describe("persistencia", () => {
  it("guarda y recupera la misma partida", () => {
    const almacen = almacenMemoria()
    const partida = partidaPrueba()
    guardar(almacen, partida)
    const resultado = cargar(almacen)
    expect(resultado.descartado).toBe(false)
    expect(resultado.partida).toEqual(partida)
  })

  it("guarda el punto exacto tras una decisión", () => {
    const almacen = almacenMemoria()
    const partida = partidaPrueba()
    const paso = siguientePaso(partida, bancoContenido)
    if (paso.tipo !== "decision") throw new Error("esperaba una decisión")
    const eleccion = elegir(
      partida,
      paso.situacion.opciones[0].id,
      bancoContenido,
    )
    if (!eleccion.ok) throw new Error("la elección debía ser válida")

    guardar(almacen, eleccion.valor)
    expect(cargar(almacen).partida).toEqual(eleccion.valor)
  })

  it("borrar elimina el guardado", () => {
    const almacen = almacenMemoria()
    guardar(almacen, partidaPrueba())
    borrar(almacen)
    expect(almacen.getItem(CLAVE_GUARDADO)).toBeNull()
    expect(cargar(almacen).partida).toBeNull()
  })

  it("sin guardado no hay nada que cargar ni descartar", () => {
    expect(cargar(almacenMemoria())).toEqual({
      partida: null,
      descartado: false,
    })
  })

  it("descarta un JSON corrupto sin lanzar", () => {
    const almacen = almacenMemoria()
    almacen.setItem(CLAVE_GUARDADO, "{ no-json ")
    const resultado = cargar(almacen)
    expect(resultado).toEqual({ partida: null, descartado: true })
    expect(almacen.getItem(CLAVE_GUARDADO)).toBeNull()
  })

  it("descarta una versión distinta de esquema", () => {
    const almacen = almacenMemoria()
    almacen.setItem(
      CLAVE_GUARDADO,
      JSON.stringify({ version: 999, partida: "{}" }),
    )
    const resultado = cargar(almacen)
    expect(resultado.descartado).toBe(true)
    expect(almacen.getItem(CLAVE_GUARDADO)).toBeNull()
  })

  it("descarta un sobre con tipos inesperados", () => {
    const almacen = almacenMemoria()
    almacen.setItem(CLAVE_GUARDADO, JSON.stringify({ version: 1, partida: 42 }))
    const resultado = cargar(almacen)
    expect(resultado).toEqual({ partida: null, descartado: true })
    expect(almacen.getItem(CLAVE_GUARDADO)).toBeNull()
  })

  it("descarta una partida que no se puede deserializar", () => {
    const almacen = almacenMemoria()
    almacen.setItem(
      CLAVE_GUARDADO,
      JSON.stringify({ version: 1, partida: "{}" }),
    )
    const resultado = cargar(almacen)
    expect(resultado).toEqual({ partida: null, descartado: true })
    expect(almacen.getItem(CLAVE_GUARDADO)).toBeNull()
  })

  it("no lanza si el almacén lanza", () => {
    const almacen = almacenQueLanza()
    expect(() => guardar(almacen, partidaPrueba())).not.toThrow()
    expect(() => borrar(almacen)).not.toThrow()
    expect(cargar(almacen)).toEqual({ partida: null, descartado: false })
  })

  it("con un almacén no-op no guarda ni descarta nada", () => {
    const almacen = almacenNoop()
    guardar(almacen, partidaPrueba())
    expect(cargar(almacen)).toEqual({ partida: null, descartado: false })
  })

  it("una carrera completa ocupa menos de 5 KB (SC-006)", () => {
    const almacen = almacenMemoria()
    let partida = partidaPrueba()
    let pasos = 0
    while (partida.fase !== "fin" && pasos < 400) {
      const paso = siguientePaso(partida, bancoContenido)
      if (paso.tipo === "decision") {
        const eleccion = elegir(
          partida,
          paso.situacion.opciones[0].id,
          bancoContenido,
        )
        if (!eleccion.ok) throw new Error("elección inválida")
        partida = eleccion.valor
      } else if (paso.tipo === "resultado") {
        partida = continuar(partida)
      } else {
        break
      }
      pasos += 1
    }
    expect(partida.fase).toBe("fin")

    guardar(almacen, partida)
    const crudo = almacen.getItem(CLAVE_GUARDADO) ?? ""
    // SC-006: menos del 1% del límite típico de localStorage (5 MB).
    expect(crudo.length).toBeLessThan(0.01 * 5 * 1024 * 1024)
  })
})

describe("estado del guardado", () => {
  it("sin partida es 'ninguno'", () => {
    expect(estadoGuardado(null)).toBe("ninguno")
  })

  it("una partida en curso es 'en-curso'", () => {
    expect(estadoGuardado(partidaPrueba())).toBe("en-curso")
  })

  it("una partida terminada es 'terminada'", () => {
    const fin: Partida = { ...partidaPrueba(), fase: "fin" }
    expect(estadoGuardado(fin)).toBe("terminada")
  })
})
