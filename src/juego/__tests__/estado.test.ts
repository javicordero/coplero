import { describe, expect, it } from "vitest"
import { crearJuego } from "../estado.svelte"
import type { Almacen } from "../persistencia"

function almacenMemoria(): Almacen {
  const mapa = new Map<string, string>()
  return {
    getItem: (clave) => mapa.get(clave) ?? null,
    setItem: (clave, valor) => void mapa.set(clave, valor),
    removeItem: (clave) => void mapa.delete(clave),
  }
}

function nuevoJuego(almacen: Almacen) {
  return crearJuego(almacen, { generarSeed: () => "seed-de-prueba" })
}

function jugarCarrera(juego: ReturnType<typeof nuevoJuego>) {
  juego.empezar()
  juego.crearPersonaje({
    nombre: "El Chato",
    edad: 30,
    localidad: "Cádiz",
    genero: "masculino",
  })
  juego.elegirModalidad("comparsista")
  juego.elegirVariante("clasico_comparsista")

  let pasos = 0
  while (juego.pantalla !== "fin" && pasos < 200) {
    if (juego.pantalla === "decision" && juego.paso?.tipo === "decision") {
      juego.elegirOpcion(juego.paso.situacion.opciones[0].id)
    } else if (juego.pantalla === "resultado") {
      juego.continuar()
    } else {
      break
    }
    pasos += 1
  }
  return pasos
}

describe("estado del juego", () => {
  it("recorre la carrera completa hasta el fin", () => {
    const juego = nuevoJuego(almacenMemoria())
    jugarCarrera(juego)
    expect(juego.pantalla).toBe("fin")
    expect(juego.resumen).not.toBeNull()
    expect(juego.resumen?.nombre).toBe("El Chato")
    expect(juego.error).toBeNull()
  })

  it("pasa por modalidad y variante antes de la primera decisión", () => {
    const juego = nuevoJuego(almacenMemoria())
    juego.empezar()
    juego.crearPersonaje({
      nombre: "Prueba",
      edad: 25,
      localidad: "San Fernando",
      genero: "femenino",
    })
    expect(juego.pantalla).toBe("modalidad")
    juego.elegirModalidad("chirigotero")
    expect(juego.pantalla).toBe("variante")
    expect(juego.modalidad).toBe("chirigotero")
    juego.elegirVariante("clasico_chirigotero")
    expect(juego.pantalla).toBe("decision")
  })

  it("continúa una partida guardada en el mismo punto", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    juego.empezar()
    juego.crearPersonaje({
      nombre: "El Chato",
      edad: 30,
      localidad: "Cádiz",
      genero: "masculino",
    })
    juego.elegirModalidad("comparsista")
    juego.elegirVariante("clasico_comparsista")
    juego.elegirOpcion(
      juego.paso?.tipo === "decision"
        ? juego.paso.situacion.opciones[0].id
        : "",
    )
    expect(juego.hayGuardado).toBe(true)
    const anoTrasDecision = juego.partida?.anoActual ?? 0

    const otroJuego = nuevoJuego(almacen)
    expect(otroJuego.hayGuardado).toBe(true)
    otroJuego.continuarPartida()
    expect(otroJuego.partida?.anoActual).toBe(anoTrasDecision)
    expect(otroJuego.pantalla).not.toBe("intro")
  })

  it("reiniciar descarta el guardado y vuelve a la intro", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    jugarCarrera(juego)
    juego.reiniciar()
    expect(juego.pantalla).toBe("intro")
    expect(juego.partida).toBeNull()
    expect(juego.hayGuardado).toBe(false)
    expect(nuevoJuego(almacen).hayGuardado).toBe(false)
  })
})
