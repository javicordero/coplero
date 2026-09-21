<script lang="ts">
let { mensaje, onReiniciar }: { mensaje: string; onReiniciar: () => void } =
  $props()
</script>

<section data-testid="error">
  <h2>Algo no ha ido bien</h2>
  <p>{mensaje}</p>
  <button
    type="button"
    class="primario"
    onclick={onReiniciar}
    data-testid="reiniciar-error"
  >
    Empezar de nuevo
  </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: var(--esp-3);
  }

  p {
    color: var(--c-error);
  }
</style>
