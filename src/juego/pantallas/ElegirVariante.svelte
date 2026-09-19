<script lang="ts">
import type { Variante } from "../../content/index"

let {
  variantes,
  onElegir,
}: {
  variantes: Variante[]
  onElegir: (variante: string) => void
} = $props()
</script>

<section data-testid="variante">
  <h2>Elige variante</h2>
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
