<script lang="ts">
let {
  onContinuar,
  onNuevaPartida,
}: {
  onContinuar: () => void
  onNuevaPartida: () => void
} = $props()
</script>

<section data-testid="reanudar">
  <h1>Coplero</h1>
  <p>Construye tu carrera en el COAC a base de decisiones.</p>
  <button
    type="button"
    class="primario"
    onclick={onContinuar}
    data-testid="continuar"
  >
    Continuar donde lo dejaste
  </button>
  <button type="button" onclick={onNuevaPartida} data-testid="nueva-partida">
    Empezar una partida nueva
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

  /* Sin hover de color en la reanudación: se mantiene el estado de reposo. */
  section > button:hover:not(:disabled) {
    background: var(--c-superficie);
    border-color: var(--c-borde-control);
  }

  section > button.primario:hover:not(:disabled) {
    background: var(--c-acento);
    border-color: var(--c-acento);
  }
</style>
