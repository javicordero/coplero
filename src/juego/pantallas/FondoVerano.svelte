<!-- Escena de playa decorativa. Solo SVG/CSS, sin imágenes externas.
     Sol, cielo, mar y arena conservan posición y proporciones originales.
     Los colores nuevos tienen valor por defecto, así que no hace falta
     definir variables adicionales (puedes sobrescribirlas si quieres):
       --c-verano-madera, --c-verano-lona-a, --c-verano-lona-b -->

<div class="playa" aria-hidden="true">

  <!-- Símbolo reutilizable: tumbona de playa -->
  <svg width="0" height="0" style="position:absolute">
    <defs>
      <clipPath id="silla-respaldo">
        <path d="M14 7 L46 7 L50 38 L10 38Z"/>
      </clipPath>
      <clipPath id="silla-asiento">
        <path d="M10 38 L50 38 L55 51 L5 51Z"/>
      </clipPath>

      <symbol id="silla" viewBox="0 0 60 72">
        <!-- Sombra en la arena -->
        <ellipse class="silla-sombra" cx="30" cy="68" rx="26" ry="3"/>

        <!-- Patas traseras -->
        <path class="madera" d="M14 38 L19 66 M46 38 L41 66"/>

        <!-- Respaldo de lona rayada -->
        <g clip-path="url(#silla-respaldo)">
          <rect class="lona-a" x="8" y="6" width="44" height="34"/>
          <rect class="lona-b" x="15" y="6" width="6" height="34"/>
          <rect class="lona-b" x="27" y="6" width="6" height="34"/>
          <rect class="lona-b" x="39" y="6" width="6" height="34"/>
          <path class="lona-sombra" d="M8 28 Q30 22 52 28 L52 40 L8 40Z"/>
        </g>

        <!-- Asiento -->
        <g clip-path="url(#silla-asiento)">
          <rect class="lona-b" x="4" y="37" width="52" height="15"/>
          <rect class="lona-a" x="11" y="37" width="6" height="15"/>
          <rect class="lona-a" x="23" y="37" width="6" height="15"/>
          <rect class="lona-a" x="35" y="37" width="6" height="15"/>
          <rect class="lona-a" x="47" y="37" width="6" height="15"/>
        </g>

        <!-- Marco de madera -->
        <path class="madera" d="M13 5 L10 40 M47 5 L50 40"/>
        <rect class="madera-barra" x="11" y="3" width="38" height="5" rx="2.5"/>
        <path class="madera" d="M8 30 L8 50 M52 30 L52 50"/>
        <rect class="madera-barra" x="5" y="29" width="7" height="3.4" rx="1.7"/>
        <rect class="madera-barra" x="48" y="29" width="7" height="3.4" rx="1.7"/>

        <!-- Patas delanteras -->
        <path class="madera" d="M7 50 L5 67 M53 50 L55 67"/>
      </symbol>
    </defs>
  </svg>


  <!-- SOL (posición y tamaño originales) -->
  <svg class="sol" viewBox="0 0 80 80">
    <defs>
      <radialGradient id="sol-halo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--c-verano-sol)" stop-opacity=".34"/>
        <stop offset="60%" stop-color="var(--c-verano-sol)" stop-opacity=".12"/>
        <stop offset="100%" stop-color="var(--c-verano-sol)" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="sol-core" cx="32%" cy="27%" r="75%">
        <stop offset="0%" stop-color="var(--c-verano-espuma)"/>
        <stop offset="30%" stop-color="var(--c-verano-sol)"/>
        <stop offset="80%" stop-color="var(--c-verano-sol)"/>
        <stop offset="100%" stop-color="var(--c-acento)"/>
      </radialGradient>
    </defs>

    <circle class="halo" cx="40" cy="40" r="34" fill="url(#sol-halo)"/>

    <g class="rayos">
      <line x1="40" y1="5" x2="40" y2="13"/>
      <line x1="40" y1="67" x2="40" y2="75"/>
      <line x1="5" y1="40" x2="13" y2="40"/>
      <line x1="67" y1="40" x2="75" y2="40"/>
      <line x1="15.3" y1="15.3" x2="21" y2="21"/>
      <line x1="59" y1="59" x2="64.7" y2="64.7"/>
      <line x1="64.7" y1="15.3" x2="59" y2="21"/>
      <line x1="21" y1="59" x2="15.3" y2="64.7"/>
    </g>

    <circle class="astro" cx="40" cy="40" r="16" fill="url(#sol-core)"/>
  </svg>


  <!-- NUBES -->
  <svg class="nube-svg n1" viewBox="0 0 180 70">
    <path d="M16 51 C16 40 24 32 35 31 C38 19 48 11 61 10 C76 9 87 18 91 31 C96 27 103 25 110 25 C124 25 135 35 135 49 C135 53 134 56 132 59 L23 59 C19 59 16 56 16 51Z"/>
    <path class="nube-sombra" d="M24 59 C30 53 60 52 90 55 C110 54 128 54 133 58 L23 59Z"/>
  </svg>

  <svg class="nube-svg n2" viewBox="0 0 150 60">
    <path d="M14 44 C14 35 21 28 31 27 C35 16 44 9 55 8 C68 7 78 16 81 27 C85 23 91 21 97 21 C110 21 120 31 120 43 C120 48 118 51 116 54 L20 54 C16 54 14 50 14 44Z"/>
    <path class="nube-sombra" d="M20 54 C30 48 60 47 85 50 C100 49 113 50 117 53 L20 54Z"/>
  </svg>

  <svg class="nube-svg n3" viewBox="0 0 130 55">
    <path d="M12 42 C12 34 18 28 27 27 C29 18 37 12 46 12 C57 12 65 19 68 29 C72 26 77 25 82 25 C93 25 101 33 101 43 C101 46 100 49 99 51 L18 51 C14 51 12 48 12 42Z"/>
    <path class="nube-sombra" d="M18 51 C26 46 52 45 72 48 C86 47 97 48 100 50 L18 51Z"/>
  </svg>


  <!-- GAVIOTAS -->
  <svg class="gaviota g1" viewBox="0 0 24 10"><path d="M1 7 Q6 1 12 6 Q18 1 23 7"/></svg>
  <svg class="gaviota g2" viewBox="0 0 20 8"><path d="M1 6 Q5 1 10 5.5 Q15 1 19 6"/></svg>
  <svg class="gaviota g3" viewBox="0 0 17 7"><path d="M1 5 Q4.5 1 8.5 4.5 Q12.5 1 16 5"/></svg>


  <!-- HORIZONTE -->
  <svg class="horizonte" viewBox="0 0 100 30" preserveAspectRatio="none">
    <defs>
      <linearGradient id="horizonte-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--c-verano-turquesa)" stop-opacity=".16"/>
        <stop offset="100%" stop-color="var(--c-verano-turquesa)" stop-opacity=".04"/>
      </linearGradient>
    </defs>
    <path class="horizonte-lejano" fill="url(#horizonte-grad)"
      d="M0 17 C8 15 15 16 23 17 C32 18 39 15 48 16 C57 17 64 18 73 16 C83 14 91 17 100 15 L100 30 L0 30Z"/>
    <path class="horizonte-linea"
      d="M0 17 C8 15 15 16 23 17 C32 18 39 15 48 16 C57 17 64 18 73 16 C83 14 91 17 100 15"/>
  </svg>


  <!-- MAR -->
  <svg class="mar" viewBox="0 0 100 40" preserveAspectRatio="none">
    <defs>
      <linearGradient id="mar-tinte" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--c-verano-turquesa)" stop-opacity=".12"/>
        <stop offset="100%" stop-color="var(--c-verano-turquesa)" stop-opacity=".02"/>
      </linearGradient>
    </defs>
    <rect width="100" height="40" fill="url(#mar-tinte)"/>

    <!-- Brillos del sol sobre el agua -->
    <g class="brillos">
      <path vector-effect="non-scaling-stroke" d="M78 3 L84 3"/>
      <path vector-effect="non-scaling-stroke" d="M74 9 L82 9"/>
      <path vector-effect="non-scaling-stroke" d="M80 15 L87 15"/>
      <path vector-effect="non-scaling-stroke" d="M71 21 L80 21"/>
      <path vector-effect="non-scaling-stroke" d="M77 28 L85 28"/>
    </g>

    <path class="onda onda-lejana" vector-effect="non-scaling-stroke" d="M2 5 C5 3 8 3 11 5 C14 7 17 7 20 5 C23 3 26 3 29 5"/>
    <path class="onda onda-lejana" vector-effect="non-scaling-stroke" d="M39 8 C42 6 45 6 48 8 C51 10 54 10 57 8"/>
    <path class="onda onda-lejana" vector-effect="non-scaling-stroke" d="M72 4 C75 2 78 2 81 4 C84 6 87 6 90 4"/>

    <path class="onda onda-media" vector-effect="non-scaling-stroke" d="M8 14 C11 11.5 15 11.5 18 14 C21 16.5 25 16.5 28 14 C31 11.5 35 11.5 38 14"/>
    <path class="onda onda-media" vector-effect="non-scaling-stroke" d="M54 17 C57 14.5 61 14.5 64 17 C67 19.5 71 19.5 74 17 C77 14.5 81 14.5 84 17"/>

    <path class="onda onda-cercana" vector-effect="non-scaling-stroke" d="M5 24 C9 21 13 21 17 24 C21 27 25 27 29 24 C33 21 37 21 41 24"/>
    <path class="onda onda-cercana" vector-effect="non-scaling-stroke" d="M47 27 C51 24 55 24 59 27 C63 30 67 30 71 27 C75 24 79 24 83 27"/>
    <path class="onda onda-cercana" vector-effect="non-scaling-stroke" d="M79 23 C82 21 86 21 89 23 C92 25 95 25 98 23"/>

    <path class="onda onda-extra" vector-effect="non-scaling-stroke" d="M27 33 C30 31 33 31 36 33"/>
    <path class="onda onda-extra" vector-effect="non-scaling-stroke" d="M63 35 C66 33 69 33 72 35"/>

    <!-- Detalles nuevos: pequeñas ondas, espuma y reflejos más naturales -->
    <g class="ondas-micro">
      <path d="M14 11 C17 9.8 20 9.8 23 11"/>
      <path d="M31 19 C34 17.8 37 17.8 40 19"/>
      <path d="M86 12 C89 10.8 92 10.8 95 12"/>
      <path d="M12 31 C15 29.8 18 29.8 21 31"/>
      <path d="M35 36 C38 34.8 41 34.8 44 36"/>
      <path d="M87 32 C90 30.8 93 30.8 96 32"/>
    </g>

    <g class="reflejo-agua">
      <path d="M63 7 L67 7"/>
      <path d="M66 11 L72 11"/>
      <path d="M62 16 L69 16"/>
      <path d="M68 22 L76 22"/>
      <path d="M64 27 L70 27"/>
    </g>

    <g class="espuma-mar">
      <path d="M18 25 C21 23.8 24 23.8 27 25"/>
      <path d="M57 12 C59.5 11 62 11 64.5 12"/>
      <path d="M40 29 C43 27.8 46 27.8 49 29"/>
    </g>
  </svg>


  <!-- Pocos elementos flotando en el agua -->
  <!-- Flotador principal: pequeño, reconocible y lejos de la orilla -->
  <svg class="objeto-agua flotador" viewBox="0 0 44 30" aria-hidden="true">
    <ellipse class="flotador-sombra" cx="22" cy="23" rx="14" ry="2.4"/>
    <ellipse class="flotador-anillo" cx="22" cy="14" rx="12" ry="8.5"/>
    <ellipse class="flotador-hueco" cx="22" cy="14" rx="5.2" ry="3.3"/>
    <path class="flotador-franja" d="M13 8.2 Q18 5.2 22 5.5 Q27 5.8 31 8.7 L28.5 11 Q25 8.8 22 8.5 Q18.5 8.3 15.5 10.5Z"/>
    <path class="flotador-brillo" d="M15 18 Q19 20.5 24 20.2"/>
  </svg>

  <!-- Pequeño inflable lejano -->
  <svg class="objeto-agua inflable-lejano" viewBox="0 0 30 22" aria-hidden="true">
    <ellipse class="flotador-sombra" cx="15" cy="17" rx="9" ry="1.6"/>
    <ellipse class="mini-anillo" cx="15" cy="10" rx="7.5" ry="5"/>
    <ellipse class="mini-hueco" cx="15" cy="10" rx="3" ry="1.8"/>
  </svg>

  <!-- ORILLA -->
  <svg class="orilla" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="arena-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--c-verano-arena)"/>
        <stop offset="100%" stop-color="var(--c-verano-arena-sombra)" stop-opacity=".55"/>
      </linearGradient>
    </defs>

    <path class="humeda"
      d="M0 38 C5 34 10 34 15 37 C20 40 24 43 30 42 C36 41 40 35 46 34 C52 33 57 38 63 40 C69 42 74 40 79 36 C84 32 89 33 94 36 C97 38 99 39 100 38 L100 100 L0 100Z"/>
    <path class="arena-seca" fill="url(#arena-grad)"
      d="M0 46 C5 42 10 42 15 45 C20 48 25 51 31 50 C37 48 41 42 47 41 C53 40 58 45 64 47 C70 49 75 46 80 42 C85 38 89 39 94 42 C97 44 99 45 100 44 L100 100 L0 100Z"/>

    <path class="espuma" vector-effect="non-scaling-stroke"
      d="M0 38 C5 34 10 34 15 37 C20 40 24 43 30 42 C36 41 40 35 46 34 C52 33 57 38 63 40 C69 42 74 40 79 36 C84 32 89 33 94 36 C97 38 99 39 100 38"/>
    <path class="espuma-fina" vector-effect="non-scaling-stroke"
      d="M3 42 C8 39 12 39 17 42 M24 45 C29 43 33 42 38 40 M50 39 C55 38 59 41 64 43 M72 43 C77 40 82 37 87 38 M92 40 C95 40 98 40 100 40"/>
    <path class="salpicadura" vector-effect="non-scaling-stroke"
      d="M5 34 C8 32 11 32 14 34 M37 34 C40 31 43 31 46 33 M65 36 C68 33 71 33 74 34 M86 33 C89 30 92 31 95 33"/>
  </svg>


  <!-- TEXTURA DE ARENA -->
  <svg class="arena-svg" viewBox="0 0 100 40" preserveAspectRatio="none">
    <g class="granos">
      <circle cx="5" cy="9" r=".45"/><circle cx="12" cy="18" r=".35"/>
      <circle cx="19" cy="6" r=".4"/><circle cx="27" cy="23" r=".5"/>
      <circle cx="34" cy="12" r=".32"/><circle cx="42" cy="28" r=".4"/>
      <circle cx="50" cy="8" r=".45"/><circle cx="58" cy="19" r=".35"/>
      <circle cx="66" cy="6" r=".4"/><circle cx="73" cy="26" r=".5"/>
      <circle cx="82" cy="13" r=".35"/><circle cx="91" cy="22" r=".45"/>
      <circle cx="97" cy="8" r=".35"/>
    </g>
    <g class="marcas-arena">
      <path d="M8 30 Q12 27 16 30"/><path d="M31 18 Q35 15 39 18"/>
      <path d="M54 33 Q58 30 62 33"/><path d="M76 18 Q80 15 84 18"/>
      <path d="M89 31 Q93 28 97 31"/>
    </g>

    <!-- Huellas y pequeñas ondulaciones naturales en la arena -->
    <g class="detalles-arena">
      <path d="M18 10 q3 -2 6 0"/>
      <path d="M44 7 q3 -2 6 0"/>
      <path d="M69 12 q3 -2 6 0"/>
      <path d="M84 25 q3 -2 6 0"/>
      <path d="M27 34 q2 -1.5 4 0"/>
      <path d="M58 25 q2 -1.5 4 0"/>
      <circle cx="11" cy="13" r=".7"/>
      <circle cx="37" cy="29" r=".6"/>
      <circle cx="64" cy="35" r=".7"/>
      <circle cx="94" cy="16" r=".6"/>
    </g>
  </svg>


  <!-- CONCHAS -->
  <svg class="concha c1" viewBox="0 0 30 30">
    <defs>
      <linearGradient id="concha-grad-1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="var(--c-verano-concha)"/>
        <stop offset="100%" stop-color="var(--c-verano-arena-humeda)"/>
      </linearGradient>
    </defs>
    <path class="cuerpo" fill="url(#concha-grad-1)" d="M15 27 C7 24 4 18 4 8 C8 12 11 11 15 5 C19 11 22 12 26 8 C26 18 23 24 15 27Z"/>
    <path class="nervio" d="M15 6 L15 25 M10.5 9 L12.5 23 M19.5 9 L17.5 23 M7 12 L11 19 M23 12 L19 19"/>
  </svg>

  <svg class="concha tono-coral c2" viewBox="0 0 30 30">
    <path class="cuerpo" d="M15 27 C7 24 4 18 5 9 C9 12 12 12 15 6 C18 12 21 12 25 9 C26 18 23 24 15 27Z"/>
    <path class="nervio" d="M15 7 L15 25 M10 10 L12.5 23 M20 10 L17.5 23 M7 13 L11 19 M23 13 L19 19"/>
  </svg>

  <svg class="concha tono-amarillo c3" viewBox="0 0 30 30">
    <path class="cuerpo" d="M15 27 C7 24 4 18 4 8 C8 12 11 11 15 5 C19 11 22 12 26 8 C26 18 23 24 15 27Z"/>
    <path class="nervio" d="M15 6 L15 25 M10.5 9 L12.5 23 M19.5 9 L17.5 23 M7 12 L11 19 M23 12 L19 19"/>
  </svg>

  <svg class="concha tono-lila caracol c4" viewBox="0 0 32 34">
    <circle class="cuerpo" cx="16" cy="18" r="12"/>
    <path class="giro" d="M16 9 C22 9 26 13 26 18 C26 25 21 28 16 28 C10 28 7 24 8 19 C9 15 12 13 16 14 C20 14 21 17 21 20 C21 23 19 24.5 16.5 24"/>
  </svg>

  <svg class="concha tono-rosa caracol c5" viewBox="0 0 32 34">
    <circle class="cuerpo" cx="16" cy="18" r="12"/>
    <path class="giro" d="M16 9 C22 9 26 13 26 18 C26 25 21 28 16 28 C10 28 7 24 8 19 C9 15 12 13 16 14 C20 14 21 17 21 20 C21 23 19 24.5 16.5 24"/>
  </svg>

  <svg class="concha tono-rosa c6" viewBox="0 0 30 30">
    <path class="cuerpo" d="M15 27 C7 24 4 18 5 9 C9 12 12 12 15 6 C18 12 21 12 25 9 C26 18 23 24 15 27Z"/>
    <path class="nervio" d="M15 7 L15 25 M10 10 L12.5 23 M20 10 L17.5 23 M7 13 L11 19 M23 13 L19 19"/>
  </svg>

  <!-- Estrella de mar -->
  <svg class="estrella" viewBox="0 0 40 40">
    <path class="estrella-cuerpo"
      d="M20 3 L24.5 14.5 L37 15.3 L27.5 23.2 L30.6 35.3 L20 28.6 L9.4 35.3 L12.5 23.2 L3 15.3 L15.5 14.5Z"/>
    <g class="estrella-puntos">
      <circle cx="20" cy="10" r=".9"/><circle cx="20" cy="17" r="1"/>
      <circle cx="12" cy="18" r=".8"/><circle cx="28" cy="18" r=".8"/>
      <circle cx="15" cy="27" r=".8"/><circle cx="25" cy="27" r=".8"/>
    </g>
  </svg>

  <!-- Pelota de playa -->
  <svg class="pelota" viewBox="0 0 40 40">
    <defs>
      <clipPath id="pelota-clip"><circle cx="20" cy="20" r="15"/></clipPath>
      <radialGradient id="pelota-luz" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fff" stop-opacity=".5"/>
        <stop offset="60%" stop-color="#fff" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity=".16"/>
      </radialGradient>
    </defs>
    <ellipse class="pelota-sombra" cx="22" cy="36" rx="13" ry="2.6"/>
    <g clip-path="url(#pelota-clip)">
      <rect class="p-nube" width="40" height="40"/>
      <path class="p-rojo" d="M20 20 L20 0 L40 0 L40 12Z"/>
      <path class="p-amarillo" d="M20 20 L40 12 L40 34Z"/>
      <path class="p-turquesa" d="M20 20 L40 34 L40 40 L20 40Z"/>
      <path class="p-rosa" d="M20 20 L20 40 L0 40 L0 28Z"/>
      <path class="p-azul" d="M20 20 L0 28 L0 6Z"/>
      <path class="p-naranja" d="M20 20 L0 6 L0 0 L20 0Z"/>
      <circle cx="20" cy="20" r="15" fill="url(#pelota-luz)"/>
    </g>
    <circle class="pelota-centro" cx="20" cy="20" r="2.2"/>
  </svg>


  <!-- TUMBONAS (al lado de la sombrilla) -->
  <svg class="silla silla-1" viewBox="0 0 60 72"><use href="#silla"/></svg>
  <svg class="silla silla-2" viewBox="0 0 60 72"><use href="#silla"/></svg>


  <!-- SOMBRILLA (posición original) -->
  <svg class="sombrilla sm1" viewBox="0 0 76 96">
    <defs>
      <clipPath id="fv-cupula">
        <path d="M4 30 Q4 4 38 4 Q72 4 72 30 Q66 34 60 30 Q54 34 48 30 Q42 34 36 30 Q30 34 24 30 Q18 34 12 30 Q6 34 4 30Z"/>
      </clipPath>
      <linearGradient id="sombrilla-sombra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-opacity="0"/>
        <stop offset="100%" stop-opacity=".16"/>
      </linearGradient>
      <linearGradient id="sombrilla-metal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-opacity=".55"/>
        <stop offset="40%" stop-opacity=".95"/>
        <stop offset="70%" stop-opacity=".45"/>
        <stop offset="100%" stop-opacity=".8"/>
      </linearGradient>
    </defs>

    <!-- Sombra proyectada en la arena -->
    <ellipse class="sombra-suelo" cx="50" cy="93" rx="30" ry="2.6"/>

    <g clip-path="url(#fv-cupula)">
      <rect class="tela" x="2" y="2" width="72" height="32"/>
      <path class="g-rojo" d="M38 4 L4 30 L12 30 Z"/>
      <path class="g-naranja" d="M38 4 L12 30 L20 30 Z"/>
      <path class="g-amarillo" d="M38 4 L20 30 L28 30 Z"/>
      <path class="g-verde" d="M38 4 L28 30 L36 30 Z"/>
      <path class="g-turquesa" d="M38 4 L36 30 L44 30 Z"/>
      <path class="g-azul" d="M38 4 L44 30 L52 30 Z"/>
      <path class="g-rosa" d="M38 4 L52 30 L60 30 Z"/>
      <path class="g-rojo" d="M38 4 L60 30 L72 30 Z"/>
      <path class="sombra-tela" d="M4 24 Q38 15 72 24 L72 34 L4 34Z"/>
      <path class="brillo-tela" d="M9 27 Q20 11 34 7 Q21 18 14 29Z"/>
    </g>

    <g class="costuras">
      <path d="M38 10 L12 30"/><path d="M38 10 L20 30"/><path d="M38 10 L28 30"/>
      <path d="M38 10 L36 30"/><path d="M38 10 L44 30"/><path d="M38 10 L52 30"/>
      <path d="M38 10 L60 30"/>
    </g>

    <circle class="hub" cx="38" cy="10" r="7"/>
    <circle class="hub-anillo" cx="38" cy="10" r="4.5"/>
    <circle class="hub-centro" cx="38" cy="10" r="2"/>
    <circle class="punta-sombrilla" cx="38" cy="5" r="2"/>

    <rect class="palo" x="36.5" y="28" width="3" height="66" rx="1.5"/>
    <rect class="palo-brillo" x="37" y="29" width=".7" height="62" rx=".35"/>
    <ellipse class="base-sombrilla" cx="38" cy="94" rx="4.5" ry="1.5"/>
  </svg>

</div>


<style>

  /* CONTENEDOR */
  .playa {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: -1;
  }

  .playa svg { display: block; }


  /* SOL (posición original exacta) */
  .sol {
    position: absolute;
    top: calc(9% - 40px);
    left: calc(82% - 40px);
    width: 80px;
    height: 80px;
    overflow: visible;
  }

  .sol .halo {
    transform-origin: 40px 40px;
    animation: halo 6s ease-in-out infinite alternate;
  }

  .sol .rayos {
    fill: none;
    stroke: var(--c-acento);
    stroke-width: 2.5;
    stroke-linecap: round;
    opacity: .72;
    transform-origin: 40px 40px;
    animation: girar 90s linear infinite;
  }

  .sol .astro {
    stroke: var(--c-acento);
    stroke-width: 1.2;
  }


  /* NUBES (posiciones originales) */
  .nube-svg {
    position: absolute;
    fill: var(--c-verano-nube);
  }

  .nube-sombra {
    fill: var(--c-verano-turquesa);
    opacity: .12;
  }

  .n1 { top: 13%; left: 5%;  width: 104px; height: 41px; opacity: .88; animation: deriva 38s ease-in-out infinite alternate; }
  .n2 { top: 9%;  left: 58%; width: 84px;  height: 34px; opacity: .66; animation: deriva 46s ease-in-out infinite alternate-reverse; }
  .n3 { top: 22%; left: 78%; width: 72px;  height: 30px; opacity: .56; animation: deriva 52s ease-in-out infinite alternate; }


  /* GAVIOTAS (posiciones originales) */
  .gaviota {
    position: absolute;
    fill: none;
    stroke: var(--c-verano-nube);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: .62;
    animation: vuelo 7s ease-in-out infinite alternate;
  }

  .g1 { top: 16%;   left: 60%; width: 20px; height: 8px; }
  .g2 { top: 12.5%; left: 69%; width: 17px; height: 7px; opacity: .5;  animation-delay: -2s; }
  .g3 { top: 18%;   left: 75%; width: 14px; height: 6px; opacity: .44; animation-delay: -4s; }


  /* HORIZONTE */
  .horizonte {
    position: absolute;
    top: 49%;
    left: 0;
    width: 100%;
    height: 10%;
  }

  .horizonte-linea {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: 1;
    opacity: .26;
  }


  /* MAR */
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
    stroke-linecap: round;
    animation: oleaje 7s ease-in-out infinite alternate;
  }

  .onda:nth-of-type(even) { animation-duration: 9s; animation-direction: alternate-reverse; }
  .onda:nth-of-type(3n)   { animation-delay: -3s; }

  .onda-lejana  { stroke-width: 1;    opacity: .18; }
  .onda-media   { stroke-width: 1.15; opacity: .25; }
  .onda-cercana { stroke-width: 1.45; opacity: .32; }
  .onda-extra   { stroke-width: 1;    opacity: .2; }

  .brillos path {
    fill: none;
    stroke: var(--c-verano-sol);
    stroke-width: 1.6;
    stroke-linecap: round;
    opacity: .4;
    animation: destello 4s ease-in-out infinite;
  }

  .brillos path:nth-child(2) { animation-delay: -.8s; }
  .brillos path:nth-child(3) { animation-delay: -1.6s; }
  .brillos path:nth-child(4) { animation-delay: -2.4s; }
  .brillos path:nth-child(5) { animation-delay: -3.2s; }


  /* ORILLA */
  .orilla {
    position: absolute;
    top: 74%;
    left: 0;
    width: 100%;
    height: 26%;
  }

  .orilla .humeda { fill: var(--c-verano-arena-humeda); }

  .orilla .espuma {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: .86;
    animation: espuma 8s ease-in-out infinite alternate;
  }

  .orilla .espuma-fina {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: 1.5;
    stroke-linecap: round;
    opacity: .62;
  }

  .orilla .salpicadura {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: 2.5;
    stroke-linecap: round;
    opacity: .35;
  }


  /* ARENA */
  .arena-svg {
    position: absolute;
    top: 86%;
    left: 0;
    width: 100%;
    height: 14%;
  }

  .granos { fill: var(--c-verano-arena-sombra); opacity: .42; }

  .marcas-arena {
    fill: none;
    stroke: var(--c-verano-arena-sombra);
    stroke-width: .8;
    stroke-linecap: round;
    opacity: .4;
  }


  /* CONCHAS */
  .concha { position: absolute; width: 16px; height: 16px; }

  .concha .cuerpo {
    stroke: var(--c-verano-arena-humeda);
    stroke-width: .8;
    stroke-linejoin: round;
  }

  .concha .nervio {
    fill: none;
    stroke: var(--c-verano-arena-humeda);
    stroke-width: .6;
    stroke-linecap: round;
    opacity: .8;
  }

  .tono-coral .cuerpo    { fill: var(--c-verano-coral); }
  .tono-lila .cuerpo     { fill: var(--c-verano-lila); }
  .tono-amarillo .cuerpo { fill: var(--c-verano-amarillo); }
  .tono-rosa .cuerpo     { fill: var(--c-verano-rosa); }

  .caracol { height: 18px; }

  .caracol .giro {
    fill: none;
    stroke: var(--c-verano-arena-humeda);
    stroke-width: .85;
    stroke-linecap: round;
  }

  .c1 { top: 90%; left: 26%; transform: rotate(-12deg); }
  .c2 { top: 93%; left: 52%; transform: rotate(9deg) scale(1.1); }
  .c3 { top: 96%; left: 36%; transform: rotate(-18deg) scale(.9); }
  .c4 { top: 88%; left: 62%; transform: rotate(8deg); }
  .c5 { top: 95%; left: 71%; transform: rotate(-10deg) scale(.85); }
  .c6 { top: 91%; left: 83%; transform: rotate(14deg) scale(.95); }


  /* ESTRELLA DE MAR */
  .estrella {
    position: absolute;
    top: 92%;
    left: 45%;
    width: 22px;
    height: 22px;
    transform: rotate(18deg);
  }

  .estrella-cuerpo {
    fill: var(--c-verano-coral);
    stroke: var(--c-verano-arena-humeda);
    stroke-width: 1.2;
    stroke-linejoin: round;
  }

  .estrella-puntos { fill: var(--c-verano-nube); opacity: .7; }


  /* PELOTA */
  .pelota {
    position: absolute;
    top: 87%;
    left: 91%;
    width: 30px;
    height: 30px;
    transform: rotate(-14deg);
  }

  .pelota-sombra { fill: var(--c-verano-arena-sombra); opacity: .4; }
  .pelota-centro { fill: var(--c-verano-nube); }
  .p-nube     { fill: var(--c-verano-nube); }
  .p-rojo     { fill: var(--c-verano-rojo); }
  .p-amarillo { fill: var(--c-verano-amarillo); }
  .p-turquesa { fill: var(--c-verano-turquesa); }
  .p-rosa     { fill: var(--c-verano-rosa); }
  .p-azul     { fill: var(--c-verano-azul); }
  .p-naranja  { fill: var(--c-verano-naranja); }


  /* TUMBONAS */
  .silla {
    position: absolute;
    width: 46px;
    height: 55px;
    overflow: visible;
    --lona-a: var(--c-verano-lona-a, var(--c-verano-turquesa));
    --lona-b: var(--c-verano-lona-b, var(--c-verano-nube));
    --madera: var(--c-verano-madera, #b98a5a);
  }

  .silla-1 { top: 87%; left: calc(8% + 70px); transform: rotate(-3deg); }

  .silla-2 {
    top: 89.5%;
    left: calc(8% + 122px);
    width: 42px;
    height: 50px;
    transform: scaleX(-1) rotate(-2deg);
    --lona-a: var(--c-verano-coral);
  }

  .lona-a      { fill: var(--lona-a); }
  .lona-b      { fill: var(--lona-b); }
  .lona-sombra { fill: #000; opacity: .08; }

  .madera {
    fill: none;
    stroke: var(--madera);
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .madera-barra { fill: var(--madera); }
  .silla-sombra { fill: var(--c-verano-arena-sombra); opacity: .4; }


  /* SOMBRILLA (posición original: top 84%, left 8%) */
  .sombrilla {
    position: absolute;
    width: 76px;
    height: 96px;
    top: 84%;
    left: 8%;
    overflow: visible;
  }

  .sombra-suelo { fill: var(--c-verano-arena-sombra); opacity: .3; }

  .tela { fill: var(--c-verano-nube); }

  .g-rojo     { fill: var(--c-verano-rojo); }
  .g-naranja  { fill: var(--c-verano-naranja); }
  .g-amarillo { fill: var(--c-verano-amarillo); }
  .g-verde    { fill: var(--c-verano-verde); }
  .g-turquesa { fill: var(--c-verano-turquesa); }
  .g-azul     { fill: var(--c-verano-azul); }
  .g-rosa     { fill: var(--c-verano-rosa); }

  .sombra-tela { fill: url(#sombrilla-sombra); }
  .brillo-tela { fill: var(--c-verano-espuma); opacity: .14; }

  .costuras path {
    fill: none;
    stroke: var(--c-verano-nube);
    stroke-width: 1.05;
    stroke-linecap: round;
    opacity: .8;
  }

  .hub            { fill: var(--c-verano-nube); }
  .hub-anillo     { fill: none; stroke: var(--c-verano-turquesa); stroke-width: 1.4; }
  .hub-centro     { fill: var(--c-verano-rosa); }
  .punta-sombrilla { fill: var(--c-verano-metal); }

  .palo        { fill: url(#sombrilla-metal); }
  .palo-brillo { fill: var(--c-verano-nube); opacity: .18; }
  .base-sombrilla { fill: var(--c-verano-metal); opacity: .55; }


  /* DETALLES DEL AGUA */
  .ondas-micro path {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: .65;
    stroke-linecap: round;
    opacity: .14;
    animation: micro-agua 8s ease-in-out infinite alternate;
  }

  .ondas-micro path:nth-child(2n) { animation-delay: -2s; }
  .ondas-micro path:nth-child(3n) { animation-delay: -4s; }

  .reflejo-agua path {
    fill: none;
    stroke: var(--c-verano-sol);
    stroke-linecap: round;
    opacity: .22;
    stroke-width: 1.2;
    animation: reflejo 5.5s ease-in-out infinite;
  }

  .reflejo-agua path:nth-child(2) { animation-delay: -.9s; }
  .reflejo-agua path:nth-child(3) { animation-delay: -1.8s; }
  .reflejo-agua path:nth-child(4) { animation-delay: -2.7s; }
  .reflejo-agua path:nth-child(5) { animation-delay: -3.6s; }

  .espuma-mar path {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: 1;
    stroke-linecap: round;
    opacity: .22;
    animation: espuma-mar 7s ease-in-out infinite alternate;
  }

  .espuma-mar path:nth-child(2) { animation-delay: -2.2s; }
  .espuma-mar path:nth-child(3) { animation-delay: -4.4s; }

  /* TEXTURA DE ARENA MEJORADA */
  .detalles-arena path {
    fill: none;
    stroke: var(--c-verano-arena-sombra);
    stroke-width: .65;
    stroke-linecap: round;
    opacity: .25;
  }

  .detalles-arena circle {
    fill: var(--c-verano-arena-sombra);
    opacity: .3;
  }

  /* OBJETOS LEJANOS EN EL AGUA */
  .objeto-agua {
    position: absolute;
    overflow: visible;
  }

  .flotador {
    top: 66.5%;
    left: 66%;
    width: 34px;
    height: 23px;
    opacity: .74;
    animation: boya 6.5s ease-in-out infinite alternate;
  }

  .flotador-anillo {
    fill: var(--c-verano-coral);
    stroke: var(--c-verano-espuma);
    stroke-width: .7;
  }

  .flotador-hueco {
    fill: var(--c-verano-turquesa);
    stroke: var(--c-verano-espuma);
    stroke-width: .55;
  }

  .flotador-franja {
    fill: var(--c-verano-amarillo);
    opacity: .9;
  }

  .flotador-brillo {
    fill: none;
    stroke: var(--c-verano-espuma);
    stroke-width: .8;
    stroke-linecap: round;
    opacity: .65;
  }

  .flotador-sombra {
    fill: var(--c-verano-azul);
    opacity: .14;
  }

  .inflable-lejano {
    top: 71%;
    left: 28%;
    width: 20px;
    height: 15px;
    opacity: .38;
    animation: boya 8s ease-in-out infinite alternate-reverse;
  }

  .mini-anillo {
    fill: var(--c-verano-amarillo);
    stroke: var(--c-verano-espuma);
    stroke-width: .55;
  }

  .mini-hueco {
    fill: var(--c-verano-turquesa);
  }

  /* ANIMACIONES (muy sutiles) */
  @keyframes girar   { to { transform: rotate(360deg); } }
  @keyframes halo    { from { transform: scale(.94); opacity: .8; } to { transform: scale(1.06); opacity: 1; } }
  @keyframes deriva  { from { transform: translateX(-10px); } to { transform: translateX(14px); } }
  @keyframes vuelo   { from { transform: translate(0, 0); } to { transform: translate(6px, -4px); } }
  @keyframes oleaje  { from { transform: translateX(-1.4px); } to { transform: translateX(1.4px); } }
  @keyframes espuma  { from { transform: translateY(0); opacity: .86; } to { transform: translateY(-1.5px); opacity: .7; } }
  @keyframes destello { 0%, 100% { opacity: .12; } 50% { opacity: .5; } }

  @keyframes micro-agua {
    from { transform: translateX(-1px); opacity: .12; }
    to   { transform: translateX(2px); opacity: .23; }
  }

  @keyframes reflejo {
    0%, 100% { opacity: .12; transform: scaleX(.85); }
    50%      { opacity: .34; transform: scaleX(1.12); }
  }

  @keyframes espuma-mar {
    from { transform: translateX(-1px); opacity: .16; }
    to   { transform: translateX(1.5px); opacity: .28; }
  }

  @keyframes boya {
    from { transform: translate(0, 0) rotate(-1deg); }
    to   { transform: translate(5px, -1.5px) rotate(1deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .playa * { animation: none !important; }
  }

</style>
