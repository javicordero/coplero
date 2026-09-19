import type { Condicional } from "../schema"

// Condicionales de febrero. Fuente: docs/04-banco-febrero.md
export const condicionalesFebrero: Condicional[] = [
  {
    id: "cf_politico",
    momento: "febrero",
    tipo: "personaje",
    categoria: "prensa",
    titulo: "Un político te contesta en la prensa local",
    texto: "",
    unicaVez: true,
    requiere: { tipo: "flag", flag: "pasodoble_duro" },
    ventanaAnos: 2,
    probabilidad: 0.6,
    consumeFlag: false,
    opciones: [
      {
        id: "doblar",
        titulo: "Doblar la apuesta",
        subtitulo: "Otro pasodoble al mismo",
        efectos: { popularidad: 2 },
      },
      {
        id: "dejar",
        titulo: "Dejarlo estar",
        subtitulo: "Ya lo dije cantando",
        efectos: { letra: 1 },
      },
    ],
  },
  {
    id: "cf_tele",
    momento: "febrero",
    tipo: "personaje",
    categoria: "prensa",
    titulo: "Te llaman de la tele por la polémica",
    texto: "",
    unicaVez: true,
    requiere: { tipo: "flag", flag: "deje_correr_polemica" },
    ventanaAnos: 1,
    probabilidad: 0.5,
    consumeFlag: false,
    opciones: [
      {
        id: "ir",
        titulo: "Ir al programa",
        subtitulo: "Aprovechar el foco",
        efectos: { popularidad: 3, letra: -1 },
      },
      {
        id: "no_ir",
        titulo: "No ir",
        subtitulo: "Yo hablo en el Falla",
        efectos: { popularidad: -1, cohesion: 1 },
      },
    ],
  },
  {
    id: "cf_excompañero",
    momento: "febrero",
    tipo: "personaje",
    categoria: "grupo",
    titulo: "Tu antiguo compañero triunfa en otra agrupación",
    texto: "",
    unicaVez: true,
    requiere: {
      tipo: "alguna",
      de: [
        { tipo: "flag", flag: "historico_se_fue" },
        { tipo: "flag", flag: "fiche_fuera" },
      ],
    },
    ventanaAnos: 3,
    probabilidad: 0.4,
    consumeFlag: false,
    opciones: [
      {
        id: "llamar",
        titulo: "Llamarlo para volver",
        subtitulo: "La puerta sigue abierta",
        efectos: { cohesion: 2, popularidad: -1 },
      },
      {
        id: "camino",
        titulo: "Seguir tu camino",
        subtitulo: "Aquí no falta nadie",
        efectos: { cohesion: 1 },
      },
    ],
  },
  {
    id: "cf_documental",
    momento: "febrero",
    tipo: "personaje",
    categoria: "prensa",
    titulo:
      "Un editor de una tele nacional quiere hacer un documental sobre tu agrupación",
    texto: "",
    unicaVez: true,
    requiere: { tipo: "faseAlcanzada", fase: "final" },
    ventanaAnos: 2,
    probabilidad: 0.08,
    consumeFlag: false,
    opciones: [
      {
        id: "abrir",
        titulo: "Abrir las puertas",
        subtitulo: "Que se vea el carnaval de dentro",
        efectos: { popularidad: 3, cohesion: -1 },
      },
      {
        id: "no",
        titulo: "Decir no",
        subtitulo: "El ensayo es sagrado",
        efectos: { cohesion: 2, popularidad: -1 },
      },
    ],
  },
]
