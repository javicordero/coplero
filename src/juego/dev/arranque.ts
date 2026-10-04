// Dispatcher SOLO de desarrollo de los arranques directos de pantalla. Unifica
// el parámetro `dev=` para que `Juego.svelte` haga una única comprobación dentro
// de su rama `import.meta.env.DEV`.
//
//   /jugar?dev=fin        → pantalla final con una tarjeta de ejemplo
//   /jugar?dev=resultado  → pantalla de resultado con un resultado de ejemplo
//
// No debe importarse desde producción.

import type { Momento, TarjetaFinal, Temporada } from "../../engine/index"
import { arranqueFinDesdeUrl } from "./fixturesFin"
import { arranqueResultadoDesdeUrl } from "./fixturesResultado"

export type ArranqueDev =
  | { pantalla: "fin"; tarjeta: TarjetaFinal; momento: Momento }
  | {
      pantalla: "resultado"
      temporada: Temporada
      ano: number
      momento: Momento
    }

/** Interpreta la query string de arranque dev; `null` si no hay `dev` conocido. */
export function arranqueDevDesdeUrl(search: string): ArranqueDev | null {
  const fin = arranqueFinDesdeUrl(search)
  if (fin) {
    return { pantalla: "fin", tarjeta: fin.tarjeta, momento: fin.momento }
  }

  const resultado = arranqueResultadoDesdeUrl(search)
  if (resultado) {
    return {
      pantalla: "resultado",
      temporada: resultado.temporada,
      ano: resultado.ano,
      momento: resultado.momento,
    }
  }

  return null
}
