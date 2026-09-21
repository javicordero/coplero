import { aplicarEfectos } from "./atributos"
import { resolverCoac } from "./coac"
import { actualizarFlags, consumirFlagsDeRequisito } from "./condicionales"
import { generarDestino } from "./destino"
import type { ParametrosMotor } from "./parametros"
import { resolverParametros } from "./parametros"
import { resolverPremios } from "./premios"
import { rngPara } from "./seed"
import { seleccionarSituacion, tipoActual, toPublica } from "./selector"
import { construirTarjeta } from "./tarjeta"
import {
  crearTrayectoria,
  registrarCambio,
  variantePertenece,
} from "./trayectoria"
import type {
  Atributos,
  BancoContenido,
  Condicional,
  CrearPartidaInput,
  ErrorMotor,
  FaseCOAC,
  FasePartida,
  Partida,
  Paso,
  Resultado,
  ResultadoTemporada,
  Temporada,
  VarianteId,
} from "./types"
import { ANO_BASE, VERSION_PARTIDA } from "./types"

export function crearPartida(
  input: CrearPartidaInput,
  _banco: BancoContenido,
  paramsParcial?: Partial<ParametrosMotor>,
): Partida {
  const params = resolverParametros(paramsParcial)
  const inicial = params.atributosIniciales
  const atributos: Atributos = {
    letra: inicial,
    musica: inicial,
    puestaEnEscena: inicial,
    popularidad: inicial,
    cohesion: inicial,
    dinero: inicial,
  }
  const anoInicio = input.anoInicio ?? ANO_BASE
  return {
    version: VERSION_PARTIDA,
    seed: input.seed,
    personaje: input.personaje,
    modalidad: input.modalidad,
    variante: input.variante,
    anoInicio,
    anoActual: anoInicio,
    momento: "verano",
    fase: "decision",
    atributos,
    flags: {},
    vistas: [],
    historial: [],
    temporadas: [],
    premios: [],
    decisionesPorAno: input.decisionesPorAno ?? params.decisionesPorAno,
    decisionesTomadasAno: 0,
    contador: 0,
    milagroUsado: false,
    saltaTemporada: false,
    resultadoPendiente: null,
    trayectoria: crearTrayectoria(input.modalidad, input.variante),
    destino: generarDestino(input.seed, input.personaje, params),
  }
}

export function siguientePaso(p: Partida, banco: BancoContenido): Paso {
  if (p.fase === "fin") {
    return { tipo: "fin", tarjeta: construirTarjeta(p, banco) }
  }
  if (p.fase === "variante") {
    return { tipo: "variante", modalidad: p.modalidad }
  }
  if (p.fase === "coac") {
    const temporada = p.temporadas[p.temporadas.length - 1]
    if (!temporada) {
      return {
        tipo: "error",
        error: {
          codigo: "CONTENIDO_INSUFICIENTE",
          momento: p.momento,
          tipo: tipoActual(p),
        },
      }
    }
    return { tipo: "resultado", temporada }
  }
  const situacion = seleccionarSituacion(p, banco)
  if (!situacion) {
    return {
      tipo: "error",
      error: {
        codigo: "CONTENIDO_INSUFICIENTE",
        momento: p.momento,
        tipo: tipoActual(p),
      },
    }
  }
  return {
    tipo: "decision",
    momento: p.momento,
    situacion: toPublica(situacion),
  }
}

export function elegir(
  p: Partida,
  opcionId: string,
  banco: BancoContenido,
  paramsParcial?: Partial<ParametrosMotor>,
): Resultado<Partida, ErrorMotor> {
  const params = resolverParametros(paramsParcial)
  if (p.fase !== "decision") {
    return { ok: false, error: { codigo: "OPCION_INVALIDA", opcionId } }
  }
  const situacion = seleccionarSituacion(p, banco)
  if (!situacion) {
    return {
      ok: false,
      error: {
        codigo: "CONTENIDO_INSUFICIENTE",
        momento: p.momento,
        tipo: tipoActual(p),
      },
    }
  }
  const opcion = situacion.opciones.find((o) => o.id === opcionId)
  if (!opcion) {
    return { ok: false, error: { codigo: "OPCION_INVALIDA", opcionId } }
  }

  const ano = p.anoActual
  const momento = p.momento
  const cambiaModalidad =
    momento === "verano" &&
    opcion.cambiaModalidad !== undefined &&
    opcion.cambiaModalidad !== p.modalidad
      ? opcion.cambiaModalidad
      : undefined
  const cambiaVariante =
    cambiaModalidad === undefined &&
    opcion.cambiaVariante !== undefined &&
    opcion.cambiaVariante !== p.variante &&
    variantePertenece(banco.variantes, p.modalidad, opcion.cambiaVariante)
      ? opcion.cambiaVariante
      : undefined
  const atributos = aplicarEfectos(p.atributos, opcion.efectos)
  let flags = actualizarFlags(p.flags, opcion, ano)
  const esCondicional = "requiere" in situacion
  if (esCondicional && (situacion as Condicional).consumeFlag) {
    flags = consumirFlagsDeRequisito(flags, (situacion as Condicional).requiere)
  }
  const vistas = p.vistas.includes(situacion.id)
    ? p.vistas
    : [...p.vistas, situacion.id]
  const historial = [
    ...p.historial,
    {
      ano,
      momento,
      tipo: "decision" as const,
      situacionId: situacion.id,
      opcionId: opcion.id,
      descripcion: `${situacion.titulo}: ${opcion.titulo}`,
    },
  ]
  const saltaTemporada = p.saltaTemporada || opcion.saltaCOAC === true

  let resultadoPendiente: ResultadoTemporada | null = p.resultadoPendiente
  let momentoNuevo = momento
  let fase: FasePartida = p.fase
  let temporadas = p.temporadas
  let premios = p.premios
  let milagroUsado = p.milagroUsado
  const decisionesTomadasAno = p.decisionesTomadasAno + 1

  if (momento === "verano") {
    // Resultado calculado con el estado previo a la decisión de febrero (FR-024).
    if (saltaTemporada) {
      resultadoPendiente = {
        fase: "preliminares",
        puesto: 50,
        premios: [],
        fueraDeConcurso: true,
        milagro: false,
      }
    } else {
      const rng = rngPara(p.seed, "coac", ano, p.contador)
      const resolucion = resolverCoac({
        atributos,
        destino: p.destino,
        anoActual: ano,
        anoInicio: p.anoInicio,
        seed: p.seed,
        rng,
        params,
        milagroUsado: p.milagroUsado,
      })
      const premiosTemporada = resolverPremios({
        temporada: {
          fase: resolucion.fase,
          puesto: resolucion.puesto,
          fueraDeConcurso: false,
        },
        atributos,
        flags,
        ano,
        seed: p.seed,
        params,
      })
      resultadoPendiente = {
        fase: resolucion.fase,
        puesto: resolucion.puesto,
        premios: premiosTemporada,
        fueraDeConcurso: false,
        milagro: resolucion.milagro,
      }
    }
    momentoNuevo = "febrero"
    if (cambiaModalidad !== undefined) {
      fase = "variante"
    }
  } else {
    const base: ResultadoTemporada = resultadoPendiente ?? {
      fase: "preliminares",
      puesto: 50,
      premios: [],
      fueraDeConcurso: true,
      milagro: false,
    }
    const fuera = base.fueraDeConcurso || saltaTemporada
    const faseTemporada: FaseCOAC = fuera ? "preliminares" : base.fase
    const temporada: Temporada = {
      ano,
      fase: faseTemporada,
      puesto: fuera ? undefined : base.puesto,
      premios: fuera ? [] : base.premios,
      fueraDeConcurso: fuera,
    }
    temporadas = [...p.temporadas, temporada]
    premios = fuera ? p.premios : [...p.premios, ...base.premios]
    milagroUsado = p.milagroUsado || base.milagro
    resultadoPendiente = null
    fase = "coac"
  }

  return {
    ok: true,
    valor: {
      ...p,
      modalidad: cambiaModalidad ?? p.modalidad,
      variante: cambiaVariante ?? p.variante,
      atributos,
      flags,
      vistas,
      historial,
      momento: momentoNuevo,
      fase,
      decisionesTomadasAno,
      temporadas,
      premios,
      milagroUsado,
      saltaTemporada,
      resultadoPendiente,
      trayectoria: cambiaVariante
        ? registrarCambio(p.trayectoria, p.modalidad, cambiaVariante, ano)
        : p.trayectoria,
      contador: p.contador + 1,
    },
  }
}

/**
 * Resuelve la elección de variante abierta tras un cambio de modalidad.
 * Valida que la variante pertenezca a la modalidad vigente.
 */
export function elegirVarianteDeCambio(
  p: Partida,
  varianteId: VarianteId,
  banco: BancoContenido,
): Resultado<Partida, ErrorMotor> {
  if (p.fase !== "variante") {
    return {
      ok: false,
      error: { codigo: "OPCION_INVALIDA", opcionId: varianteId },
    }
  }
  if (!variantePertenece(banco.variantes, p.modalidad, varianteId)) {
    return { ok: false, error: { codigo: "VARIANTE_INVALIDA", varianteId } }
  }
  return {
    ok: true,
    valor: {
      ...p,
      variante: varianteId,
      trayectoria: registrarCambio(
        p.trayectoria,
        p.modalidad,
        varianteId,
        p.anoActual,
      ),
      fase: "decision",
      contador: p.contador + 1,
    },
  }
}

/** Avanza desde la exposición del resultado de temporada al año siguiente o al fin. */
export function continuar(p: Partida): Partida {
  if (p.fase !== "coac") return p
  const fin = p.temporadas.length >= p.destino.anosCarrera
  if (fin) {
    return { ...p, fase: "fin", decisionesTomadasAno: 0, saltaTemporada: false }
  }
  return {
    ...p,
    anoActual: p.anoActual + 1,
    momento: "verano",
    fase: "decision",
    decisionesTomadasAno: 0,
    saltaTemporada: false,
  }
}

export function resumen(p: Partida, banco: BancoContenido) {
  return construirTarjeta(p, banco)
}
