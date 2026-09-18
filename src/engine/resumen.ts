import { indiceFase } from "./coac"
import type { FaseCOAC, Partida, ResumenCarrera } from "./types"

/** Resumen mínimo de carrera. Nunca incluye el destino (FR-002, US4). */
export function construirResumen(p: Partida): ResumenCarrera {
  let mejorFase: FaseCOAC = "preliminares"
  for (const t of p.temporadas) {
    if (!t.fueraDeConcurso && indiceFase(t.fase) > indiceFase(mejorFase)) {
      mejorFase = t.fase
    }
  }
  return {
    nombre: p.personaje.nombre,
    modalidad: p.modalidad,
    variante: p.variante,
    anosEnActivos: p.temporadas.length,
    mejorFase,
    premios: p.premios,
  }
}
