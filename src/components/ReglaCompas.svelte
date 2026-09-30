<script lang="ts">
// Elemento firma (012, R6): un compás de 3/4 dibujado con SVG inline.
// Decorativo, sin fichero de imagen y sin JS. Ver contracts/ui.md §6.
// Al ser Svelte, Astro lo sirve como HTML estático sin hidratar (0 kB de JS).
// `...resto` reenvía atributos (incluido el scope de Astro y `style`) al svg.
import type { SVGAttributes } from "svelte/elements"

let { class: clase = "", ...resto }: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg
  class={["regla-compas", clase]}
  viewBox="0 0 120 12"
  aria-hidden="true"
  focusable="false"
  {...resto}
>
  <line class="pauta" x1="0" y1="6" x2="104" y2="6"></line>
  <circle class="golpe" cx="16" cy="6" r="3.5"></circle>
  <circle class="golpe" cx="52" cy="6" r="3.5"></circle>
  <circle class="golpe" cx="88" cy="6" r="3.5"></circle>
  <line class="barra" x1="104" y1="0" x2="104" y2="12"></line>
</svg>

<style>
  .regla-compas {
    display: block;
    width: 100%;
    max-width: 9rem;
    height: auto;
    color: var(--c-acento);
  }

  .pauta {
    stroke: var(--c-separador);
    stroke-width: 1;
  }

  .golpe {
    fill: currentColor;
  }

  .barra {
    stroke: currentColor;
    stroke-width: 1.5;
  }
</style>
