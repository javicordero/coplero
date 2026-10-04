<script lang="ts">
import type { Temporada } from "../../engine/index"
import {
  etiquetaFase,
  etiquetaPremio,
  ordenarDistinciones,
  ROSETAS,
} from "../presentacion"

let {
  temporada,
  onContinuar,
}: {
  temporada: Temporada
  onContinuar: () => void
} = $props()

// Si no se pasó de preliminares, el texto cambia: no «Has llegado a» sino
// «Te has quedado en».
let llegada = $derived(
  temporada.fase === "preliminares" ? "Te has quedado en" : "Has llegado a",
)
</script>

<section data-testid="resultado" class="resultado">
  <div class="panel">
    {#if temporada.fueraDeConcurso}
      <p class="fuera">Este año no has concursado.</p>
    {:else}
      <div class="llegada">
        <p class="llegada__texto">{llegada}</p>
        <p class="fase">{etiquetaFase(temporada.fase)}</p>
        {#if temporada.puesto}
          <p class="puesto">puesto {temporada.puesto}</p>
        {/if}
      </div>

      {#if temporada.premios.length > 0}
        <div class="distinciones" data-testid="distinciones">
          {#each ordenarDistinciones(temporada.premios) as premio (premio.tipo)}
            <figure class="distincion" data-tipo={premio.tipo}>
              <img
                class="distincion__roseta"
                src={ROSETAS[premio.tipo]}
                alt=""
              />
              <figcaption class="distincion__nombre">
                {etiquetaPremio(premio.tipo)}
              </figcaption>
            </figure>
          {/each}
        </div>
      {/if}
    {/if}

    <button
      type="button"
      class="primario"
      onclick={onContinuar}
      data-testid="continuar-ano"
    >
      Continuar
    </button>
  </div>
</section>

<style>
  .resultado {
    display: flex;
    flex-direction: column;
  }

  /* Panel de las pantallas de creación: superficie, borde y sombra. */
  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--esp-4);

    padding: var(--esp-5);

    background: var(--c-superficie);
    border: 1px solid var(--c-separador);
    border-radius: var(--radio-sm);
    box-shadow: var(--sombra-2);
  }

  .fuera {
    font-size: var(--texto-lg);
    line-height: var(--interlinea-normal);
    color: var(--c-texto);
  }

  .llegada {
    display: flex;
    flex-direction: column;
    gap: var(--esp-1);
  }

  .llegada__texto {
    color: var(--c-texto-suave);
    font-size: var(--texto-sm);
    font-weight: var(--peso-fuerte);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .fase {
    color: var(--c-texto);
    font-family: var(--fuente-display);
    font-size: var(--texto-2xl);
    line-height: 1.05;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  /* El puesto es el protagonista: por encima de la fase. */
  .puesto {
    color: var(--c-acento);
    font-family: var(--fuente-display);
    font-size: clamp(2.25rem, 11vw, 3rem);
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  /* Distinciones en una fila: roseta encima, nombre debajo en texto sutil.
     Sin card; cada distinción ocupa la mitad del ancho. */
  .distinciones {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--esp-4) var(--esp-3);
  }

  .distincion {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--esp-2);
    margin: 0;
  }

  .distincion__nombre {
    color: var(--c-texto-suave);
    font-size: 0.6875rem;
    font-weight: var(--peso-normal);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    text-wrap: balance;
  }

  /* El texto toma el color de su roseta. */
  .distincion[data-tipo="aguja_de_oro"] .distincion__nombre {
    color: var(--c-carnaval-oro);
  }

  .distincion[data-tipo="copla_para_andalucia"] .distincion__nombre {
    color: var(--c-carnaval-verde);
  }

  .distincion[data-tipo="candela_y_espino"] .distincion__nombre {
    color: var(--c-carnaval-rojo);
  }

  .distincion__roseta {
    width: 2.5rem;
    height: auto;
  }

  button.primario {
    width: 100%;
  }
</style>
