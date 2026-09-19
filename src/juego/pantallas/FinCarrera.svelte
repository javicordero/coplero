<script lang="ts">
import { VARIANTES } from "../../content/index"
import type { ResumenCarrera } from "../../engine/index"
import {
  etiquetaFase,
  etiquetaModalidad,
  etiquetaPremio,
} from "../presentacion"

let { resumen, onReiniciar }: { resumen: ResumenCarrera; onReiniciar: () => void } =
  $props()

let tituloVariante = $derived(
  VARIANTES.find((v) => v.id === resumen.variante)?.titulo ?? resumen.variante,
)
</script>

<section data-testid="fin">
  <h2>Fin de la carrera</h2>
  <p>
    <strong>{resumen.nombre}</strong> ·
    {etiquetaModalidad(resumen.modalidad)} · {tituloVariante}
  </p>
  <p>Años en activo: {resumen.anosEnActivos}</p>
  <p>Mejor fase: {etiquetaFase(resumen.mejorFase)}</p>
  {#if resumen.premios.length > 0}
    <ul>
      {#each resumen.premios as premio (premio.ano + premio.tipo)}
        <li>{etiquetaPremio(premio.tipo)} ({premio.ano})</li>
      {/each}
    </ul>
  {:else}
    <p>Sin premios en toda la carrera.</p>
  {/if}
  <button type="button" onclick={onReiniciar} data-testid="reiniciar">
    Empezar de nuevo
  </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #555;
    background: #ededed;
    color: #0a0a0a;
    cursor: pointer;
  }
</style>
