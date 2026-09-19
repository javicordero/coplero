import { describe, expect, it } from "vitest"
import { crearJuego } from "../estado.svelte"
import { type Almacen, CLAVE_GUARDADO } from "../persistencia"

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

function nuevoJuego(almacen: Almacen, seed = "seed-de-prueba") {
  return crearJuego(almacen, { generarSeed: () => seed })
}

function datos(nombre: string) {
  return {
    nombre,
    edad: 30,
    localidad: "Cádiz",
    genero: "masculino" as const,
  }
}

function iniciar(juego: ReturnType<typeof nuevoJuego>, nombre: string): void {
  juego.empezar()
  juego.crearPersonaje(datos(nombre))
  juego.elegirModalidad("comparsista")
  juego.elegirVariante("clasico_comparsista")
}

function jugarCarrera(juego: ReturnType<typeof nuevoJuego>) {
  iniciar(juego, "El Chato")

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
    juego.crearPersonaje(datos("Prueba"))
    expect(juego.pantalla).toBe("modalidad")
    juego.elegirModalidad("chirigotero")
    expect(juego.pantalla).toBe("variante")
    expect(juego.modalidad).toBe("chirigotero")
    juego.elegirVariante("clasico_chirigotero")
    expect(juego.pantalla).toBe("decision")
    expect(juego.estadoGuardado).toBe("en-curso")
  })

  it("continúa una partida guardada en el mismo punto", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    iniciar(juego, "El Chato")
    juego.elegirOpcion(
      juego.paso?.tipo === "decision"
        ? juego.paso.situacion.opciones[0].id
        : "",
    )
    expect(juego.estadoGuardado).toBe("en-curso")
    const anoTrasDecision = juego.partida?.anoActual ?? 0
    const pasoTrasDecision = juego.paso?.tipo

    const otroJuego = nuevoJuego(almacen)
    expect(otroJuego.estadoGuardado).toBe("en-curso")
    otroJuego.continuarPartida()
    expect(otroJuego.partida?.anoActual).toBe(anoTrasDecision)
    expect(otroJuego.paso?.tipo).toBe(pasoTrasDecision)
    expect(otroJuego.pantalla).not.toBe("intro")
  })

  it("reiniciar descarta el guardado y vuelve a la intro", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    jugarCarrera(juego)
    juego.reiniciar()
    expect(juego.pantalla).toBe("intro")
    expect(juego.partida).toBeNull()
    expect(juego.estadoGuardado).toBe("ninguno")
    expect(nuevoJuego(almacen).estadoGuardado).toBe("ninguno")
  })

  it("crear una partida nueva reemplaza el guardado anterior", () => {
    const almacen = almacenMemoria()
    const primero = nuevoJuego(almacen, "seed-uno")
    iniciar(primero, "Uno")
    expect(primero.estadoGuardado).toBe("en-curso")

    const segundo = nuevoJuego(almacen, "seed-dos")
    iniciar(segundo, "Dos")

    const restaurado = nuevoJuego(almacen, "seed-tres")
    restaurado.continuarPartida()
    expect(restaurado.partida?.personaje.nombre).toBe("Dos")
  })

  it("una carrera terminada se marca como terminada y muestra el resumen", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    jugarCarrera(juego)
    expect(juego.estadoGuardado).toBe("terminada")

    const restaurado = nuevoJuego(almacen)
    expect(restaurado.estadoGuardado).toBe("terminada")
    restaurado.continuarPartida()
    expect(restaurado.pantalla).toBe("fin")
    expect(restaurado.resumen?.nombre).toBe("El Chato")
  })

  it("descarta un guardado inservible con un aviso puntual", () => {
    const almacen = almacenMemoria()
    almacen.setItem(
      CLAVE_GUARDADO,
      JSON.stringify({ version: 999, partida: "{}" }),
    )

    const juego = nuevoJuego(almacen)
    expect(juego.aviso).not.toBeNull()
    expect(juego.estadoGuardado).toBe("ninguno")

    const otro = nuevoJuego(almacen)
    expect(otro.aviso).toBeNull()
    expect(otro.estadoGuardado).toBe("ninguno")
  })

  it("sin almacenamiento se juega sin aviso", () => {
    const juego = nuevoJuego(almacenQueLanza())
    expect(juego.aviso).toBeNull()
    expect(juego.estadoGuardado).toBe("ninguno")
    iniciar(juego, "Sin guardar")
    expect(juego.pantalla).toBe("decision")
    expect(juego.error).toBeNull()
  })
})
