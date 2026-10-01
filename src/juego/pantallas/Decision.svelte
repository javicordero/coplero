<script lang="ts">
import type { SituacionPublica } from "../../engine/index"

let {
  situacion,
  onElegir,
}: {
  situacion: SituacionPublica
  onElegir: (opcionId: string) => void
} = $props()
</script>

<section data-testid="decision" class="decision">
  <div class="bloque">
    <div class="titulo" data-bloque="titulo">
      <h2>{situacion.titulo}</h2>
    </div>
    <div class="texto" data-bloque="texto">
      {#if situacion.texto}
        <p>{situacion.texto}</p>
      {/if}
    </div>
    <ul class="opciones">
      {#each situacion.opciones as opcion (opcion.id)}
        <li data-bloque="opcion">
          <button type="button" onclick={() => onElegir(opcion.id)}>
            <strong>{opcion.titulo}</strong>
            <span>{opcion.subtitulo}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  /* La sección contiene solo situación + opciones y se centra en el área de
     juego con altura reservada constante (016, FR-006b). */
  .decision {
    width: 100%;
  }

  .bloque {
    height: var(--alto-bloque-decision);
    display: flex;
    flex-direction: column;
  }

  /* Bloques de altura fija: el título ocupa siempre el mismo espacio. */
  /* El título se ancla abajo de su bloque: la distancia a las opciones es
     constante con 2, 3 o 4 líneas (el hueco sobrante queda arriba). */
  .titulo {
    height: var(--alto-titulo);
    display: grid;
    align-content: end;
  }

  /* Máximo 4 líneas de título; a 320 px el texto más largo mide 117,7 px. */
  .titulo h2 {
    font-size: 1.6rem;
    color: var(--c-texto-fuerte);
  }

  .texto {
    height: var(--alto-texto);
  }

  .opciones {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: var(--esp-3);
    margin-top: var(--esp-4);
    /* Reserva espacio constante para el máximo de opciones del banco. */
    height: var(--alto-opciones);
  }

  .opciones li {
    height: var(--alto-opcion);
  }

  /* Contenido centrado con alturas reservadas: el título y la descripción
     ocupan siempre el mismo espacio, así la descripción no desplaza al título. */
  button {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: var(--esp-1);
    text-align: left;
    padding: var(--esp-2) var(--esp-3);
    /* Fondo semitransparente: deja entrever la escena de fondo. */
    background: color-mix(in srgb, var(--c-superficie) 96%, transparent);
  }

  .opciones button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--c-superficie-alta) 98%, transparent);
  }

  strong {
    font-size: 1.2rem;
    line-height: 1.1;
    /* Reserva de 2 líneas; el título se pega abajo, subido 2 px. */
    height: calc(2 * 1.2rem * 1.1);
    padding-bottom: 2px;
    display: flex;
    align-items: flex-end;
    /* Más claro que el texto normal, sin llegar al blanco puro. */
    color: color-mix(in srgb, var(--c-texto) 55%, var(--c-texto-fuerte));
  }

  span {
    font-size: 1rem;
    line-height: 1.15;
    /* Reserva de 2 líneas; la descripción empieza arriba (el texto largo cae). */
    height: calc(2 * 1rem * 1.15);
    display: flex;
    align-items: flex-start;
    /* Se aclara hacia el blanco para ganar contraste con la escena de fondo. */
    color: color-mix(in srgb, var(--c-texto-suave) 60%, var(--c-texto));
  }
</style>
