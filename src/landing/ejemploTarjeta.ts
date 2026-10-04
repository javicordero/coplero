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
  anosDeCarrera: 8,
  anosEnActivo: 7,
  anosSinConcursar: [2031],
  mejorFase: "final",
  mejorPuesto: 2,
  primerosPremios: [{ ano: 2033, puesto: 2, tipo: "podio" }],
  hitosProgreso: [
    { ano: 2029, fase: "preliminares", debut: true },
    { ano: 2031, fase: "cuartos", debut: false },
    { ano: 2032, fase: "semifinales", debut: false },
    { ano: 2033, fase: "final", debut: false },
  ],
  otrosPremios: [{ tipo: "aguja_de_oro", veces: 1, anos: [2032] }],
  hitos: [
    { tipo: "debut", ano: 2029, texto: "Debutaste en 2029" },
    {
      tipo: "cambio_variante",
      ano: 2031,
      texto: "Cambiaste tu estilo en 2031",
    },
    { tipo: "podio", ano: 2033, texto: "Podio en el COAC en 2033" },
  ],
  fraseCierre: "Entre los mejores.",
}

/** Código de partida del ejemplo, para `og:image` y para compartir la demo. */
export const CODIGO_EJEMPLO = codificar(EJEMPLO_TARJETA)
