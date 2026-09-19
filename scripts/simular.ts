import { writeFileSync } from "node:fs"
import { bancoContenido } from "../src/content"
import type { PerfilJugador } from "../src/simulacion/index"
import {
  formatearInforme,
  informeAJson,
  PERFILES_POR_DEFECTO,
  simular,
} from "../src/simulacion/index"

const MAX_CARRERAS = 100_000

const AYUDA = `Uso: npm run simular -- [N] [opciones]

  N                      Numero de carreras (por defecto 10000; max 100000)
  --seed <base>          Semilla base (por defecto "sim")
  --json <ruta>          Vuelca el informe completo a un archivo JSON
  --perfiles <a,b,...>   Perfiles a usar (${PERFILES_POR_DEFECTO.map((p) => p.id).join(", ")})
  --quiet                Omite el informe de texto
  --help                 Muestra esta ayuda

Codigos de salida: 0 ok | 1 errores de contenido/motor | 2 argumentos invalidos`

interface Argumentos {
  n: number
  seedBase: string
  json?: string
  perfiles: PerfilJugador[]
  quiet: boolean
}

function error(mensaje: string): never {
  console.error(`Error: ${mensaje}`)
  process.exit(2)
}

function parsear(argv: string[]): Argumentos | "help" {
  let n = 10_000
  let seedBase = "sim"
  let json: string | undefined
  let quiet = false
  let posicional: string | undefined
  const ids: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") return "help"
    if (arg === "--quiet") {
      quiet = true
      continue
    }
    if (arg === "--seed") {
      seedBase = argv[++i] ?? error("--seed requiere un valor")
      continue
    }
    if (arg === "--json") {
      json = argv[++i] ?? error("--json requiere una ruta")
      continue
    }
    if (arg === "--perfiles") {
      const valor = argv[++i]
      if (!valor) error("--perfiles requiere al menos un id")
      ids.push(
        ...valor
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      )
      continue
    }
    if (arg.startsWith("--")) error(`argumento desconocido: ${arg}`)
    if (posicional === undefined) posicional = arg
    else error(`argumento de sobra: ${arg}`)
  }

  if (posicional !== undefined) {
    const valor = Number(posicional)
    if (!Number.isInteger(valor) || valor < 1 || valor > MAX_CARRERAS) {
      error(
        `numero de carreras invalido: ${posicional} (entero entre 1 y ${MAX_CARRERAS})`,
      )
    }
    n = valor
  }

  const perfiles =
    ids.length === 0
      ? [...PERFILES_POR_DEFECTO]
      : ids.map((id) => {
          const perfil = PERFILES_POR_DEFECTO.find((p) => p.id === id)
          if (!perfil) error(`perfil desconocido: ${id}`)
          return perfil
        })

  return { n, seedBase, json, perfiles, quiet }
}

const parseado = parsear(process.argv.slice(2))
if (parseado === "help") {
  console.log(AYUDA)
  process.exit(0)
}

const inicio = performance.now()
const informe = simular({
  banco: bancoContenido,
  n: parseado.n,
  seedBase: parseado.seedBase,
  perfiles: parseado.perfiles,
})
const ms = performance.now() - inicio

if (!parseado.quiet) {
  console.log(formatearInforme(informe))
  console.log(`\nTiempo: ${ms.toFixed(0)} ms`)
}
if (parseado.json) {
  writeFileSync(parseado.json, informeAJson(informe), "utf8")
  if (!parseado.quiet) console.log(`Informe JSON: ${parseado.json}`)
}

process.exit(informe.meta.generadoConError ? 1 : 0)
