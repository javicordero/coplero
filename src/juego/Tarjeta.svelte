<script lang="ts">
import { VARIANTES } from "../content/index"
import type { TarjetaFinal } from "../engine/index"
import {
  DIRECCION_JUEGO,
  ETIQUETA_ANONIMO,
  etiquetaFase,
  etiquetaModalidad,
  etiquetaPremio,
} from "./presentacion"

let { tarjeta }: { tarjeta: TarjetaFinal } = $props()

function tituloVariante(id: string): string {
  return VARIANTES.find((v) => v.id === id)?.titulo ?? id
}

function puestoTexto(puesto: number): string {
  return `${puesto}.º`
}

let nombre = $derived(tarjeta.nombre ?? ETIQUETA_ANONIMO)
let tienePremiOSCoac = $derived(tarjeta.primerosPremios.length > 0)
let mejorPosicion = $derived(
  tarjeta.mejorPuesto !== null
    ? `${etiquetaFase(tarjeta.mejorFase)} · ${puestoTexto(tarjeta.mejorPuesto)}`
    : etiquetaFase(tarjeta.mejorFase),
)
</script>

<section class="tarjeta" data-testid="tarjeta">
  <header class="identidad">
    <h2 data-testid="tarjeta-nombre">{nombre}</h2>
    <p class="subtitulo">
      {etiquetaModalidad(tarjeta.modalidadFinal)} ·
      {tituloVariante(tarjeta.varianteFinal)}
    </p>
    <p class="anios">{tarjeta.anosEnActivo} años en activo</p>
  </header>

  <div class="destacados">
    <div class="tile">
      <span class="etiqueta">Premios del COAC</span>
      <span class="valor">
        {tienePremiOSCoac ? tarjeta.primerosPremios.length : "—"}
      </span>
    </div>
    <div class="tile">
      <span class="etiqueta">Mejor posición</span>
      <span class="valor">{mejorPosicion}</span>
    </div>
    {#if tarjeta.otrosPremios.length > 0}
      <div class="tile">
        <span class="etiqueta">Otros premios</span>
        <ul class="otros">
          {#each tarjeta.otrosPremios as premio (premio.tipo)}
            <li>{etiquetaPremio(premio.tipo)}: {premio.veces}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <section class="bloque">
    <h3>Trayectoria</h3>
    <ul class="chips" data-testid="tarjeta-trayectoria">
      <li class="chip">
        {etiquetaModalidad(tarjeta.modalidadInicial)} ·
        {tituloVariante(tarjeta.varianteInicial)}
      </li>
      {#each tarjeta.cambios as cambio (cambio.ano + cambio.variante)}
        <li class="chip">
          {cambio.ano}: {etiquetaModalidad(cambio.modalidad)} ·
          {tituloVariante(cambio.variante)}
        </li>
      {/each}
    </ul>
    {#if tarjeta.cambios.length === 0}
      <p class="neutro">
        Toda la carrera en {etiquetaModalidad(tarjeta.modalidadInicial)} ·
        {tituloVariante(tarjeta.varianteInicial)}.
      </p>
    {/if}
    {#if tarjeta.anosSinConcursar.length > 0}
      <p class="neutro">
        Años sin concursar: {tarjeta.anosSinConcursar.join(", ")}.
      </p>
    {/if}
  </section>

  {#if tienePremiOSCoac}
    <section class="bloque">
      <h3>Primeros premios</h3>
      <ul class="lista">
        {#each tarjeta.primerosPremios as logro (logro.ano)}
          <li>{puestoTexto(logro.puesto)} en {logro.ano}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <section class="bloque">
    <h3>El relato</h3>
    <ul class="hitos" data-testid="tarjeta-hitos">
      {#each tarjeta.hitos as hito (hito.tipo)}
        <li>{hito.texto}</li>
      {/each}
    </ul>
    <p class="frase" data-testid="tarjeta-frase">{tarjeta.fraseCierre}</p>
  </section>

  <footer class="pie">
    <span>Juega tu carrera en</span>
    <strong>{DIRECCION_JUEGO}</strong>
  </footer>
</section>

<style>
  .tarjeta {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 1.25rem;
    background: #111;
  }

  .identidad {
    text-align: center;
  }

  .identidad h2 {
    font-size: 1.5rem;
  }

  .subtitulo {
    color: #f6ad55;
    font-weight: 600;
  }

  .anios {
    color: #a0aec0;
    font-size: 0.9rem;
  }

  .destacados {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tile {
    flex: 1 1 30%;
    min-width: 6rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 0.5rem;
  }

  .etiqueta {
    color: #a0aec0;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .valor {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .otros {
    list-style: none;
    font-size: 0.85rem;
  }

  .bloque h3 {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a0aec0;
    margin-bottom: 0.5rem;
  }

  .chips {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .chip {
    border: 1px solid #444;
    border-radius: 999px;
    padding: 0.2rem 0.6rem;
    font-size: 0.85rem;
  }

  .neutro {
    color: #a0aec0;
    font-size: 0.85rem;
  }

  .lista,
  .hitos {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.9rem;
  }

  .hitos li::before {
    content: "· ";
    color: #f6ad55;
  }

  .frase {
    margin-top: 0.5rem;
    font-style: italic;
    color: #e2e8f0;
  }

  .pie {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    border-top: 1px solid #333;
    padding-top: 0.75rem;
    font-size: 0.8rem;
    color: #a0aec0;
  }

  .pie strong {
    color: #f6ad55;
  }
</style>
