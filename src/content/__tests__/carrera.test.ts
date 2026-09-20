import { describe, expect, it } from "vitest"
import {
  continuar,
  crearPartida,
  elegir,
  elegirVarianteDeCambio,
  siguientePaso,
} from "../../engine/index"
import { CONFIGURACIONES_POR_DEFECTO } from "../../simulacion/index"
import { bancoContenido } from "../index"

function jugar(config: (typeof CONFIGURACIONES_POR_DEFECTO)[number]) {
  let partida = crearPartida(
    {
      seed: `carrera-${config.id}`,
      personaje: {
        nombre: "Prueba",
        edad: config.edad,
        localidad: config.localidad,
        genero: config.genero,
      },
      modalidad: config.modalidad,
      variante: config.variante,
    },
    bancoContenido,
  )
  let pasos = 0
  while (partida.fase !== "fin" && pasos < 1000) {
    const paso = siguientePaso(partida, bancoContenido)
    if (paso.tipo === "error") {
      throw new Error(
        `contenido insuficiente: ${paso.error.codigo} (${partida.momento}/${partida.anoActual})`,
      )
    }
    if (paso.tipo === "decision") {
      const resultado = elegir(
        partida,
        paso.situacion.opciones[0].id,
        bancoContenido,
      )
      if (!resultado.ok) {
        throw new Error(`decisión inválida: ${JSON.stringify(resultado.error)}`)
      }
      partida = resultado.valor
    } else if (paso.tipo === "resultado") {
      partida = continuar(partida)
    } else if (paso.tipo === "variante") {
      const validas = (bancoContenido.variantes ?? []).filter(
        (v) => v.modalidad === paso.modalidad,
      )
      const resultado = elegirVarianteDeCambio(
        partida,
        validas[0].id,
        bancoContenido,
      )
      if (!resultado.ok) {
        throw new Error(`variante inválida: ${JSON.stringify(resultado.error)}`)
      }
      partida = resultado.valor
    }
    pasos += 1
  }
  return partida
}

describe("carrera completa con el banco real (SC-001)", () => {
  for (const config of CONFIGURACIONES_POR_DEFECTO) {
    it(`se juega entera como ${config.id}`, () => {
      const partida = jugar(config)
      expect(partida.fase).toBe("fin")
      expect(partida.temporadas.length).toBeGreaterThan(0)
    })
  }
})
