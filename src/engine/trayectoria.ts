import type {
  CatalogoVariante,
  Modalidad,
  Trayectoria,
  VarianteId,
} from "./types"

/** Crea la trayectoria inicial de una partida. Puro y serializable. */
export function crearTrayectoria(
  modalidad: Modalidad,
  variante: VarianteId,
): Trayectoria {
  return {
    modalidadInicial: modalidad,
    varianteInicial: variante,
    cambios: [],
  }
}

/** Añade un cambio con el estado resultante, sin mutar la entrada. */
export function registrarCambio(
  trayectoria: Trayectoria,
  modalidad: Modalidad,
  variante: VarianteId,
  ano: number,
): Trayectoria {
  return {
    ...trayectoria,
    cambios: [...trayectoria.cambios, { ano, modalidad, variante }],
  }
}

/**
 * ¿La variante pertenece a la modalidad según el catálogo?
 * Sin catálogo no se puede validar (bancos de prueba antiguos): se acepta.
 */
export function variantePertenece(
  catalogo: CatalogoVariante[] | undefined,
  modalidad: Modalidad,
  varianteId: VarianteId,
): boolean {
  if (!catalogo) return true
  return catalogo.some((v) => v.id === varianteId && v.modalidad === modalidad)
}
