# Phase 0 — Research: Rediseño de la portada al estilo del juego

Resultado de la fase de investigación. Todas las incógnitas del contexto técnico quedan resueltas; no hay `NEEDS CLARIFICATION`.

## R1. Lenguaje visual de destino

**Decision**: adoptar el lenguaje de las **pantallas de creación/resultado** de la isla: títulos en **Anton** (`--fuente-display`) en mayúsculas con **sombra dura** (`text-shadow: 3px 3px 0 var(--c-superficie)`), superficies (`--c-superficie`, `--c-separador`, `--c-borde-control`), radios y `box-shadow`, y acento cálido (`--c-acento`) para CTA y ornamentos.

**Rationale**: es el lenguaje que la spec exige reproducir (FR-009) y ya está codificado en `Juego.svelte` (`.pantalla__cabecera h2`, `.tarjeta`, botón `.primario`) y en `tokens.css`. No requiere tokens nuevos.

**Alternatives considered**:
- *Mantener el estilo actual de la portada*: descartado; es justo lo que rompe la continuidad al pasar a `/jugar`.
- *Definir tokens nuevos para la portada*: descartado (YAGNI, FR-011).

## R2. Materializar la «fusión visual» de los dos primeros bloques

**Decision**: mantener los **3 bloques** y dar continuidad al primero y al segundo con recursos visuales, no estructurales: quitar el filete de corte (`border-top`) entre ambos, unificar tipografías y espaciado, y encabezar el bloque explicativo con el ornamento en lugar del compás.

**Rationale**: es la clarificación del usuario (Q1 → opción B): la apertura se mantiene breve y justo debajo va el bloque compacto; la fusión es visual. Conserva el contenido (FR-001) y la jerarquía `h1`→`h2`→`h3`.

**Alternatives considered**:
- *Fusionar en un único bloque*: descartado por el usuario.
- *Suprimir el h2 del bloque explicativo*: descartado; rompería la jerarquía semántica y el SEO.

## R3. Forma del separador tipográfico

**Decision**: un **ornamento tipográfico decorativo** (`aria-hidden="true"`, sin texto accesible) dibujado con CSS —p. ej. glifos `///` o `···` en `--c-acento`— colocado sobre el `h2` del bloque explicativo.

**Rationale**: es la clarificación del usuario (Q3 → opción B). Sustituye el papel decorativo del compás sin introducir copy nuevo ni dependencias, y encaja con la tipografía del juego.

**Alternatives considered**:
- *Rótulo de sección con texto*: descartado; añadiría copy no aprobado.
- *Reutilizar `ReglaCompas`*: descartado; el usuario pidió quitar el compás.
- *Glifo como SVG nuevo*: descartado; CSS evita un asset más.

## R4. Alcance de la retirada del compás

**Decision**: retirar `ReglaCompas` de **ambos** bloques de la portada (explicativo y ejemplo) y sustituirlo por el ornamento. Se conserva en la cabecera (uso actual) y en el pie de la tarjeta.

**Rationale**: clarificación del usuario (Q2 → opción C), ampliada en la revisión de 2026-10-04: el compás desaparece de la portada entera. La decisión cerrada de 012 describe el compás como «separador de secciones **en la portada**», así que este cambio **matiza** esa decisión y queda registrado.

**Alternatives considered**:
- *Retirarlo solo del bloque explicativo*: era la primera decisión; el usuario pidió después cambiarlo también en el ejemplo.
- *No registrar el cambio*: prohibido por la constitución (no resolver contradicciones en silencio).

## R5. Cómo acortar sin perder contenido

**Decision**: reducir el `min-height` del hero (hoy `60vh`) y los espaciados verticales; condensar la redacción de los párrafos sin eliminar la explicación ni los 4 pasos. SC-003 se valida **comparando** con la versión anterior (más corta), sin porcentaje fijo.

**Rationale**: clarificación del usuario (Q1 de `/speckit.clarify` → sin métrica). El bloque del ejemplo usa la tarjeta real, de altura fija, así que el acortado se concentra en la parte superior.

**Alternatives considered**:
- *Fijar un 20 %*: descartado por el usuario.
- *Eliminar el micro o un párrafo*: descartado; se conserva el contenido obligatorio.

## R6. Sin JavaScript y sin dependencias

**Decision**: el rediseño se resuelve con **CSS y markup de Astro**; no se añade ninguna isla, script, asset ni dependencia. El ornamento es CSS.

**Rationale**: FR-012 y Principio IV (0 kB de JS en la portada). `ReglaCompas.svelte` ya se sirve como HTML estático sin hidratar; no cambia ese contrato.

**Alternatives considered**:
- *Componente Svelte nuevo para el ornamento*: descartado; no aporta y suma superficie.

## R7. Estrategia de verificación

**Decision**:
- **Unit** (`estatico.test.ts`): invariantes existentes de 0 kB de JS (sin `client:`, sin `<script>`) sobre `index.astro`.
- **E2E** (`landing.spec.ts`): comprobaciones actuales (CTA en viewport, `#que-es` con 4 `li`, `[data-testid="tarjeta"]`, enlaces internos, pie, axe) + ausencia de `svg.regla-compas` en `#que-es` y presencia de `[data-separador]`.
- **E2E** (`visual.spec.ts`): la portada debe seguir pasando axe WCAG 2.2 AA, 320 px sin scroll, 200 % de zoom, objetivos ≥44 px, foco visible y reduced-motion.
- `npm run check` como puerta.

**Rationale**: cubre el contrato observable (estructura, ausencia del compás, separador), la accesibilidad y el responsive con la infraestructura existente, sin snapshots frágiles.

**Alternatives considered**:
- *Snapshot visual*: descartado por frágil.
- *Solo revisión manual*: insuficiente; la portada es un contrato testeable.

## R8. Registro de la decisión afectada

**Decision**: actualizar en `docs/registro/decisiones-cerradas.md` la fila «Elemento firma · regla de compás» (presentación) con una nota fechada (2026-10-04, feature 022) que recoja que el compás **se retira de la portada** y se sustituye por un ornamento tipográfico, conservándose en cabecera y pie de tarjeta.

**Rationale**: la constitución y `AGENTS.md` exigen registrar los cambios sobre decisiones cerradas; no se resuelven en silencio.

**Alternatives considered**:
- *Abonar una entrada en `decisiones-pendientes.md`*: innecesario; es un cambio deliberado, no un hueco ni una contradicción abierta.

## R9. Contenido nuevo de la tarjeta de ejemplo

**Decision**: actualizar **las dos** fixtures —`EJEMPLO_TARJETA` (`src/landing/ejemploTarjeta.ts`) y el caso `campeon` (`src/juego/dev/fixturesFin.ts`)— a la misma carrera: 2027–2040; debut 2027, cuartos 2029, semifinales 2032 y final 2035; podio 2037, primer premio 2038 y podio 2040; **2 agujas de oro (2036, 2039)** y **1 coplas por Andalucía (2034)**.

**Rationale**: son los datos que el usuario quiere ver en el ejemplo de la portada y en el modo dev; usar el mismo contenido evita divergencias. La petición de «más distinciones y trayectoria más larga» es explícita.

**Alternatives considered**:
- *Solo la fixture de portada*: descartado por el usuario («cambiar la otra»).
- *Contenidos distintos en cada fixture*: descartado; complica la coherencia sin aportar.

## R10. Coherencia y validez de las fixtures

**Decision**: las fixtures mantienen el contrato de `TarjetaFinal`: `hitos` con **exactamente 3** entradas, `otrosPremios` con `veces` = longitud de `anos`, `hitosProgreso` ordenado y encabezado por el debut, `mejorFase`/`mejorPuesto` coherentes con `primerosPremios`, y supervivencia al códec (`decodificar(codificar(x)).valor === x`).

**Rationale**: `src/juego/__tests__/fixturesFin.test.ts` ya exige 3 hitos y round-trip del códec para los casos dev; se añade un test equivalente para `EJEMPLO_TARJETA`. Evita que el ejemplo se rompa o deje de codificar.

**Alternatives considered**:
- *Confiar solo en los E2E*: insuficiente; el códec y la forma de la fixture son unidad.

## R11. Imagen OG de la portada y caché

**Decision**: no subir `VERSION_OG`. La imagen OG de `/` se pide con el **código** de `EJEMPLO_TARJETA`; al cambiar la fixture cambia `CODIGO_EJEMPLO` y, por tanto, la **URL** (`/api/og/<codigo>.png`), lo que ya invalida la caché `immutable`. `VERSION_OG` se reserva para cambios de **diseño** de la imagen.

**Rationale**: evita subir la versión de todas las imágenes OG (incluidas las de `/r` y la pantalla final) por un cambio de contenido que ya cambia el path.

**Alternatives considered**:
- *Subir `VERSION_OG` también*: innecesario; la URL ya es distinta por el código.

## R12. Fondo del hero: a sangre y con tokens

**Decision**: el hero lleva un **fondo nocturno a sangre** (llega a los bordes) mientras el contenido se mantiene centrado en el marco de 680 px. `main` pasa a **todo el ancho** y cada bloque se centra con su propio `max-width`. El fondo se construye solo con **tokens** (`--c-invierno-nube`, `--c-carnaval-violeta`, `--c-invierno-luna`) y `color-mix`, con un **velo** (oscurece por la izquierda) y un **fundido inferior** hacia `--c-fondo`.

**Rationale**: el usuario quería el ambiente del hero de Claude pero sin márgenes laterales; el test **V-04** prohíbe hex literales fuera del sistema, así que la escena se mapea a la paleta.

**Alternatives considered**:
- *Fondo limitado al marco*: el usuario lo vio como «un margin a los lados»; descartado.
- *Hex de Claude tal cual*: descartado; rompe el test V-04.
- *Horizonte duro + suelo*: descartado; se leía como dos gradientes con un corte.

## R13. Aire y tipografía

**Decision**: se **descarta acortar** la portada; los bloques ganan aire (`padding: var(--esp-6)`). El **cuerpo de texto** de los bloques sube a `--texto-lg` con interlineado **1.5**; los **subtítulos de los pasos** van a interlineado **1.3** y sus **títulos** a `--texto-xl`. El **titular del hero** es grande (`min(22vw, 7rem)`), con el **subtítulo** en versalitas justo debajo (enlace sin subrayado) y el **CTA a todo el ancho**.

**Rationale**: decisiones de revisión del usuario. `min(22vw, 7rem)` da un titular grande sin romper el layout con el zoom al 200 % (el máximo en `rem` no fuerza ancho).

**Alternatives considered**:
- *`clamp(4.75rem, 22vw, 9rem)` de Claude*: descartado; el suelo en `rem` rompía el zoom y el tope era desproporcionado en el marco.
- *Mantener el interlineado holgado (1.65)*: descartado; el usuario lo quería más apretado.
