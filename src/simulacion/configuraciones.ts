import type { ConfiguracionPartida } from "./tipos"

// Variantes provisionales hasta que exista el banco real de `content`.
export const CONFIGURACIONES_POR_DEFECTO: readonly ConfiguracionPartida[] = [
  {
    id: "comparsista",
    modalidad: "comparsista",
    variante: "clasico",
    genero: "masculino",
    localidad: "Cádiz",
    edad: 30,
  },
  {
    id: "chirigotero",
    modalidad: "chirigotero",
    variante: "clasico",
    genero: "masculino",
    localidad: "Cádiz",
    edad: 28,
  },
  {
    id: "comparsista-femenino",
    modalidad: "comparsista",
    variante: "clasico",
    genero: "femenino",
    localidad: "San Fernando",
    edad: 27,
  },
  {
    id: "chirigotero-no-binario",
    modalidad: "chirigotero",
    variante: "clasico",
    genero: "no_binario",
    localidad: "Puerto Real",
    edad: 25,
  },
]
