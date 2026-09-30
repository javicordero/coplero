<script lang="ts">
import type { Indicador } from "../presentacion"
import { etiquetaMomento } from "../presentacion"

let { indicador }: { indicador: Indicador } = $props()
</script>

<p class="indicador" data-testid="indicador" data-momento={indicador.momento}>
  Año {indicador.ano} · {etiquetaMomento(indicador.momento)}
</p>

<style>
  /* Overlay fijo en la esquina superior izquierda del área de juego,
     simétrico al sol/luna de la derecha (016, FR-001). */
  .indicador {
    position: absolute;
    /* El centro del texto coincide con el centro del sol/luna (9% del alto). */
    top: calc(var(--indicador-centro) - 0.5em);
    left: var(--indicador-izquierda);
    z-index: 2;
    font-family: var(--fuente-display);
    font-size: var(--tamano-indicador);
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--c-acento-2);
  }

  /* El color acompaña al texto, nunca lo sustituye */
  .indicador[data-momento="verano"] {
    color: var(--c-acento-texto);
  }
</style>
