<script lang="ts">
  import {
    MOMENTOS,
    MODALIDADES,
    type Modalidad,
  } from "../content/modalidades"
  import type { Opcion, Situacion } from "../content/schema"
  import { VARIANTES } from "../content/variantes"
  import { derivarId, derivarIdUnico } from "../panel/identificadores"
  import type { ErrorValidacion } from "../panel/esquema"
  import FormularioOpcion from "./FormularioOpcion.svelte"
  import Seccion from "./Seccion.svelte"

  let {
    inicial,
    guardando,
    errores,
    usados = new Set<string>(),
    flags = [],
    alGuardar,
    alCancelar,
  }: {
    inicial?: Situacion | null
    guardando: boolean
    errores: ErrorValidacion[]
    usados?: Set<string>
    flags?: string[]
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

  // Catálogo local de flags: parte del del banco y crece si se crea una nueva.
  let flagsLocales = $state<string[]>([...flags])
  function agregarFlag(flag: string) {
    if (!flagsLocales.includes(flag)) {
      flagsLocales = [...flagsLocales, flag].sort()
    }
  }

  // Al crear, el id se deriva del título mientras el diseñador no lo toque a mano.
  let idTocado = $state(editando)
  let avisoGuardado = $state<string | null>(null)

  const idAjustado = $derived(
    !editando &&
      !idTocado &&
      borrador.id !== "" &&
      borrador.id !== derivarId(borrador.titulo),
  )

  // "repetible" es la vista invertida de `unicaVez`: por defecto, una sola vez.
  const repetible = $derived(borrador.unicaVez === false)

  const hayModalidades = $derived((borrador.modalidades?.length ?? 0) > 0)
  const hayVariantes = $derived((borrador.variantes?.length ?? 0) > 0)

  const hayFemenino = $derived(
    (borrador.tituloFemenino?.trim() ?? "") !== "" ||
      (borrador.textoFemenino?.trim() ?? "") !== "",
  )

  const variantesVisibles = $derived(
    borrador.modalidades && borrador.modalidades.length > 0
      ? VARIANTES.filter((v) => borrador.modalidades?.includes(v.modalidad))
      : VARIANTES,
  )

  function cambiarTitulo(valor: string) {
    borrador.titulo = valor
    if (!editando && !idTocado) {
      borrador.id = derivarIdUnico(derivarId(valor), usados)
    }
  }

  function idsDeOtrasOpciones(indice: number): Set<string> {
    return new Set(
      borrador.opciones
        .filter((_, i) => i !== indice)
        .map((o) => o.id)
        .filter((id) => id !== ""),
    )
  }

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

  function limpiarFemenino(valor: string | undefined): string | undefined {
    return valor !== undefined && valor.trim() !== "" ? valor : undefined
  }

  function enviar(evento: SubmitEvent) {
    evento.preventDefault()
    const opcionSinId = borrador.opciones.some((o) => o.id.trim() === "")
    if (borrador.id.trim() === "" || opcionSinId) {
      avisoGuardado =
        "Cada situación y cada opción necesitan un identificador. Escribe un título para generarlo."
      return
    }
    avisoGuardado = null
    const limpio = $state.snapshot(borrador) as Situacion
    limpio.tituloFemenino = limpiarFemenino(limpio.tituloFemenino)
    limpio.textoFemenino = limpiarFemenino(limpio.textoFemenino)
    limpio.opciones = limpio.opciones.map((o) => ({
      ...o,
      tituloFemenino: limpiarFemenino(o.tituloFemenino),
      subtituloFemenino: limpiarFemenino(o.subtituloFemenino),
    }))
    alGuardar(limpio)
  }
</script>

<form onsubmit={enviar}>
  <div class="cabecera-form">
    <button
      type="button"
      class="volver"
      onclick={alCancelar}
      aria-label="Volver al panel"
      title="Volver al panel"
    >
      ←
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

  {#if avisoGuardado}
    <p class="errores" role="alert">{avisoGuardado}</p>
  {/if}

  <section class="tarjeta">
    <div class="rejilla">
      <label>
        id
        <input
          value={borrador.id}
          disabled={editando}
          placeholder="v_mi_situacion"
          oninput={(e) => {
            borrador.id = e.currentTarget.value
            idTocado = true
          }}
        />
        {#if idAjustado}
          <small class="ayuda"
            >Se ha ajustado a «{borrador.id}» para no repetir un id
            existente.</small
          >
        {:else if editando}
          <small class="ayuda">El id no se puede cambiar al editar.</small>
        {:else}
          <small class="ayuda"
            >Se rellena solo a partir del título. Puedes ajustarlo.</small
          >
        {/if}
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
          oninput={(e) => cambiarTitulo(e.currentTarget.value)}
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

      <label class="casilla ancha">
        <input
          type="checkbox"
          checked={repetible}
          onchange={(e) =>
            (borrador.unicaVez = e.currentTarget.checked ? false : undefined)}
        />
        repetible
        <small class="ayuda"
          >Por defecto, una situación sale una sola vez por partida. Marca esta
          casilla solo si debe poder repetirse.</small
        >
      </label>
    </div>
  </section>

  <Seccion titulo="Modalidades" tieneContenido={hayModalidades}>
    <p class="nota-seccion">Vacío = común a ambas.</p>
    <div class="chips">
      {#each MODALIDADES as modalidad (modalidad)}
        <label class="chip">
          <input
            type="checkbox"
            checked={borrador.modalidades?.includes(modalidad) ?? false}
            onchange={(e) =>
              alternarModalidad(modalidad, e.currentTarget.checked)}
          />
          {modalidad}
        </label>
      {/each}
    </div>
  </Seccion>

  <Seccion titulo="Variantes" tieneContenido={hayVariantes}>
    <p class="nota-seccion">Vacío = cualquiera.</p>
    <div class="chips">
      {#each variantesVisibles as variante (variante.id)}
        <label class="chip">
          <input
            type="checkbox"
            checked={borrador.variantes?.includes(variante.id) ?? false}
            onchange={(e) =>
              alternarVariante(variante.id, e.currentTarget.checked)}
          />
          {variante.id} <span class="tenue">({variante.modalidad})</span>
        </label>
      {/each}
    </div>
  </Seccion>

  <Seccion titulo="Variante femenina" tieneContenido={hayFemenino}>
    <p class="nota-seccion">
      Opcional. Se muestra si el personaje es femenino; vacío = forma por defecto.
      Con género no binario se alterna entre ambas.
    </p>
    <div class="rejilla">
      <label class="ancha">
        título femenino
        <input
          value={borrador.tituloFemenino ?? ""}
          oninput={(e) =>
            (borrador.tituloFemenino = e.currentTarget.value || undefined)}
        />
      </label>

      <label class="ancha">
        texto femenino
        <textarea
          rows="3"
          value={borrador.textoFemenino ?? ""}
          oninput={(e) =>
            (borrador.textoFemenino = e.currentTarget.value || undefined)}
        ></textarea>
      </label>
    </div>
  </Seccion>

  <h3 class="titulo-opciones">
    Opciones <span class="contador">{borrador.opciones.length}</span>
  </h3>
  {#each borrador.opciones as _, indice (indice)}
    <FormularioOpcion
      bind:opcion={borrador.opciones[indice]}
      {indice}
      flags={flagsLocales}
      usados={idsDeOtrasOpciones(indice)}
      alAgregar={agregarFlag}
      puedeEliminar={borrador.opciones.length > 2}
      alEliminar={() =>
        (borrador.opciones = borrador.opciones.filter((_, i) => i !== indice))}
    />
  {/each}

  <div class="acciones">
    <button
      type="button"
      class="secundario"
      onclick={() => (borrador.opciones = [...borrador.opciones, opcionVacia()])}
    >
      Añadir opción
    </button>
    <button type="submit" class="principal" disabled={guardando}>
      {guardando ? "Guardando…" : "Guardar"}
    </button>
    <button type="button" class="secundario" onclick={alCancelar} disabled={guardando}>
      Cancelar
    </button>
  </div>
</form>

<style>
  .tarjeta {
    background: var(--panel-surface);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    padding: 0.85rem;
  }
  .rejilla {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 0.6rem 1rem;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: var(--panel-muted);
  }
  input,
  select,
  textarea {
    box-sizing: border-box;
    font: inherit;
    font-size: 0.9rem;
    color: var(--panel-text);
    background: var(--panel-surface);
    border: 1px solid var(--panel-border);
    border-radius: 7px;
    padding: 0.4rem 0.55rem;
  }
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--panel-primary);
    outline-offset: 1px;
    border-color: var(--panel-primary);
  }
  .ancha {
    grid-column: 1 / -1;
  }
  .casilla {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .casilla input {
    width: auto;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .chip {
    flex-direction: row;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid var(--panel-border);
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    font-size: 0.82rem;
    color: var(--panel-text);
    background: var(--panel-surface);
  }
  .nota-seccion {
    margin: 0 0 0.5rem;
    font-size: 0.78rem;
    color: var(--panel-muted);
  }
  .titulo-opciones {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    margin: 1.1rem 0 0.4rem;
  }
  .contador {
    display: inline-flex;
    min-width: 1.5rem;
    justify-content: center;
    border-radius: 999px;
    background: var(--panel-hover);
    border: 1px solid var(--panel-border);
    font-size: 0.78rem;
    padding: 0 0.4rem;
  }
  .errores {
    border: 1px solid var(--panel-danger);
    border-radius: 8px;
    background: #fef2f2;
    color: var(--panel-danger);
    padding: 0.5rem 0.5rem 0.5rem 1.5rem;
    font-size: 0.85rem;
  }
  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.85rem;
  }
  .principal,
  .secundario {
    font: inherit;
    font-size: 0.85rem;
    border-radius: 8px;
    padding: 0.45rem 0.9rem;
    cursor: pointer;
  }
  .principal {
    background: var(--panel-primary);
    color: #fff;
    border: 1px solid var(--panel-primary);
  }
  .principal:hover {
    background: var(--panel-primary-hover);
  }
  .secundario {
    background: var(--panel-surface);
    color: var(--panel-text);
    border: 1px solid var(--panel-border);
  }
  .secundario:hover {
    background: var(--panel-hover);
  }
  .tenue {
    color: var(--panel-muted);
  }
  .cabecera-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .volver {
    font: inherit;
    font-size: 1rem;
    line-height: 1;
    border: 1px solid var(--panel-border);
    background: var(--panel-surface);
    color: var(--panel-text);
    border-radius: 8px;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
  }
  .volver:hover {
    background: var(--panel-hover);
  }
  .volver:focus-visible {
    outline: 2px solid var(--panel-primary);
    outline-offset: 2px;
  }
  .ayuda {
    color: var(--panel-muted);
    font-size: 0.72rem;
  }
</style>
