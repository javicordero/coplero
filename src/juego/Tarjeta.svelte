<script lang="ts">
import { VARIANTES } from "../content/index"
import type { TarjetaFinal } from "../engine/index"
import ReglaCompas from "../components/ReglaCompas.svelte"
import {
  DIRECCION_JUEGO,
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

let tienePremiOSCoac = $derived(tarjeta.primerosPremios.length > 0)
let mejorPosicion = $derived(
  tarjeta.mejorPuesto !== null
    ? `${etiquetaFase(tarjeta.mejorFase)} · ${puestoTexto(tarjeta.mejorPuesto)}`
    : etiquetaFase(tarjeta.mejorFase),
)
</script>

<section class="tarjeta" data-testid="tarjeta">
  <header class="identidad">
    <h2 data-testid="tarjeta-nombre">{tarjeta.nombre}</h2>
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

  <ReglaCompas class="compas-pie" />
  <footer class="pie">
    <span>Juega tu carrera en</span>
    <strong>{DIRECCION_JUEGO}</strong>
  </footer>
</section>

<style>
  .tarjeta {
    display: flex;
    flex-direction: column;
    gap: var(--esp-4);
    border: 1px solid var(--c-separador);
    border-radius: var(--radio-md);
    padding: var(--esp-5);
    background: var(--c-superficie);
  }

  .identidad {
    text-align: center;
  }

  .identidad h2 {
    font-size: var(--texto-2xl);
  }

  .subtitulo {
    color: var(--c-acento);
    font-weight: var(--peso-fuerte);
  }

  .anios {
    color: var(--c-texto-suave);
    font-size: var(--texto-sm);
  }

  .destacados {
    display: flex;
    flex-wrap: wrap;
    gap: var(--esp-2);
  }

  .tile {
    flex: 1 1 30%;
    min-width: 6rem;
    display: flex;
    flex-direction: column;
    gap: var(--esp-1);
    border: 1px solid var(--c-separador);
    border-radius: var(--radio-sm);
    padding: var(--esp-2);
  }

  .etiqueta {
    color: var(--c-texto-suave);
    font-size: var(--texto-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .valor {
    font-size: var(--texto-lg);
    font-weight: var(--peso-fuerte);
  }

  .otros {
    list-style: none;
    font-size: var(--texto-sm);
  }

  .bloque h3 {
    font-family: var(--fuente-texto);
    font-size: var(--texto-sm);
    font-weight: var(--peso-fuerte);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--c-texto-suave);
    margin-bottom: var(--esp-2);
  }

  .chips {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: var(--esp-1);
  }

  .chip {
    border: 1px solid var(--c-borde-control);
    border-radius: var(--radio-pill);
    padding: var(--esp-1) var(--esp-3);
    font-size: var(--texto-sm);
  }

  .neutro {
    color: var(--c-texto-suave);
    font-size: var(--texto-sm);
  }

  .lista,
  .hitos {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--esp-1);
    font-size: var(--texto-sm);
  }

  .hitos li::before {
    content: "· ";
    color: var(--c-acento);
  }

  .frase {
    margin-top: var(--esp-2);
    font-style: italic;
    color: var(--c-texto);
  }

  .compas-pie {
    max-width: 6rem;
  }

  .pie {
    display: flex;
    justify-content: space-between;
    gap: var(--esp-2);
    padding-top: var(--esp-3);
    font-size: var(--texto-xs);
    color: var(--c-texto-suave);
  }

  .pie strong {
    color: var(--c-acento);
  }
</style>
