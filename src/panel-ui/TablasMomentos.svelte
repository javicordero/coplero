<script lang="ts">
  import type { Momento } from "../content/modalidades"
  import type { GrupoMomento } from "../panel/resumen"

  interface EntidadListable {
    id: string
    momento: Momento
    titulo: string
    opciones: { titulo: string }[]
    ventanaAnos?: number
    probabilidad?: number
  }

  let {
    grupos,
    tipo,
    alAbrir,
    alEditar,
    alEliminar,
  }: {
    grupos: GrupoMomento<EntidadListable>[]
    tipo: "situación" | "condicional"
    alAbrir: (e: EntidadListable) => void
    alEditar: (e: EntidadListable) => void
    alEliminar: (e: EntidadListable) => void
  } = $props()

  const esCondicional = $derived(tipo === "condicional")
</script>

{#each grupos as grupo (grupo.momento)}
  <section class="momento">
    <h2>
      {grupo.momento}
      <span class="recuento">{grupo.total}</span>
    </h2>

    {#if grupo.total === 0}
      <p class="vacio">Sin {tipo}s en este momento.</p>
    {:else}
      <div class="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>{tipo}</th>
              <th>Opción 1</th>
              <th>Opción 2</th>
              {#if esCondicional}
                <th>Ventana / Prob.</th>
              {/if}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each grupo.entidades as entidad (entidad.id)}
              <tr>
                <td>
                  <button
                    type="button"
                    class="enlace"
                    onclick={() => alAbrir(entidad)}
                  >
                    {entidad.titulo}
                  </button>
                  <span class="id">{entidad.id}</span>
                </td>
                <td>{entidad.opciones[0]?.titulo ?? "—"}</td>
                <td>{entidad.opciones[1]?.titulo ?? "—"}</td>
                {#if esCondicional}
                  <td>
                    {entidad.ventanaAnos ?? "—"} años /
                    {entidad.probabilidad ?? "—"}
                  </td>
                {/if}
                <td class="acciones">
                  <button
                    type="button"
                    class="accion"
                    onclick={() => alEditar(entidad)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="accion peligro"
                    onclick={() => alEliminar(entidad)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
{/each}

<style>
  .momento {
    margin-bottom: 1.75rem;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    margin: 0 0 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--panel-muted);
  }
  .recuento {
    display: inline-flex;
    min-width: 1.6rem;
    justify-content: center;
    border-radius: 999px;
    background: var(--panel-hover);
    border: 1px solid var(--panel-border);
    padding: 0 0.5rem;
    font-size: 0.8rem;
    color: var(--panel-text);
  }
  .tabla-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid var(--panel-border);
    border-radius: var(--panel-radius);
    background: var(--panel-surface);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  th,
  td {
    padding: 0.5rem 0.7rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--panel-border);
  }
  th {
    background: var(--panel-hover);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--panel-muted);
    white-space: nowrap;
  }
  /* La primera columna queda fija al hacer scroll horizontal. */
  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--panel-surface);
    border-right: 1px solid var(--panel-border);
  }
  th:first-child {
    z-index: 2;
    background: var(--panel-hover);
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  .enlace {
    border: 0;
    background: none;
    padding: 0;
    color: var(--panel-primary);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .enlace:hover {
    text-decoration: underline;
  }
  .enlace:focus-visible {
    outline: 2px solid var(--panel-primary);
    outline-offset: 2px;
    border-radius: 4px;
  }
  .id {
    display: block;
    color: var(--panel-muted);
    font-size: 0.72rem;
  }
  .acciones {
    white-space: nowrap;
  }
  .accion {
    font: inherit;
    font-size: 0.78rem;
    border: 1px solid var(--panel-border);
    background: var(--panel-surface);
    color: var(--panel-text);
    border-radius: 7px;
    padding: 0.25rem 0.6rem;
    cursor: pointer;
  }
  .accion:hover {
    background: var(--panel-hover);
  }
  .accion.peligro {
    color: var(--panel-danger);
    border-color: var(--panel-danger);
  }
  .accion.peligro:hover {
    background: #fef2f2;
  }
  .vacio {
    color: var(--panel-muted);
    font-style: italic;
  }
</style>
