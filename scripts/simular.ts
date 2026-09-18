// Simulador masivo de balance. Uso: npm run simular [n]
// NOTA: usa el banco de fixtures (el banco real de content llega en su feature).

import { bancoPrueba, inputPrueba } from "../src/engine/__tests__/fixtures"
import type { CrearPartidaInput, FaseCOAC, Partida } from "../src/engine/index"
import {
  continuar,
  crearPartida,
  elegir,
  FASES_COAC,
  indiceFase,
  rngPara,
  siguientePaso,
} from "../src/engine/index"

const TOTAL = Number.parseInt(process.argv[2] ?? "10000", 10)

function jugar(input: CrearPartidaInput): Partida {
  let p = crearPartida(input, bancoPrueba)
  let step = 0
  while (step++ < 5000) {
    const paso = siguientePaso(p, bancoPrueba)
    if (paso.tipo === "fin") return p
    if (paso.tipo === "error") throw new Error(JSON.stringify(paso.error))
    if (paso.tipo === "resultado") {
      p = continuar(p)
      continue
    }
    const opciones = paso.situacion.opciones
    const rng = rngPara(input.seed, "jugador", step)
    const opcion = opciones[Math.floor(rng() * opciones.length)]
    const res = elegir(p, opcion.id, bancoPrueba)
    if (!res.ok) throw new Error(JSON.stringify(res.error))
    p = res.valor
  }
  throw new Error("carrera sin terminar")
}

const fases = new Map<FaseCOAC, number>()
let pisanFinal = 0
let gananPrimerPremio = 0
const premiosPorTipo = new Map<string, number>()
const inicio = performance.now()

for (let i = 0; i < TOTAL; i++) {
  const fin = jugar({ ...inputPrueba, seed: `sim-${i}` })
  let mejorIdx = 0
  let gano = false
  for (const t of fin.temporadas) {
    if (!t.fueraDeConcurso) mejorIdx = Math.max(mejorIdx, indiceFase(t.fase))
    if (t.premios.length > 0) gano = true
    for (const pr of t.premios)
      premiosPorTipo.set(pr.tipo, (premiosPorTipo.get(pr.tipo) ?? 0) + 1)
  }
  const mejor = FASES_COAC[mejorIdx]
  fases.set(mejor, (fases.get(mejor) ?? 0) + 1)
  if (mejor === "final") pisanFinal++
  if (gano) gananPrimerPremio++
}

const ms = performance.now() - inicio
const pct = (n: number) => `${((n / TOTAL) * 100).toFixed(1)}%`

console.log(`Carreras: ${TOTAL} en ${ms.toFixed(0)} ms`)
console.log(`Pisan la final: ${pct(pisanFinal)}`)
console.log(`Con al menos un premio ajeno: ${pct(gananPrimerPremio)}`)
console.log("Distribución de mejor fase:")
for (const [fase, n] of fases) console.log(`  ${fase}: ${pct(n)}`)
console.log("Premios ajenos repartidos:")
for (const [tipo, n] of premiosPorTipo) console.log(`  ${tipo}: ${n}`)
