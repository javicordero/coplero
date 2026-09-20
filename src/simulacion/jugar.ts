import type {
  BancoContenido,
  CrearPartidaInput,
  ParametrosMotor,
  Paso,
  Situacion,
} from "../engine/index"
import {
  continuar,
  crearPartida,
  elegir,
  elegirVarianteDeCambio,
  rngPara,
  siguientePaso,
} from "../engine/index"
import { auditarCarrera } from "./auditoria"
import { mejorFaseDe, participoAlgunaVez } from "./comun"
import type {
  DecisionRegistrada,
  ErrorAgregable,
  PerfilJugador,
  RegistroCarrera,
} from "./tipos"

const MAX_PASOS = 100_000

function anotarError(errores: ErrorAgregable[], codigo: string): void {
  const previo = errores.find((e) => e.codigo === codigo)
  if (previo) previo.n += 1
  else errores.push({ codigo, n: 1 })
}

function situacionCompleta(
  banco: BancoContenido,
  id: string,
): Situacion | undefined {
  return (
    banco.situaciones.find((s) => s.id === id) ??
    banco.condicionales?.find((c) => c.id === id)
  )
}

export function jugarCarrera(args: {
  input: CrearPartidaInput
  banco: BancoContenido
  perfil: PerfilJugador
  configuracionId: string
  parametros?: Partial<ParametrosMotor>
}): RegistroCarrera {
  const { input, banco, perfil, configuracionId, parametros } = args
  let p = crearPartida(input, banco, parametros)
  const decisiones: DecisionRegistrada[] = []
  const situacionesVistas: string[] = []
  const errores: ErrorAgregable[] = []
  let pasos = 0

  try {
    while (pasos < MAX_PASOS) {
      pasos += 1
      const paso: Paso = siguientePaso(p, banco)
      if (paso.tipo === "fin") break
      if (paso.tipo === "error") {
        anotarError(errores, paso.error.codigo)
        break
      }
      if (paso.tipo === "resultado") {
        p = continuar(p)
        continue
      }
      if (paso.tipo === "variante") {
        const opciones = (banco.variantes ?? []).filter(
          (v) => v.modalidad === paso.modalidad,
        )
        if (opciones.length === 0) {
          anotarError(errores, "VARIANTE_INVALIDA")
          break
        }
        const rngVariante = rngPara(p.seed, "variante-cambio", p.contador)
        const elegida = opciones[Math.floor(rngVariante() * opciones.length)]
        const resVariante = elegirVarianteDeCambio(p, elegida.id, banco)
        if (!resVariante.ok) {
          anotarError(errores, resVariante.error.codigo)
          break
        }
        p = resVariante.valor
        continue
      }

      situacionesVistas.push(paso.situacion.id)
      const situacion = situacionCompleta(banco, paso.situacion.id)
      if (!situacion) {
        anotarError(errores, "CONTENIDO_INSUFICIENTE")
        break
      }

      const rng = rngPara(p.seed, "jugador", perfil.id, p.contador)
      const opcionId = perfil.elegir({ paso, situacion, partida: p, rng })
      const opcion = situacion.opciones.find((o) => o.id === opcionId)
      if (!opcion) {
        anotarError(errores, "OPCION_INVALIDA")
        break
      }

      const resultado = elegir(p, opcionId, banco, parametros)
      if (!resultado.ok) {
        anotarError(errores, resultado.error.codigo)
        break
      }

      decisiones.push({
        ano: p.anoActual,
        momento: p.momento,
        tipo: situacion.tipo,
        situacionId: situacion.id,
        opcionId: opcion.id,
        flags: opcion.flags ?? [],
        consume: opcion.consume ?? [],
        saltaCOAC: opcion.saltaCOAC === true,
      })
      p = resultado.valor
    }
    if (pasos >= MAX_PASOS) anotarError(errores, "BUCLE_INFINITO")
  } catch {
    anotarError(errores, "EXCEPCION")
  }

  const registro: RegistroCarrera = {
    seed: input.seed,
    perfilId: perfil.id,
    configuracionId,
    partida: p,
    decisiones,
    situacionesVistas,
    errores,
    mejorFase: mejorFaseDe(p),
    participo: participoAlgunaVez(p),
    duracion: p.temporadas.length,
    primerosPremios: p.temporadas.filter(
      (t) => !t.fueraDeConcurso && t.fase === "final" && t.puesto === 1,
    ).length,
    premios: p.premios,
    atributosFinales: p.atributos,
    anoPico: p.destino.anoPico,
    hallazgos: [],
  }
  registro.hallazgos = auditarCarrera(registro, banco.variantes)
  return registro
}
