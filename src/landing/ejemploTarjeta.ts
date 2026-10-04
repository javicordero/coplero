// Fixture de ejemplo para la landing: una tarjeta final plausible y completa.
// Se usa para mostrar el ejemplo (renderizado con el componente real) y como
// código de la imagen Open Graph de la portada.

import { codificar, type TarjetaFinal } from "../engine/index"

export const EJEMPLO_TARJETA: TarjetaFinal = {
  nombre: "El Bauti",
  modalidadInicial: "comparsista",
  modalidadFinal: "comparsista",
  varianteInicial: "clasico_comparsista",
  varianteFinal: "evolucion_con_raices",
  cambios: [
    {
      ano: 2031,
      modalidad: "comparsista",
      variante: "evolucion_con_raices",
    },
  ],
  anosDeCarrera: 14,
  anosEnActivo: 14,
  anosSinConcursar: [],
  mejorFase: "final",
  mejorPuesto: 1,
  primerosPremios: [
    { ano: 2037, puesto: 3, tipo: "podio" },
    { ano: 2038, puesto: 1, tipo: "primer_premio" },
    { ano: 2040, puesto: 2, tipo: "podio" },
  ],
  hitosProgreso: [
    { ano: 2027, fase: "preliminares", debut: true },
    { ano: 2029, fase: "cuartos", debut: false },
    { ano: 2032, fase: "semifinales", debut: false },
    { ano: 2035, fase: "final", debut: false },
  ],
  otrosPremios: [
    { tipo: "aguja_de_oro", veces: 2, anos: [2036, 2039] },
    { tipo: "copla_para_andalucia", veces: 1, anos: [2034] },
  ],
  hitos: [
    { tipo: "debut", ano: 2027, texto: "Debutaste en 2027" },
    { tipo: "ganar_coac", ano: 2038, texto: "Ganaste el COAC en 2038" },
    { tipo: "duracion", ano: null, texto: "14 años de carrera" },
  ],
  fraseCierre: "Lo tocaste todo.",
}

/** Código de partida del ejemplo, para `og:image` y para compartir la demo. */
export const CODIGO_EJEMPLO = codificar(EJEMPLO_TARJETA)
