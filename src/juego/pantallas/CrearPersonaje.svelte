<script lang="ts">
import type { DatosCreacion } from "../estado.svelte"
import { normalizarNombre, tituloDelJuego } from "../presentacion"

let { onCrear }: { onCrear: (datos: DatosCreacion) => void } = $props()

let nombre = $state("")
let edad = $state(30)
let localidad = $state("Cádiz")
let genero = $state<DatosCreacion["genero"]>("masculino")

let nombreValido = $derived(normalizarNombre(nombre).length > 0)
let titulo = $derived(tituloDelJuego(genero))

function enviar(evento: SubmitEvent) {
  evento.preventDefault()
  if (!nombreValido) return
  onCrear({ nombre, edad, localidad, genero })
}
</script>

<section data-testid="crear-personaje">
  <h2>{titulo}</h2>
  <p>Así se llamará tu carrera en el Falla.</p>

  <form onsubmit={enviar}>
    <label for="nombre">Nombre o apodo</label>
    <input id="nombre" bind:value={nombre} maxlength="24" autocomplete="off" />

    <label for="edad">Edad</label>
    <input id="edad" type="number" bind:value={edad} min="18" max="65" />

    <label for="localidad">Localidad</label>
    <input id="localidad" bind:value={localidad} autocomplete="off" />

    <label for="genero">Género</label>
    <select id="genero" bind:value={genero}>
      <option value="masculino">Masculino</option>
      <option value="femenino">Femenino</option>
      <option value="no_binario">No binario</option>
    </select>

    {#if !nombreValido}
      <p class="hint">Escribe un nombre o apodo.</p>
    {/if}

    <button
      type="submit"
      class="primario"
      disabled={!nombreValido}
      data-testid="crear"
    >
      Continuar
    </button>
  </form>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: var(--esp-3);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--esp-2);
  }

  label {
    font-size: var(--texto-sm);
    color: var(--c-texto-suave);
  }

  input,
  select {
    padding: var(--esp-2);
    border-radius: var(--radio-sm);
    border: 1px solid var(--c-borde-control);
    background: var(--c-superficie);
    color: var(--c-texto);
  }

  .hint {
    color: var(--c-acento);
    font-size: var(--texto-sm);
  }

  button {
    margin-top: var(--esp-2);
  }
</style>
