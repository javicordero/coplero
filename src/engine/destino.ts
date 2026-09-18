import type { ParametrosMotor } from "./parametros"
import { elegirPonderado, rngPara } from "./seed"
import type { Destino, FaseCOAC, Personaje } from "./types"
import { FASES_COAC } from "./types"

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
  const techo = elegirPonderado<FaseCOAC>(
    rng,
    FASES_COAC.map((fase) => ({ valor: fase, peso: params.pesosTecho[fase] })),
  )
  const anosCarrera = params.anosCarreraPorDefecto
  const anoPico = 2 + Math.floor(rng() * Math.max(1, anosCarrera - 3))
  const volatilidad =
    params.volatilidadMin +
    rng() * (params.volatilidadMax - params.volatilidadMin)
  return {
    techo,
    suelo: "preliminares",
    anoPico,
    anosCarrera,
    volatilidad,
    carisma: carismaBase(personaje, params),
  }
}
