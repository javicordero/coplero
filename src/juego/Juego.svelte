<script lang="ts">
import { variantesDe } from "../content/index"
import { crearJuego } from "./estado.svelte"
import { almacenNavegador } from "./persistencia"
import {
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
import Intro from "./pantallas/Intro.svelte"
import Resultado from "./pantallas/Resultado.svelte"

const juego = crearJuego(almacenNavegador())

let indicadorDecision = $derived.by(() => {
  if (!juego.partida || juego.paso?.tipo !== "decision") return null
  return {
    ano: juego.partida.anoActual,
    momento: juego.paso.momento,
    tipo: juego.paso.situacion.tipo,
  }
})

function empezarDeCero() {
  juego.reiniciar()
  juego.empezar()
}

// La marca de la cabecera refleja el sexo del personaje (FR-006):
// al montar con partida guardada y cada vez que cambia.
$effect(() => {
  const genero = juego.personaje?.genero ?? juego.partida?.personaje.genero
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
  {#if juego.pantalla === "intro"}
    <Intro
      estadoGuardado={juego.estadoGuardado}
      aviso={juego.aviso}
      onEmpezar={empezarDeCero}
      onContinuar={juego.continuarPartida}
      onVerResultado={juego.continuarPartida}
    />
  {:else if juego.pantalla === "crear-personaje"}
    <CrearPersonaje onCrear={juego.crearPersonaje} />
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
  {:else if juego.pantalla === "decision" && juego.paso?.tipo === "decision" && indicadorDecision}
    <Decision
      indicador={indicadorDecision}
      situacion={juego.paso.situacion}
      onElegir={juego.elegirOpcion}
    />
  {:else if juego.pantalla === "resultado" && juego.paso?.tipo === "resultado" && juego.partida}
    <Resultado
      indicador={{ ano: juego.partida.anoActual, momento: "febrero" }}
      temporada={juego.paso.temporada}
      onContinuar={juego.continuar}
    />
  {:else if juego.pantalla === "fin" && juego.tarjeta}
    <FinCarrera
      tarjeta={juego.tarjeta}
      codigo={juego.codigo()}
      nombreOculto={juego.nombreOculto}
      onAlternarNombre={juego.alternarNombre}
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
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 2rem 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
