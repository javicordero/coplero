<script lang="ts">
  import { ATRIBUTOS, FASES_COAC } from "../content/modalidades"
  import type { Requisito } from "../content/schema"

  let {
    requisito = $bindable(),
    flags = [],
  }: {
    requisito: Requisito
    flags?: string[]
  } = $props()

  const TIPOS = [
    "flag",
    "flagRepetida",
    "faseAlcanzada",
    "atributo",
    "todas",
    "alguna",
    "ninguna",
  ] as const

  let errorJson = $state<string | null>(null)

  const esCompuesto = $derived(
    requisito.tipo === "todas" ||
      requisito.tipo === "alguna" ||
      requisito.tipo === "ninguna",
  )

  const hijosJson = $derived(
    esCompuesto
      ? JSON.stringify((requisito as { de: Requisito[] }).de, null, 2)
      : "",
  )

  function cambiarTipo(tipo: (typeof TIPOS)[number]) {
    errorJson = null
    switch (tipo) {
      case "flag":
        requisito = { tipo: "flag", flag: flags[0] ?? "" }
        break
      case "flagRepetida":
        requisito = { tipo: "flagRepetida", flag: flags[0] ?? "", veces: 2 }
        break
      case "faseAlcanzada":
        requisito = { tipo: "faseAlcanzada", fase: "final" }
        break
      case "atributo":
        requisito = { tipo: "atributo", atributo: "popularidad", min: 50 }
        break
      default:
        requisito = { tipo, de: [] }
    }
  }

  function actualizarHijos(valor: string) {
    if (
      requisito.tipo !== "todas" &&
      requisito.tipo !== "alguna" &&
      requisito.tipo !== "ninguna"
    ) {
      return
    }
    try {
      const parseado = JSON.parse(valor)
      if (!Array.isArray(parseado)) {
        throw new Error("debe ser una lista de requisitos")
      }
      requisito.de = parseado as Requisito[]
      errorJson = null
    } catch (e) {
      errorJson = e instanceof Error ? e.message : String(e)
    }
  }
</script>

<div class="requisito">
  <label>
    tipo de requisito
    <select
      value={requisito.tipo}
      onchange={(e) =>
        cambiarTipo(e.currentTarget.value as (typeof TIPOS)[number])}
    >
      {#each TIPOS as tipo (tipo)}
        <option value={tipo}>{tipo}</option>
      {/each}
    </select>
  </label>

  {#if requisito.tipo === "flag" || requisito.tipo === "flagRepetida"}
    <label>
      flag
      <select
        value={requisito.flag}
        onchange={(e) => (requisito.flag = e.currentTarget.value)}
      >
        <option value="">—</option>
        {#each flags as flag (flag)}
          <option value={flag}>{flag}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if requisito.tipo === "flagRepetida"}
    <label>
      veces
      <input
        type="number"
        min="1"
        value={requisito.veces}
        oninput={(e) => (requisito.veces = Number(e.currentTarget.value))}
      />
    </label>
  {/if}

  {#if requisito.tipo === "faseAlcanzada"}
    <label>
      fase
      <select
        value={requisito.fase}
        onchange={(e) =>
          (requisito.fase = e.currentTarget.value as (typeof FASES_COAC)[number])}
      >
        {#each FASES_COAC as fase (fase)}
          <option value={fase}>{fase}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if requisito.tipo === "atributo"}
    <label>
      atributo
      <select
        value={requisito.atributo}
        onchange={(e) =>
          (requisito.atributo = e.currentTarget.value as (typeof ATRIBUTOS)[number])}
      >
        {#each ATRIBUTOS as atributo (atributo)}
          <option value={atributo}>{atributo}</option>
        {/each}
      </select>
    </label>
    <label>
      mínimo
      <input
        type="number"
        value={requisito.min ?? ""}
        oninput={(e) =>
          (requisito.min =
            e.currentTarget.value.trim() === ""
              ? undefined
              : Number(e.currentTarget.value))}
      />
    </label>
    <label>
      máximo
      <input
        type="number"
        value={requisito.max ?? ""}
        oninput={(e) =>
          (requisito.max =
            e.currentTarget.value.trim() === ""
              ? undefined
              : Number(e.currentTarget.value))}
      />
    </label>
  {/if}

  {#if esCompuesto}
    <label class="ancha">
      condiciones (JSON)
      <textarea
        rows="5"
        value={hijosJson}
        onchange={(e) => actualizarHijos(e.currentTarget.value)}
      ></textarea>
    </label>
    {#if errorJson}
      <p class="error" role="alert">JSON inválido: {errorJson}</p>
    {/if}
  {/if}
</div>

<style>
  .requisito {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: flex-end;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: var(--f-muted, #6b7280);
  }
  select,
  input,
  textarea {
    box-sizing: border-box;
    font: inherit;
    font-size: 0.9rem;
    color: var(--f-text, #111827);
    background: var(--f-surface, #fff);
    border: 1px solid var(--f-border, #e5e7eb);
    border-radius: 7px;
    padding: 0.4rem 0.55rem;
  }
  select:focus-visible,
  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--f-primary, #4f46e5);
    outline-offset: 1px;
    border-color: var(--f-primary, #4f46e5);
  }
  .ancha {
    flex-basis: 100%;
  }
  textarea {
    width: 100%;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.8rem;
  }
  .error {
    flex-basis: 100%;
    color: var(--f-danger, #b91c1c);
    font-size: 0.8rem;
  }
</style>
