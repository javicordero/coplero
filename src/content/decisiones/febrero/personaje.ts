// GENERADO por `npm run panel:volcar` — no editar a mano.
import type { Situacion } from "../../schema"

export const situacionesFebreroPersonaje: Situacion[] = [
  {
    id: "f_fuera_por_punto",
    momento: "febrero",
    tipo: "personaje",
    categoria: "jurado",
    titulo: "Te dejan fuera por un punto",
    texto: "",
    opciones: [
      {
        id: "reclamar",
        titulo: "Reclamar públicamente",
        subtitulo: "Que se sepa lo que pienso",
        flags: ["bronca_publica"],
      },
      {
        id: "callar",
        titulo: "Callar y trabajar",
        subtitulo: "El año que viene hablo cantando",
        flags: ["silencio_digno"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "f_grada",
    momento: "febrero",
    tipo: "personaje",
    categoria: "prensa",
    titulo: "El público del Falla te pide un tema puntual",
    texto: "",
    opciones: [
      {
        id: "complacer",
        titulo: "Complacer al público",
        subtitulo: "Dar lo que se espera",
        flags: ["complazco_grada"],
      },
      {
        id: "aire",
        titulo: "Ir a tu aire",
        subtitulo: "El artista manda, no la grada",
        flags: ["voy_a_mi_aire"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "f_jurado",
    momento: "febrero",
    tipo: "personaje",
    categoria: "jurado",
    titulo: "Sientes que el jurado te trata injustamente",
    texto: "",
    opciones: [
      {
        id: "no_ir",
        titulo: "No ir al COAC el año que viene",
        subtitulo: "Que no me arruinen el carnaval",
        flags: ["year_sabatico"],
        saltaCOAC: true,
      },
      {
        id: "seguir",
        titulo: "Seguir en el COAC",
        subtitulo: "Aquí se viene a competir",
        flags: ["sigo_compitiendo"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "f_radio",
    momento: "febrero",
    tipo: "personaje",
    categoria: "prensa",
    titulo: "Una radio local te pide entrevista en plena semana de cuartos",
    texto: "",
    opciones: [
      {
        id: "ir",
        titulo: "Ir a la radio",
        subtitulo: "Sumar público",
        flags: ["promocion_si"],
      },
      {
        id: "encerrarse",
        titulo: "Encerrarse a ensayar",
        subtitulo: "Lo importante es el escenario",
        flags: ["promocion_no"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "f_repesca",
    momento: "febrero",
    tipo: "personaje",
    categoria: "jurado",
    titulo: "Pasas a la siguiente fase con lo justo",
    texto: "",
    opciones: [
      {
        id: "retocar",
        titulo: "Repescar el repertorio",
        subtitulo: "Ajustar lo que no funcionó",
        flags: ["repertorio_retocado"],
      },
      {
        id: "intacto",
        titulo: "Mantener todo igual",
        subtitulo: "Si algo funciona, no se toca",
        flags: ["repertorio_intacto"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "f_viral",
    momento: "febrero",
    tipo: "personaje",
    categoria: "prensa",
    titulo: "Una letra se ha hecho viral, mal interpretada",
    texto: "",
    opciones: [
      {
        id: "explicar",
        titulo: "Salir a explicarla",
        subtitulo: "Que quede claro el mensaje",
        flags: ["di_explicaciones"],
      },
      {
        id: "dejar",
        titulo: "Dejar que se hable",
        subtitulo: "La polémica también es carnaval",
        flags: ["deje_correr_polemica"],
      },
    ],
    unicaVez: true,
  },
]
