<script lang="ts">
  import {
    MOMENTOS,
    MODALIDADES,
    type Modalidad,
  } from "../content/modalidades"
  import type { Opcion, Situacion } from "../content/schema"
  import { VARIANTES } from "../content/variantes"
  import type { ErrorValidacion } from "../panel/esquema"
  import FormularioOpcion from "./FormularioOpcion.svelte"

  let {
    inicial,
    guardando,
    errores,
    alGuardar,
    alCancelar,
  }: {
    inicial?: Situacion | null
    guardando: boolean
    errores: ErrorValidacion[]
    alGuardar: (s: Situacion) => void
    alCancelar: () => void
  } = $props()

  const opcionVacia = (): Opcion => ({ id: "", titulo: "", subtitulo: "" })

  const situacionVacia = (): Situacion => ({
    id: "",
    momento: "verano",
    titulo: "",
    texto: "",
    opciones: [opcionVacia(), opcionVacia()],
  })

  const clonar = <T,>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T

  const borrador = $state<Situacion>(clonar(inicial ?? situacionVacia()))
  const editando = Boolean(inicial)

  const variantesVisibles = $derived(
    borrador.modalidades && borrador.modalidades.length > 0
      ? VARIANTES.filter((v) => borrador.modalidades?.includes(v.modalidad))
      : VARIANTES,
  )

  function alternarModalidad(modalidad: Modalidad, marcada: boolean) {
    const actuales = borrador.modalidades ?? []
    const siguientes = marcada
      ? [...actuales, modalidad]
      : actuales.filter((m) => m !== modalidad)
    borrador.modalidades = siguientes.length > 0 ? siguientes : undefined
  }

  function alternarVariante(id: string, marcada: boolean) {
    const actuales = borrador.variantes ?? []
    const siguientes = marcada
      ? [...actuales, id]
      : actuales.filter((v) => v !== id)
    borrador.variantes = siguientes.length > 0 ? siguientes : undefined
  }

  function enviar(evento: SubmitEvent) {
    evento.preventDefault()
    alGuardar($state.snapshot(borrador) as Situacion)
  }
</script>

<form onsubmit={enviar}>
  <div class="cabecera-form">
    <button type="button" class="volver" onclick={alCancelar}>
      ← Volver al panel
    </button>
    <h2>{editando ? `Editar «${inicial?.id}»` : "Nueva situación"}</h2>
  </div>

  {#if errores.length > 0}
    <ul class="errores">
      {#each errores as error (error.ruta + error.mensaje)}
        <li><strong>{error.ruta}</strong>: {error.mensaje}</li>
      {/each}
    </ul>
  {/if}

  <div class="rejilla">
    <label>
      id
      <input
        value={borrador.id}
        disabled={editando}
        placeholder="v_mi_situacion"
        oninput={(e) => (borrador.id = e.currentTarget.value)}
      />
      <small class="ayuda">Único y en minúsculas con guion bajo. No se puede cambiar al editar.</small>
    </label>

    <label>
      momento
      <select
        value={borrador.momento}
        onchange={(e) =>
          (borrador.momento = e.currentTarget.value as Situacion["momento"])}
      >
        {#each MOMENTOS as momento (momento)}
          <option value={momento}>{momento}</option>
        {/each}
      </select>
    </label>

    <label class="ancha">
      título
      <input
        value={borrador.titulo}
        oninput={(e) => (borrador.titulo = e.currentTarget.value)}
      />
    </label>

    <label class="ancha">
      texto
      <textarea
        rows="3"
        value={borrador.texto}
        oninput={(e) => (borrador.texto = e.currentTarget.value)}
      ></textarea>
    </label>

    <label>
      minAno
      <input
        type="number"
        value={borrador.minAno ?? ""}
        oninput={(e) =>
          (borrador.minAno =
            e.currentTarget.value.trim() === ""
              ? undefined
              : Number(e.currentTarget.value))}
      />
    </label>

    <label>
      peso
      <input
        type="number"
        value={borrador.peso ?? ""}
        placeholder="1"
        oninput={(e) =>
          (borrador.peso =
            e.currentTarget.value.trim() === ""
              ? undefined
              : Number(e.currentTarget.value))}
      />
      <small class="ayuda">
        Probabilidad relativa frente a otras del mismo momento. Vacío = 1;
        2 = el doble de probable; 0,5 = la mitad.
      </small>
    </label>

    <label class="casilla">
      <input
        type="checkbox"
        checked={borrador.unicaVez ?? false}
        onchange={(e) =>
          (borrador.unicaVez = e.currentTarget.checked || undefined)}
      />
      única vez
    </label>
  </div>

  <fieldset>
    <legend>Modalidades (vacío = común a ambas)</legend>
    {#each MODALIDADES as modalidad (modalidad)}
      <label class="casilla">
        <input
          type="checkbox"
          checked={borrador.modalidades?.includes(modalidad) ?? false}
          onchange={(e) =>
            alternarModalidad(modalidad, e.currentTarget.checked)}
        />
        {modalidad}
      </label>
    {/each}
  </fieldset>

  <fieldset>
    <legend>Variantes (vacío = cualquiera)</legend>
    {#each variantesVisibles as variante (variante.id)}
      <label class="casilla">
        <input
          type="checkbox"
          checked={borrador.variantes?.includes(variante.id) ?? false}
          onchange={(e) =>
            alternarVariante(variante.id, e.currentTarget.checked)}
        />
        {variante.id} <span class="tenue">({variante.modalidad})</span>
      </label>
    {/each}
  </fieldset>

  <h3>Opciones ({borrador.opciones.length})</h3>
  {#each borrador.opciones as _, indice (indice)}
    <FormularioOpcion
      bind:opcion={borrador.opciones[indice]}
      {indice}
      puedeEliminar={borrador.opciones.length > 2}
      alEliminar={() =>
        (borrador.opciones = borrador.opciones.filter((_, i) => i !== indice))}
    />
  {/each}

  <div class="acciones">
    <button
      type="button"
      onclick={() => (borrador.opciones = [...borrador.opciones, opcionVacia()])}
    >
      Añadir opción
    </button>
    <button type="submit" disabled={guardando}>
      {guardando ? "Guardando…" : "Guardar"}
    </button>
    <button type="button" onclick={alCancelar} disabled={guardando}>
      Cancelar
    </button>
  </div>
</form>

<style>
  .rejilla {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
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
  fieldset {
    margin: 0.75rem 0;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
  .errores {
    border: 1px solid #a11;
    border-radius: 6px;
    background: #fdecec;
    color: #7a1010;
    padding: 0.5rem 0.5rem 0.5rem 1.5rem;
    font-size: 0.85rem;
  }
  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  .tenue {
    color: #999;
  }
  .cabecera-form {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }
  .volver {
    border: 1px solid #8a3324;
    background: #fff;
    color: #8a3324;
    border-radius: 6px;
    padding: 0.35rem 0.7rem;
    cursor: pointer;
  }
  .ayuda {
    color: #888;
    font-size: 0.72rem;
  }
</style>
