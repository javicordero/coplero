<script lang="ts">
import type { Indicador } from "../presentacion"
import { etiquetaMomento, etiquetaTipo } from "../presentacion"

let { indicador }: { indicador: Indicador } = $props()
</script>

<p
  class="indicador"
  data-testid="indicador"
  data-momento={indicador.momento}
  data-tipo={indicador.tipo}
>
  Año {indicador.ano} · {etiquetaMomento(indicador.momento)}
  {#if indicador.tipo}· {etiquetaTipo(indicador.tipo)}{/if}
</p>

<style>
  .indicador {
    font-family: var(--fuente-display);
    font-size: var(--texto-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--c-acento-2);
    margin-bottom: var(--esp-3);
  }

  /* El color acompaña al texto, nunca lo sustituye (FR-006) */
  .indicador[data-momento="verano"] {
    color: var(--c-acento);
  }
</style>
