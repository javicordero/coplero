<script lang="ts">
import type { Modalidad } from "../../engine/index"
import { type ModalidadInfo, SUBTITULO_MODALIDAD } from "../presentacion"

let {
  modalidades,
  onElegir,
}: {
  modalidades: ModalidadInfo[]
  onElegir: (modalidad: Modalidad) => void
} = $props()
</script>

<section class="pantalla" data-testid="modalidad">
  <div class="pantalla__cabecera">
    <h2>Elige modalidad</h2>
    <p>{SUBTITULO_MODALIDAD}</p>
  </div>

  <div class="pantalla__cuerpo">
    <ul class="opciones">
      {#each modalidades as modalidad (modalidad.id)}
        <li>
          <button
            class="tarjeta"
            type="button"
            onclick={() => onElegir(modalidad.id)}
          >
            <strong>{modalidad.titulo}</strong>
            <span>{modalidad.subtitulo}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .opciones {
    list-style: none;

    display: flex;
    flex-direction: column;
    gap: var(--esp-3);
  }

  .opciones button {
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--esp-1);

    padding: var(--esp-3) var(--esp-4);

    text-align: left;
  }

  strong {
    font-size: var(--texto-lg);
    color: var(--c-texto-fuerte);
  }

  span {
    font-size: var(--texto-sm);
    color: var(--c-texto-suave);
  }
</style>
