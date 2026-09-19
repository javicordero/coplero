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
    gap: 0.75rem;
    margin-top: 1rem;
  }

  button {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: left;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #444;
    background: #1a1a1a;
    color: #ededed;
    cursor: pointer;
  }

  button:hover {
    border-color: #9ae6b4;
  }

  span {
    font-size: 0.85rem;
    color: #aaa;
  }
</style>
