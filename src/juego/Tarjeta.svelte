<script lang="ts">
import type { TarjetaFinal } from "../engine/index"
import {
  enFilas,
  etiquetaEstilo,
  etiquetaFase,
  etiquetaModalidad,
  etiquetaPremio,
  ROSETAS,
  textoPuesto,
  trayectoria,
} from "./presentacion"

let { tarjeta }: { tarjeta: TarjetaFinal } = $props()

// Línea temporal: premios del COAC + hitos de progresión (debut y primeras veces).
let eventos = $derived(
  trayectoria(tarjeta.primerosPremios, tarjeta.hitosProgreso ?? []),
)

/** Tono del bloque «mejor posición»: podio (1º/2º/3º) o fase alcanzada. */
let tonoMejor = $derived.by(() => {
  const { mejorFase, mejorPuesto } = tarjeta
  if (mejorFase === "final") {
    if (mejorPuesto === 1) return "oro"
    if (mejorPuesto === 2) return "plata"
    if (mejorPuesto === 3) return "bronce"
    return "final"
  }
  return mejorFase
})

/** Protagonista del bloque: el puesto y, sin puesto, la fase alcanzada. */
let sinPuesto = $derived(tarjeta.mejorPuesto === null)

// Línea temporal horizontal: columnas automáticas según el ancho disponible.
const COLUMNAS_POR_DEFECTO = 5
const CELDA_MIN = 3.2 // rem
const ALTO_HITO = 2.9 // rem
const HUECO_FILA = 0.75 // rem (= --esp-3)
const HUECO_FILA_COMPACTO = 0.5 // rem (= --esp-2), en móviles < 375px
const NODO_Y = 1.45 // rem desde el borde superior del hito
const RADIO_NODO = 0.35 // rem (mitad de 0.7rem del .hito__nodo)
const RADIO_BRONCE = 0.35 + 0.156 // nodo + halo (2.5px)
const RADIO_PLATA = 0.35 + 0.156 // nodo + halo (2.5px)
const RADIO_ORO = 0.35 + 0.188 // nodo + halo (3px)

let anchoDisponible = $state(0)
let remPx = $state(16)

$effect(() => {
  remPx =
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
})

// Móviles muy estrechos (< 375px): composición algo más compacta.
let compacto = $state(false)
$effect(() => {
  const mq = window.matchMedia("(max-width: 374px)")
  const aplicar = () => {
    compacto = mq.matches
  }
  aplicar()
  mq.addEventListener("change", aplicar)
  return () => mq.removeEventListener("change", aplicar)
})

// El hueco entre filas debe coincidir con el del carril (geometría del SVG).
let huecoFila = $derived(compacto ? HUECO_FILA_COMPACTO : HUECO_FILA)
let pitch = $derived(ALTO_HITO + huecoFila)

let columnas = $derived(
  anchoDisponible > 0
    ? Math.max(1, Math.floor(anchoDisponible / (CELDA_MIN * remPx)))
    : COLUMNAS_POR_DEFECTO,
)

// La primera fila reparte el ancho completo solo si está llena.
let rellena = $derived(anchoDisponible > 0 && eventos.length >= columnas)

// Ancho de celda: repartido entre las columnas o el mínimo.
let celdaRem = $derived(
  rellena ? anchoDisponible / columnas / remPx : CELDA_MIN,
)
let celdaCss = $derived(rellena ? `calc(100% / ${columnas})` : `${CELDA_MIN}rem`)

let filasPremios = $derived(enFilas(eventos, columnas))

let carril = $derived.by(() => {
  const filas = filasPremios
  const maxPorFila = filas.reduce((max, f) => Math.max(max, f.length), 0)
  const ancho = maxPorFila * celdaRem
  const alto =
    filas.length * ALTO_HITO + Math.max(0, filas.length - 1) * HUECO_FILA
  const x = (col: number) => (col + 0.5) * celdaRem
  const y = (row: number) => row * pitch + NODO_Y
  const radio = (puesto: number | null) => {
    if (puesto === 1) return RADIO_ORO
    if (puesto === 2) return RADIO_PLATA
    if (puesto === 3) return RADIO_BRONCE
    return RADIO_NODO
  }

  const partes: string[] = []
  filas.forEach((fila, r) => {
    const n = fila.length

    // Tramos horizontales entre nodos consecutivos, de borde a borde.
    for (let c = 0; c < n - 1; c++) {
      const x1 = x(c) + radio(fila[c].puesto)
      const x2 = x(c + 1) - radio(fila[c + 1].puesto)
      partes.push(`M ${x1} ${y(r)} L ${x2} ${y(r)}`)
    }
  })
  return { ancho, alto, d: partes.join(" ") }
})
</script>

<section class="palmares" data-testid="tarjeta">
  <header class="identidad">
    <span class="modalidad" data-testid="tarjeta-modalidad">
      {etiquetaModalidad(tarjeta.modalidadFinal)}
    </span>
    <h2 class="nombre" data-testid="tarjeta-nombre">{tarjeta.nombre}</h2>
    <span class="estilo" data-testid="tarjeta-estilo">
      {etiquetaEstilo(tarjeta.varianteFinal)}
    </span>
  </header>

  <div
    class="mejor"
    data-testid="tarjeta-mejor-posicion"
    data-tono={tonoMejor}
  >
    <span class="mejor__ornamento" aria-hidden="true">
      <span class="mejor__linea"></span>
      <span class="mejor__rombo"></span>
      <span class="mejor__linea"></span>
    </span>
    <span class="mejor__etiqueta">Mejor posición</span>
    <span
      class="mejor__puesto"
      style={sinPuesto ? "--tam-puesto: clamp(1.75rem, 9vw, 2.25rem)" : null}
    >
      {#if sinPuesto}
        {etiquetaFase(tarjeta.mejorFase)}
      {:else}
        {tarjeta.mejorPuesto}<span class="mejor__ordinal">º</span>
      {/if}
    </span>
    <span
      class="mejor__ornamento mejor__ornamento--abajo"
      aria-hidden="true"
    >
      <span class="mejor__linea"></span>
      <span class="mejor__rombo"></span>
      <span class="mejor__linea"></span>
    </span>
  </div>

  {#if eventos.length > 0}
    <section class="seccion" data-testid="tarjeta-premios">
      <h3 class="seccion__titulo">Trayectoria</h3>
      <div
        class="linea"
        style={`--hueco-fila:${huecoFila}rem;--columnas:${columnas};--celda:${celdaCss}`}
        bind:clientWidth={anchoDisponible}
      >
        <svg
          class="carril"
          viewBox={`0 0 ${carril.ancho} ${carril.alto}`}
          style={`width:${rellena ? "100%" : `${carril.ancho}rem`};height:${carril.alto}rem`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={carril.d} />
        </svg>
        {#each filasPremios as fila, i (i)}
          <ol class="fila">
            {#each fila as evento (evento.ano)}
              <li
                class="hito"
                class:primero={evento.puesto === 1}
                data-puesto={evento.puesto}
              >
                {#if evento.puesto !== null}
                  <span class="hito__puesto" data-tono={evento.tono}
                    >{textoPuesto(evento.puesto)}</span
                  >
                {:else if evento.hito}
                  <span class="hito__hito" data-tono={evento.tono}
                    >{evento.hito}</span
                  >
                {/if}
                <span
                  class="hito__nodo"
                  data-tono={evento.tono}
                  aria-hidden="true"
                ></span>
                <span class="hito__anio">{evento.ano}</span>
              </li>
            {/each}
          </ol>
        {/each}
      </div>
    </section>
  {/if}

  {#if tarjeta.otrosPremios.length > 0}
    <section class="seccion" data-testid="tarjeta-distinciones">
      <h3 class="seccion__titulo">Distinciones</h3>
      <ul class="distinciones">
        {#each tarjeta.otrosPremios as premio (premio.tipo)}
          <li
            class="distincion"
            data-tipo={premio.tipo}
            title={`${etiquetaPremio(premio.tipo)}: ${premio.veces}`}
          >
            <span class="distincion__rosetas" aria-hidden="true">
              {#each Array(premio.veces) as _, i (i)}
                <img class="roseta" src={ROSETAS[premio.tipo]} alt="" />
              {/each}
            </span>
            <span class="oculto"
              >{etiquetaPremio(premio.tipo)}: {premio.veces}</span
            >
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</section>

<style>
  /* Palmarés: vertical, aireado, sin panel de formulario. */
  /* Tarjeta global del palmarés: envuelve de nombre a distinciones. */
  .palmares {
    display: flex;
    flex-direction: column;
    gap: var(--esp-4);

    padding: var(--esp-4);

    background: color-mix(in srgb, var(--c-texto-fuerte) 5%, transparent);
    border: 1px solid
      color-mix(in srgb, var(--c-texto-fuerte) 12%, transparent);
    border-radius: var(--radio-md);

    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .identidad {
    display: flex;
    flex-direction: column;
    align-items: center;

    text-align: center;
  }

  .modalidad {
    color: var(--c-acento-fuerte);
    font-size: var(--texto-base);
    font-weight: var(--peso-fuerte);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1.2;
  }

  .nombre {
    margin: var(--esp-1) 0 0;

    font-family: var(--fuente-display);
    font-size: var(--texto-2xl);
    line-height: var(--interlinea-apretada);
    color: var(--c-texto-fuerte);
  }

  .estilo {
    color: var(--c-acento-fuerte);
    font-size: var(--texto-base);
    font-weight: var(--peso-normal);
    line-height: 1.2;
  }

  /* Placa de honor: ornamento editorial + puesto protagonista. */
  .mejor {
    --tono: var(--c-texto-suave);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--esp-1);

    text-align: center;
  }

  .mejor[data-tono="oro"] {
    --tono: var(--c-carnaval-oro);
  }

  .mejor[data-tono="plata"] {
    --tono: var(--c-carnaval-plata);
  }

  .mejor[data-tono="bronce"] {
    --tono: var(--c-carnaval-bronce);
  }

  /* Fases: verde (Debut), azul claro (CF), azul (SF) y morado (F). */
  .mejor[data-tono="preliminares"] {
    --tono: var(--c-carnaval-verde-claro);
  }

  .mejor[data-tono="cuartos"] {
    --tono: var(--c-carnaval-azul-claro);
  }

  .mejor[data-tono="semifinales"] {
    --tono: var(--c-carnaval-azul);
  }

  .mejor[data-tono="final"] {
    --tono: var(--c-carnaval-violeta);
  }

  /* Ornamento: línea — rombo — línea. */
  .mejor__ornamento {
    display: flex;
    align-items: center;
    gap: var(--esp-2);
    width: min(100%, 12rem);
  }

  .mejor__linea {
    flex: 1;
    height: 1px;
    background: var(--c-separador);
  }

  .mejor__rombo {
    width: 0.4rem;
    height: 0.4rem;
    background: color-mix(in srgb, var(--tono) 75%, transparent);
    transform: rotate(45deg);
  }

  .mejor__etiqueta {
    color: var(--c-texto-suave);
    font-size: var(--texto-xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.16em;
  }

  .mejor__puesto {
    color: var(--tono);
    font-family: var(--fuente-display);
    font-size: var(--tam-puesto, clamp(2.5rem, 12vw, 3rem));
    line-height: 1;
  }

  /* Anton dibuja el ordinal a tamaño completo: lo elevamos y reducimos. */
  .mejor__ordinal {
    font-size: 0.4em;
    vertical-align: 0.55em;
  }

  /* Base de la placa: mismo ornamento que arriba. */
  .mejor__ornamento--abajo {
    margin-top: var(--esp-1);
  }

  /* Título de sección con separador ornamental sutil. */
  .seccion__titulo {
    display: flex;
    align-items: center;
    gap: var(--esp-3);

    margin-bottom: var(--esp-3);

    color: var(--c-texto-suave);
    font-size: var(--texto-xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.16em;
  }

  .seccion__titulo::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--c-separador);
  }

  /* --- Línea temporal horizontal (5 por fila, carril continuo) --- */
  .linea {
    position: relative;

    display: flex;
    flex-direction: column;
    gap: var(--hueco-fila);
  }

  .carril {
    position: absolute;
    top: 0;
    left: 0;

    overflow: visible;
    pointer-events: none;
  }

  .carril path {
    fill: none;
    stroke: var(--c-separador);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .fila {
    position: relative;
    list-style: none;

    display: grid;
    grid-template-columns: repeat(var(--columnas), var(--celda));
    justify-content: start;
  }

  .hito {
    height: 2.9rem;

    display: grid;
    grid-template-rows: 1rem 0.9rem 1rem;
    justify-items: center;
    align-items: center;
  }

  /* Etiquetas del hito: cortas, con el tono de su medalla o fase. */
  .hito__hito {
    color: var(--c-texto-suave);
    font-size: 0.68rem;
    font-weight: var(--peso-fuerte);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    line-height: 1;
    white-space: nowrap;
  }

  .hito__puesto {
    position: relative;
    left: 2px;

    color: var(--c-texto-suave);
    font-size: var(--texto-sm);
    font-weight: var(--peso-fuerte);
    line-height: 1;
  }

  /* Tonos de etiqueta: medalla (premio) o fase (hito). */
  .hito__puesto[data-tono="oro"] {
    color: var(--c-carnaval-oro);
  }

  .hito__puesto[data-tono="plata"] {
    color: var(--c-carnaval-plata);
  }

  .hito__puesto[data-tono="bronce"] {
    color: var(--c-carnaval-bronce);
  }

  /* Fases: verde (Debut), azul claro (CF), azul (SF) y morado (F). */
  .hito__hito[data-tono="preliminares"] {
    color: var(--c-carnaval-verde-claro);
  }

  .hito__hito[data-tono="cuartos"] {
    color: var(--c-carnaval-azul-claro);
  }

  .hito__hito[data-tono="semifinales"] {
    color: var(--c-carnaval-azul);
  }

  .hito__hito[data-tono="final"] {
    color: var(--c-carnaval-violeta);
  }

  .hito__nodo {
    width: 0.7rem;
    height: 0.7rem;

    background: var(--c-texto-suave);
    border-radius: 50%;
  }

  /* El nodo toma el tono de su etiqueta (medalla o fase). */
  .hito__nodo[data-tono="oro"] {
    background: var(--c-carnaval-oro);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--c-carnaval-oro) 22%, transparent);
  }

  .hito__nodo[data-tono="plata"] {
    background: var(--c-carnaval-plata);
    box-shadow: 0 0 0 2.5px
      color-mix(in srgb, var(--c-carnaval-plata) 18%, transparent);
  }

  .hito__nodo[data-tono="bronce"] {
    background: var(--c-carnaval-bronce);
    box-shadow: 0 0 0 2.5px
      color-mix(in srgb, var(--c-carnaval-bronce) 16%, transparent);
  }

  /* Fases: verde (Debut), azul claro (CF), azul (SF) y morado (F). */
  .hito__nodo[data-tono="preliminares"] {
    background: var(--c-carnaval-verde-claro);
  }

  .hito__nodo[data-tono="cuartos"] {
    background: var(--c-carnaval-azul-claro);
  }

  .hito__nodo[data-tono="semifinales"] {
    background: var(--c-carnaval-azul);
  }

  .hito__nodo[data-tono="final"] {
    background: var(--c-carnaval-violeta);
  }

  .hito__anio {
    color: var(--c-texto-suave);
    font-size: var(--texto-sm);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  /* --- Distinciones: una roseta por victoria, agrupadas por tipo --- */
  .distinciones {
    list-style: none;

    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    gap: var(--esp-3) var(--esp-2);
  }

  .distincion {
    position: relative;

    display: flex;
  }

  .distincion__rosetas {
    display: flex;
    align-items: flex-start;
  }

  /* Las rosetas del mismo premio van pegadas: se solapa el aire lateral del SVG. */
  .distincion__rosetas .roseta + .roseta {
    margin-left: -0.7rem;
  }

  .roseta {
    display: block;
    width: 2.8rem;
    height: auto;
  }

  /* Nombre accesible: visible solo para lectores de pantalla. */
  .oculto {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    white-space: nowrap;
    border: 0;
    clip-path: inset(50%);
  }

  /* Móviles muy estrechos (< 375px): composición algo más compacta. */
  @media (max-width: 374px) {
    .palmares {
      gap: var(--esp-3);
    }

    .nombre {
      margin: 0;
    }

    .seccion__titulo {
      margin-bottom: var(--esp-2);
    }

    .roseta {
      width: 2.5rem;
    }

    .distincion__rosetas .roseta + .roseta {
      margin-left: -0.6rem;
    }
  }
</style>
