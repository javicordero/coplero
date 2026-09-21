# Phase 0 — Research: Reordenar la landing, cabecera/pie persistentes y páginas nuevas

Resuelve los puntos técnicos de la spec. No queda ningún `NEEDS CLARIFICATION`.

## R1 · Marco común en todas las páginas

**Decision**: mover el marco al `Layout.astro`: renderiza `<Header />` + `<slot />` + `<Footer />`.
Todas las páginas que ya usan `Layout` (portada, juego, tarjeta compartida) lo heredan, y las nuevas
lo usan igual.

**Rationale**: hoy cada página gestiona su propio envoltorio (la portada pone su `header` a mano y
`/jugar` no tiene ninguno). Centralizarlo evita duplicación y garantiza FR-001/FR-002 (todas las
páginas) sin repasar una a una.

**Alternativas consideradas**:
- *Añadir cabecera y pie página a página*: repetitivo y fácil de olvidar.
- *Hacer el marco una isla*: sumaría JS a páginas que deben ser 0 kB.

## R2 · La marca cambia con el sexo del personaje

**Decision**: `Header.astro` pinta la marca con un `<span data-marca>Coplero</span>`. En `/jugar`, la
isla actualiza ese texto con `tituloDelJuego(genero)` (`src/juego/presentacion.ts`) cuando el jugador
elige sexo; antes de elegirlo se muestra «Coplero».

**Rationale**: el sexo vive en la partida (isla) y la cabecera es estática. Una escritura de
`textContent` es la forma más barata de reflejarlo, sin añadir islas ni JS a las páginas estáticas.
El mapeo **ya existe** (`masculino: "Coplero"`, `femenino: "Coplera"`, `no_binario: "Coplere"`), no
hay que inventarlo.

**Alternativas consideradas**:
- *Re-renderizar la cabecera dentro de la isla*: duplicaría el marcado del marco.
- *Leer `localStorage` con un script en la cabecera*: rompería las 0 kB de la portada.

## R3 · Portada corta y contenido reubicado

**Decision**: la portada conserva el hero y una única sección que **fusiona** «qué es Coplero» y
«cómo funciona»; se retiran modalidades, FAQ y cierre. La FAQ pasa a `/como-jugar`, junto con las
reglas y las modalidades.

**Rationale**: es la petición explícita del diseñador (FR-008…FR-012) y evita perder contenido útil:
la FAQ y las modalidades siguen accesibles en una página de contexto, que además ayuda al SEO.

**Alternativas consideradas**:
- *Borrar la FAQ*: se perdería contenido de soporte y valor SEO.
- *Mantener las secciones pero ocultas*: ruido innecesario.

## R4 · Contenido compartido del sitio

**Decision**: mover `src/landing/contenido.ts` a `src/sitio/contenido.ts` y añadir
`src/sitio/reglas.ts` (reglas del juego para `/como-jugar`). El fixture `ejemploTarjeta.ts` se queda
en `src/landing/`.

**Rationale**: redes, autor y FAQ ya no son exclusivos de la portada: los usan el pie (marco común) y
`/como-jugar`. La carpeta `landing/` deja de ser el sitio natural para ellos.

**Alternativas consideradas**:
- *Dejarlos en `landing/`*: nombre engañoso al ser contenido del sitio.
- *Duplicarlos*: fuente de verdad doble.

## R5 · Ancho: marco 680 y juego 420–480

**Decision**: el contenedor del marco (cabecera y pie) usa 680 px en escritorio y ancho completo en
móvil; el bucle jugable mantiene su columna de 420–480 px centrada (`Juego.svelte` ya tiene
`max-width: 480px`). Fondo idéntico en todas las páginas.

**Rationale**: cumple a la vez la continuidad percibida (FR-025/SC-007) y la constitución
(Principio IV, 420–480 para el bucle jugable). El «salto» de ancho se percibe sobre todo por el
marco y el fondo, que quedan idénticos.

**Alternativas consideradas**:
- *Juego a 680*: rompería la constitución y exigiría re-maquetar la isla.
- *Todo a 480*: portada demasiado estrecha en escritorio.

## R6 · Pie con la estructura de acordesgaditanos

**Decision**: reescribir `Footer.astro` con los cuatro bloques del pie de acordesgaditanos y en su
orden: (1) `nav` de «Redes sociales», (2) `address` del autor con LinkedIn/GitHub, (3) fila de
enlaces legales (privacidad y cookies), (4) línea de copyright. Se mantiene la referencia a
acordesgaditanos y los iconos siguen siendo SVG en línea.

**Rationale**: es la petición explícita («hazlo igual») y la estructura del otro proyecto del autor.
Los iconos en línea evitan `astro-icon` y mantienen las 0 kB.

**Alternativas consideradas**:
- *Solo cambiar los colores*: no era eso lo pedido; el usuario habla de **estructura**.

## R7 · Páginas legales

**Decision**: crear `/politicas/politica-de-privacidad` y `/politicas/politica-de-cookies` con texto
mínimo y veraz: sin analítica ni cookies de terceros; `localStorage` como funcionalidad esencial
(guardar la partida); datos del autor y vía de contacto (el propio sitio). Se enlazan desde el pie.

**Rationale**: evita enlaces rotos (SC-004) y deja el terreno preparado para AdSense (`docs/06`).

**Alternativas consideradas**:
- *Plantilla genérica*: podría afirmar cosas falsas (cookies que no se usan).
- *No crearlas aún*: el pie quedaría incompleto y con enlaces rotos.

## R8 · Verificación

**Decision**:
1. **E2E** `tests/e2e/chrome.spec.ts`: cabecera y pie visibles en portada, `/jugar`, `/como-jugar`,
   legales y `/r/[codigo]`; la marca cambia a «Coplera»/«Coplere» al elegir sexo; sin scroll
   horizontal desde 320 px; axe WCAG 2.2 AA.
2. **E2E** `tests/e2e/landing.spec.ts` actualizado: la portada ya no tiene modalidades/FAQ/cierre y
   sí la sección fusionada.
3. **Vitest**: el mapeo `tituloDelJuego` (ya cubierto en presentacion) y una comprobación de que las
   páginas estáticas siguen sin `<script>`.

**Rationale**: cubre los criterios medibles (SC-001…SC-008) con la infraestructura existente.
