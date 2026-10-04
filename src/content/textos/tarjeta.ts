// Textos de la tarjeta final (DATOS). Sin lógica de juego.
// Plantillas con marcadores opcionales: {ano}, {n} (años), {fase}.
// El motor elige una variante por tipo y sustituye los marcadores.

import type { TextosTarjeta } from "../schema"

export const TEXTOS_TARJETA: TextosTarjeta = {
  hitos: {
    ganar_coac: [
      "Levantaste el primer premio del COAC en {ano}",
      "Te llevaste el COAC en {ano}",
    ],
    podio: ["Subiste al podio del COAC en {ano}", "Podio en el COAC en {ano}"],
    final: ["Llegaste a la final del COAC en {ano}", "Finalista en {ano}"],
    premio_aguja: [
      "Aguja de oro en {ano}",
      "Te dieron la Aguja de oro en {ano}",
    ],
    premio_copla: [
      "Coplas por Andalucía en {ano}",
      "Coplas por Andalucía en {ano}",
    ],
    premio_candela: [
      "Candela y espino en {ano}",
      "Te llevaste la Candela y espino en {ano}",
    ],
    cambio_modalidad: [
      "Cambiaste de modalidad en {ano}",
      "Diste el salto de modalidad en {ano}",
    ],
    cambio_variante: [
      "Tu estilo evolucionó en {ano}",
      "Cambió tu forma de trabajar en {ano}",
    ],
    anos_sin_concursar: [
      "Un año fuera de concurso: {ano}",
      "Te quedaste sin concursar en {ano}",
    ],
    debut: ["Debutaste en {ano}", "Tu primer año en las tablas: {ano}"],
    duracion: ["{n} años de carrera", "Aguantaste {n} años en el concurso"],
    mejor_resultado: ["Tu mejor resultado fue {fase}", "Llegaste hasta {fase}"],
  },
  frases: {
    campeon: [
      "Lo tocaste todo: el COAC tiene tu nombre.",
      "Años de trabajo para acabar levantando el primer premio.",
    ],
    podio: [
      "Te quedaste a un paso, pero el podio sabe a gloria.",
      "Entre los mejores del COAC, con la copla por bandera.",
    ],
    finalista: [
      "Llegaste a la final: ya nadie te quita eso.",
      "El Falla te vio en la final y eso no se olvida.",
    ],
    semifinales: [
      "Te plantaste en semifinales y dejaste huella.",
      "Media carrera peleando hasta las semifinales.",
    ],
    cuartos: [
      "Los cuartos fueron tu casa durante años.",
      "No pasaste de cuartos, pero vaya cuartos.",
    ],
    preliminares: [
      "Cada febrero, ahí estabas, en preliminares.",
      "Nunca pasaste de preliminares, pero nunca te rendiste.",
    ],
    retirada: [
      "Una carrera de idas y venidas, contada a tu manera.",
      "El concurso no era lo tuyo, y aun así lo intentaste.",
    ],
  },
}
