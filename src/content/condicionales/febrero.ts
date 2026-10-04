// GENERADO por `npm run panel:volcar` — no editar a mano.
import type { Condicional } from "../schema"

export const condicionalesFebrero: Condicional[] = [
  {
    id: "cf_documental",
    momento: "febrero",
    titulo:
      "Un editor de una tele nacional quiere hacer un documental sobre tu agrupación",
    texto: "",
    opciones: [
      {
        id: "abrir",
        titulo: "Abrir las puertas",
        subtitulo: "Que se vea el carnaval de dentro",
      },
      {
        id: "no",
        titulo: "Decir no",
        subtitulo: "El ensayo es sagrado",
      },
    ],
    unicaVez: true,
    requiere: {
      tipo: "faseAlcanzada",
      fase: "final",
    },
    ventanaAnos: 2,
    probabilidad: 0.08,
  },
  {
    id: "cf_excompañero",
    momento: "febrero",
    titulo: "Tu antiguo compañero triunfa en otra agrupación",
    texto: "",
    opciones: [
      {
        id: "llamar",
        titulo: "Llamarlo para volver",
        subtitulo: "La puerta sigue abierta",
      },
      {
        id: "camino",
        titulo: "Seguir tu camino",
        subtitulo: "Aquí no falta nadie",
      },
    ],
    unicaVez: true,
    requiere: {
      tipo: "alguna",
      de: [
        {
          tipo: "flag",
          flag: "historico_se_fue",
        },
        {
          tipo: "flag",
          flag: "fiche_fuera",
        },
      ],
    },
    ventanaAnos: 3,
    probabilidad: 0.4,
  },
  {
    id: "cf_politico",
    momento: "febrero",
    titulo: "Un político te contesta en la prensa local",
    texto: "",
    opciones: [
      {
        id: "doblar",
        titulo: "Doblar la apuesta",
        subtitulo: "Otro pasodoble al mismo",
      },
      {
        id: "dejar",
        titulo: "Dejarlo estar",
        subtitulo: "Ya lo dije cantando",
      },
    ],
    unicaVez: true,
    requiere: {
      tipo: "flag",
      flag: "pasodoble_duro",
    },
    ventanaAnos: 2,
    probabilidad: 0.6,
  },
  {
    id: "cf_tele",
    momento: "febrero",
    titulo: "Te llaman de la tele por la polémica",
    texto: "",
    opciones: [
      {
        id: "ir",
        titulo: "Ir al programa",
        subtitulo: "Aprovechar el foco",
      },
      {
        id: "no_ir",
        titulo: "No ir",
        subtitulo: "Yo hablo en el Falla",
      },
    ],
    unicaVez: true,
    requiere: {
      tipo: "flag",
      flag: "deje_correr_polemica",
    },
    ventanaAnos: 1,
    probabilidad: 0.5,
  },
]
