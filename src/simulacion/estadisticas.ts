import type { Atributo, BancoContenido } from "../engine/index"
import { ATRIBUTOS, indiceFase } from "../engine/index"
import type {
  AtributoResumen,
  Distribucion,
  ErrorAgregable,
  InformeSimulacion,
  MetricasAgregadas,
  MetricasPrincipales,
  RegistroCarrera,
  SituacionFrecuencia,
} from "./tipos"

function porcentaje(n: number, total: number): number {
  return total === 0 ? 0 : (n / total) * 100
}

function distribucion(claves: string[]): Distribucion {
  const conteo = new Map<string, number>()
  for (const clave of claves) conteo.set(clave, (conteo.get(clave) ?? 0) + 1)
  const total = claves.length
  const salida: Distribucion = {}
  const ordenadas = [...conteo.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )
  for (const [clave, n] of ordenadas) {
    salida[clave] = { n, pct: porcentaje(n, total) }
  }
  return salida
}

function sumaPct(
  registros: RegistroCarrera[],
  pred: (r: RegistroCarrera) => boolean,
): number {
  return porcentaje(registros.filter(pred).length, registros.length)
}

function media(
  registros: RegistroCarrera[],
  valor: (r: RegistroCarrera) => number,
): number {
  if (registros.length === 0) return 0
  let total = 0
  for (const r of registros) total += valor(r)
  return total / registros.length
}

function premiosPorTipo(registros: RegistroCarrera[]): Record<string, number> {
  const conteo = new Map<string, number>()
  for (const r of registros) {
    for (const premio of r.premios) {
      conteo.set(premio.tipo, (conteo.get(premio.tipo) ?? 0) + 1)
    }
  }
  const salida: Record<string, number> = {}
  for (const clave of [...conteo.keys()].sort()) {
    salida[clave] = conteo.get(clave) ?? 0
  }
  return salida
}

function metricasPrincipales(
  registros: RegistroCarrera[],
): MetricasPrincipales {
  return {
    n: registros.length,
    pisanFinal: sumaPct(registros, (r) => r.mejorFase === "final"),
    distribucionMejorFase: distribucion(
      registros.map((r) => (r.participo ? r.mejorFase : "no_concurso")),
    ),
    mediaPrimerosPremios: media(registros, (r) => r.primerosPremios),
    carrerasConPremio: sumaPct(registros, (r) => r.premios.length > 0),
    duracionMedia: media(registros, (r) => r.duracion),
  }
}

function metricasAgregadas(registros: RegistroCarrera[]): MetricasAgregadas {
  return {
    ...metricasPrincipales(registros),
    noSuperanCuartos: sumaPct(
      registros,
      (r) => r.participo && indiceFase(r.mejorFase) <= indiceFase("cuartos"),
    ),
    noSuperanPreliminares: sumaPct(
      registros,
      (r) => r.participo && r.mejorFase === "preliminares",
    ),
    noConcurso: sumaPct(registros, (r) => !r.participo),
    premiosPorTipo: premiosPorTipo(registros),
  }
}

function agrupar(
  registros: RegistroCarrera[],
  clave: (r: RegistroCarrera) => string,
): Map<string, RegistroCarrera[]> {
  const grupos = new Map<string, RegistroCarrera[]>()
  for (const r of registros) {
    const k = clave(r)
    const lista = grupos.get(k) ?? []
    lista.push(r)
    grupos.set(k, lista)
  }
  return grupos
}

function resumenAtributos(
  registros: RegistroCarrera[],
): Record<Atributo, AtributoResumen> {
  const salida = {} as Record<Atributo, AtributoResumen>
  for (const atributo of ATRIBUTOS) {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    let total = 0
    for (const r of registros) {
      const valor = r.atributosFinales[atributo]
      if (valor < min) min = valor
      if (valor > max) max = valor
      total += valor
    }
    salida[atributo] = {
      min: registros.length === 0 ? 0 : min,
      max: registros.length === 0 ? 0 : max,
      media: registros.length === 0 ? 0 : total / registros.length,
    }
  }
  return salida
}

function frecuenciaSituaciones(
  registros: RegistroCarrera[],
  banco: BancoContenido,
): InformeSimulacion["situaciones"] {
  const conteo = new Map<string, number>()
  let totalDecisiones = 0
  for (const r of registros) {
    for (const id of r.situacionesVistas) {
      conteo.set(id, (conteo.get(id) ?? 0) + 1)
      totalDecisiones += 1
    }
  }
  const todos = banco.situaciones.map((s) => s.id)
  const nuncaVistas = [...new Set(todos)].filter(
    (id) => (conteo.get(id) ?? 0) === 0,
  )
  const vistas: SituacionFrecuencia[] = [...conteo.entries()].map(
    ([id, n]) => ({
      id,
      n,
      pct: porcentaje(n, totalDecisiones),
    }),
  )
  const masFrecuentes = [...vistas]
    .sort((a, b) => b.n - a.n || a.id.localeCompare(b.id))
    .slice(0, 10)
  const menosFrecuentes = [...vistas]
    .sort((a, b) => a.n - b.n || a.id.localeCompare(b.id))
    .slice(0, 10)
  return { totalDecisiones, masFrecuentes, menosFrecuentes, nuncaVistas }
}

function condicionales(
  registros: RegistroCarrera[],
  banco: BancoContenido,
): InformeSimulacion["condicionales"] {
  const disparados = new Set<string>()
  for (const r of registros) {
    for (const id of r.situacionesVistas) disparados.add(id)
  }
  const ids = (banco.condicionales ?? []).map((c) => c.id)
  return {
    disparados: ids.filter((id) => disparados.has(id)).sort(),
    nuncaDisparados: ids.filter((id) => !disparados.has(id)).sort(),
  }
}

function erroresAgregados(registros: RegistroCarrera[]): ErrorAgregable[] {
  const conteo = new Map<string, number>()
  for (const r of registros) {
    for (const error of r.errores) {
      conteo.set(error.codigo, (conteo.get(error.codigo) ?? 0) + error.n)
    }
  }
  return [...conteo.entries()]
    .map(([codigo, n]) => ({ codigo, n }))
    .sort((a, b) => a.codigo.localeCompare(b.codigo))
}

export function construirInforme(args: {
  registros: RegistroCarrera[]
  banco: BancoContenido
  seedBase: string
  perfiles: string[]
  configuraciones: string[]
}): InformeSimulacion {
  const { registros, banco, seedBase, perfiles, configuraciones } = args
  const agregado = metricasAgregadas(registros)
  const errores = erroresAgregados(registros)

  const porPerfil: Record<string, MetricasAgregadas> = {}
  for (const [id, grupo] of agrupar(registros, (r) => r.perfilId)) {
    porPerfil[id] = metricasAgregadas(grupo)
  }

  const porConfiguracion: Record<string, MetricasPrincipales> = {}
  for (const [id, grupo] of agrupar(registros, (r) => r.configuracionId)) {
    porConfiguracion[id] = metricasPrincipales(grupo)
  }

  return {
    meta: {
      n: registros.length,
      seedBase,
      perfiles,
      configuraciones,
      generadoConError: errores.length > 0,
      usoInterno: true,
    },
    fases: {
      pisanFinal: agregado.pisanFinal,
      noSuperanCuartos: agregado.noSuperanCuartos,
      noSuperanPreliminares: agregado.noSuperanPreliminares,
      noConcurso: agregado.noConcurso,
      distribucion: agregado.distribucionMejorFase,
    },
    premios: {
      mediaPrimerosPremios: agregado.mediaPrimerosPremios,
      totalPrimerosPremios: registros.reduce(
        (s, r) => s + r.primerosPremios,
        0,
      ),
      porTipo: agregado.premiosPorTipo,
      carrerasConPremio: agregado.carrerasConPremio,
      acumuladoPrimeros: {
        alMenos1: sumaPct(registros, (r) => r.primerosPremios >= 1),
        alMenos3: sumaPct(registros, (r) => r.primerosPremios >= 3),
        alMenos5: sumaPct(registros, (r) => r.primerosPremios >= 5),
        alMenos10: sumaPct(registros, (r) => r.primerosPremios >= 10),
        alMenos15: sumaPct(registros, (r) => r.primerosPremios >= 15),
      },
    },
    duracionMedia: agregado.duracionMedia,
    anosPico: distribucion(registros.map((r) => String(r.anoPico))),
    situaciones: frecuenciaSituaciones(registros, banco),
    condicionales: condicionales(registros, banco),
    atributos: resumenAtributos(registros),
    estadosImposibles: registros.flatMap((r) => r.hallazgos),
    porPerfil,
    porConfiguracion,
    errores,
  }
}
