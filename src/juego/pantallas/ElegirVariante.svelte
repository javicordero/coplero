<script lang="ts">
import type { Variante } from "../../content/index"

let {
  variantes,
  onElegir,
  titulo = "Elige variante",
  subtitulo,
}: {
  variantes: Variante[]
  onElegir: (variante: string) => void
  titulo?: string
  subtitulo?: string
} = $props()
</script>

<section class="pantalla" data-testid="variante">
  <div class="pantalla__cabecera">
    <h2>{titulo}</h2>
    {#if subtitulo}
      <p>{subtitulo}</p>
    {/if}
  </div>

  <div class="pantalla__cuerpo">
    <ul class="opciones">
      {#each variantes as variante (variante.id)}
        <li>
          <button
            class="tarjeta"
            type="button"
            onclick={() => onElegir(variante.id)}
          >
            <strong>{variante.titulo}</strong>
            <span>{variante.subtitulo}</span>
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
