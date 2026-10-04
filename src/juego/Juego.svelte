<script lang="ts">
import { variantesDe } from "../content/index"
import { crearJuego } from "./estado.svelte"
import { almacenNavegador } from "./persistencia"
import { arranqueFinDesdeUrl } from "./dev/fixturesFin"
import {
  type Indicador,
  mensajeError,
  MODALIDADES_INFO,
  SUBTITULO_VARIANTE,
  TITULO_CAMBIO_VARIANTE,
  tituloDelJuego,
} from "./presentacion"
import CrearPersonaje from "./pantallas/CrearPersonaje.svelte"
import Decision from "./pantallas/Decision.svelte"
import ElegirModalidad from "./pantallas/ElegirModalidad.svelte"
import ElegirVariante from "./pantallas/ElegirVariante.svelte"
import ErrorPantalla from "./pantallas/Error.svelte"
import FinCarrera from "./pantallas/FinCarrera.svelte"
import FondoFebrero from "./pantallas/FondoFebrero.svelte"
import FondoVerano from "./pantallas/FondoVerano.svelte"
import IndicadorContexto from "./pantallas/IndicadorContexto.svelte"
import Reanudar from "./pantallas/Reanudar.svelte"
import Resultado from "./pantallas/Resultado.svelte"

// Solo en desarrollo: `/jugar?dev=fin` abre directamente la pantalla final con
// una tarjeta de ejemplo (ver `dev/fixturesFin.ts`). En producción `arranque`
// es `null` y la rama se elimina del bundle.
const arranque =
  import.meta.env.DEV && typeof window !== "undefined"
    ? arranqueFinDesdeUrl(window.location.search)
    : null

const juego = crearJuego(almacenNavegador(), {
  tarjetaInicial: arranque?.tarjeta,
})

// Momento para el fondo: en el arranque dev manda el de la URL; el resto del
// tiempo, el de la partida.
let momento = $derived(arranque?.momento ?? juego.partida?.momento ?? null)

// Pantallas del flujo previo a partida: comparten el marco de pantalla
// (altura del área de juego y cabecera de posición fija).
const PANTALLAS_PREVIAS = new Set(["crear-personaje", "modalidad", "variante"])

const GOTAS = [
  { left: "3%", alto: "16px", retraso: "0s", duracion: "2.4s" },
  { left: "8%", alto: "20px", retraso: "0.3s", duracion: "3.1s" },
  { left: "13%", alto: "14px", retraso: "0.6s", duracion: "2.0s" },
  { left: "18%", alto: "18px", retraso: "0.15s", duracion: "2.6s" },
  { left: "23%", alto: "22px", retraso: "0.9s", duracion: "3.3s" },
  { left: "28%", alto: "15px", retraso: "0.45s", duracion: "2.2s" },
  { left: "33%", alto: "19px", retraso: "1.1s", duracion: "2.9s" },
  { left: "38%", alto: "14px", retraso: "0.2s", duracion: "2.0s" },
  { left: "43%", alto: "21px", retraso: "0.75s", duracion: "3.1s" },
  { left: "48%", alto: "16px", retraso: "0.05s", duracion: "2.4s" },
  { left: "53%", alto: "18px", retraso: "0.55s", duracion: "2.6s" },
  { left: "58%", alto: "14px", retraso: "1.25s", duracion: "2.0s" },
  { left: "63%", alto: "20px", retraso: "0.35s", duracion: "3.3s" },
  { left: "68%", alto: "15px", retraso: "0.85s", duracion: "2.2s" },
  { left: "73%", alto: "22px", retraso: "0.1s", duracion: "2.9s" },
  { left: "78%", alto: "16px", retraso: "0.65s", duracion: "2.4s" },
  { left: "83%", alto: "19px", retraso: "1.05s", duracion: "3.1s" },
  { left: "88%", alto: "14px", retraso: "0.4s", duracion: "2.0s" },
  { left: "93%", alto: "18px", retraso: "0.7s", duracion: "2.6s" },
  { left: "5%", alto: "21px", retraso: "1.3s", duracion: "3.3s" },
  { left: "45%", alto: "14px", retraso: "0.5s", duracion: "2.2s" },
  { left: "70%", alto: "20px", retraso: "0.95s", duracion: "2.9s" },
  { left: "25%", alto: "15px", retraso: "1.15s", duracion: "2.0s" },
  { left: "90%", alto: "17px", retraso: "0.25s", duracion: "2.4s" },
]

// El indicador es un overlay del área de juego (016): se muestra en decisión
// y en resultado, con año y momento, nunca con el tipo (FR-001, FR-006, FR-014).
let indicadorActual = $derived.by<Indicador | null>(() => {
  if (!juego.partida) return null
  if (juego.pantalla === "decision" && juego.paso?.tipo === "decision") {
    return { ano: juego.partida.anoActual, momento: juego.paso.momento }
  }
  if (juego.pantalla === "resultado") {
    return { ano: juego.partida.anoActual, momento: "febrero" }
  }
  return null
})

// Cada pantalla empieza arriba: evita heredar el scroll de la anterior (p. ej.
// al pulsar «Continuar» en un formulario más alto que el viewport).
$effect(() => {
  if (juego.pantalla) window.scrollTo(0, 0)
})

// El juego ocupa el alto del viewport menos la cabecera para que el pie
// quede por debajo del pliegue: solo se ve al hacer scroll.
$effect(() => {
  const cabecera = document.querySelector<HTMLElement>(".site-header")
  if (!cabecera) return
  const ajustar = () =>
    document.documentElement.style.setProperty(
      "--alto-cabecera",
      `${cabecera.offsetHeight}px`,
    )
  ajustar()
  window.addEventListener("resize", ajustar)
  return () => window.removeEventListener("resize", ajustar)
})

// La marca de la cabecera refleja el sexo del personaje (FR-006): al montar
// con partida guardada, en cuanto se elige en el formulario y cada vez que cambia.
$effect(() => {
  const genero =
    juego.personaje?.genero ??
    (juego.pantalla === "crear-personaje" ? juego.generoBorrador : null) ??
    juego.partida?.personaje.genero
  const marca = document.querySelector<HTMLElement>("[data-marca]")
  if (marca) marca.textContent = genero ? tituloDelJuego(genero) : "Coplero"
  document.title = genero ? tituloDelJuego(genero) : "Coplero"
})
</script>

<main
  data-testid="juego"
  data-pantalla={juego.pantalla}
  data-momento={juego.pantalla === "fin" ? "" : (momento ?? "")}
  data-ano={juego.partida?.anoActual ?? ""}
  data-prepartida={PANTALLAS_PREVIAS.has(juego.pantalla) ? "" : undefined}
>
  {#if momento === "febrero" && juego.pantalla !== "resultado" && juego.pantalla !== "fin"}
    <FondoFebrero />
    <span class="lluvia" aria-hidden="true">
      {#each GOTAS as gota, i (i)}
        <i
          style="left:{gota.left};height:{gota.alto};animation-delay:{gota.retraso};animation-duration:{gota.duracion}"
        ></i>
      {/each}
    </span>
  {/if}
  {#if momento === "verano" && juego.pantalla !== "resultado" && juego.pantalla !== "fin"}
    <FondoVerano />
  {/if}
  {#if indicadorActual}
    <IndicadorContexto indicador={indicadorActual} />
  {/if}
  {#if juego.pantalla === "reanudar"}
    <Reanudar
      onContinuar={juego.continuarPartida}
      onNuevaPartida={juego.empezar}
    />
  {:else if juego.pantalla === "crear-personaje"}
    <CrearPersonaje
      onCrear={juego.crearPersonaje}
      onGenero={juego.seleccionarGenero}
    />
  {:else if juego.pantalla === "modalidad"}
    <ElegirModalidad
      modalidades={MODALIDADES_INFO}
      onElegir={juego.elegirModalidad}
    />
  {:else if juego.pantalla === "variante"}
    <ElegirVariante
      variantes={variantesDe(juego.modalidad ?? "comparsista")}
      subtitulo={SUBTITULO_VARIANTE}
      iconos={true}
      onElegir={juego.elegirVariante}
    />
  {:else if juego.pantalla === "cambio-variante" && juego.paso?.tipo === "variante"}
    <ElegirVariante
      titulo={TITULO_CAMBIO_VARIANTE}
      variantes={variantesDe(juego.paso.modalidad)}
      onElegir={juego.elegirVarianteCambio}
    />
  {:else if juego.pantalla === "decision" && juego.paso?.tipo === "decision"}
    <Decision
      situacion={juego.paso.situacion}
      onElegir={juego.elegirOpcion}
    />
  {:else if juego.pantalla === "resultado" && juego.paso?.tipo === "resultado" && juego.partida}
    <Resultado
      temporada={juego.paso.temporada}
      onContinuar={juego.continuar}
    />
  {:else if juego.pantalla === "fin" && juego.tarjeta}
    <FinCarrera
      tarjeta={juego.tarjeta}
      codigo={juego.codigo()}
      onReiniciar={juego.reiniciar}
    />
  {:else if juego.pantalla === "error" && juego.error}
    <ErrorPantalla
      mensaje={mensajeError(juego.error)}
      onReiniciar={juego.reiniciar}
    />
  {/if}
</main>

<style>
  main {
    position: relative;
    width: 100%;
    max-width: var(--ancho-bucle);
    margin: 0 auto;
    padding: var(--esp-6) var(--esp-4);
    flex: 1;
    /* `svh` (viewport pequeño estable) en vez de `dvh`: en móvil, `dvh` crece
       al ocultarse la barra del navegador al scrollear y hacía saltar la altura
       del área de juego. `100vh` queda como reserva para navegadores antiguos. */
    min-height: calc(100vh - var(--alto-cabecera, 0px));
    min-height: calc(100svh - var(--alto-cabecera, 0px));
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--c-texto);
  }

  /* Flujo previo a partida (017): el área de juego se fija a "viewport menos
     cabecera" y se ancla arriba (sin el centrado de `main`, que desplazaría la
     cabecera según el contenido). */
  main[data-prepartida] {
    height: calc(100vh - var(--alto-cabecera, 0px));
    height: calc(100svh - var(--alto-cabecera, 0px));
    min-height: 0;
    flex: 0 0 auto;
    justify-content: flex-start;
  }

  main[data-momento="verano"] {
    color-scheme: light;
    --c-texto: var(--c-verano-texto);
    --c-texto-fuerte: var(--c-verano-texto);
    --c-texto-suave: var(--c-verano-texto-suave);
    --c-superficie: var(--c-verano-superficie);
    --c-superficie-alta: var(--c-verano-superficie-alta);
    --c-separador: var(--c-verano-separador);
    --c-borde-control: var(--c-verano-borde-control);
    --c-acento-texto: var(--c-verano-acento-texto);
    /* El borde del hover se vuelve naranja vivo, a tono con el sol (016). */
    --c-acento-2: var(--c-verano-acento-borde);
    isolation: isolate;
    background-image: linear-gradient(
      180deg,
      var(--c-verano-cielo) 0%,
      var(--c-verano-cielo) 55%,
      var(--c-verano-mar-hondo) 55%,
      var(--c-verano-mar-hondo) 56.5%,
      var(--c-verano-mar) 56.5%,
      var(--c-verano-mar) 100%
    );
  }

  main[data-momento="febrero"]:not([data-pantalla="resultado"]) {
    position: relative;
    isolation: isolate;
    background-image: radial-gradient(
      120% 55% at 50% 100%,
      rgba(127, 209, 193, 0.1),
      rgba(127, 209, 193, 0) 65%
    );
  }

  main[data-pantalla="resultado"] {
    color-scheme: light;
    --c-texto: var(--c-acta-tinta);
    --c-texto-fuerte: var(--c-acta-tinta);
    --c-texto-suave: var(--c-acta-tinta-suave);
    --c-superficie: var(--c-acta-papel-alta);
    --c-superficie-alta: var(--c-acta-papel);
    --c-separador: var(--c-acta-linea);
    --c-borde-control: var(--c-acta-tinta-suave);
    --c-acento-texto: var(--c-acta-sello);
    --c-acento-2: var(--c-acta-sello);
    background-color: var(--c-acta-papel);
    background-image: repeating-linear-gradient(
      180deg,
      rgba(30, 34, 38, 0.05) 0 1px,
      transparent 1px 26px
    );
  }

  /* La pantalla final se centra verticalmente; el padding lo hereda del global. */
  main[data-pantalla="fin"] {
    justify-content: center;
  }

  /* En móviles muy estrechos (< 375px), menos aire arriba. */
  @media (max-width: 374px) {
    main[data-pantalla="fin"] {
      padding-top: var(--esp-3);
    }
  }

  .lluvia {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: -1;
  }

  .lluvia i {
    position: absolute;
    top: -24px;
    width: 1px;
    background: linear-gradient(
      180deg,
      rgba(226, 235, 255, 0),
      rgba(226, 235, 255, 0.55)
    );
    animation-name: gota;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
  }

  @keyframes gota {
    to {
      transform: translateY(110vh);
    }
  }

  /* Al cambiar de pantalla entra un nodo nuevo: eso dispara la animación.
     Bajo prefers-reduced-motion la duración queda neutralizada en base.css. */
  main > :global(*) {
    animation: entrar var(--dur-3) var(--ease-sal) both;
  }

  @keyframes entrar {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  /* En pantallas bajas se permite scroll en vez de recortar. */
  @media (max-height: 719px) {
    main[data-prepartida] {
      height: auto;
      min-height: calc(100vh - var(--alto-cabecera, 0px));
      min-height: calc(100svh - var(--alto-cabecera, 0px));
      flex: 1;
    }
  }

  /* --- Marco de pantalla del flujo previo a partida (017) --- */
  :global(.pantalla) {
    width: min(calc(100% - 48px), var(--ancho-marco));
    height: 100%;
    margin: 0 auto;
    padding: var(--esp-5) 0 var(--esp-4);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    font-family: var(--fuente-texto);
  }

  /* Cabecera de altura natural: su parte superior queda fija (por el padding
     superior del marco). */
  :global(.pantalla__cabecera) {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  /* El cuerpo va justo debajo de la cabecera con un gap fijo; el espacio
     sobrante queda al final. */
  :global(.pantalla__cuerpo) {
    margin-top: var(--esp-5);
  }

  :global(.pantalla__cabecera h2) {
    margin: 0;
    text-align: center;
    color: var(--c-texto-fuerte);
    font-family: var(--fuente-display);
    font-size: clamp(2rem, 6.5vw, 3rem);
    line-height: 0.9;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-shadow: 3px 3px 0 var(--c-superficie);
  }

  :global(.pantalla__cabecera p) {
    margin: var(--esp-4) 0 0;
    color: var(--c-texto-suave);
    font-size: var(--texto-lg);
    line-height: var(--interlinea-normal);
    text-align: center;
  }

  /* Lenguaje visual común de las tarjetas de opción (género, modalidad, variante). */
  :global(.tarjeta) {
    position: relative;

    color: var(--c-texto-suave);
    background: var(--c-superficie);
    border: 1px solid var(--c-borde-control);
    border-radius: var(--radio-sm);
    cursor: pointer;
    transition:
      color var(--dur-2) var(--ease-sal),
      border-color var(--dur-2) var(--ease-sal),
      background-color var(--dur-2) var(--ease-sal);
  }

  :global(.pantalla .tarjeta:hover) {
    color: var(--c-texto);
    background: var(--c-superficie-alta);
    border-color: var(--c-acento);
  }

  /* Contenido común de las tarjetas de opción (modalidad y variante). */
  :global(.tarjeta strong) {
    font-size: 1.25rem;
    color: var(--c-texto-fuerte);
  }

  :global(.tarjeta__subtitulo) {
    font-size: var(--texto-sm);
    color: var(--c-texto-suave);

    text-wrap: balance;
  }

  /* En modalidad los subtítulos son citas: van en cursiva. */
  :global(.tarjeta__subtitulo--cita) {
    font-style: italic;
  }

  /* Con icono: el texto reserva su hueco para no quedar debajo. */
  :global(.tarjeta--icono strong),
  :global(.tarjeta--icono .tarjeta__subtitulo) {
    padding-right: 2.75rem;
  }

  :global(.tarjeta__icono) {
    position: absolute;
    top: var(--esp-3);
    right: var(--esp-4);

    width: 1.25rem;
    height: 1.25rem;

    color: var(--c-texto-suave);

    pointer-events: none;
  }

  /* La guitarra es de línea fina: algo más grande para que se vea. */
  :global(.tarjeta__icono--guitarra) {
    width: 2rem;
    height: 2rem;
  }

  :global(.tarjeta__icono--caja) {
    width: 1.5rem;
    height: 1.5rem;
  }

  :global(.tarjeta__icono--bigote) {
    width: 2.25rem;
    height: 2.25rem;
  }

  :global(.tarjeta__icono--raices) {
    width: 2rem;
    height: 2rem;
  }

  :global(.tarjeta__icono--nueva-escuela) {
    width: 1.75rem;
    height: 1.75rem;
  }

  @media (max-width: 600px) {
    :global(.pantalla) {
      width: 100%;
    }
  }
</style>
