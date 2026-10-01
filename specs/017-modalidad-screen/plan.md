# Implementation Plan: Pantalla de selección de modalidad y cabecera estable del flujo previo

**Branch**: `017-modalidad-screen` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-modalidad-screen/spec.md`

## Summary

**Objetivo principal**: que el título y el subtítulo de la pantalla de modalidad queden **en la misma posición y con el mismo estilo** (tipografía, tamaño, color y mayúsculas) que los de la creación de personaje; hoy hay ~159 px de desfase. Para lograrlo se extrapola el lenguaje visual de la creación de personaje a la selección de modalidad y variante y se fija una **cabecera anclada arriba con altura natural**. Se centraliza en `Juego.svelte` el marco de pantalla del flujo previo a partida (altura del área de juego) y se comparten clases de layout. La **textura de puntos se retira por completo** del producto (no se muestra en ninguna pantalla, header ni pie). Además, el **header del sitio** pasa a fondo negro plano y anclado arriba (`position: sticky`) en todas las páginas, sin alterar la altura `--alto-cabecera`. Es presentación pura: no se toca `engine` ni `content`.

## Technical Context

**Language/Version**: TypeScript 5.x; Astro 5 + Svelte 5 (runes)

**Primary Dependencies**: sistema de tokens CSS propio (`src/ui/tokens.css` + `tokens.ts`) y `src/ui/base.css`; **sin dependencias nuevas**

**Storage**: N/A (no aplica)

**Testing**: Vitest (unitario) + Playwright (E2E) + `@axe-core/playwright` (accesibilidad)

**Target Platform**: web mobile-first (desde 320 px); ancho máximo del marco en escritorio; build Node 22 en Netlify

**Project Type**: proyecto único Astro con una sola isla Svelte en `/jugar`

**Performance Goals**: 0 kB de JavaScript añadido; páginas estáticas intactas

**Constraints**: no tocar `engine`/`content`; una sola isla; sin scroll ni recorte dentro del bloque (salvo pantallas muy bajas, con fallback); altura estable con `100svh` (sin saltos al scrollear); contraste AA; compatible con `prefers-reduced-motion`

**Scale/Scope**: pantallas de modalidad y variante del flujo previo a partida; cabecera compartida también con la creación de personaje para alinear; ~3 componentes Svelte, tokens y 1 test E2E

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| **I. Motor independiente y determinista** | No se importa ni modifica el motor; todo vive en `src/juego` (UI). | ✅ PASS |
| **II. Contenido como datos, no código** | No se cambian esquemas ni el banco; el subtítulo “Purpurina o plumero” es texto de presentación. | ✅ PASS |
| **III. Verificación determinista y balance por simulación** | No es balance; se añade un test de layout reproducible y `npm run check` debe pasar. | ✅ PASS |
| **IV. Rendimiento y mobile-first** | Solo CSS + tokens; 0 kB JS añadido; mobile-first real desde 320 px; sin dependencias. | ✅ PASS |
| **V. Simplicidad arquitectónica y proyecto único** | Reutiliza la isla existente y el sistema de tokens; sin capas ni paquetes nuevos. | ✅ PASS |

**Resultado**: sin violaciones. No se requiere `Complexity Tracking`.

**Re-evaluación post-diseño (Fase 1)**: la retirada de la textura y el header `sticky` son CSS puro (Principio IV), viven en `web` sin tocar `engine`/`content` (I, II, V) y se verifican con E2E determinista (III). Sigue sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/017-modalidad-screen/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── layout.md        # Contrato de anclajes, clases y ganchos de test
└── tasks.md             # Fase 2 (lo crea /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Header.astro                    # Header negro plano y sticky en todo el sitio (FR-016)
├── juego/
│   ├── Juego.svelte                    # Marco del flujo previo: altura de `main` (sin textura)
│   └── pantallas/
│       ├── CrearPersonaje.svelte       # Usa la cabecera compartida (título + subtítulo)
│       ├── ElegirModalidad.svelte      # Rediseño: subtítulo + tarjetas de opción
│       └── ElegirVariante.svelte       # Mismo lenguaje visual (título + subtítulo)
├── layouts/
│   └── Layout.astro                    # (sin prop `textura`)
├── pages/
│   ├── index.astro                     # (sin textura)
│   └── jugar.astro                     # (sin textura)
├── ui/
│   ├── base.css                        # (sin regla de textura de puntos)
│   ├── tokens.css                      # (sin tokens nuevos)
│   └── tokens.ts                       # (sin tokens nuevos)
tests/
└── e2e/
    └── layout-previo.spec.ts           # NUEVO: alineación de cabecera, ausencia de textura y header sticky
```

**Structure Decision**: proyecto único existente. El cambio se concentra en la isla `src/juego`, `src/components/Header.astro` y la retirada de la textura (`src/ui/base.css`, `Layout.astro` y páginas), más un test E2E nuevo. No se crean carpetas de código nuevas ni dependencias.

## Design

### Cabecera de pantalla estable (núcleo de la feature)

Se comparte un marco de pantalla con la **cabecera anclada arriba** (altura natural) y el **cuerpo justo debajo con un gap fijo**:

- `.pantalla` (la `section`): columna flex, `justify-content: flex-start`, alto del área de juego y padding superior fijo. La cabecera arranca siempre en la misma `y`.
- `.pantalla__cabecera`: `h2` + subtítulo opcional, altura natural (sin hueco reservado).
- `.pantalla__cuerpo`: el formulario o la lista de tarjetas, con `margin-top` fijo (`--esp-5`) respecto a la cabecera.

Como la cabecera está anclada arriba y `main` no la centra, su parte superior cae **siempre en la misma `y`** con independencia del contenido (formulario vs. tarjetas) y del alto de la ventana (incluido el fallback de scroll). Título y subtítulo comparten **el mismo estilo** (tipografía de display, tamaño, color de acento y mayúsculas) en crear, modalidad y variante, de modo que la cabecera es idéntica en sitio y aspecto (objetivo principal, FR-012/FR-013). No se introducen tokens nuevos.

Estas clases se definen como reglas `:global` en `Juego.svelte`, de modo que el CSS de cada cuerpo (p. ej. `section form > input`) siga siendo scoped y funcione.

### Marco del flujo previo (Juego.svelte)

- Generalizar a `crear-personaje | modalidad | variante` el forzado de `main` (`height: calc(100svh - cabecera)`, `min-height: 0`, `flex: 0 0 auto`) que hoy solo aplica a `crear-personaje`, y **anclarlo arriba** (`justify-content: flex-start`) para que su centrado no desplace la cabecera según el contenido (causa del desajuste en ventanas bajas).
- Usar **`100svh`** (con `100vh` de reserva) y no `100dvh`: en móvil `dvh` crece al ocultarse la barra del navegador al scrollear y el bloque de juego saltaba de altura (R10).
- Mantener el fallback `@media (max-height: 719px)` (scroll en pantallas muy bajas) para las pantallas previas a partida.

### Textura de puntos retirada (FR-006, SC-008)

La textura de puntos se elimina por completo:

- Se borra la regla `body.textura-puntos::before` de `src/ui/base.css`.
- Se elimina la prop `textura` de `src/layouts/Layout.astro` y su uso en `src/pages/index.astro` (y `jugar.astro` ya no la usa).
- Se elimina el `$effect` de `Juego.svelte` que activaba la clase en el flujo previo.

No aparece en ninguna pantalla, header ni pie.

**Invariante de test**: `body` **no** tiene la clase `textura-puntos` en portada, intro, flujo previo ni escenas.

### Header negro y anclado en todo el sitio (FR-016, SC-009)

`src/components/Header.astro` (`.site-header`) pasa a:

- `background: var(--c-fondo)` (negro plano, opaco) → sin textura de puntos en ninguna página.
- `position: sticky; top: 0; z-index: 20` → queda anclado arriba y, al hacer scroll, se sobrepone al contenido.
- Se mantiene el `padding`/estructura actual para no alterar su altura.

Al ser **sticky** (no `fixed`), el header sigue ocupando su espacio en el flujo: el `$effect` de `Juego.svelte` que mide `.site-header` y publica `--alto-cabecera` sigue funcionando, y los cálculos `height: calc(100dvh - var(--alto-cabecera))` de `main` no cambian. El `z-index` del header debe quedar por encima del contenido de `main` (que usa `isolation: isolate` y `z-index: -1` en sus escenas) para que el overlay sea visible.

**Invariante de test**: en cualquier página, `.site-header` tiene `position: sticky`, `top: 0` y `background-color` opaco (alfa = 1); al hacer scroll `window.scrollY > 0` el header sigue visible en `top: 0`; y `--alto-cabecera` conserva el valor medido antes del scroll.

### Pantallas

- **Modalidad**: `h2` “Elige modalidad”, subtítulo “Purpurina o plumero”; dos tarjetas de opción (Comparsista, Chirigotero) con el lenguaje visual de las tarjetas de género (superficie, borde, radio, hover), con `strong` (título) + `span` (descripción existente). Se conserva `data-testid="modalidad"` y los `<button>`.
- **Variante**: mismo marco y cabecera, con subtítulo “Elige tu estilo”; opciones como tarjetas con el mismo lenguaje. Se conserva `data-testid="variante"` y el uso con `titulo` (cambio de variante, sin subtítulo).
- **Crear personaje**: se refactoriza para usar la cabecera compartida, sin cambiar su cuerpo ni su comportamiento.
- **Portada (index)**: sin textura; conserva su identidad por tipografía y color.

### Tokens

No se añaden tokens nuevos: la posición fija de la cabecera se consigue con el anclaje de `main`/`.pantalla` y el gap usa `--esp-5`.

### Tests

- Nuevo E2E `layout-previo.spec.ts`: mide `h2` y subtítulo en `crear-personaje`, `modalidad` y `variante` y exige diferencias ≤ 2 px; comprueba ausencia de desborde horizontal a 320 px y que no se recorta contenido.
- E2E de textura (FR-006/SC-008): comprobar que `body` **no** lleva la clase `textura-puntos` en la portada, la intro y el flujo previo.
- E2E de header (FR-016/SC-009): `.site-header` con `position: sticky`, `top: 0` y fondo opaco; al hacer scroll sigue en `top: 0` y `--alto-cabecera` no cambia.
- Se mantienen `jugar`, `chrome`, `layout-estable` y axe.

## Complexity Tracking

> Sin violaciones constitucionales; sección no aplicable.
