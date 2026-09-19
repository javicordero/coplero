import type { FaseCOAC, Partida } from "../engine/index"
import { indiceFase } from "../engine/index"

export function mejorFaseDe(p: Partida): FaseCOAC {
  let mejor: FaseCOAC | null = null
  for (const t of p.temporadas) {
    if (t.fueraDeConcurso) continue
    if (mejor === null || indiceFase(t.fase) > indiceFase(mejor)) {
      mejor = t.fase
    }
  }
  return mejor ?? "preliminares"
}

export function participoAlgunaVez(p: Partida): boolean {
  return p.temporadas.some((t) => !t.fueraDeConcurso)
}
