import type { ConfiguracionPartida } from "./tipos"

// Variantes reales del catálogo de `content` (docs/01 §2).
export const CONFIGURACIONES_POR_DEFECTO: readonly ConfiguracionPartida[] = [
  {
    id: "comparsista",
    modalidad: "comparsista",
    variante: "clasico_comparsista",
    genero: "masculino",
    localidad: "Cádiz",
    edad: 30,
  },
  {
    id: "chirigotero",
    modalidad: "chirigotero",
    variante: "clasico_chirigotero",
    genero: "masculino",
    localidad: "Cádiz",
    edad: 28,
  },
  {
    id: "comparsista-femenino",
    modalidad: "comparsista",
    variante: "clasico_comparsista",
    genero: "femenino",
    localidad: "San Fernando",
    edad: 27,
  },
  {
    id: "chirigotero-no-binario",
    modalidad: "chirigotero",
    variante: "clasico_chirigotero",
    genero: "no_binario",
    localidad: "Puerto Real",
    edad: 25,
  },
]
