import type { ParametrosMotor } from "./parametros"
import { elegirPonderado, rngPara } from "./seed"
import type { Destino, NivelCOAC, Personaje } from "./types"
import { NIVELES_COAC } from "./types"

function carismaBase(personaje: Personaje, params: ParametrosMotor): number {
  const localidad = personaje.localidad.trim().toLowerCase()
  let carisma = 0
  for (const [clave, valor] of Object.entries(
    params.modificadoresCreacion.carismaPorLocalidad,
  )) {
    if (localidad.includes(clave)) {
      carisma += valor
      break
    }
  }
  return carisma
}

/** Genera el destino oculto de forma determinista desde la semilla. */
export function generarDestino(
  seed: string,
  personaje: Personaje,
  params: ParametrosMotor,
): Destino {
  const rng = rngPara(seed, "destino")
  const techo = elegirPonderado<NivelCOAC>(
    rng,
    NIVELES_COAC.map((nivel) => ({
      valor: nivel,
      peso: params.pesosTecho[nivel],
    })),
  )
  const anosCarrera = params.anosCarreraPorDefecto
  const anoPico = 2 + Math.floor(rng() * Math.max(1, anosCarrera - 3))
  const volatilidad =
    params.volatilidadMin +
    rng() * (params.volatilidadMax - params.volatilidadMin)
  const milagro = rng() < params.milagro
  const crack = rng() < params.probabilidadCrack
  return {
    techo,
    suelo: "preliminares",
    anoPico,
    anosCarrera,
    volatilidad,
    carisma: carismaBase(personaje, params) + (crack ? params.bonusCrack : 0),
    milagro,
  }
}
