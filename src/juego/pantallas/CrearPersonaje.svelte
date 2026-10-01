<script lang="ts">
import type { DatosCreacion } from "../estado.svelte"
import { GENEROS_INFO, normalizarNombre } from "../presentacion"

let {
  onCrear,
  onGenero,
}: {
  onCrear: (datos: DatosCreacion) => void
  onGenero?: (genero: DatosCreacion["genero"]) => void
} = $props()

let nombre = $state("")
let edad = $state<number | null>(null)
let localidad = $state("")
let genero = $state<DatosCreacion["genero"]>("masculino")

let nombreValido = $derived(normalizarNombre(nombre).length > 0)

// La marca de la cabecera debe reflejar el sexo en cuanto se elige (FR-006).
$effect(() => {
  onGenero?.(genero)
})

function enviar(evento: SubmitEvent) {
  evento.preventDefault()
  if (!nombreValido) return
  onCrear({ nombre, edad: edad ?? 30, localidad, genero })
}
</script>

<section data-testid="crear-personaje">
  <h2>Crea tu personaje</h2>

  <p>Inicia tu carrera como autor de carnaval</p>

  <form onsubmit={enviar}>
    <label for="nombre">Nombre o apodo</label>
    <input
      id="nombre"
      bind:value={nombre}
      maxlength="24"
      autocomplete="off"
      placeholder="¿Cómo te conocerán?"
      required
    />

    <label for="edad">Edad</label>
    <input
      id="edad"
      type="number"
      bind:value={edad}
      min="18"
      max="65"
      placeholder="30"
    />

    <label for="localidad">Localidad</label>
    <input
      id="localidad"
      bind:value={localidad}
      autocomplete="off"
      placeholder="Cádiz"
    />

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
  /* Fondo y decoración de pantalla: se pintan sobre `main` mientras esta
     pantalla está montada, para no tocar el resto del sitio. */
  /* La pantalla manda sobre `main`: lo fija a la altura máxima que queremos
     (viewport menos cabecera) y neutraliza su `flex: 1`, para que nunca crezca
     por debajo de la cabecera. El pie sigue quedando bajo el pliegue. */
  :global(main[data-testid="juego"][data-pantalla="crear-personaje"]) {
    background: var(--c-fondo);
    height: calc(100dvh - var(--alto-cabecera, 0px));
    min-height: 0;
    flex: 0 0 auto;
  }

  :global(main[data-pantalla="crear-personaje"])::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.045;
    background-image: radial-gradient(
      circle at 20% 20%,
      var(--c-texto-fuerte) 0 1px,
      transparent 1px
    );
    background-size: 5px 5px;
  }

  section {
    width: min(calc(100% - 48px), var(--ancho-marco));
    /* Llena el alto que le deja `main` (ya acotado arriba). */
    height: 100%;
    overflow: hidden;

    margin: 0 auto;
    /* El relleno inferior es mayor que el superior para subir un poco el
       contenido dentro del hueco disponible. */
    padding: 0 0 var(--esp-4);

    position: relative;
    z-index: 1;

    display: flex;
    flex-direction: column;
    justify-content: center;
    justify-content: safe center;

    font-family: var(--fuente-texto);
  }

  section h2 {
    margin: 0;

    text-align: center;

    color: var(--c-texto-fuerte);

    font-family: var(--fuente-display);
    font-size: clamp(2rem, 6.5vw, 3rem);
    line-height: 0.9;

    letter-spacing: 0.05em;
    text-transform: uppercase;

    text-shadow: 3px 3px 0 var(--c-superficie);
  }

  section > p {
    margin: var(--esp-4) 0;

    color: var(--c-texto-suave);

    font-size: var(--texto-lg);
    line-height: var(--interlinea-normal);

    text-align: center;
  }

  section form {
    display: flex;
    flex-direction: column;

    padding: var(--esp-5);

    background: var(--c-superficie);
    border: 1px solid var(--c-separador);
    border-radius: var(--radio-sm);

    box-shadow: var(--sombra-2);
  }

  section label,
  section legend {
    display: block;

    margin-bottom: var(--esp-1);

    color: var(--c-texto);

    font-size: var(--texto-sm);
    font-weight: var(--peso-fuerte);

    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  section form > input {
    width: 100%;
    height: 3rem;

    margin-bottom: var(--esp-3);
    padding: 0 var(--esp-2);

    color: var(--c-texto);
    background: var(--c-superficie);

    border: 1px solid var(--c-borde-control);
    border-radius: var(--radio-sm);

    font-size: var(--texto-base);

    transition:
      background-color var(--dur-2) var(--ease-sal),
      border-color var(--dur-2) var(--ease-sal);
  }

  section form > input:hover {
    border-color: var(--c-acento);
  }

  section form > input:focus {
    background: var(--c-superficie-alta);
    border-color: var(--c-acento);

    /* El resaltado es el propio borde; sin el outline ancho por defecto. */
    outline: none;
  }

  section form > input::placeholder {
    color: var(--c-texto-suave);
  }

  section input[type="number"] {
    appearance: textfield;
  }

  section input[type="number"]::-webkit-inner-spin-button,
  section input[type="number"]::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }

  section fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }

  section legend {
    margin-bottom: var(--esp-1);
  }

  .opciones {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--esp-2);

    margin-bottom: var(--esp-4);
  }

  .opciones input[type="radio"] {
    position: absolute;

    width: 1px;
    height: 1px;
    min-height: 0;
    margin: 0;

    opacity: 0;
    pointer-events: none;
  }

  .opciones label {
    min-width: 0;
    min-height: 3rem;

    margin: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--esp-2);

    color: var(--c-texto-suave);
    background: var(--c-superficie);

    border: 1px solid var(--c-borde-control);
    border-radius: var(--radio-sm);

    cursor: pointer;

    font-size: var(--texto-xs);
    font-weight: var(--peso-fuerte);

    letter-spacing: 0.04em;
    text-align: center;
    text-transform: uppercase;

    transition:
      color var(--dur-2) var(--ease-sal),
      border-color var(--dur-2) var(--ease-sal),
      background-color var(--dur-2) var(--ease-sal);
  }

  .opciones label:hover {
    color: var(--c-texto);
    border-color: var(--c-acento);
  }

  .opciones input[type="radio"]:checked + label {
    color: var(--c-sobre-acento);
    background: var(--c-acento);
    border-color: var(--c-acento);

    box-shadow: 0 5px 18px
      color-mix(in srgb, var(--c-acento) 18%, transparent);
  }

  .opciones input[type="radio"]:focus-visible + label {
    outline: var(--foco-ancho) solid var(--c-acento-texto);
    outline-offset: var(--foco-offset);
  }

  section button.primario {
    width: 100%;
    min-height: 3.25rem;

    padding: var(--esp-2) var(--esp-4);

    border-radius: var(--radio-sm);

    font-size: 1.25rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Sin desplazamiento al pulsar: solo cambian los colores. */
  section button.primario:hover,
  section button.primario:active {
    transform: none;
  }

  /* Hover: se aclara un poco, pero menos que el acento fuerte por defecto. */
  section button.primario:hover:not(:disabled) {
    background: color-mix(in srgb, var(--c-acento) 88%, var(--c-texto-fuerte));
    border-color: color-mix(in srgb, var(--c-acento) 88%, var(--c-texto-fuerte));
  }

  /* En pantallas bajas no se puede mantener todo dentro del viewport sin
     perder contenido: se permite desplazar en vertical. */
  @media (max-height: 719px) {
    :global(main[data-testid="juego"][data-pantalla="crear-personaje"]) {
      height: auto;
      min-height: calc(100dvh - var(--alto-cabecera, 0px));
      flex: 1;
    }

    section {
      height: auto;
      min-height: calc(100dvh - var(--alto-cabecera, 0px) - 2 * var(--esp-6));
      overflow: visible;
    }
  }

  @media (max-width: 600px) {
    section {
      width: 100%;
    }

    section form {
      padding: var(--esp-4);
    }

    .opciones label {
      padding: var(--esp-1) 0;
    }
  }

  /* En pantallas muy estrechas se reduce la separación para que cada tarjeta
     de género siga entrando en una línea. */
  @media (max-width: 340px) {
    .opciones {
      gap: var(--esp-1);
    }

    .opciones label {
      letter-spacing: normal;
    }
  }
</style>
