<script lang="ts">
import type { Variante } from "../../content/index"
import IconoBigote from "./IconoBigote.svelte"
import IconoGuitarra from "./IconoGuitarra.svelte"
import IconoNuevaEscuela from "./IconoNuevaEscuela.svelte"
import IconoRaices from "./IconoRaices.svelte"

let {
  variantes,
  onElegir,
  titulo = "Elige tu estilo",
  subtitulo,
  iconos = false,
}: {
  variantes: Variante[]
  onElegir: (variante: string) => void
  titulo?: string
  subtitulo?: string
  iconos?: boolean
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
            class:tarjeta--icono={iconos}
            type="button"
            onclick={() => onElegir(variante.id)}
          >
            {#if iconos}
              {#if variante.id === "clasico_comparsista"}
                <IconoBigote />
              {:else if variante.id === "evolucion_con_raices"}
                <IconoRaices />
              {:else if variante.id === "nueva_escuela"}
                <IconoNuevaEscuela />
              {:else}
                <!-- Pendiente de icono definitivo (de momento, guitarra). -->
                <IconoGuitarra />
              {/if}
            {/if}
            <strong>{variante.titulo}</strong>
            <span
              class="tarjeta__subtitulo"
              class:tarjeta__subtitulo--cita={variante.cita}
              >{variante.cita
                ? `“${variante.subtitulo}”`
                : variante.subtitulo}</span
            >
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
</style>
