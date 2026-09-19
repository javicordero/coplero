import { writeFileSync } from "node:fs"
import { bancoContenido } from "../src/content"
import { construirInformeContenido } from "../src/content/informe"
import { simular } from "../src/simulacion/index"

const N_POR_DEFECTO = 10_000

const AYUDA = `Uso: npm run contenido:informe -- [opciones]

  --json <ruta>     Vuelca el informe completo a un archivo JSON
  --n <carreras>    Carreras para la deteccion por simulacion (por defecto ${N_POR_DEFECTO})
  --help            Muestra esta ayuda

Codigos de salida: 0 ok | 1 integridad rota | 2 argumentos invalidos`

interface Argumentos {
  json?: string
  n: number
}

function error(mensaje: string): never {
  console.error(`Error: ${mensaje}`)
  process.exit(2)
}

function parsear(argv: string[]): Argumentos | "help" {
  let json: string | undefined
  let n = N_POR_DEFECTO
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") return "help"
    if (arg === "--json") {
      json = argv[++i] ?? error("--json requiere una ruta")
      continue
    }
    if (arg === "--n") {
      const valor = Number(argv[++i])
      if (!Number.isInteger(valor) || valor < 1) {
        error("--n requiere un entero positivo")
      }
      n = valor
      continue
    }
    error(`argumento desconocido: ${arg}`)
  }
  return { json, n }
}

const parseado = parsear(process.argv.slice(2))
if (parseado === "help") {
  console.log(AYUDA)
  process.exit(0)
}

const estatico = construirInformeContenido(bancoContenido)
const simulacion = simular({
  banco: bancoContenido,
  n: parseado.n,
  seedBase: "informe-contenido",
})

const nuncaVistas = simulacion.situaciones.nuncaVistas
const nuncaDisparados = simulacion.condicionales.nuncaDisparados

const lineas = [
  "-- Informe del banco de contenido --",
  `Situaciones de verano: ${estatico.situacionesPorMomento.verano}`,
  `Situaciones de febrero: ${estatico.situacionesPorMomento.febrero}`,
  `Condicionales: ${estatico.totalCondicionales}`,
  "",
  `Flags declaradas (${estatico.flagsDeclaradas.length}): ${estatico.flagsDeclaradas.join(", ")}`,
  `Flags referenciadas (${estatico.flagsReferenciadas.length}): ${estatico.flagsReferenciadas.join(", ")}`,
  `  referenciadas sin declarar: ${estatico.flagsSinDeclarar.join(", ") || "ninguna"}`,
  "",
  `Inalcanzables estaticas: ${estatico.situacionesInalcanzablesEstaticas.join(", ") || "ninguna"}`,
  `Inalcanzables por simulacion (${parseado.n} carreras): ${nuncaVistas.join(", ") || "ninguna"}`,
  `Condicionales nunca disparados: ${nuncaDisparados.join(", ") || "ninguno"}`,
]

console.log(lineas.join("\n"))

if (parseado.json) {
  writeFileSync(
    parseado.json,
    `${JSON.stringify({ estatico, simulacion: { n: parseado.n, nuncaVistas, nuncaDisparados } }, null, 2)}\n`,
    "utf8",
  )
  console.log(`\nInforme JSON: ${parseado.json}`)
}

const integridadRota =
  estatico.flagsSinDeclarar.length > 0 ||
  estatico.situacionesInalcanzablesEstaticas.length > 0 ||
  nuncaVistas.length > 0 ||
  nuncaDisparados.length > 0

process.exit(integridadRota ? 1 : 0)
