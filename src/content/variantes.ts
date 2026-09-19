// Catálogo de variantes por modalidad (DATOS). Fuente: docs/01 §2.
// Sin lógica de juego: solo títulos y subtítulos.

import type { Modalidad } from "./modalidades"

export interface Variante {
  id: string
  modalidad: Modalidad
  titulo: string
  subtitulo: string
}

export const VARIANTES: Variante[] = [
  {
    id: "clasico_comparsista",
    modalidad: "comparsista",
    titulo: "Clásico",
    subtitulo: "Más clásico que un tenor con bigote.",
  },
  {
    id: "nueva_escuela",
    modalidad: "comparsista",
    titulo: "Nueva escuela",
    subtitulo:
      "Buscas innovar tanto en la modalidad como en el carnaval, buscando nuevas formas.",
  },
  {
    id: "evolucion_con_raices",
    modalidad: "comparsista",
    titulo: "Evolución con raíces",
    subtitulo: "Buscando el progreso, respetando la esencia.",
  },
  {
    id: "lolosedismo",
    modalidad: "chirigotero",
    titulo: "Lolosedismo",
    subtitulo: "Te gusta el humor visual.",
  },
  {
    id: "clasico_chirigotero",
    modalidad: "chirigotero",
    titulo: "Clásico",
    subtitulo: "3x4 de pellizco.",
  },
  {
    id: "interpretar_personaje",
    modalidad: "chirigotero",
    titulo: "Interpretar el personaje",
    subtitulo: "Busca todo el tiempo el humor, sin salirse del personaje.",
  },
]

export function variantesDe(modalidad: Modalidad): Variante[] {
  return VARIANTES.filter((variante) => variante.modalidad === modalidad)
}
