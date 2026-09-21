import type { CatalogoVariante, FaseCOAC, Modalidad } from "../engine/index"
import { ATRIBUTO_MAX, ATRIBUTO_MIN } from "../engine/index"
import { mejorFaseDe } from "./comun"
import { esCrack, rachaMaxima } from "./forma-carrera"
import type {
  HallazgoEstadoImposible,
  RegistroCarrera,
  ReglaEstadoImposible,
} from "./tipos"

/**
 * A partir de cuántos años seguidos con la misma posición la carrera es plana.
 * Es la regresión que la feature 013 elimina: con el motor anterior toda una
 * carrera de 20 años caía en la misma posición.
 */
export const UMBRAL_RACHA_PLANA = 8

export const REGLAS_ESTADO_IMPOSIBLE: readonly ReglaEstadoImposible[] = [
  "premioSinConcurso",
  "temporadasExcedidas",
  "mejorFaseIncoherente",
  "flagConsumidaSinRegistro",
  "atributoFueraDeRango",
  "puestoIncoherente",
  "temporadasDesordenadas",
  "premioAnoInexistente",
  "finIncoherente",
  "modalidadVarianteInvalida",
  "faseEnNoConcurso",
  "composicionAnualIncorrecta",
  "saltaCOACIncoherente",
  "trayectoriaIncoherente",
  "varianteInvalida",
  "tarjetaIncoherente",
  "carreraPlana",
] as const

const BANDAS: Record<FaseCOAC, readonly [number, number]> = {
  final: [1, 4],
  semifinales: [5, 10],
  cuartos: [11, 16],
  preliminares: [17, 50],
}

const MODALIDADES: readonly Modalidad[] = ["comparsista", "chirigotero"]

export function auditarCarrera(
  registro: RegistroCarrera,
  catalogoVariantes?: readonly CatalogoVariante[],
  umbralRachaPlana: number = UMBRAL_RACHA_PLANA,
): HallazgoEstadoImposible[] {
  const p = registro.partida
  const hallazgos: HallazgoEstadoImposible[] = []
  const add = (regla: ReglaEstadoImposible, detalle: string) => {
    hallazgos.push({
      regla,
      seed: registro.seed,
      perfilId: registro.perfilId,
      detalle,
    })
  }

  const racha = rachaMaxima(registro.secuencia)
  if (!esCrack(registro) && racha > umbralRachaPlana) {
    add("carreraPlana", `${racha} anos con la misma posicion`)
  }

  for (const premio of p.premios) {
    const temporada = p.temporadas.find((t) => t.ano === premio.ano)
    if (!temporada) add("premioAnoInexistente", `${premio.tipo}@${premio.ano}`)
    else if (temporada.fueraDeConcurso)
      add("premioSinConcurso", `${premio.tipo}@${premio.ano}`)
  }

  if (p.temporadas.length > p.destino.anosCarrera) {
    add(
      "temporadasExcedidas",
      `${p.temporadas.length}>${p.destino.anosCarrera}`,
    )
  }

  const mejor = mejorFaseDe(p)
  if (registro.mejorFase !== mejor) {
    add("mejorFaseIncoherente", `${registro.mejorFase}!==${mejor}`)
  }

  const introducidas = new Set(registro.decisiones.flatMap((d) => d.flags))
  for (const [id, flag] of Object.entries(p.flags)) {
    if (flag.consumida && !introducidas.has(id)) {
      add("flagConsumidaSinRegistro", id)
    }
  }

  for (const [atributo, valor] of Object.entries(p.atributos)) {
    if (valor < ATRIBUTO_MIN || valor > ATRIBUTO_MAX) {
      add("atributoFueraDeRango", `${atributo}=${valor}`)
    }
  }

  for (const t of p.temporadas) {
    if (t.fueraDeConcurso) {
      if (t.puesto !== undefined) add("puestoIncoherente", `puesto@${t.ano}`)
      if (t.fase !== "preliminares")
        add("faseEnNoConcurso", `${t.fase}@${t.ano}`)
      continue
    }
    const banda = BANDAS[t.fase]
    if (t.puesto === undefined || t.puesto < banda[0] || t.puesto > banda[1]) {
      add("puestoIncoherente", `${t.puesto}@${t.ano}(${t.fase})`)
    }
  }

  for (let i = 0; i < p.temporadas.length; i++) {
    const esperado = p.anoInicio + i
    if (p.temporadas[i].ano !== esperado) {
      add(
        "temporadasDesordenadas",
        `pos ${i}: ${p.temporadas[i].ano}!=${esperado}`,
      )
      break
    }
  }

  if (p.fase === "fin" && p.resultadoPendiente !== null) {
    add("finIncoherente", "fin con resultado pendiente")
  }

  if (!MODALIDADES.includes(p.modalidad)) {
    add("modalidadVarianteInvalida", `modalidad=${p.modalidad}`)
  }
  if (!p.variante) add("modalidadVarianteInvalida", "variante vacia")

  const catalogo = catalogoVariantes ?? []
  const enCatalogo = (variante: string, modalidad: Modalidad) =>
    catalogo.some((v) => v.id === variante && v.modalidad === modalidad)
  // Mientras se elige la variante, el valor vigente es el antiguo (aún no válido).
  if (catalogo.length > 0 && p.fase !== "variante") {
    if (!enCatalogo(p.variante, p.modalidad)) {
      add("varianteInvalida", `${p.variante}@${p.modalidad}`)
    }
    for (const cambio of p.trayectoria.cambios) {
      if (!enCatalogo(cambio.variante, cambio.modalidad)) {
        add(
          "varianteInvalida",
          `cambio ${cambio.variante}@${cambio.modalidad}(${cambio.ano})`,
        )
      }
    }
  }

  const cambios = p.trayectoria.cambios
  if (cambios.length === 0) {
    if (
      p.modalidad !== p.trayectoria.modalidadInicial ||
      p.variante !== p.trayectoria.varianteInicial
    ) {
      add(
        "trayectoriaIncoherente",
        "sin cambios pero estado distinto del inicial",
      )
    }
  } else {
    const ultimo = cambios[cambios.length - 1]
    if (ultimo.modalidad !== p.modalidad || ultimo.variante !== p.variante) {
      add(
        "trayectoriaIncoherente",
        `ultimo ${ultimo.modalidad}/${ultimo.variante} != ${p.modalidad}/${p.variante}`,
      )
    }
    for (let i = 1; i < cambios.length; i++) {
      if (cambios[i].ano < cambios[i - 1].ano) {
        add("trayectoriaIncoherente", `anos desordenados en pos ${i}`)
        break
      }
    }
  }

  const porAno = new Map<number, typeof registro.decisiones>()
  for (const d of registro.decisiones) {
    const lista = porAno.get(d.ano) ?? []
    lista.push(d)
    porAno.set(d.ano, lista)
  }
  for (const [ano, ds] of porAno) {
    const contenido = ds.filter((d) => d.tipo === "contenido").length
    const personaje = ds.filter((d) => d.tipo === "personaje").length
    if (contenido > 1 || personaje > 1) {
      add(
        "composicionAnualIncorrecta",
        `ano ${ano}: contenido=${contenido} personaje=${personaje}`,
      )
    }
    if (ds.length === 2) {
      const verano = ds.filter((d) => d.momento === "verano").length
      const febrero = ds.filter((d) => d.momento === "febrero").length
      if (verano !== 1 || febrero !== 1) {
        add(
          "composicionAnualIncorrecta",
          `ano ${ano}: verano=${verano} febrero=${febrero}`,
        )
      }
    }
  }

  for (const t of p.temporadas) {
    if (!t.fueraDeConcurso) continue
    const salto = registro.decisiones.some(
      (d) => d.ano === t.ano && d.saltaCOAC,
    )
    if (!salto) add("saltaCOACIncoherente", `ano ${t.ano} fuera sin saltaCOAC`)
  }

  const tarjeta = registro.tarjeta
  if (tarjeta) {
    if (tarjeta.hitos.length !== 3) {
      add("tarjetaIncoherente", `hitos=${tarjeta.hitos.length}`)
    }
    const clavesOcultas = [
      "destino",
      "techo",
      "suelo",
      "anoPico",
      "anosCarrera",
      "volatilidad",
      "carisma",
      "milagro",
    ]
    const claves = Object.keys(tarjeta)
    for (const clave of clavesOcultas) {
      if (claves.includes(clave))
        add("tarjetaIncoherente", `clave oculta ${clave}`)
    }
    for (const premio of tarjeta.otrosPremios) {
      if (premio.veces <= 0) {
        add("tarjetaIncoherente", `premio ${premio.tipo} veces=${premio.veces}`)
      }
    }
  }

  return hallazgos
}
