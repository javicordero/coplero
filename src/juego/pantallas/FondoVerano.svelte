<!-- Escena de playa decorativa (015 D7). Sin imágenes: bandas por gradiente en
     `main[data-momento="verano"]` y formas SVG/CSS aquí. Puramente decorativo. -->
<div class="playa" aria-hidden="true">
  <svg class="sol" viewBox="0 0 80 80">
    <g class="rayos">
      <line x1="40" y1="12" x2="40" y2="20"></line>
      <line x1="40" y1="60" x2="40" y2="68"></line>
      <line x1="12" y1="40" x2="20" y2="40"></line>
      <line x1="60" y1="40" x2="68" y2="40"></line>
      <line x1="20.2" y1="20.2" x2="25.9" y2="25.9"></line>
      <line x1="54.1" y1="54.1" x2="59.8" y2="59.8"></line>
      <line x1="54.1" y1="25.9" x2="59.8" y2="20.2"></line>
      <line x1="20.2" y1="59.8" x2="25.9" y2="54.1"></line>
    </g>
    <circle class="astro" cx="40" cy="40" r="16"></circle>
  </svg>

  <span class="nube n1"></span>
  <span class="nube n2"></span>
  <span class="nube n3"></span>

  <svg class="gaviota g1" viewBox="0 0 20 8">
    <path d="M0 6 Q5 1 10 6 M10 6 Q15 1 20 6"></path>
  </svg>
  <svg class="gaviota g2" viewBox="0 0 20 8">
    <path d="M0 6 Q5 1 10 6 M10 6 Q15 1 20 6"></path>
  </svg>
  <svg class="gaviota g3" viewBox="0 0 20 8">
    <path d="M0 6 Q5 1 10 6 M10 6 Q15 1 20 6"></path>
  </svg>

  <!-- Textura del mar: líneas de oleaje finas y dispersas. -->
  <svg class="mar" viewBox="0 0 100 40" preserveAspectRatio="none">
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M6 5 C8 3.6 10 3.6 12 5 C14 6.4 16 6.4 18 5"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M42 8 C44 6.6 46 6.6 48 8 C50 9.4 52 9.4 54 8"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M74 4 C76 2.6 78 2.6 80 4 C82 5.4 84 5.4 86 4"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M16 14 C18.5 12 21.5 12 24 14 C26.5 16 29.5 16 32 14"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M58 17 C60.5 15 63.5 15 66 17 C68.5 19 71.5 19 74 17"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M8 24 C10.5 22 13.5 22 16 24 C18.5 26 21.5 26 24 24"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M48 27 C50.5 25 53.5 25 56 27 C58.5 29 61.5 29 64 27"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M80 23 C82.5 21 85.5 21 88 23 C90.5 25 93.5 25 96 23"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M28 33 C30.5 31 33.5 31 36 33 C38.5 35 41.5 35 44 33"
    ></path>
    <path
      class="onda"
      vector-effect="non-scaling-stroke"
      d="M66 34 C68.5 32 71.5 32 74 34 C76.5 36 79.5 36 82 34"
    ></path>
  </svg>

  <!-- Orilla: arena húmeda, arena seca y espuma con borde ondulado irregular. -->
  <svg class="orilla" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path
      class="humeda"
      d="M0 38 C5 34 10 34 15 37 C20 40 24 43 30 42 C36 41 40 35 46 34 C52 33 57 38 63 40 C69 42 74 40 79 36 C84 32 89 33 94 36 C97 38 99 39 100 38 L100 100 L0 100 Z"
    ></path>
    <path
      class="arena-seca"
      d="M0 45 C5 41 10 41 15 44 C20 47 25 51 31 49 C37 47 41 41 47 40 C53 39 58 44 64 46 C70 48 75 45 80 41 C85 37 89 38 94 41 C97 43 99 44 100 43 L100 100 L0 100 Z"
    ></path>
    <path
      class="espuma"
      vector-effect="non-scaling-stroke"
      d="M0 38 C5 34 10 34 15 37 C20 40 24 43 30 42 C36 41 40 35 46 34 C52 33 57 38 63 40 C69 42 74 40 79 36 C84 32 89 33 94 36 C97 38 99 39 100 38"
    ></path>
    <path
      class="salpicadura"
      vector-effect="non-scaling-stroke"
      d="M0 33 C5 29 10 29 15 32 C20 35 24 38 30 37 C36 36 40 30 46 29 C52 28 57 33 63 35 C69 37 74 35 79 31 C84 27 89 28 94 31 C97 33 99 34 100 33"
    ></path>
  </svg>

  <!-- Arena: moteado y conchas. -->
  <span class="arena"></span>

  <svg class="concha c1" viewBox="0 0 16 16">
    <path
      class="cuerpo"
      d="M8 15 C2 12.5 1 7 1 3.5 C4 6 6 5.5 8 2.5 C10 5.5 12 6 15 3.5 C15 7 14 12.5 8 15 Z"
    ></path>
    <path class="nervio" d="M8 3 L8 14 M5 4.5 L6.5 13.5 M11 4.5 L9.5 13.5"></path>
  </svg>

  <svg class="concha tono-coral c2" viewBox="0 0 16 16">
    <path
      class="cuerpo"
      d="M8 15 C1.5 13 1 8 1.5 4.5 C4.5 7 6.5 6.5 8 3.5 C9.5 6.5 11.5 7 14.5 4.5 C15 8 14.5 13 8 15 Z"
    ></path>
    <path class="nervio" d="M8 4 L8 14 M4.5 5.5 L6.5 13 M11.5 5.5 L9.5 13"></path>
  </svg>

  <svg class="concha tono-amarillo c3" viewBox="0 0 16 16">
    <path
      class="cuerpo"
      d="M8 15 C2 12.5 1 7 1 3.5 C4 6 6 5.5 8 2.5 C10 5.5 12 6 15 3.5 C15 7 14 12.5 8 15 Z"
    ></path>
    <path class="nervio" d="M8 3 L8 14 M5 4.5 L6.5 13.5 M11 4.5 L9.5 13.5"></path>
  </svg>

  <svg class="concha tono-lila caracol c4" viewBox="0 0 16 18">
    <circle class="cuerpo" cx="8" cy="10" r="6.5"></circle>
    <path class="giro" d="M8 6.5 a3.5 3.5 0 0 1 0 7 a2.8 2.8 0 0 1 0 -5.6 a2 2 0 0 1 0 4"></path>
  </svg>

  <svg class="concha tono-rosa caracol c5" viewBox="0 0 16 18">
    <circle class="cuerpo" cx="8" cy="10" r="6.5"></circle>
    <path class="giro" d="M8 6.5 a3.5 3.5 0 0 1 0 7 a2.8 2.8 0 0 1 0 -5.6 a2 2 0 0 1 0 4"></path>
  </svg>

  <svg class="concha tono-rosa c6" viewBox="0 0 16 16">
    <path
      class="cuerpo"
      d="M8 15 C1.5 13 1 8 1.5 4.5 C4.5 7 6.5 6.5 8 3.5 C9.5 6.5 11.5 7 14.5 4.5 C15 8 14.5 13 8 15 Z"
    ></path>
    <path class="nervio" d="M8 4 L8 14 M4.5 5.5 L6.5 13 M11.5 5.5 L9.5 13"></path>
  </svg>

  <!-- Sombrilla de playa. -->
  <svg class="sombrilla sm1" viewBox="0 0 76 96">
    <defs>
      <clipPath id="fv-cupula">
        <path
          d="M4 30 Q4 4 38 4 Q72 4 72 30 Q66 34 60 30 Q54 34 48 30 Q42 34 36 30 Q30 34 24 30 Q18 34 12 30 Q6 34 4 30 Z"
        ></path>
      </clipPath>
    </defs>
    <g clip-path="url(#fv-cupula)">
      <rect class="tela" x="2" y="2" width="72" height="32"></rect>
      <path class="g-rojo" d="M38 4 L4 30 L12 30 Z"></path>
      <path class="g-naranja" d="M38 4 L12 30 L20 30 Z"></path>
      <path class="g-amarillo" d="M38 4 L20 30 L28 30 Z"></path>
      <path class="g-verde" d="M38 4 L28 30 L36 30 Z"></path>
      <path class="g-turquesa" d="M38 4 L36 30 L44 30 Z"></path>
      <path class="g-azul" d="M38 4 L44 30 L52 30 Z"></path>
      <path class="g-rosa" d="M38 4 L52 30 L60 30 Z"></path>
      <path class="g-rojo" d="M38 4 L60 30 L72 30 Z"></path>
      <g class="costuras">
        <path d="M38 11 L12 30"></path>
        <path d="M38 11 L20 30"></path>
        <path d="M38 11 L28 30"></path>
        <path d="M38 11 L36 30"></path>
        <path d="M38 11 L44 30"></path>
        <path d="M38 11 L52 30"></path>
        <path d="M38 11 L60 30"></path>
      </g>
    </g>
    <circle class="hub" cx="38" cy="10" r="7"></circle>
    <circle class="hub-anillo" cx="38" cy="10" r="4.5"></circle>
    <circle class="hub-centro" cx="38" cy="10" r="2"></circle>
    <circle class="palo" cx="38" cy="5" r="2"></circle>
    <rect class="palo" x="36.5" y="28" width="3" height="66" rx="1.5"></rect>
  </svg>
</div>

<style>
  .playa {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: -1;
  }

  /* Sol: círculo central con rayos, en la esquina superior derecha. */
  .sol {
    position: absolute;
    top: calc(9% - 40px);
    left: calc(82% - 40px);
    width: 80px;
    height: 80px;
  }

  .sol .rayos line {
    stroke: var(--c-acento);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .sol .astro {
    fill: var(--c-verano-sol);
    stroke: var(--c-acento);
    stroke-width: 1.5;
  }

  /* Nubes: bloques suaves con dos bultos, anclados por porcentaje para que la
     escena se adapte a cualquier alto sin deformarse. */
  .nube {
    position: absolute;
    background: var(--c-verano-nube);
    border-radius: var(--radio-pill);
    opacity: 0.9;
  }

  .nube::before,
  .nube::after {
    content: "";
    position: absolute;
    background: inherit;
    border-radius: 50%;
  }

  .n1 {
    top: 13%;
    left: 5%;
    width: 104px;
    height: 24px;
  }
  .n1::before {
    top: -20px;
    left: 12px;
    width: 44px;
    height: 44px;
  }
  .n1::after {
    top: -14px;
    left: 50px;
    width: 32px;
    height: 32px;
  }

  .n2 {
    top: 9%;
    left: 58%;
    width: 84px;
    height: 20px;
  }
  .n2::before {
    top: -16px;
    left: 10px;
    width: 36px;
    height: 36px;
  }
  .n2::after {
    top: -11px;
    left: 42px;
    width: 26px;
    height: 26px;
  }

  .n3 {
    top: 22%;
    left: 78%;
    width: 72px;
    height: 18px;
  }
  .n3::before {
    top: -14px;
    left: 8px;
    width: 30px;
    height: 30px;
  }
  .n3::after {
    top: -10px;
    left: 38px;
    width: 22px;
    height: 22px;
  }

  /* Gaviotas: trazos finos blancos sobre el cielo. */
  .gaviota {
    position: absolute;
    width: 18px;
    height: 7px;
  }

  .gaviota path {
    fill: none;
    stroke: var(--c-verano-nube);
    stroke-width: 1.6;
    stroke-linecap: round;
  }

  .g1 {
    top: 16%;
    left: 60%;
  }
  .g2 {
    top: 12.5%;
    left: 69%;
  }
  .g3 {
    top: 18%;
    left: 75%;
  }

  /* Oleaje del mar. */
  .mar {
    position: absolute;
    top: 55%;
    left: 0;
    width: 100%;
    height: 25%;
  }

  .onda {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: 1.2;
    stroke-linecap: round;
    opacity: 0.4;
  }

  /* Orilla: arena húmeda, arena seca y espuma con borde ondulado. */
  .orilla {
    position: absolute;
    top: 74%;
    left: 0;
    width: 100%;
    height: 26%;
  }

  .orilla .humeda {
    fill: var(--c-verano-arena-humeda);
  }

  .orilla .arena-seca {
    fill: var(--c-verano-arena);
  }

  .orilla .espuma {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: 9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .orilla .salpicadura {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0.5;
  }

  /* Textura de arena: moteado sutil y rizos. */
  .arena {
    position: absolute;
    top: 86%;
    left: 0;
    width: 100%;
    height: 14%;
    background-image:
      radial-gradient(
        circle,
        var(--c-verano-arena-sombra) 0 1px,
        transparent 1.6px
      ),
      radial-gradient(
        circle,
        var(--c-verano-arena-sombra) 0 1px,
        transparent 1.6px
      );
    background-size:
      17px 15px,
      23px 21px;
    background-position:
      0 0,
      7px 9px;
    opacity: 0.45;
  }

  /* Conchas sobre la arena. */
  .concha {
    position: absolute;
    width: 16px;
    height: 16px;
  }

  .concha .cuerpo {
    fill: var(--c-verano-concha);
    stroke: var(--c-verano-arena-humeda);
    stroke-width: 0.8;
    stroke-linejoin: round;
  }

  .concha .nervio {
    fill: none;
    stroke: var(--c-verano-arena-humeda);
    stroke-width: 0.6;
  }

  .concha .giro {
    fill: none;
    stroke: var(--c-verano-concha);
    stroke-width: 1;
    stroke-linecap: round;
  }

  .tono-coral .cuerpo {
    fill: var(--c-verano-coral);
  }
  .tono-lila .cuerpo {
    fill: var(--c-verano-lila);
  }
  .tono-amarillo .cuerpo {
    fill: var(--c-verano-amarillo);
  }
  .tono-rosa .cuerpo {
    fill: var(--c-verano-rosa);
  }

  .caracol {
    height: 18px;
  }

  .c1 {
    top: 90%;
    left: 26%;
    transform: rotate(-12deg);
  }
  .c2 {
    top: 93%;
    left: 52%;
    transform: rotate(9deg) scale(1.1);
  }
  .c3 {
    top: 96%;
    left: 36%;
    transform: rotate(-18deg) scale(0.9);
  }
  .c4 {
    top: 88%;
    left: 62%;
    transform: rotate(8deg);
  }
  .c5 {
    top: 95%;
    left: 71%;
    transform: rotate(-10deg) scale(0.85);
  }
  .c6 {
    top: 91%;
    left: 83%;
    transform: rotate(14deg) scale(0.95);
  }

  /* Sombrilla. */
  .sombrilla {
    position: absolute;
    width: 76px;
    height: 96px;
  }

  .tela {
    fill: var(--c-verano-nube);
  }

  /* Gajos de la sombrilla. */
  .g-rojo {
    fill: var(--c-verano-rojo);
  }
  .g-naranja {
    fill: var(--c-verano-naranja);
  }
  .g-amarillo {
    fill: var(--c-verano-amarillo);
  }
  .g-verde {
    fill: var(--c-verano-verde);
  }
  .g-turquesa {
    fill: var(--c-verano-turquesa);
  }
  .g-azul {
    fill: var(--c-verano-azul);
  }
  .g-rosa {
    fill: var(--c-verano-rosa);
  }

  .costuras path {
    fill: none;
    stroke: var(--c-verano-nube);
    stroke-width: 1.2;
    stroke-linecap: round;
  }

  .hub {
    fill: var(--c-verano-nube);
  }

  .hub-anillo {
    fill: none;
    stroke: var(--c-verano-turquesa);
    stroke-width: 1.4;
  }

  .hub-centro {
    fill: var(--c-verano-rosa);
  }

  .palo {
    fill: var(--c-verano-metal);
  }

  .sm1 {
    top: 84%;
    left: 8%;
  }

  .si1 {
    top: 88%;
    left: 60%;
  }
</style>
