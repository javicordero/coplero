<script lang="ts">
import type { SituacionPublica } from "../../engine/index"
import type { Indicador } from "../presentacion"
import IndicadorContexto from "./IndicadorContexto.svelte"

let {
  indicador,
  situacion,
  onElegir,
}: {
  indicador: Indicador
  situacion: SituacionPublica
  onElegir: (opcionId: string) => void
} = $props()
</script>

<section data-testid="decision">
  <IndicadorContexto {indicador} />
  <h2>{situacion.titulo}</h2>
  {#if situacion.texto}
    <p>{situacion.texto}</p>
  {/if}
  <ul>
    {#each situacion.opciones as opcion (opcion.id)}
      <li>
        <button type="button" onclick={() => onElegir(opcion.id)}>
          <strong>{opcion.titulo}</strong>
          <span>{opcion.subtitulo}</span>
        </button>
      </li>
    {/each}
  </ul>
</section>

<style>
  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--esp-3);
    margin-top: var(--esp-4);
  }

  button {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--esp-1);
    text-align: left;
    padding: var(--esp-3);
  }

  span {
    font-size: var(--texto-sm);
    color: var(--c-texto-suave);
  }
</style>
