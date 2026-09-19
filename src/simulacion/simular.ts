import { CONFIGURACIONES_POR_DEFECTO } from "./configuraciones"
import { construirInforme } from "./estadisticas"
import { jugarCarrera } from "./jugar"
import { PERFILES_POR_DEFECTO } from "./perfiles"
import type {
  InformeSimulacion,
  OpcionesSimulacion,
  RegistroCarrera,
} from "./tipos"

export function simular(opciones: OpcionesSimulacion): InformeSimulacion {
  const perfiles = opciones.perfiles ?? [...PERFILES_POR_DEFECTO]
  const configuraciones = opciones.configuraciones ?? [
    ...CONFIGURACIONES_POR_DEFECTO,
  ]
  if (perfiles.length === 0) throw new Error("Se requiere al menos un perfil")
  if (configuraciones.length === 0) {
    throw new Error("Se requiere al menos una configuracion")
  }

  const registros: RegistroCarrera[] = []
  for (let i = 0; i < opciones.n; i++) {
    const perfil = perfiles[i % perfiles.length]
    const configuracion =
      configuraciones[Math.floor(i / perfiles.length) % configuraciones.length]
    registros.push(
      jugarCarrera({
        input: {
          seed: `${opciones.seedBase}-${i}`,
          personaje: {
            nombre: configuracion.id,
            edad: configuracion.edad,
            localidad: configuracion.localidad,
            genero: configuracion.genero,
          },
          modalidad: configuracion.modalidad,
          variante: configuracion.variante,
        },
        banco: opciones.banco,
        perfil,
        configuracionId: configuracion.id,
        parametros: opciones.parametros,
      }),
    )
  }

  return construirInforme({
    registros,
    banco: opciones.banco,
    seedBase: opciones.seedBase,
    perfiles: perfiles.map((p) => p.id),
    configuraciones: configuraciones.map((c) => c.id),
  })
}
