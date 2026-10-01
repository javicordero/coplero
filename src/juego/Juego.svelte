<script lang="ts">
import { variantesDe } from "../content/index"
import { crearJuego } from "./estado.svelte"
import { almacenNavegador } from "./persistencia"
import {
  type Indicador,
  mensajeError,
  MODALIDADES_INFO,
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
import Intro from "./pantallas/Intro.svelte"
import Resultado from "./pantallas/Resultado.svelte"

const juego = crearJuego(almacenNavegador())

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

function empezarDeCero() {
  juego.reiniciar()
  juego.empezar()
}

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
})
</script>

<main
  data-testid="juego"
  data-pantalla={juego.pantalla}
  data-momento={juego.partida?.momento ?? ""}
  data-ano={juego.partida?.anoActual ?? ""}
>
  {#if juego.partida?.momento === "febrero" && juego.pantalla !== "resultado"}
    <FondoFebrero />
    <span class="lluvia" aria-hidden="true">
      {#each GOTAS as gota, i (i)}
        <i
          style="left:{gota.left};height:{gota.alto};animation-delay:{gota.retraso};animation-duration:{gota.duracion}"
        ></i>
      {/each}
    </span>
  {/if}
  {#if juego.partida?.momento === "verano" && juego.pantalla !== "resultado"}
    <FondoVerano />
  {/if}
  {#if indicadorActual}
    <IndicadorContexto indicador={indicadorActual} />
  {/if}
  {#if juego.pantalla === "intro"}
    <Intro
      estadoGuardado={juego.estadoGuardado}
      aviso={juego.aviso}
      onEmpezar={empezarDeCero}
      onContinuar={juego.continuarPartida}
      onVerResultado={juego.continuarPartida}
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
    min-height: calc(100dvh - var(--alto-cabecera, 0px));
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--c-texto);
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
</style>
