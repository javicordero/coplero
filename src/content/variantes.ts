// Catálogo de variantes por modalidad (DATOS). Fuente: docs/01 §2.
// Sin lógica de juego: solo títulos y subtítulos.

import type { Modalidad } from "./modalidades"

export interface Variante {
  id: string
  modalidad: Modalidad
  titulo: string
  subtitulo: string
  /** El subtítulo es una cita: se muestra en cursiva. */
  cita?: boolean
}

export const VARIANTES: Variante[] = [
  {
    id: "clasico_comparsista",
    modalidad: "comparsista",
    titulo: "Clásico",
    subtitulo: "Más clásico que un tenor con bigote.",
  },
  {
    id: "evolucion_con_raices",
    modalidad: "comparsista",
    titulo: "Evolución con raíces",
    subtitulo:
      "Amigo veterano, no pienses que mi copla va contra tu legado por nuestro descaro y solo es una moda",
    cita: true,
  },
  {
    id: "nueva_escuela",
    modalidad: "comparsista",
    titulo: "Nueva escuela",
    subtitulo:
      "Buscas innovar tanto en la modalidad como en el carnaval, buscando nuevas formas.",
  },
  {
    id: "clasico_chirigotero",
    modalidad: "chirigotero",
    titulo: "Clásico",
    subtitulo: "Vuelve ya el 3x4, el 3x4 bueno",
    cita: true,
  },
  {
    id: "interpretar_personaje",
    modalidad: "chirigotero",
    titulo: "Interpretar el personaje",
    subtitulo:
      "Aquí, de toda la vida, se han cantao pasodobles pa que vibre el coliseo, aquí no deberían permitirse pasodobles de cachondeo",
    cita: true,
  },
  {
    id: "lolosedismo",
    modalidad: "chirigotero",
    titulo: "Lolosedismo",
    subtitulo:
      "Te gusta formar el taco tirando de humor visual y haciendo todo tipo de performances sobre las tablas",
  },
]

export function variantesDe(modalidad: Modalidad): Variante[] {
  return VARIANTES.filter((variante) => variante.modalidad === modalidad)
}
