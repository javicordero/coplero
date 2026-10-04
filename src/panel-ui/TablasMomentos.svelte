<script lang="ts">
  import type { Situacion } from "../content/schema"
  import type { GrupoMomento } from "../panel/resumen"

  let {
    grupos,
    alAbrir,
    alEditar,
    alEliminar,
  }: {
    grupos: GrupoMomento[]
    alAbrir: (s: Situacion) => void
    alEditar: (s: Situacion) => void
    alEliminar: (s: Situacion) => void
  } = $props()
</script>

{#each grupos as grupo (grupo.momento)}
  <section class="momento">
    <h2>
      {grupo.momento}
      <span class="recuento">{grupo.total}</span>
    </h2>

    {#if grupo.total === 0}
      <p class="vacio">Sin situaciones en este momento.</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>Situación</th>
            <th>Momento</th>
            <th>Opción 1</th>
            <th>Opción 2</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each grupo.situaciones as situacion (situacion.id)}
            <tr>
              <td>
                <button
                  type="button"
                  class="enlace"
                  onclick={() => alAbrir(situacion)}
                >
                  {situacion.titulo}
                </button>
                <span class="id">{situacion.id}</span>
              </td>
              <td>{situacion.momento}</td>
              <td>{situacion.opciones[0]?.titulo ?? "—"}</td>
              <td>{situacion.opciones[1]?.titulo ?? "—"}</td>
              <td class="acciones">
                <button type="button" onclick={() => alEditar(situacion)}>
                  Editar
                </button>
                <button type="button" onclick={() => alEliminar(situacion)}>
                  Eliminar
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>
{/each}

<style>
  .momento {
    margin-bottom: 2rem;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .recuento {
    display: inline-flex;
    min-width: 1.6rem;
    justify-content: center;
    border-radius: 999px;
    background: #e8e0d0;
    padding: 0 0.5rem;
    font-size: 0.85rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  th,
  td {
    border: 1px solid #ddd;
    padding: 0.4rem 0.6rem;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f6f2e9;
  }
  .enlace {
    border: 0;
    background: none;
    padding: 0;
    color: #8a3324;
    font: inherit;
    text-align: left;
    text-decoration: underline;
    cursor: pointer;
  }
  .id {
    display: block;
    color: #777;
    font-size: 0.75rem;
  }
  .acciones {
    white-space: nowrap;
  }
  .vacio {
    color: #777;
    font-style: italic;
  }
</style>
