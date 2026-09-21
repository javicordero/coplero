<script lang="ts">
import type { TarjetaFinal } from "../../engine/index"
import {
  compartirNativo,
  copiarTexto,
  descargarImagen,
  textoCompartir,
  urlResultado,
} from "../../utilities/compartir"
import { DIRECCION_JUEGO } from "../presentacion"
import Tarjeta from "../Tarjeta.svelte"

let {
  tarjeta,
  codigo,
  nombreOculto,
  onAlternarNombre,
  onReiniciar,
}: {
  tarjeta: TarjetaFinal
  codigo: string | null
  nombreOculto: boolean
  onAlternarNombre: () => void
  onReiniciar: () => void
} = $props()

let avisoAccion = $state<string | null>(null)

function origen(): string {
  return typeof window !== "undefined"
    ? window.location.origin
    : `https://${DIRECCION_JUEGO}`
}

let enlace = $derived(codigo ? urlResultado(codigo, origen()) : "")

async function alCompartir() {
  if (!codigo) return
  const ok = await compartirNativo({
    title: "Coplero",
    text: textoCompartir(tarjeta, enlace),
    url: enlace,
  })
  avisoAccion = ok
    ? null
    : "Tu navegador no permite compartir directamente; copia el enlace."
}

async function alCopiar() {
  if (!codigo) return
  const ok = await copiarTexto(textoCompartir(tarjeta, enlace))
  avisoAccion = ok ? "Texto copiado." : "No se pudo copiar."
}

async function alDescargar(formato: "9x16" | "1x1") {
  if (!codigo) return
  const ok = await descargarImagen(
    `${origen()}/api/og/${codigo}.png?t=${formato}`,
    `coplero-${formato}.png`,
  )
  avisoAccion = ok ? "Imagen descargada." : "No se pudo descargar la imagen."
}

async function alCopiarEnlace() {
  const ok = await copiarTexto(enlace)
  avisoAccion = ok ? "Enlace copiado." : "No se pudo copiar."
}
</script>

<section class="fin" data-testid="fin">
  <h2 class="titulo">Carrera finalizada</h2>
  <Tarjeta {tarjeta} />

  <div class="privacidad">
    <button
      type="button"
      class="toggle"
      aria-pressed={nombreOculto}
      onclick={onAlternarNombre}
      data-testid="toggle-nombre"
    >
      {nombreOculto ? "Mostrar nombre" : "Ocultar nombre"}
    </button>
  </div>

  <div class="acciones" role="group" aria-label="Compartir la tarjeta">
    <button
      type="button"
      class="primario"
      onclick={alCompartir}
      data-testid="compartir"
    >
      Compartir
    </button>
    <button type="button" onclick={alCopiar} data-testid="copiar-texto">
      Copiar texto
    </button>
    <button
      type="button"
      onclick={() => alDescargar("9x16")}
      data-testid="descargar-9x16"
    >
      Imagen 9:16
    </button>
    <button
      type="button"
      onclick={() => alDescargar("1x1")}
      data-testid="descargar-1x1"
    >
      Imagen 1:1
    </button>
    <button type="button" onclick={alCopiarEnlace} data-testid="copiar-enlace">
      Copiar enlace
    </button>
  </div>

  <p class="aviso" aria-live="polite" data-testid="aviso-accion">
    {avisoAccion ?? ""}
  </p>

  <button
    type="button"
    class="reiniciar"
    onclick={onReiniciar}
    data-testid="reiniciar"
  >
    Empezar de nuevo
  </button>
</section>

<style>
  .fin {
    display: flex;
    flex-direction: column;
    gap: var(--esp-4);
  }

  .titulo {
    font-family: var(--fuente-texto);
    font-size: var(--texto-base);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--c-texto-suave);
    text-align: center;
  }

  .privacidad {
    display: flex;
    justify-content: center;
  }

  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: var(--esp-2);
    justify-content: center;
  }

  .toggle {
    background: transparent;
  }

  .aviso {
    min-height: 1.2rem;
    text-align: center;
    color: var(--c-texto-suave);
    font-size: var(--texto-sm);
  }

  .reiniciar {
    margin-top: var(--esp-2);
  }
</style>
