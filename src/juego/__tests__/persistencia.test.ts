import { describe, expect, it } from "vitest"
import { bancoContenido } from "../../content/index"
import { crearPartida } from "../../engine/index"
import {
  type Almacen,
  borrar,
  CLAVE_GUARDADO,
  cargar,
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

function partidaPrueba() {
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

  it("borrar elimina el guardado", () => {
    const almacen = almacenMemoria()
    guardar(almacen, partidaPrueba())
    borrar(almacen)
    expect(almacen.getItem(CLAVE_GUARDADO)).toBeNull()
    expect(cargar(almacen).partida).toBeNull()
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

  it("sin guardado no hay nada que cargar ni descartar", () => {
    expect(cargar(almacenMemoria())).toEqual({
      partida: null,
      descartado: false,
    })
  })
})
