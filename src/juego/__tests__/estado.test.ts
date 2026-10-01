import { describe, expect, it } from "vitest"
import { type BancoContenido, decodificar } from "../../engine/index"
import { crearJuego } from "../estado.svelte"
import { type Almacen, CLAVE_GUARDADO } from "../persistencia"

function bancoConCambio(): BancoContenido {
  const opciones = [
    { id: "seguir", titulo: "Seguir", subtitulo: "x" },
    {
      id: "cambiar",
      titulo: "Cambiar",
      subtitulo: "x",
      cambiaModalidad: "chirigotero" as const,
    },
  ]
  const verano = (id: string, tipo: "contenido" | "personaje") => ({
    id,
    momento: "verano" as const,
    tipo,
    categoria: "carrera" as const,
    titulo: "Salto",
    texto: "",
    modalidades: ["comparsista" as const],
    opciones,
  })
  const febrero = (id: string, tipo: "contenido" | "personaje") => ({
    id,
    momento: "febrero" as const,
    tipo,
    categoria: "concurso" as const,
    titulo: "Concurso",
    texto: "",
    opciones: [
      { id: "a", titulo: "A", subtitulo: "a" },
      { id: "b", titulo: "B", subtitulo: "b" },
    ],
  })
  return {
    situaciones: [
      verano("v_c", "contenido"),
      verano("v_p", "personaje"),
      febrero("f_c", "contenido"),
      febrero("f_p", "personaje"),
    ],
    variantes: [
      { id: "c_a", modalidad: "comparsista" },
      { id: "ch_a", modalidad: "chirigotero" },
    ],
  }
}

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
  it("sin guardado arranca directamente en la creación de personaje", () => {
    const juego = nuevoJuego(almacenMemoria())
    expect(juego.estadoGuardado).toBe("ninguno")
    expect(juego.pantalla).toBe("crear-personaje")
  })

  it("con una partida en curso arranca en la pantalla de reanudación", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    iniciar(juego, "El Chato")

    const otroJuego = nuevoJuego(almacen)
    expect(otroJuego.estadoGuardado).toBe("en-curso")
    expect(otroJuego.pantalla).toBe("reanudar")
  })

  it("«Nueva partida» no borra el guardado hasta crear la nueva partida", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    iniciar(juego, "El Chato")
    expect(almacen.getItem(CLAVE_GUARDADO)).not.toBeNull()

    const otroJuego = nuevoJuego(almacen)
    otroJuego.empezar()
    expect(otroJuego.pantalla).toBe("crear-personaje")
    expect(almacen.getItem(CLAVE_GUARDADO)).not.toBeNull()
  })

  it("recorre la carrera completa hasta el fin", () => {
    const juego = nuevoJuego(almacenMemoria())
    jugarCarrera(juego)
    expect(juego.pantalla).toBe("fin")
    expect(juego.tarjeta).not.toBeNull()
    expect(juego.tarjeta?.nombre).toBe("El Chato")
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

  it("registra el género elegido en el formulario y lo limpia al reiniciar", () => {
    const juego = nuevoJuego(almacenMemoria())
    expect(juego.generoBorrador).toBeNull()

    juego.empezar()
    juego.seleccionarGenero("femenino")
    expect(juego.generoBorrador).toBe("femenino")

    juego.crearPersonaje({ ...datos("La Chata"), genero: "femenino" })
    expect(juego.personaje?.genero).toBe("femenino")

    juego.reiniciar()
    expect(juego.generoBorrador).toBeNull()
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
    expect(otroJuego.pantalla).toBe("reanudar")
    otroJuego.continuarPartida()
    expect(otroJuego.partida?.anoActual).toBe(anoTrasDecision)
    expect(otroJuego.paso?.tipo).toBe(pasoTrasDecision)
    expect(otroJuego.pantalla).not.toBe("reanudar")
  })

  it("reiniciar descarta el guardado y vuelve a crear personaje", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    jugarCarrera(juego)
    juego.reiniciar()
    expect(juego.pantalla).toBe("crear-personaje")
    expect(juego.partida).toBeNull()
    expect(juego.estadoGuardado).toBe("ninguno")
    expect(nuevoJuego(almacen).estadoGuardado).toBe("ninguno")
    expect(nuevoJuego(almacen).pantalla).toBe("crear-personaje")
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

  it("una carrera terminada no se reanuda y arranca directo", () => {
    const almacen = almacenMemoria()
    const juego = nuevoJuego(almacen)
    jugarCarrera(juego)
    expect(juego.estadoGuardado).toBe("terminada")

    const restaurado = nuevoJuego(almacen)
    expect(restaurado.estadoGuardado).toBe("terminada")
    expect(restaurado.pantalla).toBe("crear-personaje")
    // La capacidad interna de restaurar el resumen se conserva.
    restaurado.continuarPartida()
    expect(restaurado.pantalla).toBe("fin")
    expect(restaurado.tarjeta?.nombre).toBe("El Chato")
  })

  it("descarta un guardado inservible en silencio", () => {
    const almacen = almacenMemoria()
    almacen.setItem(
      CLAVE_GUARDADO,
      JSON.stringify({ version: 999, partida: "{}" }),
    )

    const juego = nuevoJuego(almacen)
    expect(juego.estadoGuardado).toBe("ninguno")
    expect(juego.pantalla).toBe("crear-personaje")

    const otro = nuevoJuego(almacen)
    expect(otro.estadoGuardado).toBe("ninguno")
    expect(otro.pantalla).toBe("crear-personaje")
  })

  it("sin almacenamiento arranca directo y no falla", () => {
    const juego = nuevoJuego(almacenQueLanza())
    expect(juego.estadoGuardado).toBe("ninguno")
    expect(juego.pantalla).toBe("crear-personaje")
    iniciar(juego, "Sin guardar")
    expect(juego.pantalla).toBe("decision")
    expect(juego.error).toBeNull()
  })

  it("el cambio de modalidad abre la pantalla de cambio de variante", () => {
    const juego = crearJuego(almacenMemoria(), {
      generarSeed: () => "seed-cambio",
      banco: bancoConCambio(),
    })
    juego.empezar()
    juego.crearPersonaje(datos("El Chato"))
    juego.elegirModalidad("comparsista")
    juego.elegirVariante("c_a")
    expect(juego.pantalla).toBe("decision")

    juego.elegirOpcion("cambiar")
    expect(juego.pantalla).toBe("cambio-variante")
    expect(juego.paso?.tipo).toBe("variante")
    expect(juego.partida?.modalidad).toBe("chirigotero")
    expect(juego.partida?.trayectoria.cambios).toHaveLength(0)

    juego.elegirVarianteCambio("ch_a")
    expect(juego.pantalla).toBe("decision")
    expect(juego.partida?.variante).toBe("ch_a")
    expect(juego.partida?.trayectoria.cambios).toHaveLength(1)
    expect(juego.error).toBeNull()
  })

  it("guarda y restaura en medio del cambio de variante", () => {
    const almacen = almacenMemoria()
    const juego = crearJuego(almacen, {
      generarSeed: () => "seed-cambio",
      banco: bancoConCambio(),
    })
    juego.empezar()
    juego.crearPersonaje(datos("El Chato"))
    juego.elegirModalidad("comparsista")
    juego.elegirVariante("c_a")
    juego.elegirOpcion("cambiar")
    expect(juego.pantalla).toBe("cambio-variante")

    const restaurado = crearJuego(almacen, {
      generarSeed: () => "otra-seed",
      banco: bancoConCambio(),
    })
    restaurado.continuarPartida()
    expect(restaurado.pantalla).toBe("cambio-variante")
    expect(restaurado.partida?.modalidad).toBe("chirigotero")

    restaurado.elegirVarianteCambio("ch_a")
    expect(restaurado.partida?.trayectoria.cambios).toEqual([
      {
        ano: restaurado.partida?.anoActual,
        modalidad: "chirigotero",
        variante: "ch_a",
      },
    ])
  })

  it("genera un código compartible con el nombre", () => {
    const juego = nuevoJuego(almacenMemoria())
    jugarCarrera(juego)
    expect(juego.tarjeta?.nombre).toBe("El Chato")

    const codigo = juego.codigo()
    expect(codigo).toBeTruthy()
    if (codigo) {
      const decodificado = decodificar(codigo)
      expect(decodificado.ok).toBe(true)
      if (decodificado.ok) expect(decodificado.valor.nombre).toBe("El Chato")
    }
  })
})
