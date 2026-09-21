// Datos de la landing (`/`). Son contenido estático, no lógica de juego.

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
    texto:
      "Ponle nombre o apodo, edad y localidad. No hace falta registrarse ni saber carnaval.",
  },
  {
    numero: 2,
    titulo: "Elige modalidad y estilo",
    texto:
      "Comparsista o chirigotero. Y dentro de cada una, el estilo con el que quieres sonar.",
  },
  {
    numero: 3,
    titulo: "Decide cada año",
    texto:
      "Cada temporada trae una decisión de verano y otra de febrero: letra, música, jurado, dinero, grupo…",
  },
  {
    numero: 4,
    titulo: "Recibe tu tarjeta",
    texto:
      "Al final de la carrera recibes un póster con tu historia, listo para compartir.",
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
  {
    id: "x",
    nombre: "X",
    url: "https://x.com/acordesgaditano",
  },
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
  {
    id: "github",
    nombre: "GitHub",
    url: "https://github.com/javicordero",
  },
]

export const AUTOR = "Javier Cordero Toscano"

export const ACORDES_GADITANOS = "https://acordesgaditanos.com"
