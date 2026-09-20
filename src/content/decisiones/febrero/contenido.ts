import type { Situacion } from "../../schema"

// Febrero · tipo contenido. Fuente: docs/04-banco-febrero.md
export const situacionesFebreroContenido: Situacion[] = [
  {
    id: "f_popurri_cierre",
    momento: "febrero",
    tipo: "contenido",
    categoria: "musica",
    titulo: "Hay que cerrar el popurrí de la final",
    texto: "",
    unicaVez: true,
    modalidades: ["chirigotero"],
    opciones: [
      {
        id: "cai",
        titulo: "Vámonos por Cai",
        subtitulo: "Al 3x4 de Cádiz, a lo grande",
        flags: ["cierre_himno"],
      },
      {
        id: "esdrujulas",
        titulo: "Canto a la vida",
        subtitulo: "Apóyate en las esdrújulas, la fórmula más auténtica",
        flags: ["cierre_esdrujulas"],
      },
    ],
  },
  {
    id: "f_cuple",
    momento: "febrero",
    tipo: "contenido",
    categoria: "letra",
    titulo: "Un cuplé no ha entrado en preliminares",
    texto: "",
    unicaVez: true,
    opciones: [
      {
        id: "cambiar",
        titulo: "Cambiarlo para cuartos",
        subtitulo: "Si no ríe, fuera",
        flags: ["cuple_cambiado"],
      },
      {
        id: "mantener",
        titulo: "Mantenerlo",
        subtitulo: "El chiste necesita otra grada",
        flags: ["cuple_mantenido"],
      },
    ],
  },
  {
    id: "f_primera_sesion",
    momento: "febrero",
    tipo: "contenido",
    categoria: "letra",
    titulo: "Te toca actuar en la primera sesión de la fase",
    texto: "",
    unicaVez: true,
    opciones: [
      {
        id: "sacar",
        titulo: "Sacar el mejor pasodoble ya",
        subtitulo: "Que se hable de nosotros desde el día uno",
        flags: ["ensenar_las_cartas"],
      },
      {
        id: "guardar",
        titulo: "Guardarlo para la siguiente fase",
        subtitulo: "Reservar la bala buena",
        flags: ["guardo_la_bala"],
      },
    ],
  },
]
