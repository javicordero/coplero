<script lang="ts">
let {
  hayGuardado,
  aviso,
  onEmpezar,
  onContinuar,
}: {
  hayGuardado: boolean
  aviso: string | null
  onEmpezar: () => void
  onContinuar: () => void
} = $props()
</script>

<section data-testid="intro">
  <h1>Coplero</h1>
  <p>Construye tu carrera en el COAC a base de decisiones.</p>
  {#if aviso}
    <p class="aviso">{aviso}</p>
  {/if}
  {#if hayGuardado}
    <button type="button" onclick={onContinuar} data-testid="continuar">
      Continuar donde lo dejaste
    </button>
  {/if}
  <button type="button" onclick={onEmpezar} data-testid="empezar">
    {hayGuardado ? "Empezar de cero" : "Empezar"}
  </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
  }

  .aviso {
    color: #f6ad55;
    font-size: 0.9rem;
  }
</style>
