import type { BancoContenido, CrearPartidaInput, Personaje } from "../types"

export const personajePrueba: Personaje = {
  nombre: "El Chato",
  edad: 30,
  localidad: "Cádiz",
  genero: "masculino",
}

export const inputPrueba: CrearPartidaInput = {
  seed: "semilla-de-prueba",
  personaje: personajePrueba,
  modalidad: "comparsista",
  variante: "clasico",
}

/** Banco de contenido mínimo y estable para tests. Sin nombres reales. */
export const bancoPrueba: BancoContenido = {
  situaciones: [
    {
      id: "v_letra_tema",
      momento: "verano",
      titulo: "Tema del repertorio",
      texto: "Hay que decidir el tema del año.",
      opciones: [
        {
          id: "social",
          titulo: "A lo social",
          subtitulo: "Criticar lo que pasa en la calle",
          efectos: { letra: 1, popularidad: 1 },
          flags: ["tema_social"],
        },
        {
          id: "personal",
          titulo: "A lo personal",
          subtitulo: "Hablar de tu gente",
          efectos: { letra: 1, cohesion: 1 },
          flags: ["tema_personal"],
        },
      ],
    },
    {
      id: "v_letra_duro",
      momento: "verano",
      titulo: "Pasodoble duro",
      texto: "El pasodoble ha quedado muy duro.",
      opciones: [
        {
          id: "suavizar",
          titulo: "Suavizarlo",
          subtitulo: "Menos ruido",
          efectos: { letra: -1 },
          flags: ["pasodoble_suave"],
        },
        {
          id: "mantener",
          titulo: "Mantenerlo",
          subtitulo: "Que se note quién lo canta",
          efectos: { letra: 2, popularidad: 2 },
          flags: ["pasodoble_duro"],
        },
      ],
    },
    {
      id: "v_musica_tipo",
      momento: "verano",
      titulo: "El tipo no convence",
      texto: "El tipo no acaba de convencer.",
      opciones: [
        {
          id: "cambiar",
          titulo: "Cambiarlo entero",
          subtitulo: "Aún hay tiempo",
          efectos: { puestaEnEscena: 2, cohesion: -1, dinero: -2 },
          flags: ["tipo_cambiado"],
        },
        {
          id: "conservar",
          titulo: "Sacarlo como está",
          subtitulo: "Ya está pagado",
          efectos: { cohesion: 1 },
          flags: ["tipo_conservado"],
        },
      ],
    },
    {
      id: "v_vestuario",
      momento: "verano",
      titulo: "Presupuesto de vestuario",
      texto: "Hay que decidir el presupuesto.",
      opciones: [
        {
          id: "caro",
          titulo: "Tirar la casa por la ventana",
          subtitulo: "El atrezzo puntúa",
          efectos: { puestaEnEscena: 2, dinero: -3 },
          flags: ["vestuario_caro"],
        },
        {
          id: "humilde",
          titulo: "Ahorrar",
          subtitulo: "Que hable la letra",
          efectos: { puestaEnEscena: -1, dinero: 2 },
          flags: ["vestuario_humilde"],
        },
      ],
    },
    {
      id: "v_patrocinador",
      momento: "verano",
      titulo: "Oferta de patrocinador",
      texto: "Un patrocinador ofrece dinero.",
      opciones: [
        {
          id: "aceptar",
          titulo: "Aceptar el dinero",
          subtitulo: "El carnaval hay que pagarlo",
          efectos: { dinero: 3, popularidad: -1 },
          flags: ["acepto_patrocinio"],
        },
        {
          id: "rechazar",
          titulo: "Rechazar la oferta",
          subtitulo: "Aquí no se vende nadie",
          efectos: { dinero: -1, popularidad: 2 },
          flags: ["rechazo_patrocinio"],
        },
      ],
    },
    {
      id: "v_grupo_historico",
      momento: "verano",
      titulo: "Componente histórico",
      texto: "Un componente histórico quiere irse.",
      opciones: [
        {
          id: "marchar",
          titulo: "Dejarlo marchar",
          subtitulo: "Cada uno tiene su momento",
          efectos: { cohesion: -1 },
          flags: ["historico_se_fue"],
        },
        {
          id: "quedarse",
          titulo: "Convencerlo",
          subtitulo: "La agrupación es él",
          efectos: { cohesion: 2 },
          flags: ["historico_se_queda"],
        },
      ],
    },
    {
      id: "f_cierre",
      momento: "febrero",
      titulo: "Cierre del popurrí",
      texto: "Hay que cerrar el popurrí.",
      opciones: [
        {
          id: "coral",
          titulo: "Cierre coral",
          subtitulo: "Buscar la ovación",
          efectos: { musica: 2, puestaEnEscena: 1 },
          flags: ["cierre_coral"],
        },
        {
          id: "intimo",
          titulo: "Cierre íntimo",
          subtitulo: "Apostar por la emoción",
          efectos: { letra: 2, musica: 1 },
          flags: ["cierre_intimo"],
        },
      ],
    },
    {
      id: "f_ensenar",
      momento: "febrero",
      titulo: "Primera sesión",
      texto: "Te toca actuar en la primera sesión.",
      opciones: [
        {
          id: "sacar_ya",
          titulo: "Sacar el mejor pasodoble ya",
          subtitulo: "Que se hable de nosotros",
          efectos: { popularidad: 2, letra: 1 },
          flags: ["ensenar_las_cartas"],
        },
        {
          id: "guardar",
          titulo: "Guardarlo",
          subtitulo: "Reservar la bala buena",
          efectos: { letra: 2, popularidad: -1 },
          flags: ["guardo_la_bala"],
        },
      ],
    },
    {
      id: "f_jurado",
      momento: "febrero",
      titulo: "El jurado te trata injustamente",
      texto: "Sientes que el jurado es injusto.",
      opciones: [
        {
          id: "reclamar",
          titulo: "Reclamar públicamente",
          subtitulo: "Que se sepa",
          efectos: { popularidad: 2, cohesion: -1 },
          flags: ["bronca_publica"],
        },
        {
          id: "callar",
          titulo: "Callar y trabajar",
          subtitulo: "El año que viene hablo cantando",
          efectos: { letra: 1, cohesion: 1 },
          flags: ["silencio_digno"],
        },
      ],
    },
    {
      id: "f_prensa",
      momento: "febrero",
      titulo: "Entrevista en la radio",
      texto: "Una radio local te pide entrevista.",
      opciones: [
        {
          id: "ir",
          titulo: "Ir a la radio",
          subtitulo: "Sumar público",
          efectos: { popularidad: 2, musica: -1 },
          flags: ["promocion_si"],
        },
        {
          id: "no_ir",
          titulo: "Encerrarse a ensayar",
          subtitulo: "Lo importante es el escenario",
          efectos: { musica: 1, popularidad: -1 },
          flags: ["promocion_no"],
        },
      ],
    },
  ],
  condicionales: [
    {
      id: "c_patrocinador_rival",
      momento: "verano",
      titulo: "El patrocinador aparece con tu rival",
      texto: "El patrocinador que rechazaste aparece con tu rival.",
      requiere: { tipo: "flag", flag: "rechazo_patrocinio" },
      ventanaAnos: 2,
      probabilidad: 0.5,
      consumeFlag: false,
      prioridad: 5,
      opciones: [
        {
          id: "cuple",
          titulo: "Cuplé al asunto",
          subtitulo: "Que se ría Cádiz",
          efectos: { popularidad: 2 },
          flags: ["cuple_al_asunto"],
        },
        {
          id: "no_trapo",
          titulo: "No entrar al trapo",
          subtitulo: "Cada uno con lo suyo",
          efectos: { cohesion: 1 },
          flags: ["sin_entrar_al_trapo"],
        },
      ],
    },
  ],
}
