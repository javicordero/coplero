<script lang="ts">
  import { ATRIBUTOS, MODALIDADES, type Atributo } from "../content/modalidades"
  import type { Opcion } from "../content/schema"
  import { VARIANTES } from "../content/variantes"
  import { derivarId, derivarIdUnico } from "../panel/identificadores"
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

<fieldset class="opcion">
  <legend>
    Opción {indice + 1}
    {#if puedeEliminar}
      <button type="button" class="eliminar" onclick={alEliminar}>
        Eliminar opción
      </button>
    {/if}
  </legend>

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
      <small class="ayuda">Opcional. Hoy el motor no usa el peso de una opción.</small>
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
      <span>Efectos:</span>
      {#each ATRIBUTOS as atributo (atributo)}
        <label>
          {atributo}
          <input
            type="number"
            value={opcion.efectos?.[atributo] ?? ""}
            oninput={(e) => cambiarEfecto(atributo, e.currentTarget.value)}
          />
        </label>
      {/each}
    </div>
  {:else}
    <p class="nota">No afecta al resultado (caso por defecto).</p>
  {/if}

  <SelectorFlags
    etiqueta="flags (lo que deja la opción)"
    bind:seleccion={opcion.flags}
    disponibles={flags}
    permiteNuevas={true}
    {alAgregar}
    ayuda="Huellas que deja la opción en el historial (no se borran). Sirven de requisito a los condicionales."
  />

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
</fieldset>

<style>
  .opcion {
    border: 1px solid #ddd;
    border-radius: 6px;
    margin: 0.75rem 0;
    padding: 0.75rem;
  }
  legend {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
  }
  .rejilla {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 0.5rem 1rem;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.85rem;
  }
  .ancha {
    grid-column: 1 / -1;
  }
  .casilla {
    flex-direction: row;
    align-items: center;
    gap: 0.4rem;
  }
  .efectos {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin: 0.5rem 0;
    font-size: 0.85rem;
  }
  .efectos label {
    flex-direction: row;
    align-items: center;
    gap: 0.3rem;
  }
  .efectos input {
    width: 4rem;
  }
  .nota {
    color: #777;
    font-size: 0.85rem;
  }
  .eliminar {
    font-size: 0.75rem;
  }
  .ayuda {
    color: #888;
    font-size: 0.72rem;
  }
</style>
