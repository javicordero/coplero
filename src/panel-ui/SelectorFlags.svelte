<script lang="ts">
  let {
    etiqueta,
    seleccion = $bindable(),
    disponibles,
    permiteNuevas = false,
    alAgregar,
    ayuda,
  }: {
    etiqueta: string
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

<fieldset class="selector">
  <legend>{etiqueta}</legend>

  {#if opciones.length === 0 && !permiteNuevas}
    <p class="vacio">Todavía no hay ninguna flag en el banco.</p>
  {:else if opciones.length > 0}
    <div class="lista">
      {#each opciones as flag (flag)}
        <label class="casilla">
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
      <button type="button" onclick={anadirNueva}>Añadir flag</button>
    </div>
  {/if}

  {#if ayuda}
    <small class="ayuda">{ayuda}</small>
  {/if}
</fieldset>

<style>
  .selector {
    border: 1px solid #ddd;
    border-radius: 6px;
    margin: 0.5rem 0;
    padding: 0.5rem 0.75rem;
  }
  .lista {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
  }
  .casilla {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.82rem;
  }
  .nueva {
    display: flex;
    gap: 0.4rem;
    margin-top: 0.4rem;
  }
  .nueva input {
    flex: 1;
  }
  .vacio {
    color: #777;
    font-size: 0.82rem;
    font-style: italic;
  }
  .ayuda {
    display: block;
    color: #888;
    font-size: 0.72rem;
    margin-top: 0.3rem;
  }
</style>
