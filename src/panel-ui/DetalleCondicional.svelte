<script lang="ts">
  import { ATRIBUTOS } from "../content/modalidades"
  import type { Condicional, Requisito } from "../content/schema"

  let { condicional, alCerrar }: { condicional: Condicional; alCerrar: () => void } =
    $props()

  function textoRequisito(req: Requisito): string {
    switch (req.tipo) {
      case "flag":
        return `flag «${req.flag}»`
      case "flagRepetida":
        return `flag «${req.flag}» ×${req.veces}`
      case "faseAlcanzada":
        return `fase «${req.fase}»`
      case "atributo": {
        const partes: string[] = []
        if (req.min !== undefined) partes.push(`≥ ${req.min}`)
        if (req.max !== undefined) partes.push(`≤ ${req.max}`)
        return `${req.atributo} ${partes.join(" y ")}`
      }
      case "todas":
        return `todas (${req.de.map(textoRequisito).join(", ")})`
      case "alguna":
        return `alguna (${req.de.map(textoRequisito).join(", ")})`
      case "ninguna":
        return `ninguna (${req.de.map(textoRequisito).join(", ")})`
    }
  }
</script>

<div class="detalle">
  <header>
    <h2>{condicional.titulo}</h2>
    <button type="button" onclick={alCerrar}>Cerrar</button>
  </header>

  <dl>
    <dt>id</dt>
    <dd>{condicional.id}</dd>
    <dt>momento</dt>
    <dd>{condicional.momento}</dd>
    <dt>texto</dt>
    <dd>{condicional.texto || "—"}</dd>
    <dt>requisito</dt>
    <dd>{textoRequisito(condicional.requiere)}</dd>
    <dt>ventana</dt>
    <dd>{condicional.ventanaAnos} años</dd>
    <dt>probabilidad</dt>
    <dd>{condicional.probabilidad}</dd>
    <dt>repetible</dt>
    <dd>{condicional.unicaVez === false ? "sí" : "no"}</dd>
    <dt>peso</dt>
    <dd>{condicional.peso ?? "—"}</dd>
  </dl>

  <h3>Opciones</h3>
  {#each condicional.opciones as opcion (opcion.id)}
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
      </dl>
    </article>
  {/each}
</div>

<style>
  .detalle {
    border: 2px solid #8a3324;
    border-radius: 8px;
    padding: 0 1rem 1rem;
    background: #fffdf8;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  dl {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 0.15rem 0.75rem;
    margin: 0.5rem 0 1rem;
    font-size: 0.9rem;
  }
  dt {
    color: #777;
  }
  dd {
    margin: 0;
  }
  .opcion {
    border-top: 1px solid #e0d8c8;
    padding-top: 0.5rem;
  }
  h4 {
    margin: 0.25rem 0;
  }
  .id {
    color: #999;
    font-size: 0.75rem;
    font-weight: normal;
  }
  .marca {
    border-radius: 999px;
    background: #f0d9a8;
    padding: 0 0.5rem;
    font-size: 0.7rem;
    text-transform: uppercase;
  }
</style>
