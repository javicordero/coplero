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
    <button type="button" onclick={onContinuar} data-testid="continuar">
      Continuar donde lo dejaste
    </button>
  {:else if estadoGuardado === "terminada"}
    <button type="button" onclick={onVerResultado} data-testid="ver-resultado">
      Ver resultado
    </button>
  {/if}
  <button type="button" onclick={onEmpezar} data-testid="empezar">
    {estadoGuardado === "ninguno" ? "Empezar" : "Empezar de cero"}
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

  button {
    padding: 0.75rem 1.25rem;
    min-height: 44px;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #555;
    background: #ededed;
    color: #0a0a0a;
    cursor: pointer;
  }
</style>
