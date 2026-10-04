import type { Condicional } from "../schema"

// Condicionales de verano. Fuente: docs/03-banco-verano.md
export const condicionalesVerano: Condicional[] = [
  {
    id: "cv_grupo_consagrado",
    momento: "verano",
    titulo:
      "Has ganado premios con el grupo consagrado; tus amigos te llaman para volver",
    texto: "",
    unicaVez: true,
    requiere: { tipo: "flag", flag: "autor_grupo_consagrado" },
    ventanaAnos: 4,
    probabilidad: 0.5,
    consumeFlag: false,
    opciones: [
      {
        id: "volver",
        titulo: "Volver con los tuyos",
        subtitulo: "Más piña, menos cartel",
        excepcion: true,
        efectos: { cohesion: 3, popularidad: -1 },
        flags: ["regreso_a_la_pena"],
      },
      {
        id: "seguir",
        titulo: "Seguir donde se gana",
        subtitulo: "Más cartel, menos piña",
        excepcion: true,
        efectos: { popularidad: 1, letra: 1, cohesion: -1 },
        flags: ["carrera_de_elite"],
      },
    ],
  },
  {
    id: "cv_plazo_inscripcion",
    momento: "verano",
    titulo: "Se acerca el plazo de inscripción tras tu año fuera del concurso",
    texto: "",
    unicaVez: true,
    requiere: {
      tipo: "alguna",
      de: [
        { tipo: "flag", flag: "ano_callejero" },
        { tipo: "flag", flag: "ano_de_gira" },
      ],
    },
    ventanaAnos: 2,
    probabilidad: 0.8,
    consumeFlag: false,
    opciones: [
      {
        id: "volver",
        titulo: "Volver al COAC",
        subtitulo: "Lo echaba de menos",
        flags: ["regreso_al_coac"],
      },
      {
        id: "fuera",
        titulo: "Seguir fuera",
        subtitulo: "Calle o teatro, pero sin jurado",
        flags: ["sigo_fuera"],
      },
    ],
  },
  {
    id: "cv_patrocinador_rival",
    momento: "verano",
    titulo: "El patrocinador que rechazaste aparece con tu rival",
    texto: "",
    unicaVez: true,
    requiere: { tipo: "flag", flag: "rechazo_patrocinio" },
    ventanaAnos: 2,
    probabilidad: 0.5,
    consumeFlag: false,
    opciones: [
      {
        id: "cuple",
        titulo: "Cuplé al asunto",
        subtitulo: "Que se ría Cádiz",
      },
      {
        id: "no_trapo",
        titulo: "No entrar al trapo",
        subtitulo: "Cada uno con lo suyo",
      },
    ],
  },
  {
    id: "cv_registro_social",
    momento: "verano",
    titulo: "El público espera otra vez tu registro social",
    texto: "",
    unicaVez: true,
    // La doc pedía "tema_social dos años seguidos". Al unificarse el pool por
    // momento (sin separación contenido/personaje) y ser toda situación de una
    // sola aparición, el tema ya no se repite con la frecuencia necesaria para
    // exigir `veces: 2`: la condición quedaría inalcanzable. Se dispara con el
    // tema ya visto una vez (consecuencia registrada del cambio sin `tipo`).
    requiere: { tipo: "flag", flag: "tema_social" },
    ventanaAnos: 1,
    probabilidad: 0.7,
    consumeFlag: false,
    opciones: [
      {
        id: "repetir",
        titulo: "Repetir registro",
        subtitulo: "Es lo que soy",
      },
      {
        id: "romper",
        titulo: "Romper con lo esperado",
        subtitulo: "Que no me encasillen",
      },
    ],
  },
  {
    id: "cv_vuelta",
    momento: "verano",
    titulo: "Vuelves al concurso tras el año que no fuiste",
    texto: "",
    unicaVez: true,
    requiere: {
      tipo: "alguna",
      de: [
        { tipo: "flag", flag: "year_sabatico" },
        { tipo: "flag", flag: "ano_callejero" },
        { tipo: "flag", flag: "ano_de_gira" },
      ],
    },
    ventanaAnos: 1,
    probabilidad: 1,
    consumeFlag: false,
    opciones: [
      {
        id: "humildad",
        titulo: "Entrar con humildad",
        subtitulo: "Un año fuera enseña",
      },
      {
        id: "saco",
        titulo: "Entrar a saco",
        subtitulo: "Vengo a cobrarme lo mío",
      },
    ],
  },
  {
    id: "cv_musico_firma",
    momento: "verano",
    titulo: "El músico de fuera quiere firmar la música",
    texto: "",
    unicaVez: true,
    requiere: { tipo: "flag", flag: "musico_externo" },
    ventanaAnos: 2,
    probabilidad: 0.5,
    consumeFlag: false,
    opciones: [
      {
        id: "compartir",
        titulo: "Compartir la firma",
        subtitulo: "Lo justo es lo justo",
      },
      {
        id: "negar",
        titulo: "Negarte",
        subtitulo: "La música es de la agrupación",
      },
    ],
  },
  {
    id: "cv_local_venta",
    momento: "verano",
    titulo: "El local de siempre se pone en venta",
    texto: "",
    unicaVez: true,
    requiere: { tipo: "flag", flag: "local_de_siempre" },
    ventanaAnos: 3,
    probabilidad: 0.4,
    consumeFlag: false,
    opciones: [
      {
        id: "comprar",
        titulo: "Comprarlo entre todos",
        subtitulo: "Casa propia",
      },
      {
        id: "mudarse",
        titulo: "Mudarse por fin",
        subtitulo: "Toca soltar",
      },
    ],
  },
  // Trayectoria: cambio de estilo (variante). Repetible y de baja frecuencia;
  // para el jugador es una decisión normal, sin anunciar la mecánica.
  {
    id: "cv_enfoque_comparsista",
    momento: "verano",
    titulo: "El grupo debate cómo enfocar el repertorio del próximo año",
    texto: "",
    modalidades: ["comparsista"],
    unicaVez: false,
    requiere: { tipo: "ninguna", de: [] },
    ventanaAnos: 1,
    probabilidad: 0.05,
    consumeFlag: false,
    opciones: [
      {
        id: "clasico",
        titulo: "Mantener lo que siempre ha funcionado",
        subtitulo: "Fiel a la tradición",
        cambiaVariante: "clasico_comparsista",
      },
      {
        id: "nuevo",
        titulo: "Darle una vuelta a todo",
        subtitulo: "Buscar un sonido que no se haya oído",
        cambiaVariante: "nueva_escuela",
      },
      {
        id: "raices",
        titulo: "Cambiar sin perder la esencia",
        subtitulo: "Progresar con la raíz intacta",
        cambiaVariante: "evolucion_con_raices",
      },
    ],
  },
  {
    id: "cv_enfoque_chirigotero",
    momento: "verano",
    titulo: "El grupo quiere reírse de otra manera este año",
    texto: "",
    modalidades: ["chirigotero"],
    unicaVez: false,
    requiere: { tipo: "ninguna", de: [] },
    ventanaAnos: 1,
    probabilidad: 0.05,
    consumeFlag: false,
    opciones: [
      {
        id: "clasico",
        titulo: "Seguir con el humor de siempre",
        subtitulo: "Lo que funciona no se toca",
        cambiaVariante: "clasico_chirigotero",
      },
      {
        id: "visual",
        titulo: "Apoyarse en el gesto, casi sin hablar",
        subtitulo: "Que el cuerpo cuente el chiste",
        cambiaVariante: "lolosedismo",
      },
      {
        id: "personaje",
        titulo: "No salirse del personaje ni un segundo",
        subtitulo: "Todo el rato dentro del tipo",
        cambiaVariante: "interpretar_personaje",
      },
    ],
  },
  // Trayectoria: cambio de modalidad. Repetible, baja frecuencia, desde el año 4;
  // permite cambiar y volver más adelante.
  {
    id: "cv_salto_a_comparsista",
    momento: "verano",
    titulo: "La chirigota se te queda pequeña y te ronda la comparsa",
    texto: "",
    modalidades: ["chirigotero"],
    minAno: 4,
    unicaVez: false,
    requiere: { tipo: "ninguna", de: [] },
    ventanaAnos: 1,
    probabilidad: 0.04,
    consumeFlag: false,
    opciones: [
      {
        id: "seguir",
        titulo: "Seguir con la chirigota",
        subtitulo: "Donde estás cómodo y donde te conocen",
      },
      {
        id: "cambiar",
        titulo: "Dar el salto a la comparsa",
        subtitulo: "Otro registro, otra guerra",
        cambiaModalidad: "comparsista",
      },
    ],
  },
  {
    id: "cv_salto_a_chirigotero",
    momento: "verano",
    titulo: "La comparsa se te queda seria y te llama la chirigota",
    texto: "",
    modalidades: ["comparsista"],
    minAno: 4,
    unicaVez: false,
    requiere: { tipo: "ninguna", de: [] },
    ventanaAnos: 1,
    probabilidad: 0.04,
    consumeFlag: false,
    opciones: [
      {
        id: "seguir",
        titulo: "Seguir con la comparsa",
        subtitulo: "Donde estás cómodo y donde te conocen",
      },
      {
        id: "cambiar",
        titulo: "Dar el salto a la chirigota",
        subtitulo: "Otro registro, otra guerra",
        cambiaModalidad: "chirigotero",
      },
    ],
  },
]
