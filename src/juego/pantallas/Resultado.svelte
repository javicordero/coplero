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

<section data-testid="resultado">
  <IndicadorContexto {indicador} />
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
  <button type="button" onclick={onContinuar} data-testid="continuar-ano">
    Continuar
  </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  li {
    color: #9ae6b4;
  }

  button {
    margin-top: 0.5rem;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #555;
    background: #ededed;
    color: #0a0a0a;
    cursor: pointer;
  }
</style>
