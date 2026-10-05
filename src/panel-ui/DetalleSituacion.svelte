<script lang="ts">
  import { ATRIBUTOS } from "../content/modalidades"
  import type { Situacion } from "../content/schema"

  let { situacion, alCerrar }: { situacion: Situacion; alCerrar: () => void } =
    $props()
</script>

<div class="detalle">
  <header>
    <h2>{situacion.titulo}</h2>
    <button type="button" class="cerrar" onclick={alCerrar}>Cerrar</button>
  </header>

  <dl>
    <dt>id</dt>
    <dd>{situacion.id}</dd>
    <dt>momento</dt>
    <dd>{situacion.momento}</dd>
    <dt>texto</dt>
    <dd>{situacion.texto || "—"}</dd>
    <dt>modalidades</dt>
    <dd>{situacion.modalidades?.join(", ") || "común"}</dd>
    <dt>variantes</dt>
    <dd>{situacion.variantes?.join(", ") || "—"}</dd>
    <dt>minAno</dt>
    <dd>{situacion.minAno ?? "—"}</dd>
    <dt>repetible</dt>
    <dd>{situacion.unicaVez === false ? "sí" : "no"}</dd>
    <dt>peso</dt>
    <dd>{situacion.peso ?? "—"}</dd>
  </dl>

  <h3>Opciones</h3>
  {#each situacion.opciones as opcion (opcion.id)}
    <article class="opcion">
      <h4>
        {opcion.titulo}
        <span class="id">{opcion.id}</span>
        {#if opcion.excepcion}
          <span class="marca">excepción declarada</span>
        {/if}
      </h4>
      <p>{opcion.subtitulo}</p>
      <dl>
        <dt>efectos</dt>
        <dd>
          {#if opcion.efectos}
            {ATRIBUTOS.filter((a) => opcion.efectos?.[a]).map(
              (a) => `${a} ${opcion.efectos?.[a] > 0 ? "+" : ""}${opcion.efectos?.[a]}`,
            ).join(", ")}
          {:else}
            no afecta al resultado
          {/if}
        </dd>
        <dt>flags</dt>
        <dd>{opcion.flags?.join(", ") || "—"}</dd>
        <dt>peso</dt>
        <dd>{opcion.peso ?? "—"}</dd>
        <dt>saltaCOAC</dt>
        <dd>{opcion.saltaCOAC ? "sí" : "no"}</dd>
        <dt>cambiaModalidad</dt>
        <dd>{opcion.cambiaModalidad ?? "—"}</dd>
        <dt>cambiaVariante</dt>
        <dd>{opcion.cambiaVariante ?? "—"}</dd>
      </dl>
    </article>
  {/each}
</div>

<style>
  .detalle {
    border: 1px solid var(--panel-primary);
    border-radius: var(--panel-radius);
    padding: 0 1rem 1rem;
    background: var(--panel-surface);
    margin-bottom: 1.25rem;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  h2 {
    font-size: 1.05rem;
  }
  dl {
    display: grid;
    grid-template-columns: 9rem 1fr;
    gap: 0.15rem 0.75rem;
    margin: 0.5rem 0 1rem;
    font-size: 0.9rem;
  }
  dt {
    color: var(--panel-muted);
  }
  dd {
    margin: 0;
  }
  .opcion {
    border-top: 1px solid var(--panel-border);
    padding-top: 0.5rem;
  }
  h4 {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0.25rem 0;
  }
  .id {
    color: var(--panel-muted);
    font-size: 0.75rem;
    font-weight: normal;
  }
  .marca {
    border-radius: 999px;
    background: #fef3c7;
    color: #92400e;
    padding: 0 0.5rem;
    font-size: 0.7rem;
    text-transform: uppercase;
  }
  .cerrar {
    font: inherit;
    font-size: 0.82rem;
    border: 1px solid var(--panel-border);
    background: var(--panel-surface);
    color: var(--panel-text);
    border-radius: 7px;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
  }
  .cerrar:hover {
    background: var(--panel-hover);
  }
</style>
