<script lang="ts">
import type { DatosCreacion } from "../estado.svelte"
import { GENEROS_INFO, normalizarNombre, tituloDelJuego } from "../presentacion"

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

    <fieldset class="genero">
      <legend>Género</legend>
      <div class="opciones" data-testid="genero">
        {#each GENEROS_INFO as opcion (opcion.id)}
          <input
            type="radio"
            name="genero"
            id={`genero-${opcion.id}`}
            value={opcion.id}
            bind:group={genero}
          />
          <label for={`genero-${opcion.id}`}>{opcion.titulo}</label>
        {/each}
      </div>
    </fieldset>

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

  label,
  legend {
    font-size: var(--texto-sm);
    color: var(--c-texto-suave);
  }

  input:not([type="radio"]) {
    padding: var(--esp-2);
    border-radius: var(--radio-sm);
    border: 1px solid var(--c-borde-control);
    background: var(--c-superficie);
    color: var(--c-texto);
  }

  .genero {
    border: 0;
    padding: 0;
    margin: 0;
  }

  .genero legend {
    padding: 0;
    margin-bottom: var(--esp-2);
  }

  .opciones {
    display: flex;
    gap: var(--esp-2);
  }

  .opciones input {
    position: absolute;
    width: 1px;
    height: 1px;
    min-height: 0;
    margin: 0;
    opacity: 0;
    pointer-events: none;
  }

  .opciones label {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: var(--esp-2);
    border: 1px solid var(--c-borde-control);
    border-radius: var(--radio-sm);
    background: var(--c-superficie);
    color: var(--c-texto);
    text-align: center;
    overflow-wrap: break-word;
    cursor: pointer;
    transition:
      background-color var(--dur-1) var(--ease-sal),
      border-color var(--dur-1) var(--ease-sal),
      color var(--dur-1) var(--ease-sal);
  }

  .opciones label:hover {
    background: var(--c-superficie-alta);
    border-color: var(--c-acento);
  }

  .opciones input:checked + label {
    background: var(--c-superficie-alta);
    border-color: var(--c-acento);
    color: var(--c-acento);
  }

  .opciones input:focus-visible + label {
    outline: var(--foco-ancho) solid var(--c-acento-texto);
    outline-offset: var(--foco-offset);
  }

  .hint {
    color: var(--c-acento);
    font-size: var(--texto-sm);
  }

  button {
    margin-top: var(--esp-2);
  }
</style>
