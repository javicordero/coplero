<script lang="ts">
import type { Indicador } from "../presentacion"
import { etiquetaMomento, etiquetaTipo } from "../presentacion"

let { indicador }: { indicador: Indicador } = $props()
</script>

<p class="indicador" data-testid="indicador">
  Año {indicador.ano} · {etiquetaMomento(indicador.momento)}
  {#if indicador.tipo}· {etiquetaTipo(indicador.tipo)}{/if}
</p>

<style>
  .indicador {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9ae6b4;
    margin-bottom: 0.75rem;
  }
</style>
