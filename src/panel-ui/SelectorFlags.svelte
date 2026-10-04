<script lang="ts">
  let {
    etiqueta,
    seleccion = $bindable(),
    disponibles,
    permiteNuevas = false,
    alAgregar,
    ayuda,
  }: {
    etiqueta?: string
    seleccion: string[] | undefined
    disponibles: string[]
    permiteNuevas?: boolean
    alAgregar?: (flag: string) => void
    ayuda?: string
  } = $props()

  let nueva = $state("")

  const marcadas = $derived(new Set(seleccion ?? []))
  const opciones = $derived(
    [...new Set([...disponibles, ...(seleccion ?? [])])].sort(),
  )

  function alternar(flag: string, activada: boolean) {
    const actuales = new Set(seleccion ?? [])
    if (activada) actuales.add(flag)
    else actuales.delete(flag)
    const lista = [...actuales].sort()
    seleccion = lista.length > 0 ? lista : undefined
  }

  function anadirNueva() {
    const limpia = nueva.trim()
    if (limpia === "") return
    alAgregar?.(limpia)
    const actuales = new Set(seleccion ?? [])
    actuales.add(limpia)
    seleccion = [...actuales].sort()
    nueva = ""
  }
</script>

<div class="selector">
  {#if etiqueta}
    <span class="etiqueta">{etiqueta}</span>
  {/if}

  {#if opciones.length === 0 && !permiteNuevas}
    <p class="vacio">Todavía no hay ninguna flag en el banco.</p>
  {:else if opciones.length > 0}
    <div class="lista">
      {#each opciones as flag (flag)}
        <label class="chip">
          <input
            type="checkbox"
            checked={marcadas.has(flag)}
            onchange={(e) => alternar(flag, e.currentTarget.checked)}
          />
          {flag}
        </label>
      {/each}
    </div>
  {/if}

  {#if permiteNuevas}
    <div class="nueva">
      <input
        type="text"
        placeholder="flag_nueva"
        value={nueva}
        oninput={(e) => (nueva = e.currentTarget.value)}
        onkeydown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            anadirNueva()
          }
        }}
      />
      <button type="button" class="secundario" onclick={anadirNueva}>
        Añadir flag
      </button>
    </div>
  {/if}

  {#if ayuda}
    <small class="ayuda">{ayuda}</small>
  {/if}
</div>

<style>
  .selector {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .etiqueta {
    font-size: 0.8rem;
    color: var(--f-muted, #6b7280);
  }
  .lista {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .chip {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid var(--f-border, #e5e7eb);
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    font-size: 0.82rem;
    color: var(--f-text, #111827);
    background: var(--f-surface, #fff);
  }
  .chip input {
    width: auto;
    margin: 0;
  }
  .nueva {
    display: flex;
    gap: 0.4rem;
  }
  .nueva input {
    box-sizing: border-box;
    flex: 1;
    font: inherit;
    font-size: 0.9rem;
    color: var(--f-text, #111827);
    background: var(--f-surface, #fff);
    border: 1px solid var(--f-border, #e5e7eb);
    border-radius: 7px;
    padding: 0.4rem 0.55rem;
  }
  .nueva input:focus-visible {
    outline: 2px solid var(--f-primary, #4f46e5);
    outline-offset: 1px;
    border-color: var(--f-primary, #4f46e5);
  }
  .secundario {
    font: inherit;
    font-size: 0.82rem;
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    background: var(--f-surface, #fff);
    color: var(--f-text, #111827);
    border: 1px solid var(--f-border, #e5e7eb);
  }
  .secundario:hover {
    background: var(--f-hover, #f9fafb);
  }
  .vacio {
    margin: 0;
    color: var(--f-muted, #6b7280);
    font-size: 0.82rem;
    font-style: italic;
  }
  .ayuda {
    color: var(--f-muted, #6b7280);
    font-size: 0.72rem;
  }
</style>
