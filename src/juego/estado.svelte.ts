// Estado reactivo de la isla. Envuelve el motor: no contiene reglas de juego.
// Fábrica (sin estado de módulo) para no filtrar partidas entre peticiones SSR.

import { bancoContenido as bancoReal } from "../content/index"
import {
  type BancoContenido,
  codificar,
  continuar as continuarMotor,
  crearPartida,
  type ErrorMotor,
  elegir,
  elegirVarianteDeCambio,
  type Genero,
  type Modalidad,
  type Partida,
  type Paso,
  type Personaje,
  siguientePaso,
  type TarjetaFinal,
  type VarianteId,
} from "../engine/index"
import {
  type Almacen,
  borrar,
  estadoGuardado as calcularEstadoGuardado,
  cargar,
  type EstadoGuardado,
  guardar,
} from "./persistencia"
import { AVISO_GUARDADO_DESCARTADO, normalizarNombre } from "./presentacion"

export type Pantalla =
  | "intro"
  | "crear-personaje"
  | "modalidad"
  | "variante"
  | "cambio-variante"
  | "decision"
  | "resultado"
  | "fin"
  | "error"

export interface DatosCreacion {
  nombre: string
  edad: number
  localidad: string
  genero: Genero
}

export interface OpcionesJuego {
  generarSeed?: () => string
  /** Banco inyectable para tests; por defecto, el banco real de `content`. */
  banco?: BancoContenido
}

function seedPorDefecto(): string {
  const cripto = globalThis.crypto
  if (cripto?.randomUUID) return cripto.randomUUID()
  return `seed-${Math.floor(performance.now())}`
}

export interface Juego {
  readonly pantalla: Pantalla
  readonly partida: Partida | null
  readonly personaje: Personaje | null
  readonly paso: Paso | null
  readonly tarjeta: TarjetaFinal | null
  readonly error: ErrorMotor | null
  readonly aviso: string | null
  readonly estadoGuardado: EstadoGuardado
  readonly modalidad: Modalidad | null
  empezar(): void
  crearPersonaje(datos: DatosCreacion): void
  elegirModalidad(modalidad: Modalidad): void
  elegirVariante(variante: VarianteId): void
  elegirOpcion(opcionId: string): void
  elegirVarianteCambio(variante: VarianteId): void
  continuar(): void
  reiniciar(): void
  continuarPartida(): void
  codigo(): string | null
}

export function crearJuego(
  almacen: Almacen,
  opciones: OpcionesJuego = {},
): Juego {
  const generarSeed = opciones.generarSeed ?? seedPorDefecto
  const banco = opciones.banco ?? bancoReal

  let pantalla = $state<Pantalla>("intro")
  let partida = $state<Partida | null>(null)
  let paso = $state<Paso | null>(null)
  let tarjeta = $state<TarjetaFinal | null>(null)
  let error = $state<ErrorMotor | null>(null)
  const cargaInicial = cargar(almacen)
  let aviso = $state<string | null>(
    cargaInicial.descartado ? AVISO_GUARDADO_DESCARTADO : null,
  )
  let estadoGuardado = $state<EstadoGuardado>(
    calcularEstadoGuardado(cargaInicial.partida),
  )
  let personaje = $state<Personaje | null>(null)
  let modalidad = $state<Modalidad | null>(null)
  let seed = $state<string>("")

  function persistir(): void {
    if (!partida) return
    guardar(almacen, partida)
    estadoGuardado = calcularEstadoGuardado(partida)
  }

  function refrescarPaso(): void {
    if (!partida) return
    const siguiente = siguientePaso(partida, banco)
    paso = siguiente
    if (siguiente.tipo === "error") {
      error = siguiente.error
      pantalla = "error"
      return
    }
    if (siguiente.tipo === "fin") {
      tarjeta = siguiente.tarjeta
      pantalla = "fin"
      return
    }
    if (siguiente.tipo === "variante") {
      pantalla = "cambio-variante"
      return
    }
    pantalla = siguiente.tipo === "resultado" ? "resultado" : "decision"
  }

  function empezar(): void {
    error = null
    aviso = null
    pantalla = "crear-personaje"
  }

  function crearPersonaje(datos: DatosCreacion): void {
    personaje = {
      nombre: normalizarNombre(datos.nombre),
      edad: datos.edad,
      localidad: normalizarNombre(datos.localidad),
      genero: datos.genero,
    }
    seed = generarSeed()
    error = null
    pantalla = "modalidad"
  }

  function elegirModalidad(valor: Modalidad): void {
    modalidad = valor
    pantalla = "variante"
  }

  function elegirVariante(variante: VarianteId): void {
    if (!personaje || !modalidad) return
    partida = crearPartida({ seed, personaje, modalidad, variante }, banco)
    refrescarPaso()
    persistir()
  }

  function elegirOpcion(opcionId: string): void {
    if (!partida || paso?.tipo !== "decision") return
    const resultado = elegir(partida, opcionId, banco)
    if (!resultado.ok) {
      error = resultado.error
      pantalla = "error"
      return
    }
    partida = resultado.valor
    refrescarPaso()
    persistir()
  }

  function elegirVarianteCambio(varianteId: VarianteId): void {
    if (!partida || paso?.tipo !== "variante") return
    const resultado = elegirVarianteDeCambio(partida, varianteId, banco)
    if (!resultado.ok) {
      error = resultado.error
      pantalla = "error"
      return
    }
    partida = resultado.valor
    refrescarPaso()
    persistir()
  }

  function continuar(): void {
    if (!partida) return
    partida = continuarMotor(partida)
    refrescarPaso()
    persistir()
  }

  function reiniciar(): void {
    borrar(almacen)
    pantalla = "intro"
    partida = null
    paso = null
    tarjeta = null
    error = null
    aviso = null
    personaje = null
    modalidad = null
    seed = ""
    estadoGuardado = "ninguno"
  }

  function continuarPartida(): void {
    const resultado = cargar(almacen)
    if (resultado.descartado) {
      aviso = AVISO_GUARDADO_DESCARTADO
      estadoGuardado = "ninguno"
      pantalla = "intro"
      return
    }
    if (!resultado.partida) {
      estadoGuardado = "ninguno"
      pantalla = "intro"
      return
    }
    partida = resultado.partida
    error = null
    aviso = null
    refrescarPaso()
  }

  function codigo(): string | null {
    return tarjeta ? codificar(tarjeta) : null
  }

  return {
    get pantalla() {
      return pantalla
    },
    get partida() {
      return partida
    },
    get personaje() {
      return personaje
    },
    get paso() {
      return paso
    },
    get tarjeta() {
      return tarjeta
    },
    get error() {
      return error
    },
    get aviso() {
      return aviso
    },
    get estadoGuardado() {
      return estadoGuardado
    },
    get modalidad() {
      return modalidad
    },
    empezar,
    crearPersonaje,
    elegirModalidad,
    elegirVariante,
    elegirOpcion,
    elegirVarianteCambio,
    continuar,
    reiniciar,
    continuarPartida,
    codigo,
  }
}
