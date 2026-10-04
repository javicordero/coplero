<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    titulo,
    tieneContenido = false,
    children,
  }: {
    titulo: string
    tieneContenido?: boolean
    children: Snippet
  } = $props()
</script>

<details class="seccion">
  <summary>
    <span class="chevron" aria-hidden="true"></span>
    <span class="titulo">{titulo}</span>
    {#if tieneContenido}
      <span class="punto" title="Tiene contenido" aria-label="Tiene contenido"
      ></span>
    {/if}
  </summary>
  <div class="contenido">{@render children()}</div>
</details>

<style>
  .seccion {
    border: 1px solid var(--f-border, #e5e7eb);
    border-radius: 10px;
    background: var(--f-surface, #fff);
    margin: 0.6rem 0;
    overflow: hidden;
  }
  summary {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.6rem 0.85rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--f-text, #111827);
    list-style: none;
    user-select: none;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary:hover {
    background: var(--f-hover, #f9fafb);
  }
  summary:focus-visible {
    outline: 2px solid var(--f-primary, #4f46e5);
    outline-offset: -2px;
  }
  .chevron {
    flex: none;
    width: 0.55rem;
    height: 0.55rem;
    border-right: 2px solid var(--f-muted, #6b7280);
    border-bottom: 2px solid var(--f-muted, #6b7280);
    transform: rotate(-45deg);
    transition: transform 0.15s ease;
  }
  details[open] .chevron {
    transform: rotate(45deg);
  }
  .titulo {
    flex: 1;
  }
  .punto {
    flex: none;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: var(--f-primary, #4f46e5);
  }
  .contenido {
    padding: 0.35rem 0.85rem 0.85rem;
    border-top: 1px solid var(--f-border, #e5e7eb);
  }
</style>
