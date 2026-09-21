<script lang="ts">
import type { Variante } from "../../content/index"

let {
  variantes,
  onElegir,
  titulo = "Elige variante",
}: {
  variantes: Variante[]
  onElegir: (variante: string) => void
  titulo?: string
} = $props()
</script>

<section data-testid="variante">
  <h2>{titulo}</h2>
  <ul>
    {#each variantes as variante (variante.id)}
      <li>
        <button type="button" onclick={() => onElegir(variante.id)}>
          <strong>{variante.titulo}</strong>
          <span>{variante.subtitulo}</span>
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
