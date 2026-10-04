// Contenido compartido del sitio (portada, pie y /como-jugar).
// Son datos estáticos, no lógica de juego.

import type { Modalidad } from "../content/modalidades"

export interface PasoComoFunciona {
  numero: number
  titulo: string
  texto: string
}

export interface ModalidadResumen {
  id: Modalidad
  nombre: string
  descripcion: string
  enQueDecide: string
}

export interface PreguntaFAQ {
  pregunta: string
  respuesta: string
}

export interface EnlaceSocial {
  id: "x" | "youtube" | "tiktok" | "instagram" | "linkedin" | "github"
  nombre: string
  url: string
}

export const PASOS: PasoComoFunciona[] = [
  {
    numero: 1,
    titulo: "Crea tu personaje",
    texto: "Ponle nombre o apodo, edad y localidad.",
  },
  {
    numero: 2,
    titulo: "Elige modalidad y estilo",
    texto:
      "Comparsista o chirigotero. Y, dentro de cada una, escoge tu estilo.",
  },
  {
    numero: 3,
    titulo: "Decide cada año",
    texto:
      "Cada año toma una decisión en verano y otra en febrero: letra, música, grupo, contratos, tipo, dinero...",
  },
  {
    numero: 4,
    titulo: "Recibe tu tarjeta",
    texto:
      "Al final de la carrera recibes una tarjeta con tu historia, lista para compartir.",
  },
]

export const MODALIDADES_RESUMEN: ModalidadResumen[] = [
  {
    id: "comparsista",
    nombre: "Comparsista",
    descripcion:
      "La modalidad más clásica del Carnaval: letra cuidada, música con fundamento y un tipo que sostiene el repertorio.",
    enQueDecide: "El repertorio y el sonido de la comparsa.",
  },
  {
    id: "chirigotero",
    nombre: "Chirigotero",
    descripcion:
      "El humor por delante: el tipo, el chiste y la interpretación son tan importantes como la música.",
    enQueDecide: "El tipo, el chiste y la puesta en escena.",
  },
]

export const FAQ: PreguntaFAQ[] = [
  {
    pregunta: "¿Es gratis?",
    respuesta:
      "Sí. Coplero es gratis y se juega directamente en el navegador, sin instalar nada.",
  },
  {
    pregunta: "¿Necesito registrarme o crear una cuenta?",
    respuesta:
      "No. No hay cuentas ni inicio de sesión: escribes tu personaje y empiezas a jugar.",
  },
  {
    pregunta: "¿Cuánto dura una partida?",
    respuesta:
      "Cada año son un par de decisiones, así que una carrera se juega en unos minutos. Puedes parar y continuar donde lo dejaste en el mismo dispositivo.",
  },
  {
    pregunta: "¿De dónde salen las situaciones?",
    respuesta:
      "Están inspiradas en la vida real de las agrupaciones del Carnaval de Cádiz: ensayos, presupuesto, jurado, prensa, grupo… Sin usar nombres reales de personas ni agrupaciones.",
  },
  {
    pregunta: "¿Puedo compartir mi resultado?",
    respuesta:
      "Sí. Al terminar se genera una tarjeta con tu carrera que puedes compartir como enlace o como imagen.",
  },
  {
    pregunta: "¿Quién ha hecho Coplero?",
    respuesta:
      "Javier Cordero Toscano, el mismo creador de Acordes Gaditanos, la web de acordes del Carnaval de Cádiz.",
  },
]

/** Cuentas de acordesgaditanos mientras Coplero no tenga las suyas (docs/05 §3). */
export const REDES: EnlaceSocial[] = [
  { id: "x", nombre: "X", url: "https://x.com/acordesgaditano" },
  {
    id: "youtube",
    nombre: "YouTube",
    url: "https://www.youtube.com/@acordesgaditanos",
  },
  {
    id: "tiktok",
    nombre: "TikTok",
    url: "https://www.tiktok.com/@acordes.gaditanos",
  },
  {
    id: "instagram",
    nombre: "Instagram",
    url: "https://www.instagram.com/acordesgaditanos/",
  },
  {
    id: "linkedin",
    nombre: "LinkedIn",
    url: "https://www.linkedin.com/in/javier-cordero-toscano",
  },
  { id: "github", nombre: "GitHub", url: "https://github.com/javicordero" },
]

export interface EnlaceDonacion {
  url: string
  etiqueta: string
}

export interface OpcionSugerencia {
  valor: "situacion" | "opcion" | "otro"
  etiqueta: string
}

export interface ConfigSugerencias {
  endpoint: string
  maxLongitud: number
  tipoOpciones: OpcionSugerencia[]
}

/** Enlace de donación: cuenta reutilizada de acordesgaditanos (docs/05 §5). */
export const DONACION: EnlaceDonacion = {
  url: "https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero",
  etiqueta: "Apoyar Coplero",
}

/** Formulario de sugerencias: servicio externo, sin backend. */
export const SUGERENCIAS: ConfigSugerencias = {
  endpoint: "https://formspree.io/f/mdeanyjr",
  maxLongitud: 500,
  tipoOpciones: [
    { valor: "situacion", etiqueta: "Una situación" },
    { valor: "opcion", etiqueta: "Una opción" },
    { valor: "otro", etiqueta: "Otro" },
  ],
}

export const AUTOR = "Javier Cordero Toscano"

export const ACORDES_GADITANOS = "https://acordesgaditanos.com"
