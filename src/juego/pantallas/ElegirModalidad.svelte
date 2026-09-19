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
    gap: 0.75rem;
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
