<script lang="ts">
  interface CategoriaFila {
    id: string
    enUso: boolean
  }

  let { alVolver }: { alVolver: () => void } = $props()

  let categorias = $state<CategoriaFila[]>([])
  let nueva = $state("")
  let error = $state<string | null>(null)
  let cargando = $state(true)
  let ocupado = $state(false)

  const mensaje = (payload: unknown, respaldo: string): string => {
    const errores = (payload as { errores?: { mensaje: string }[] } | null)
      ?.errores
    return errores && errores.length > 0
      ? errores.map((e) => e.mensaje).join("; ")
      : respaldo
  }

  async function cargar() {
    cargando = true
    error = null
    try {
      const respuesta = await fetch("/api/panel/categorias")
      if (!respuesta.ok) throw new Error(`el panel respondió ${respuesta.status}`)
      const datos = (await respuesta.json()) as { categorias: CategoriaFila[] }
      categorias = datos.categorias
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      cargando = false
    }
  }

  async function agregar(evento: SubmitEvent) {
    evento.preventDefault()
    if (nueva.trim() === "") return
    ocupado = true
    error = null
    try {
      const respuesta = await fetch("/api/panel/categorias", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: nueva }),
      })
      const datos = await respuesta.json().catch(() => null)
      if (!respuesta.ok) {
        throw new Error(mensaje(datos, `el panel respondió ${respuesta.status}`))
      }
      categorias = datos.categorias
      nueva = ""
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      ocupado = false
    }
  }

  async function eliminar(fila: CategoriaFila) {
    if (!confirm(`¿Eliminar la categoría «${fila.id}»?`)) return
    ocupado = true
    error = null
    try {
      const respuesta = await fetch(
        `/api/panel/categorias/${encodeURIComponent(fila.id)}`,
        { method: "DELETE" },
      )
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null)
        throw new Error(mensaje(datos, `el panel respondió ${respuesta.status}`))
      }
      await cargar()
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      ocupado = false
    }
  }

  $effect(() => {
    void cargar()
  })
</script>

<section class="categorias">
  <div class="cabecera-form">
    <button type="button" class="volver" onclick={alVolver}>
      ← Volver al panel
    </button>
    <h2>Categorías de las situaciones</h2>
  </div>

  <p class="ayuda">
    Las categorías son el catálogo del juego: se guardan en
    <code>src/content/categorias.ts</code>. No se puede borrar una categoría que
    estén usando alguna situación o un condicional.
  </p>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <form onsubmit={agregar}>
    <label>
      nueva categoría
      <input
        value={nueva}
        placeholder="vestuario"
        oninput={(e) => (nueva = e.currentTarget.value)}
      />
    </label>
    <button type="submit" disabled={ocupado}>Añadir</button>
  </form>

  {#if cargando}
    <p>Cargando…</p>
  {:else}
    <ul>
      {#each categorias as fila (fila.id)}
        <li>
          <span class="id">{fila.id}</span>
          {#if fila.enUso}
            <span class="marca">en uso</span>
            <button type="button" disabled>Eliminar</button>
          {:else}
            <button type="button" onclick={() => eliminar(fila)} disabled={ocupado}>
              Eliminar
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .categorias {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0 1rem 1rem;
    background: #fffdf8;
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
    color: #777;
    font-size: 0.85rem;
  }
  form {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    margin: 0.75rem 0;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.85rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.3rem 0;
    border-top: 1px solid #eee;
  }
  .id {
    font-weight: 600;
    min-width: 10rem;
  }
  .marca {
    border-radius: 999px;
    background: #e8e0d0;
    padding: 0 0.5rem;
    font-size: 0.72rem;
  }
  .error {
    color: #a11;
  }
</style>
