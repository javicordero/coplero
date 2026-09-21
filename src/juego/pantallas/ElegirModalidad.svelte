<script lang="ts">
import type { Modalidad } from "../../engine/index"
import type { ModalidadInfo } from "../presentacion"

let {
  modalidades,
  onElegir,
}: {
  modalidades: ModalidadInfo[]
  onElegir: (modalidad: Modalidad) => void
} = $props()
</script>

<section data-testid="modalidad">
  <h2>Elige modalidad</h2>
  <ul>
    {#each modalidades as modalidad (modalidad.id)}
      <li>
        <button type="button" onclick={() => onElegir(modalidad.id)}>
          <strong>{modalidad.titulo}</strong>
          <span>{modalidad.subtitulo}</span>
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
