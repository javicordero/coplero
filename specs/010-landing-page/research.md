# Phase 0 — Research: Landing estática

Resuelve los puntos técnicos de la spec. No queda ningún `NEEDS CLARIFICATION`.

## R1 · Cómo se garantizan las 0 kB de JavaScript

**Decision**: la página no usa ninguna isla ni directiva `client:*`; todo el contenido es HTML/CSS
puro. No se añade ningún `<script>`. La interactividad (FAQ) se resuelve con elementos nativos.

**Rationale**: es un requisito de producto (constitución IV): la landing es la que decide si el
enlace de WhatsApp convierte. Astro no emite JS en una página sin islas, así que basta con no
introducirlas.

**Alternativas consideradas**:
- *Contador animado / animaciones JS*: rechazado; se pueden hacer con CSS si hacen falta.
- *FAQ como isla Svelte*: rechazado; el elemento nativo `<details>` cubre el caso sin JS.

## R2 · El ejemplo de tarjeta

**Decision**: reutilizar el componente real **`src/juego/Tarjeta.svelte`** renderizado **en el
servidor** (sin `client:*`) con un fixture `TarjetaFinal` (`src/landing/ejemploTarjeta.ts`).

**Rationale**: `Tarjeta.svelte` es puramente presentacional (props + `$derived`, sin APIs de
navegador ni eventos), así que Astro lo renderiza a HTML en build **sin enviar JavaScript**. Se
consigue un ejemplo **fiel** al resultado real y **sin duplicar** maquetación ni estilos.

**Alternativas consideradas**:
- *Maqueta HTML/CSS a mano*: duplica el diseño de la tarjeta y se desincroniza en cuanto cambie.
- *Imagen estática del póster*: exigiría un activo gráfico y perdería texto seleccionable/SEO.

## R3 · El pie de página

**Decision**: `src/components/Footer.astro` (Astro, 0 JS) con la **estructura** del pie de
acordesgaditanos: `nav` de redes sociales, `address` del autor, enlaces legales y copyright. Los
iconos son **SVG en línea** con `aria-label` en el enlace.

**Rationale**: `astro-icon` (lo que usa acordesgaditanos) no está en el stack de Coplero y añadiría
dependencia + JS potencial. Un SVG en línea cero-coste mantiene las 0 kB y el nombre accesible
(FR-012). Aislarlo en un componente lo hace reutilizable por el resto de páginas estáticas (FR-013).

**Alternativas consideradas**:
- *Añadir `astro-icon`*: dependencia nueva innecesaria para 6 iconos.
- *Font de iconos*: peso extra y peor accesibilidad.

## R4 · Redes sociales y referencia al autor

**Decision**: se reutilizan las **cuentas de acordesgaditanos** (X, YouTube, TikTok, Instagram) hasta
que Coplero tenga las suyas, y se enlaza a **acordesgaditanos** como proyecto del mismo autor (en la
sección de explicación y en el pie), con los perfiles personales LinkedIn y GitHub.

**Rationale**: está decidido en `docs/05` §3–§4: acordesgaditanos es el puente de visitas y refuerza
que ambos proyectos son del mismo autor.

**Alternativas consideradas**:
- *Crear cuentas nuevas para Coplero*: fragmenta el lanzamiento; se pospone.

## R5 · Enlaces legales

**Decision**: el pie **no** enlaza todavía a privacidad/cookies; se añadirán cuando existan esas
páginas.

**Rationale**: FR-014 evita enlaces rotos (SC-003). Las páginas legales entran con AdSense
(`docs/06`), fuera del alcance de esta feature.

**Alternativas consideradas**:
- *Crear páginas vacías para poder enlazar*: peor experiencia y las mete en el índice de buscadores.

## R6 · FAQ sin JavaScript

**Decision**: la FAQ se implementa con **`<details>`/`<summary>`** nativos (acordeón sin JS,
accesible por teclado y con nombre de control correcto).

**Rationale**: cubre FR-007 y el edge case "JavaScript desactivado" sin coste. Es HTML semántico y
funciona en todos los navegadores objetivo.

**Alternativas consideradas**:
- *Preguntas y respuestas siempre expandidas*: válido, pero alarga mucho la página en móvil.
- *Acordeón con JS*: rompe las 0 kB.

## R7 · Metadatos y Open Graph

**Decision**: usar las props de `Layout.astro` para `title`, `description` y `canonical`; para
`og:image`, apuntar al **endpoint de OG existente** (`/api/og/:codigo.png`) con un **código de
ejemplo** derivado del fixture (mismo dato que la tarjeta mostrada), sobre la URL absoluta del
dominio (`https://coplero.app`).

**Rationale**: reutiliza la infraestructura de OG ya construida (007) sin activos nuevos y mantiene
coherencia entre lo que se ve en la página y la preview al compartir. Depende de que el OG funcione
en Netlify (huecos C14/T21, ya registrados).

**Alternativas consideradas**:
- *Imagen estática `public/og/portada.png`*: exige diseñar y mantener un activo nuevo.
- *Sin `og:image`*: incumple FR-020 y empeora la preview al compartir.

## R8 · Verificación

**Decision**:
1. **E2E** (`tests/e2e/landing.spec.ts`): secciones presentes, CTA hacia `/jugar`, FAQ usable, pie con
   redes/autor/acordesgaditanos, enlaces externos con `target="_blank" rel="noopener noreferrer"`, y
   **axe** (WCAG 2.2 AA) sin violaciones.
2. **0 kB de JS**: se comprueba sobre `dist/index.html` construido (ausencia de `<script>`), ya que en
   desarrollo Astro inyecta scripts.

**Rationale**: cubre los criterios medibles (SC-001, SC-003, SC-005, SC-006) sin añadir infraestructura.

## R9 · Año del copyright

**Decision**: el año del pie se calcula en **build** (`new Date().getFullYear()`), como en
acordesgaditanos.

**Rationale**: es una página estática; el año queda fijado en cada despliegue. No afecta al motor
(la prohibición de tiempo implícito es del `engine`).
