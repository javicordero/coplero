// GENERADO por `npm run panel:volcar` — no editar a mano.
import type { Situacion } from "../schema"

export const situacionesVerano: Situacion[] = [
  {
    id: "v_arreglo",
    momento: "verano",
    titulo:
      "Te ofrecen un arreglo musical firmado por un músico de fuera del carnaval",
    texto: "",
    tituloFemenino:
      "Te ofrecen un arreglo musical firmado por una música de fuera del carnaval",
    opciones: [
      {
        id: "aceptar",
        titulo: "Aceptar el arreglo",
        subtitulo: "Sonar distinto a todos",
        subtituloFemenino: "Sonar distinta a todas",
        flags: ["musico_externo"],
      },
      {
        id: "casa",
        titulo: "Hacerlo en casa",
        subtitulo: "Aquí sabemos lo que hacemos",
        subtituloFemenino: "Que la copla se note nuestra",
        flags: ["musica_casera"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_enfado_coac",
    momento: "verano",
    titulo:
      "Te enfadas con el COAC por unos resultados que consideras injustos",
    texto: "",
    opciones: [
      {
        id: "calle",
        titulo: "Pa la calle",
        subtitulo:
          "No concursas: sacas una agrupación callejera para tomar aire",
        flags: ["ano_callejero"],
        saltaCOAC: true,
      },
      {
        id: "gira",
        titulo: "Gira por España",
        subtitulo: "No concursas, pero recorréis teatros de todo el país",
        flags: ["ano_de_gira"],
        saltaCOAC: true,
      },
      {
        id: "concursar",
        titulo: "Me gusta concursar",
        subtitulo: "Vas al COAC con un pasodoble al trato del jurado",
        flags: ["pasodoble_al_jurado"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_fichaje",
    momento: "verano",
    titulo: "Te ofrecen fichar por otra agrupación más grande",
    texto: "",
    opciones: [
      {
        id: "fuera",
        titulo: "Cambiar de aires",
        subtitulo: "Buscar otro nivel",
        flags: ["fiche_fuera"],
      },
      {
        id: "fiel",
        titulo: "Ser fiel a los tuyos",
        subtitulo: "De aquí no me muevo",
        flags: ["me_quede"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_filtracion",
    momento: "verano",
    titulo: "Alguien graba un ensayo y lo sube a redes antes de tiempo",
    texto: "",
    opciones: [
      {
        id: "aprovechar",
        titulo: "Aprovechar el ruido",
        subtitulo: "Publicidad gratis",
        flags: ["filtracion_aprovechada"],
      },
      {
        id: "cerrar",
        titulo: "Cerrar el ensayo a cal y canto",
        subtitulo: "Aquí no entra nadie",
        flags: ["ensayo_cerrado"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_grupo_consagrado",
    momento: "verano",
    titulo:
      "Llevas muchos años con tu grupo de amigos y un grupo consagrado y puntero te ofrece ser su autor",
    texto: "",
    opciones: [
      {
        id: "pena",
        titulo: "Fiel a la peña",
        subtitulo: "Con estos empecé y con estos sigo",
        flags: ["rechace_grupo_consagrado"],
      },
      {
        id: "elite",
        titulo: "Firmar por el grupo consagrado",
        subtitulo: "Jugar en la élite",
        flags: ["autor_grupo_consagrado"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_historico",
    momento: "verano",
    titulo: "Un componente histórico quiere dejar el grupo",
    texto: "",
    opciones: [
      {
        id: "marchar",
        titulo: "Dejarlo marchar",
        subtitulo: "Cada uno tiene su momento",
        flags: ["historico_se_fue"],
      },
      {
        id: "quedarse",
        titulo: "Convencerlo de quedarse",
        subtitulo: "La agrupación es él también",
        flags: ["historico_se_queda"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_letra_duro",
    momento: "verano",
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
    id: "v_local",
    momento: "verano",
    titulo: "El local de ensayo sube el alquiler",
    texto: "",
    opciones: [
      {
        id: "nuevo",
        titulo: "Buscar otro local",
        subtitulo: "Donde se pueda pagar",
        flags: ["local_nuevo"],
      },
      {
        id: "siempre",
        titulo: "Rascarse el bolsillo entre todos",
        subtitulo: "Aquí nació la agrupación",
        flags: ["local_de_siempre"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_patrocinador",
    momento: "verano",
    titulo: "Un patrocinador ofrece dinero a cambio de suavizar la crítica",
    texto: "",
    opciones: [
      {
        id: "aceptar",
        titulo: "Aceptar el dinero",
        subtitulo: "El carnaval también hay que pagarlo",
        flags: ["acepto_patrocinio"],
      },
      {
        id: "rechazar",
        titulo: "Rechazar la oferta",
        subtitulo: "Aquí no se vende nadie",
        flags: ["rechazo_patrocinio"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_plantilla",
    momento: "verano",
    titulo: "Hay que cerrar la plantilla del año",
    texto: "",
    opciones: [
      {
        id: "joven",
        titulo: "Apostar por la cantera",
        subtitulo: "Frescura y piña, menos oficio",
        efectos: {
          letra: -1,
          popularidad: 1,
          cohesion: 2,
        },
        excepcion: true,
        flags: ["plantilla_joven"],
      },
      {
        id: "veterana",
        titulo: "Fichar veteranos de garantía",
        subtitulo: "Oficio inmediato, menos piña",
        efectos: {
          letra: 2,
          musica: 1,
          cohesion: -1,
        },
        excepcion: true,
        flags: ["plantilla_veterana"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_popurri_cierre",
    momento: "verano",
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
    id: "v_protagonismo",
    momento: "verano",
    titulo: "Un componente se ha hecho más conocido que tú dentro del grupo",
    texto: "",
    opciones: [
      {
        id: "galones",
        titulo: "Darle galones",
        subtitulo: "Brillo repartido, menos mando",
        efectos: {
          letra: -1,
          popularidad: 2,
          cohesion: 1,
        },
        excepcion: true,
        flags: ["reparto_protagonismo"],
      },
      {
        id: "firma",
        titulo: "Marcar quién firma aquí",
        subtitulo: "Mando claro, menos piña",
        efectos: {
          letra: 2,
          cohesion: -1,
        },
        excepcion: true,
        flags: ["autoridad_marcada"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_ritmo",
    momento: "verano",
    titulo: "El carnaval te está comiendo la vida de casa",
    texto: "",
    opciones: [
      {
        id: "apretar",
        titulo: "Apretar hasta febrero",
        subtitulo: "Ya descansaré en marzo",
        flags: ["todo_al_carnaval"],
      },
      {
        id: "bajar",
        titulo: "Bajar el ritmo de ensayos",
        subtitulo: "Hay vida fuera del Falla",
        flags: ["pie_en_casa"],
      },
    ],
    unicaVez: true,
  },
  {
    id: "v_ruptura_grupo",
    momento: "verano",
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
  {
    id: "v_vestuario",
    momento: "verano",
    titulo: "Hay que decidir el presupuesto de vestuario",
    texto: "",
    opciones: [
      {
        id: "caro",
        titulo: "Tirar la casa por la ventana",
        subtitulo: "El atrezzo también puntúa",
        flags: ["vestuario_caro"],
      },
      {
        id: "humilde",
        titulo: "Ahorrar en vestuario",
        subtitulo: "Que hable la letra, no el disfraz",
        flags: ["vestuario_humilde"],
      },
    ],
    unicaVez: true,
  },
]
