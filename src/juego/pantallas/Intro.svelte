<script lang="ts">
import type { EstadoGuardado } from "../persistencia"

let {
  estadoGuardado,
  aviso,
  onEmpezar,
  onContinuar,
  onVerResultado,
}: {
  estadoGuardado: EstadoGuardado
  aviso: string | null
  onEmpezar: () => void
  onContinuar: () => void
  onVerResultado: () => void
} = $props()
</script>

<section data-testid="intro">
  <h1>Coplero</h1>
  <p>Construye tu carrera en el COAC a base de decisiones.</p>
  {#if aviso}
    <p class="aviso" role="status" aria-live="polite">{aviso}</p>
  {/if}
  {#if estadoGuardado === "en-curso"}
    <button
      type="button"
      class="primario"
      onclick={onContinuar}
      data-testid="continuar"
    >
      Continuar donde lo dejaste
    </button>
  {:else if estadoGuardado === "terminada"}
    <button
      type="button"
      class="primario"
      onclick={onVerResultado}
      data-testid="ver-resultado"
    >
      Ver resultado
    </button>
  {/if}
  <button
    type="button"
    class={estadoGuardado === "ninguno" ? "primario" : undefined}
    onclick={onEmpezar}
    data-testid="empezar"
  >
    {estadoGuardado === "ninguno" ? "Empezar" : "Empezar de cero"}
  </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: var(--esp-4);
    align-items: center;
    text-align: center;
  }

  section > button {
    width: 100%;
  }

  /* Sin hover de color en el intro: se mantiene el estado de reposo. */
  section > button:hover:not(:disabled) {
    background: var(--c-superficie);
    border-color: var(--c-borde-control);
  }

  section > button.primario:hover:not(:disabled) {
    background: var(--c-acento);
    border-color: var(--c-acento);
  }

  .aviso {
    color: var(--c-acento);
    font-size: var(--texto-sm);
  }
</style>
