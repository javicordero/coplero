<script lang="ts">
  import { ATRIBUTOS, MODALIDADES, type Atributo } from "../content/modalidades"
  import type { Opcion } from "../content/schema"
  import { VARIANTES } from "../content/variantes"
  import { derivarId, derivarIdUnico } from "../panel/identificadores"
  import Seccion from "./Seccion.svelte"
  import SelectorFlags from "./SelectorFlags.svelte"

  let {
    opcion = $bindable(),
    indice,
    puedeEliminar,
    alEliminar,
    flags = [],
    usados = new Set<string>(),
    alAgregar,
  }: {
    opcion: Opcion
    indice: number
    puedeEliminar: boolean
    alEliminar: () => void
    flags?: string[]
    usados?: Set<string>
    alAgregar?: (flag: string) => void
  } = $props()

  // Si la opción ya tiene id (edición), no se sobrescribe; si no, se deriva del título.
  let idTocado = $state(opcion.id !== "")

  const idAjustado = $derived(
    !idTocado && opcion.id !== "" && opcion.id !== derivarId(opcion.titulo),
  )

  const hayFlags = $derived((opcion.flags?.length ?? 0) > 0)

  function cambiarTitulo(valor: string) {
    opcion.titulo = valor
    if (!idTocado) opcion.id = derivarIdUnico(derivarId(valor), usados)
  }

  function numeroOpcional(valor: string): number | undefined {
    return valor.trim() === "" ? undefined : Number(valor)
  }

  function alternarExcepcion(evento: Event) {
    const marcado = (evento.currentTarget as HTMLInputElement).checked
    if (marcado) {
      opcion.excepcion = true
      opcion.efectos ??= {}
    } else {
      opcion.excepcion = undefined
      opcion.efectos = undefined
    }
  }

  function cambiarEfecto(atributo: Atributo, valor: string) {
    if (!opcion.efectos) opcion.efectos = {}
    if (valor.trim() === "") {
      delete opcion.efectos[atributo]
    } else {
      opcion.efectos[atributo] = Number(valor)
    }
  }
</script>

<section class="opcion">
  <header class="cabecera-opcion">
    <h4>
      Opción {indice + 1}
      <span class="id">{opcion.id || "sin id"}</span>
    </h4>
    {#if puedeEliminar}
      <button type="button" class="eliminar" onclick={alEliminar}>
        Eliminar opción
      </button>
    {/if}
  </header>

  <div class="rejilla">
    <label>
      id
      <input
        value={opcion.id}
        placeholder="id_de_la_opcion"
        oninput={(e) => {
          opcion.id = e.currentTarget.value
          idTocado = true
        }}
      />
      {#if idAjustado}
        <small class="ayuda"
          >Se ha ajustado a «{opcion.id}» para no repetir.</small
        >
      {:else}
        <small class="ayuda">Se rellena solo a partir del título.</small>
      {/if}
    </label>

    <label>
      título
      <input
        value={opcion.titulo}
        oninput={(e) => cambiarTitulo(e.currentTarget.value)}
      />
    </label>

    <label class="ancha">
      subtítulo
      <input
        value={opcion.subtitulo}
        oninput={(e) => (opcion.subtitulo = e.currentTarget.value)}
      />
    </label>

    <label>
      peso
      <input
        type="number"
        value={opcion.peso ?? ""}
        placeholder="1"
        oninput={(e) => (opcion.peso = numeroOpcional(e.currentTarget.value))}
      />
      <small class="ayuda"
        >Opcional. Hoy el motor no usa el peso de una opción.</small
      >
    </label>

    <label class="casilla">
      <input
        type="checkbox"
        checked={opcion.saltaCOAC ?? false}
        onchange={(e) =>
          (opcion.saltaCOAC = e.currentTarget.checked || undefined)}
      />
      salta el COAC
    </label>

    <label class="casilla">
      <input
        type="checkbox"
        checked={opcion.excepcion ?? false}
        onchange={alternarExcepcion}
      />
      excepción declarada (mueve atributos)
    </label>
  </div>

  {#if opcion.excepcion}
    <div class="efectos">
      <span class="etiqueta-efectos">Efectos</span>
      {#each ATRIBUTOS as atributo (atributo)}
        <label class="efecto">
          {atributo}
          <input
            type="number"
            value={opcion.efectos?.[atributo] ?? ""}
            oninput={(e) => cambiarEfecto(atributo, e.currentTarget.value)}
          />
        </label>
      {/each}
      <p class="ayuda-efectos">
        Cuánto sube (+) o baja (−) cada atributo al elegir esta opción. Vacío =
        sin cambio; por defecto ninguna opción mueve atributos y solo las
        excepciones declaradas lo hacen (valores pequeños, p. ej. ±1).
      </p>
    </div>
  {:else}
    <p class="nota">No afecta al resultado (caso por defecto).</p>
  {/if}

  <Seccion titulo="Flags" tieneContenido={hayFlags}>
    <SelectorFlags
      bind:seleccion={opcion.flags}
      disponibles={flags}
      permiteNuevas={true}
      {alAgregar}
      ayuda="Huellas que deja la opción en el historial (no se borran). Sirven de requisito a los condicionales."
    />
  </Seccion>

  <div class="rejilla">
    <label>
      cambia modalidad
      <select
        value={opcion.cambiaModalidad ?? ""}
        onchange={(e) =>
          (opcion.cambiaModalidad =
            e.currentTarget.value === ""
              ? undefined
              : (e.currentTarget.value as (typeof MODALIDADES)[number]))}
      >
        <option value="">—</option>
        {#each MODALIDADES as modalidad (modalidad)}
          <option value={modalidad}>{modalidad}</option>
        {/each}
      </select>
    </label>

    <label>
      cambia variante
      <select
        value={opcion.cambiaVariante ?? ""}
        onchange={(e) =>
          (opcion.cambiaVariante = e.currentTarget.value || undefined)}
      >
        <option value="">—</option>
        {#each VARIANTES as variante (variante.id)}
          <option value={variante.id}>{variante.id}</option>
        {/each}
      </select>
    </label>
  </div>
</section>

<style>
  .opcion {
    border: 1px solid var(--panel-border, #e5e7eb);
    border-radius: 10px;
    background: var(--panel-surface, #fff);
    margin: 0.75rem 0;
    padding: 0.85rem;
  }
  .cabecera-opcion {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
  }
  h4 {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0;
    font-size: 0.9rem;
  }
  .id {
    color: var(--panel-muted, #6b7280);
    font-size: 0.72rem;
    font-weight: normal;
  }
  .rejilla {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 0.6rem 1rem;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: var(--panel-muted, #6b7280);
  }
  input,
  select {
    box-sizing: border-box;
    font: inherit;
    font-size: 0.9rem;
    color: var(--panel-text, #111827);
    background: var(--panel-surface, #fff);
    border: 1px solid var(--panel-border, #e5e7eb);
    border-radius: 7px;
    padding: 0.4rem 0.55rem;
  }
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--panel-primary, #4f46e5);
    outline-offset: 1px;
    border-color: var(--panel-primary, #4f46e5);
  }
  .ancha {
    grid-column: 1 / -1;
  }
  .casilla {
    flex-direction: row;
    align-items: center;
    gap: 0.4rem;
  }
  .casilla input {
    width: auto;
  }
  .efectos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(5.5rem, 1fr));
    gap: 0.55rem 0.75rem;
    margin: 0.7rem 0;
    padding-top: 0.7rem;
    border-top: 1px solid var(--panel-border, #e5e7eb);
  }
  .etiqueta-efectos {
    grid-column: 1 / -1;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--panel-muted, #6b7280);
  }
  .efecto {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  .efecto input {
    width: 100%;
  }
  .ayuda-efectos {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--panel-muted, #6b7280);
    font-size: 0.72rem;
    line-height: 1.35;
  }
  .nota {
    color: var(--panel-muted, #6b7280);
    font-size: 0.82rem;
    margin: 0.4rem 0;
  }
  .eliminar {
    font: inherit;
    font-size: 0.75rem;
    border: 1px solid var(--panel-danger, #b91c1c);
    background: var(--panel-surface, #fff);
    color: var(--panel-danger, #b91c1c);
    border-radius: 7px;
    padding: 0.25rem 0.6rem;
    cursor: pointer;
  }
  .eliminar:hover {
    background: #fef2f2;
  }
  .ayuda {
    color: var(--panel-muted, #6b7280);
    font-size: 0.72rem;
  }
</style>
