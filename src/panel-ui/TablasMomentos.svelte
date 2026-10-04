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
      <table>
        <thead>
          <tr>
            <th>{tipo}</th>
            <th>Momento</th>
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
              <td>{entidad.momento}</td>
              <td>{entidad.opciones[0]?.titulo ?? "—"}</td>
              <td>{entidad.opciones[1]?.titulo ?? "—"}</td>
              {#if esCondicional}
                <td>
                  {entidad.ventanaAnos ?? "—"} años /
                  {entidad.probabilidad ?? "—"}
                </td>
              {/if}
              <td class="acciones">
                <button type="button" onclick={() => alEditar(entidad)}>
                  Editar
                </button>
                <button type="button" onclick={() => alEliminar(entidad)}>
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
