<script lang="ts">
let { mensaje, onReiniciar }: { mensaje: string; onReiniciar: () => void } =
  $props()
</script>

<section data-testid="error">
  <h2>Algo no ha ido bien</h2>
  <p>{mensaje}</p>
  <button type="button" onclick={onReiniciar} data-testid="reiniciar-error">
    Empezar de nuevo
  </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  p {
    color: #f6ad55;
  }

  button {
    padding: 0.6rem 1rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #555;
    background: #ededed;
    color: #0a0a0a;
    cursor: pointer;
  }
</style>
