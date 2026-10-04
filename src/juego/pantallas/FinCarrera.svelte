<script lang="ts">
import type { TarjetaFinal } from "../../engine/index"
import {
  compartirNativo,
  descargarImagen,
  textoCompartir,
  urlResultado,
} from "../../utilities/compartir"
import { DONACION } from "../../sitio/contenido"
import { DIRECCION_JUEGO, urlImagenOg } from "../presentacion"
import Tarjeta from "../Tarjeta.svelte"

let {
  tarjeta,
  codigo,
  onReiniciar,
}: {
  tarjeta: TarjetaFinal
  codigo: string | null
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

async function alDescargar() {
  if (!codigo) return
  const ok = await descargarImagen(
    urlImagenOg(origen(), codigo, "9x16"),
    "coplero-9x16.png",
  )
  avisoAccion = ok ? "Imagen descargada." : "No se pudo descargar la imagen."
}
</script>

<section class="fin" data-testid="fin" data-codigo={codigo ?? ""}>
  <p class="antetitulo">Carrera finalizada</p>
  <Tarjeta {tarjeta} />

  <div class="pie">
    <div class="acciones" role="group" aria-label="Compartir la tarjeta">
      <button
        type="button"
        class="primario"
        onclick={alCompartir}
        data-testid="compartir"
      >
        Compartir
      </button>
      <button type="button" onclick={alDescargar} data-testid="descargar-9x16">
        Descargar imagen
      </button>
    </div>

    <button
      type="button"
      class="reiniciar"
      onclick={onReiniciar}
      data-testid="reiniciar"
    >
      Jugar de nuevo
    </button>
  </div>

  <div class="apoyo">
    <p class="apoyo__nota">¿Te ha gustado?</p>
    <a
      class="boton-donacion"
      href={DONACION.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        class="boton-donacion__icono"
        src="/iconos/buy-me-a-coffee.svg"
        alt=""
        width="20"
        height="28"
      />
      <span>{DONACION.etiqueta}</span>
    </a>
    <a class="apoyo__enlace" href="/colaborar">
      <span>Sugerir una situación</span>
      <img
        class="apoyo__icono"
        src="/iconos/tip.svg"
        alt=""
        width="20"
        height="20"
      />
    </a>
  </div>

  <p class="aviso" aria-live="polite" data-testid="aviso-accion">
    {avisoAccion ?? ""}
  </p>
</section>

<style>
  .fin {
    display: flex;
    flex-direction: column;
    gap: var(--esp-2);
  }

  /* Antetítulo fuera de la tarjeta: subtítulo atenuado, no titular. */
  .antetitulo {
    margin: 0 0 calc(-1 * var(--esp-1));

    text-align: center;
    color: var(--c-texto-suave);

    font-size: var(--texto-sm);
    text-transform: uppercase;
    letter-spacing: 0.16em;
  }

  .pie {
    display: flex;
    flex-direction: column;
    gap: var(--esp-2);
  }

  .acciones {
    display: flex;
    gap: var(--esp-2);
  }

  .acciones button {
    flex: 1 1 0;
    min-width: 0;
    border-radius: var(--radio-pill);
  }

  /* Compartir: fondo de "Descargar" con el texto en acento. */
  .acciones .primario {
    background: var(--c-superficie);
    border-color: var(--c-acento);
    color: var(--c-acento);
  }

  .acciones .primario:hover:not(:disabled) {
    background: var(--c-superficie-alta);
    border-color: var(--c-acento);
  }

  /* Jugar de nuevo: como el CTA de inicio (fondo acento, texto oscuro). */
  .reiniciar {
    background: var(--c-acento);
    border-color: var(--c-acento);
    color: var(--c-sobre-acento);
    border-radius: var(--radio-pill);
    text-transform: uppercase;
  }

  .reiniciar:hover:not(:disabled) {
    background: var(--c-acento-fuerte);
    border-color: var(--c-acento-fuerte);
  }

  .aviso {
    min-height: 1.2rem;
    text-align: center;
    color: var(--c-texto-suave);
    font-size: var(--texto-sm);
  }

  .apoyo {
    display: flex;
    flex-direction: column;
    gap: var(--esp-2);
    margin-top: 0;
  }

  .apoyo__nota {
    margin: 0;
    text-align: center;
    color: var(--c-texto-suave);
    font-size: var(--texto-sm);
    letter-spacing: 0.04em;
  }

  .apoyo__enlace {
    display: inline-flex;
    align-items: center;
    align-self: flex-end;
    gap: var(--esp-2);
    min-height: 44px;
    margin-top: calc(-1 * var(--esp-1));
    color: var(--c-acento);
    font-size: var(--texto-sm);
    font-weight: var(--peso-fuerte);
    text-decoration: none;
  }

  .apoyo__enlace:hover {
    color: var(--c-acento-fuerte);
    text-decoration: underline;
  }

  .apoyo__icono {
    display: block;
    flex: 0 0 auto;
    width: auto;
    height: 18px;
  }

  /* Móviles muy estrechos (< 375px): botones algo más compactos. */
  @media (max-width: 374px) {
    .fin button {
      padding: var(--esp-2) var(--esp-3);
      text-wrap: nowrap;
    }
  }
</style>
