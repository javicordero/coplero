<script lang="ts">
import type { Temporada } from "../../engine/index"
import type { Indicador } from "../presentacion"
import { etiquetaFase, etiquetaPremio } from "../presentacion"
import IndicadorContexto from "./IndicadorContexto.svelte"

let {
  indicador,
  temporada,
  onContinuar,
}: {
  indicador: Indicador
  temporada: Temporada
  onContinuar: () => void
} = $props()
</script>

<section data-testid="resultado" class="acta">
  <IndicadorContexto {indicador} />
  <div class="hoja">
    <p class="membrete">Carnaval de Cádiz · COAC</p>
    <h2>Resultado de la temporada</h2>
    {#if temporada.fueraDeConcurso}
      <p>Este año no has concursado.</p>
    {:else}
      <p>
        Has llegado a <strong>{etiquetaFase(temporada.fase)}</strong>
        {#if temporada.puesto}· puesto {temporada.puesto}{/if}
      </p>
      {#if temporada.premios.length > 0}
        <ul>
          {#each temporada.premios as premio (premio.ano + premio.tipo)}
            <li>{etiquetaPremio(premio.tipo)}</li>
          {/each}
        </ul>
      {:else}
        <p>Sin premios este año.</p>
      {/if}
    {/if}
  </div>
  <button
    type="button"
    class="primario"
    onclick={onContinuar}
    data-testid="continuar-ano"
  >
    Continuar
  </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: var(--esp-3);
  }

  .hoja {
    display: flex;
    flex-direction: column;
    gap: var(--esp-3);
    padding: var(--esp-5);
    background: var(--c-superficie);
    border: 1px solid var(--c-separador);
    border-radius: var(--radio-sm);
    box-shadow: var(--sombra-1);
  }

  .membrete {
    font-family: var(--fuente-display);
    font-size: var(--texto-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--c-acento-2);
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--esp-1);
  }

  li {
    color: var(--c-acento-2);
  }

  button {
    margin-top: var(--esp-2);
  }
</style>
