// GENERADO por `npm run panel:volcar` — no editar a mano.
import type { Situacion } from "../../schema"

export const situacionesVeranoContenido: Situacion[] = [
  {
    id: "v_arreglo",
    momento: "verano",
    tipo: "contenido",
    categoria: "musica",
    titulo:
      "Te ofrecen un arreglo musical firmado por un músico de fuera del carnaval",
    texto: "",
    opciones: [
      {
        id: "aceptar",
        titulo: "Aceptar el arreglo",
        subtitulo: "Sonar distinto a todos",
        flags: ["musico_externo"],
      },
      {
        id: "casa",
        titulo: "Hacerlo en casa",
        subtitulo: "Aquí sabemos lo que hacemos",
        flags: ["musica_casera"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_letra_duro",
    momento: "verano",
    tipo: "contenido",
    categoria: "letra",
    titulo: "Un pasodoble ha quedado muy duro con un político local",
    texto: "",
    opciones: [
      {
        id: "suavizar",
        titulo: "Suavizarlo",
        subtitulo: "Menos ruido, menos problemas",
        flags: ["pasodoble_suave"],
      },
      {
        id: "mantener",
        titulo: "Mantenerlo tal cual",
        subtitulo: "Que se note quién lo canta",
        flags: ["pasodoble_duro"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_letra_tema",
    momento: "verano",
    tipo: "contenido",
    categoria: "letra",
    titulo: "Toca elegir tema para el repertorio",
    texto: "",
    opciones: [
      {
        id: "social",
        titulo: "A lo social",
        subtitulo: "Criticar lo que pasa en la calle",
        flags: ["tema_social"],
      },
      {
        id: "personal",
        titulo: "A lo personal",
        subtitulo: "Hablar de tu barrio, tu gente, tu vida",
        flags: ["tema_personal"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_popurri_cierre",
    momento: "verano",
    tipo: "contenido",
    categoria: "musica",
    titulo: "El popurrí necesita un cierre",
    texto: "",
    opciones: [
      {
        id: "coral",
        titulo: "Cierre coral potente",
        subtitulo: "Buscando la ovación del Falla",
        flags: ["cierre_coral"],
      },
      {
        id: "intimo",
        titulo: "Cierre íntimo",
        subtitulo: "Apostando por la emoción",
        flags: ["cierre_intimo"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_ruptura_grupo",
    momento: "verano",
    tipo: "contenido",
    categoria: "letra",
    titulo: "Te separas de tu grupo tras varios años y toca escribir",
    texto: "",
    opciones: [
      {
        id: "emotivo",
        titulo: "Pasodoble emotivo",
        subtitulo: "Buscando emocionar",
        flags: ["ruptura_elegante"],
      },
      {
        id: "cañi",
        titulo: "Cuplé con carga de Cádiz",
        subtitulo: "Llamándoles de todo",
        flags: ["ruptura_a_saco"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_tipo",
    momento: "verano",
    tipo: "contenido",
    categoria: "puestaEnEscena",
    titulo: "El tipo no acaba de convencer al grupo a un mes del concurso",
    texto: "",
    opciones: [
      {
        id: "cambiarlo",
        titulo: "Cambiarlo entero",
        subtitulo: "Aún hay tiempo",
        flags: ["tipo_cambiado"],
      },
      {
        id: "conservarlo",
        titulo: "Sacarlo como está",
        subtitulo: "Ya está pagado",
        flags: ["tipo_conservado"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_tono",
    momento: "verano",
    tipo: "contenido",
    categoria: "musica",
    titulo:
      "Un componente pide bajar el tono del pasodoble para poder cantarlo",
    texto: "",
    opciones: [
      {
        id: "bajarlo",
        titulo: "Bajarlo",
        subtitulo: "Que suene limpio",
        flags: ["tono_comodo"],
      },
      {
        id: "dejarlo",
        titulo: "Dejarlo arriba",
        subtitulo: "Ahí está el vello de punta",
        flags: ["tono_exigente"],
      },
    ],
    unicaVez: true,
  },
]
