<script lang="ts">
  import type { Condicional, Situacion } from "../content/schema"
  import type { ErrorValidacion } from "../panel/esquema"
  import { agruparPorMomento } from "../panel/resumen"
  import DetalleCondicional from "./DetalleCondicional.svelte"
  import DetalleSituacion from "./DetalleSituacion.svelte"
  import FormularioCondicional from "./FormularioCondicional.svelte"
  import FormularioSituacion from "./FormularioSituacion.svelte"
  import TablasMomentos from "./TablasMomentos.svelte"

  let situaciones = $state<Situacion[]>([])
  let condicionales = $state<Condicional[]>([])
  let flags = $state<string[]>([])
  let cargando = $state(true)
  let error = $state<string | null>(null)

  let vista = $state<"situaciones" | "condicionales">("situaciones")
  let seleccionadaSituacion = $state<Situacion | null>(null)
  let seleccionadoCondicional = $state<Condicional | null>(null)
  let editandoSituacion = $state<Situacion | null>(null)
  let editandoCondicional = $state<Condicional | null>(null)
  let creando = $state(false)
  let guardando = $state(false)
  let importando = $state(false)
  let erroresFormulario = $state<ErrorValidacion[]>([])

  const gruposSituaciones = $derived(agruparPorMomento(situaciones))
  const gruposCondicionales = $derived(agruparPorMomento(condicionales))
  const total = $derived(
    vista === "situaciones" ? situaciones.length : condicionales.length,
  )
  const enFormulario = $derived(
    creando || editandoSituacion !== null || editandoCondicional !== null,
  )
  const usados = $derived(
    new Set([...situaciones, ...condicionales].map((e) => e.id)),
  )

  async function cargar() {
    cargando = true
    error = null
    try {
      const respuesta = await fetch("/api/panel/situaciones")
      if (!respuesta.ok) throw new Error(`el panel respondió ${respuesta.status}`)
      const datos = (await respuesta.json()) as {
        situaciones: Situacion[]
        condicionales?: Condicional[]
        flags?: string[]
      }
      situaciones = datos.situaciones
      condicionales = datos.condicionales ?? []
      flags = datos.flags ?? []
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      cargando = false
    }
  }

  function mensajesDe(payload: unknown, respaldo: string): string {
    const errores = (payload as { errores?: ErrorValidacion[] } | null)?.errores
    return errores && errores.length > 0
      ? errores.map((e) => `${e.ruta}: ${e.mensaje}`).join("; ")
      : respaldo
  }

  async function importar() {
    importando = true
    error = null
    try {
      const respuesta = await fetch("/api/panel/importar", { method: "POST" })
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null)
        throw new Error(
          mensajesDe(datos, `el panel respondió ${respuesta.status}`),
        )
      }
      await cargar()
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      importando = false
    }
  }

  function abrirNueva() {
    seleccionadaSituacion = null
    seleccionadoCondicional = null
    editandoSituacion = null
    editandoCondicional = null
    creando = true
    erroresFormulario = []
  }

  function abrirEditarSituacion(situacion: Situacion) {
    seleccionadaSituacion = null
    seleccionadoCondicional = null
    creando = false
    editandoSituacion = situacion
    editandoCondicional = null
    erroresFormulario = []
  }

  function abrirEditarCondicional(condicional: Condicional) {
    seleccionadaSituacion = null
    seleccionadoCondicional = null
    creando = false
    editandoCondicional = condicional
    editandoSituacion = null
    erroresFormulario = []
  }

  function cerrarFormulario() {
    creando = false
    editandoSituacion = null
    editandoCondicional = null
    erroresFormulario = []
  }

  async function enviar(
    url: string,
    metodo: "POST" | "PUT",
    cuerpo: Record<string, unknown>,
  ) {
    guardando = true
    erroresFormulario = []
    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(cuerpo),
      })
      if (respuesta.status === 422 || respuesta.status === 404) {
        const datos = await respuesta.json()
        erroresFormulario = datos.errores ?? []
        return
      }
      if (!respuesta.ok) throw new Error(`el panel respondió ${respuesta.status}`)
      cerrarFormulario()
      await cargar()
    } catch (e) {
      erroresFormulario = [
        { ruta: "(red)", mensaje: e instanceof Error ? e.message : String(e) },
      ]
    } finally {
      guardando = false
    }
  }

  function guardarSituacion(situacion: Situacion) {
    const enEdicion = editandoSituacion !== null
    const url = enEdicion
      ? `/api/panel/situaciones/${encodeURIComponent(editandoSituacion?.id ?? "")}`
      : "/api/panel/situaciones"
    return enviar(url, enEdicion ? "PUT" : "POST", { situacion })
  }

  function guardarCondicional(condicional: Condicional) {
    const enEdicion = editandoCondicional !== null
    const url = enEdicion
      ? `/api/panel/condicionales/${encodeURIComponent(editandoCondicional?.id ?? "")}`
      : "/api/panel/condicionales"
    return enviar(url, enEdicion ? "PUT" : "POST", { condicional })
  }

  async function borrar(
    url: string,
    titulo: string,
    id: string,
    alCerrarDetalle: () => void,
  ) {
    if (!confirm(`¿Eliminar «${titulo}» (${id})?`)) return
    try {
      const respuesta = await fetch(url, { method: "DELETE" })
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null)
        alert(
          `No se pudo eliminar: ${mensajesDe(datos, `el panel respondió ${respuesta.status}`)}`,
        )
        return
      }
      alCerrarDetalle()
      await cargar()
    } catch (e) {
      alert(
        `No se pudo eliminar: ${e instanceof Error ? e.message : String(e)}`,
      )
    }
  }

  function eliminarSituacion(situacion: Situacion) {
    return borrar(
      `/api/panel/situaciones/${encodeURIComponent(situacion.id)}`,
      situacion.titulo,
      situacion.id,
      () => (seleccionadaSituacion = null),
    )
  }

  function eliminarCondicional(condicional: Condicional) {
    return borrar(
      `/api/panel/condicionales/${encodeURIComponent(condicional.id)}`,
      condicional.titulo,
      condicional.id,
      () => (seleccionadoCondicional = null),
    )
  }

  $effect(() => {
    void cargar()
  })
</script>

<section class="panel">
  <header class="cabecera">
    <h1>Panel de contenido</h1>
    <p class="total">{total} {vista}</p>
    <button type="button" class="principal" onclick={abrirNueva}>
      {vista === "situaciones" ? "Nueva situación" : "Nuevo condicional"}
    </button>
  </header>

  <nav class="vistas">
    <button
      type="button"
      class:activa={vista === "situaciones"}
      onclick={() => (vista = "situaciones")}
    >
      Situaciones ({situaciones.length})
    </button>
    <button
      type="button"
      class:activa={vista === "condicionales"}
      onclick={() => (vista = "condicionales")}
    >
      Condicionales ({condicionales.length})
    </button>
  </nav>

  {#if cargando}
    <p>Cargando…</p>
  {:else if error}
    <p class="error">No se pudo cargar el banco: {error}</p>
  {:else if enFormulario}
    {#if vista === "situaciones"}
      {#key editandoSituacion?.id ?? "nueva"}
        <FormularioSituacion
          inicial={editandoSituacion}
          {guardando}
          errores={erroresFormulario}
          {usados}
          {flags}
          alGuardar={guardarSituacion}
          alCancelar={cerrarFormulario}
        />
      {/key}
    {:else}
      {#key editandoCondicional?.id ?? "nuevo"}
        <FormularioCondicional
          inicial={editandoCondicional}
          {guardando}
          errores={erroresFormulario}
          {usados}
          {flags}
          alGuardar={guardarCondicional}
          alCancelar={cerrarFormulario}
        />
      {/key}
    {/if}
  {:else}
    {#if situaciones.length === 0 && condicionales.length === 0}
      <div class="sin-almacen">
        <p>El almacén está vacío. Importa el banco actual para empezar.</p>
        <button type="button" onclick={importar} disabled={importando}>
          {importando ? "Importando…" : "Importar el banco actual"}
        </button>
      </div>
    {/if}

    {#if vista === "situaciones"}
      {#if seleccionadaSituacion}
        <DetalleSituacion
          situacion={seleccionadaSituacion}
          alCerrar={() => (seleccionadaSituacion = null)}
        />
      {/if}
      <TablasMomentos
        grupos={gruposSituaciones}
        tipo="situación"
        alAbrir={(e) => (seleccionadaSituacion = e as Situacion)}
        alEditar={(e) => abrirEditarSituacion(e as Situacion)}
        alEliminar={(e) => eliminarSituacion(e as Situacion)}
      />
    {:else}
      {#if seleccionadoCondicional}
        <DetalleCondicional
          condicional={seleccionadoCondicional}
          alCerrar={() => (seleccionadoCondicional = null)}
        />
      {/if}
      <TablasMomentos
        grupos={gruposCondicionales}
        tipo="condicional"
        alAbrir={(e) => (seleccionadoCondicional = e as Condicional)}
        alEditar={(e) => abrirEditarCondicional(e as Condicional)}
        alEliminar={(e) => eliminarCondicional(e as Condicional)}
      />
    {/if}
  {/if}
</section>

<style>
  .panel {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.5rem;
    font-family: system-ui, sans-serif;
  }
  .cabecera {
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }
  .total {
    color: #777;
    margin-right: auto;
  }
  .vistas {
    display: flex;
    gap: 0.5rem;
    margin: 0.75rem 0 1rem;
  }
  .vistas button {
    border: 1px solid #8a3324;
    background: #fff;
    color: #8a3324;
    border-radius: 6px;
    padding: 0.35rem 0.7rem;
    cursor: pointer;
  }
  .vistas button.activa {
    background: #8a3324;
    color: #fff;
  }
  .principal {
    background: #8a3324;
    color: #fff;
    border: 0;
    border-radius: 6px;
    padding: 0.5rem 0.9rem;
    cursor: pointer;
  }
  .error {
    color: #a11;
  }
  .sin-almacen {
    border: 1px dashed #8a3324;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background: #fff6ec;
  }
  :global(body) {
    margin: 0;
    background: #fbf8f2;
    color: #241f18;
  }
</style>
