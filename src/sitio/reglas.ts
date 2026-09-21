// Reglas del juego para `/como-jugar`. Contenido estático, sin lógica.

export interface Regla {
  titulo: string
  texto: string
}

export const REGLAS: Regla[] = [
  {
    titulo: "Cada año, dos decisiones",
    texto:
      "Una en verano (la preparación) y otra en febrero (el concurso). Siempre una de contenido y otra de personaje.",
  },
  {
    titulo: "Contenido y personaje",
    texto:
      "Las decisiones de contenido tocan la letra, la música y la puesta en escena. Las de personaje afectan al jurado, el dinero, el grupo, la prensa, la carrera y el concurso.",
  },
  {
    titulo: "El COAC, por fases",
    texto:
      "Cada febrero hay que superar preliminares, cuartos, semifinales y final. No pasar de fase también es una historia.",
  },
  {
    titulo: "Nunca sabrás tu techo",
    texto:
      "El destino de tu carrera se decide al empezar y permanece oculto. Por eso no existe una estrategia perfecta: cada partida es una historia distinta.",
  },
  {
    titulo: "Tu tarjeta final",
    texto:
      "Al retirarte recibes un póster con tu trayectoria, tus premios y tus mejores momentos, listo para compartir.",
  },
]
