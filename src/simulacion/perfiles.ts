import type { Atributo, Opcion } from "../engine/index"
import type { ContextoDecision, PerfilJugador } from "./tipos"

const ARTISTICOS: readonly Atributo[] = ["letra", "musica", "puestaEnEscena"]

function sumaArtistica(o: Opcion): number {
  let total = 0
  for (const atributo of ARTISTICOS) {
    total += Math.max(0, o.efectos?.[atributo] ?? 0)
  }
  return total
}

function impactoTotal(o: Opcion): number {
  let total = 0
  for (const valor of Object.values(o.efectos ?? {})) {
    total += Math.abs(valor)
  }
  return total
}

function mayorPor(opciones: Opcion[], valorDe: (o: Opcion) => number): Opcion {
  let mejor = opciones[0]
  let mejorValor = Number.NEGATIVE_INFINITY
  for (const opcion of opciones) {
    const valor = valorDe(opcion)
    if (valor > mejorValor) {
      mejorValor = valor
      mejor = opcion
    }
  }
  return mejor
}

function uniforme(opciones: Opcion[], rng: () => number): Opcion {
  return opciones[
    Math.min(opciones.length - 1, Math.floor(rng() * opciones.length))
  ]
}

export const PERFIL_ALEATORIO: PerfilJugador = {
  id: "aleatorio",
  descripcion: "Elige una opción al azar de forma uniforme",
  elegir: ({ situacion, rng }: ContextoDecision) =>
    uniforme(situacion.opciones, rng).id,
}

export const PERFIL_CODICIOSO: PerfilJugador = {
  id: "codicioso",
  descripcion:
    "Maximiza los atributos artísticos (letra, música, puesta en escena)",
  elegir: ({ situacion }: ContextoDecision) =>
    mayorPor(situacion.opciones, sumaArtistica).id,
}

export const PERFIL_ERRATICO: PerfilJugador = {
  id: "erratico",
  descripcion:
    "Apuesta por el cambio de mayor impacto la mitad de las veces; si no, elige al azar",
  elegir: ({ situacion, rng }: ContextoDecision) =>
    rng() < 0.5
      ? mayorPor(situacion.opciones, impactoTotal).id
      : uniforme(situacion.opciones, rng).id,
}

export const PERFILES_POR_DEFECTO: readonly PerfilJugador[] = [
  PERFIL_ALEATORIO,
  PERFIL_CODICIOSO,
  PERFIL_ERRATICO,
]
