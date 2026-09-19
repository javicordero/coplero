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

    <button type="submit" disabled={!nombreValido} data-testid="crear">
      Continuar
    </button>
  </form>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.85rem;
    color: #aaa;
  }

  input,
  select {
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #444;
    background: #1a1a1a;
    color: #ededed;
  }

  .hint {
    color: #f6ad55;
    font-size: 0.85rem;
  }

  button {
    margin-top: 0.5rem;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #555;
    background: #ededed;
    color: #0a0a0a;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
