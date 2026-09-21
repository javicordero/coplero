<script lang="ts">
  import type { Situacion } from "../content/schema"
  import type { ErrorValidacion } from "../panel/esquema"
  import { agruparPorCategoria } from "../panel/resumen"
  import Categorias from "./Categorias.svelte"
  import DetalleSituacion from "./DetalleSituacion.svelte"
  import FormularioSituacion from "./FormularioSituacion.svelte"
  import TablasCategorias from "./TablasCategorias.svelte"

  let situaciones = $state<Situacion[]>([])
  let cargando = $state(true)
  let error = $state<string | null>(null)
  let seleccionada = $state<Situacion | null>(null)
  let editando = $state<Situacion | null>(null)
  let creando = $state(false)
  let guardando = $state(false)
  let importando = $state(false)
  let erroresFormulario = $state<ErrorValidacion[]>([])
  let vista = $state<"situaciones" | "categorias">("situaciones")

  const grupos = $derived(agruparPorCategoria(situaciones))
  const total = $derived(situaciones.length)
  const enFormulario = $derived(creando || editando !== null)

  async function cargar() {
    cargando = true
    error = null
    try {
      const respuesta = await fetch("/api/panel/situaciones")
      if (!respuesta.ok) throw new Error(`el panel respondió ${respuesta.status}`)
      const datos = (await respuesta.json()) as { situaciones: Situacion[] }
      situaciones = datos.situaciones
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
    vista = "situaciones"
    seleccionada = null
    editando = null
    creando = true
    erroresFormulario = []
  }

  function abrirEditar(situacion: Situacion) {
    vista = "situaciones"
    seleccionada = null
    creando = false
    editando = situacion
    erroresFormulario = []
  }

  function cerrarFormulario() {
    creando = false
    editando = null
    erroresFormulario = []
  }

  async function guardar(situacion: Situacion) {
    guardando = true
    erroresFormulario = []
    const enEdicion = editando !== null
    const url = enEdicion
      ? `/api/panel/situaciones/${encodeURIComponent(editando?.id ?? "")}`
      : "/api/panel/situaciones"
    try {
      const respuesta = await fetch(url, {
        method: enEdicion ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ situacion }),
      })
      if (respuesta.status === 422) {
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

  async function eliminar(situacion: Situacion) {
    if (!confirm(`¿Eliminar «${situacion.titulo}» (${situacion.id})?`)) return
    try {
      const respuesta = await fetch(
        `/api/panel/situaciones/${encodeURIComponent(situacion.id)}`,
        { method: "DELETE" },
      )
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null)
        alert(
          `No se pudo eliminar: ${mensajesDe(datos, `el panel respondió ${respuesta.status}`)}`,
        )
        return
      }
      seleccionada = null
      await cargar()
    } catch (e) {
      alert(
        `No se pudo eliminar: ${e instanceof Error ? e.message : String(e)}`,
      )
    }
  }

  $effect(() => {
    void cargar()
  })
</script>

<section class="panel">
  <header class="cabecera">
    <h1>Panel de situaciones</h1>
    <p class="total">{total} situaciones</p>
    <button type="button" onclick={() => (vista = "categorias")}>
      Categorías
    </button>
    <button type="button" class="principal" onclick={abrirNueva}>
      Nueva situación
    </button>
  </header>

  {#if cargando}
    <p>Cargando…</p>
  {:else if error}
    <p class="error">No se pudo cargar el banco: {error}</p>
  {:else if vista === "categorias"}
    <Categorias alVolver={() => (vista = "situaciones")} />
  {:else if enFormulario}
    {#key editando?.id ?? "nueva"}
      <FormularioSituacion
        inicial={editando}
        {guardando}
        errores={erroresFormulario}
        alGuardar={guardar}
        alCancelar={cerrarFormulario}
      />
    {/key}
  {:else}
    {#if situaciones.length === 0}
      <div class="sin-almacen">
        <p>El almacén está vacío. Importa el banco actual para empezar.</p>
        <button type="button" onclick={importar} disabled={importando}>
          {importando ? "Importando…" : "Importar el banco actual"}
        </button>
      </div>
    {/if}
    {#if seleccionada}
      <DetalleSituacion
        situacion={seleccionada}
        alCerrar={() => (seleccionada = null)}
      />
    {/if}
    <TablasCategorias
      {grupos}
      alAbrir={(s) => (seleccionada = s)}
      alEditar={abrirEditar}
      alEliminar={eliminar}
    />
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
