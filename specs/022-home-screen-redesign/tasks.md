---

description: "Task list — Rediseño de la portada al estilo del juego + contenido del ejemplo"
---

# Tasks: Rediseño de la portada al estilo del juego

**Input**: Design documents from `/specs/022-home-screen-redesign/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Per the Coplero constitution (Principle III), engine and content changes MUST include deterministic tests; E2E tests are OPTIONAL unless explicitly requested in the feature specification. Esta feature es de UI estática y de fixtures de presentación: se incluyen las tareas de test necesarias para verificar el contrato de la portada, la validez de las fixtures y las invariantes de 0 kB de JS.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/`, `docs/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No hay inicialización de proyecto; se fija el baseline de la portada y de las fixtures, y se confirma que no se añaden dependencias.

- [X] T001 Revisar el baseline en `src/pages/index.astro`, `src/ui/tokens.css`, `src/components/ReglaCompas.svelte`, `src/juego/Tarjeta.svelte`, `src/landing/ejemploTarjeta.ts`, `src/juego/dev/fixturesFin.ts` y `tests/e2e/landing.spec.ts`, y confirmar que el trabajo no requiere dependencias, tokens ni assets nuevos (research.md R1, R6)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base de estilo común que reutilizan la apertura y el ejemplo; debe estar antes de las historias.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Añadir en el bloque `<style>` de `src/pages/index.astro` las reglas locales compartidas del lenguaje del juego: títulos en `var(--fuente-display)` mayúsculas con sombra dura (`3px 3px 0 var(--c-superficie)`), superficies con `--c-superficie`/`--c-separador`/`--c-borde-control`, radios, `box-shadow` y acento `--c-acento` (research.md R1)
- [X] T003 Conservar en `src/pages/index.astro` los anclajes y selectores observables del contrato: `#que-es`, `[data-testid="tarjeta"]` y el CTA `a[href="/jugar"]` (contracts/ui.md §1, §3); eliminar de `.bloque` el filete `border-top` que corta apertura y explicativo (research.md R2)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Entender y empezar desde una portada coherente con el juego (Priority: P1) 🎯 MVP

**Goal**: Apertura breve (h1 + frase + CTA + micro) y bloque explicativo compacto (h2 + explicación + 4 pasos) con continuidad visual y el lenguaje de las pantallas del juego.

**Independent Test**: Abrir `/` sin JavaScript y comprobar: h1 «Coplero», CTA «Empezar a jugar» visible sin scroll y hacia `/jugar`, bloque `#que-es` con h2 y exactamente 4 `li`, todo con tipografía display mayúsculas y mismas superficies que `/jugar`.

### Implementation for User Story 1

- [X] T004 [US1] Rediseñar y **estilar** la apertura (hero) en `src/pages/index.astro`: `eyebrow`, h1 display, claim, CTA «Empezar a jugar» y **referencia a Acordes Gaditanos**; arranca más abajo y con más aire (`min-height`), **sin** el micro (revisión de 2026-10-04) (spec.md FR-002, FR-013, FR-007)
- [X] T005 [US1] Reestilizar el bloque explicativo `#que-es` en `src/pages/index.astro`: h2 «Qué es Coplero y cómo funciona» con el lenguaje del juego, **un** párrafo, la lista `PASOS` (4 pasos como h3, **sin subtítulos**) y el ornamento; sin filete de corte respecto a la apertura. La mención a acordesgaditanos pasa al hero (revisión de 2026-10-04) (spec.md FR-004, FR-005, FR-007, FR-009)
- [X] T006 [US1] Verificar en `src/pages/index.astro` la jerarquía semántica: un único `h1` («Coplero»), `h2` en el bloque explicativo y `h3` en cada paso, y que todo CTA apunta a `/jugar` (spec.md FR-002; contracts/ui.md §1, §3)

### Tests for User Story 1

- [X] T007 [P] [US1] Actualizar `tests/e2e/landing.spec.ts` para asegurar el CTA principal en viewport (360×640) con `href="/jugar"`, `#que-es` visible con 4 `li` y el `h1` «Coplero» (contracts/ui.md §1, §3)

**Checkpoint**: User Story 1 funcional y verificable de forma independiente (MVP)

---

## Phase 4: User Story 2 - Ver una tarjeta final de ejemplo (Priority: P2)

**Goal**: El bloque del ejemplo muestra la tarjeta final realzada con el lenguaje del juego y con la **nueva carrera** (2027–2040, 2 agujas de oro y 1 coplas por Andalucía), en la portada y en el modo dev.

**Independent Test**: Recorrer `/` y comprobar que `[data-testid="tarjeta"]` se ve con 7 hitos de trayectoria y 3 rosetas de distinciones, dentro de una superficie con el estilo del juego, con su h2 y su `ReglaCompas`; y que `EJEMPLO_TARJETA` y `fixturesFin` son fixtures válidas.

### Implementation for User Story 2

- [X] T008 [US2] Reestilizar el bloque `#ejemplo` en `src/pages/index.astro`: h2 «Tu tarjeta final», frase, contenedor realzado con superficie/borde/sombra alrededor de `Tarjeta` y CTA final, conservando el `ReglaCompas` del bloque (spec.md FR-006, FR-009; research.md R1, R4)
- [X] T009 [P] [US2] Actualizar `EJEMPLO_TARJETA` en `src/landing/ejemploTarjeta.ts` a la carrera 2027–2040: progresión 2027/2029/2032/2035; podio 2037, primer premio 2038 y podio 2040; agujas ×2 (2036, 2039) y coplas ×1 (2034); mejor puesto 1; 3 hitos (spec.md FR-019, FR-020; data-model.md)
- [X] T010 [P] [US2] Actualizar el caso `CAMPEON` en `src/juego/dev/fixturesFin.ts` con la **misma** carrera nueva (spec.md FR-019, FR-020; data-model.md)
- [X] T011 [US2] Verificar que `src/landing/ejemploTarjeta.ts` recalcula `CODIGO_EJEMPLO` sin cambios de código y que la imagen OG de `/` (`src/pages/index.astro`) se compone desde el nuevo código (no se sube `VERSION_OG`) (research.md R11; contracts/ui.md §6)

### Tests for User Story 2

- [X] T012 [P] [US2] Crear `src/landing/__tests__/ejemploTarjeta.test.ts` que valide `EJEMPLO_TARJETA`: 3 hitos, `veces` = años, progresión 2027→2035, mejor puesto 1 y round-trip del códec (data-model.md V-11…V-15)
- [X] T013 [US2] Ampliar `tests/e2e/landing.spec.ts` para comprobar el ejemplo nuevo: `[data-testid="tarjeta-premios"]` con 7 `.hito`, `[data-testid="tarjeta-distinciones"]` con 3 `.roseta` y `[data-testid="tarjeta-mejor-posicion"][data-tono="oro"]` (contracts/ui.md §6)

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Portada breve y sin adornos redundantes (Priority: P3)

**Goal**: Retirar el compás del bloque explicativo, sustituirlo por un ornamento tipográfico decorativo y acortar la parte superior (apertura + explicación).

**Independent Test**: Recorrer `/` y comprobar que en `#que-es` no hay `svg.regla-compas` sino un `[data-separador]` decorativo, que no falta información (4 pasos y explicación) y que apertura + explicación son más cortas.

### Implementation for User Story 3

- [X] T014 [US3] Retirar el uso de `ReglaCompas` **solo** en el bloque explicativo de `src/pages/index.astro` (mantener el import y su uso en `#ejemplo`) (spec.md FR-003; research.md R4)
- [X] T015 [US3] Añadir en `src/pages/index.astro` el ornamento tipográfico decorativo sobre el h2 del bloque explicativo: elemento `aria-hidden="true"` con marcador `data-separador` y glifos resueltos por CSS en `--c-acento`, sin texto accesible ni SVG nuevo (spec.md FR-003; research.md R3; contracts/ui.md §1)
- [X] T016 [US3] Ajustar el espaciado en `src/pages/index.astro`: dar más aire entre bloques y arrancar el hero más abajo. **Se descarta el objetivo de acortar** (revisión de 2026-10-04: la portada se alarga por decisión del usuario) (spec.md FR-010; SC-003; research.md R5)

### Tests for User Story 3

- [X] T017 [US3] Ampliar `tests/e2e/landing.spec.ts` para verificar que en `#que-es` no existe `svg.regla-compas` y sí un `[data-separador]`, y que se conservan los 4 pasos y la explicación (contracts/ui.md §2; data-model.md V-03, V-04)

**Checkpoint**: Las tres historias son funcionales de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Registro de decisión, invariantes y validación final.

- [X] T018 [P] Matizar en `docs/registro/decisiones-cerradas.md` la fila «Elemento firma · regla de compás»: el compás deja de estar en la portada y se sustituye por un ornamento tipográfico (2026-10-04, feature 022), conservándose en cabecera y pie de tarjeta (research.md R8; data-model.md V-10)
- [X] T019 [P] Revisar `src/landing/__tests__/estatico.test.ts` para confirmar que sigue cubriendo `src/pages/index.astro` sin `client:` ni `<script>` (0 kB de JS) (data-model.md V-01; contracts/ui.md §5)
- [X] T020 [P] Revisar `src/juego/__tests__/fixturesFin.test.ts` y confirmar que sigue verde con el caso `campeon` actualizado (3 hitos + códec) (data-model.md V-12, V-15)
- [X] T021 Ejecutar `npm run check` y la validación de `specs/022-home-screen-redesign/quickstart.md`: axe WCAG 2.2 AA, sin scroll horizontal a 320 px ni al 200 %, objetivos ≥44 px, foco visible y reduced-motion (contracts/ui.md §5)
- [X] T022 [P] Revisar `specs/022-home-screen-redesign/quickstart.md` y `specs/022-home-screen-redesign/contracts/ui.md` y actualizar cualquier selector o paso que haya cambiado durante la implementación

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; puede empezar de inmediato.
- **Foundational (Phase 2)**: depende de Setup; **bloquea** todas las historias.
- **User Stories (Phase 3+)**: dependen de Foundational. US1 → US2 → US3 en orden de prioridad (US1, US2·T008 y US3 editan `src/pages/index.astro`, así que no conviene paralelizar esas tareas entre sí).
- **Polish (Phase 6)**: depende de que las historias deseadas estén completas.

### User Story Dependencies

- **US1 (P1)**: tras Foundational; sin dependencias de otras historias. **MVP**.
- **US2 (P2)**: tras Foundational. Sus tareas de **contenido** (T009, T010) son independientes de la portada y pueden hacerse en paralelo; la de estilo (T008) comparte `index.astro` con US1 y va después.
- **US3 (P3)**: tras Foundational; comparte `index.astro` con US1/US2, por lo que va después.

### Within Each User Story

- Implementación antes que su test de E2E asociado.
- La jerarquía semántica (T006) se verifica tras rediseñar la apertura y el bloque explicativo.
- Cada historia debe quedar verificable de forma independiente antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- T009 (`src/landing/ejemploTarjeta.ts`) y T010 (`src/juego/dev/fixturesFin.ts`) son ficheros distintos y paralelizables entre sí.
- T012 (test unit nuevo) es independiente y paralelizable una vez fijado el contenido de T009/T010.
- T007, T013 y T017 editan el mismo `tests/e2e/landing.spec.ts`: no son paralelizables entre sí.
- T018 (`docs/registro/`), T019 (`src/landing/__tests__/estatico.test.ts`), T020 (`src/juego/__tests__/fixturesFin.test.ts`) y T022 (`specs/022-...`) son ficheros distintos y paralelizables.

---

## Parallel Example: Contenido del ejemplo (US2)

```bash
# Ficheros distintos, en paralelo:
Task: "T009 Actualizar EJEMPLO_TARJETA en src/landing/ejemploTarjeta.ts"
Task: "T010 Actualizar CAMPEON en src/juego/dev/fixturesFin.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Fase 1: Setup.
2. Completar Fase 2: Foundational (CRÍTICA).
3. Completar Fase 3: US1.
4. **PARAR Y VALIDAR**: probar US1 de forma independiente (`npm run test:e2e -- landing`).
5. Desplegar/demostrar si está listo.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → verificar → demo (MVP).
3. US2 (estilo del ejemplo + fixtures nuevas + tests) → verificar → demo.
4. US3 → verificar → demo.
5. Polish (registro + `npm run check`).

---

## Notes

- [P] tasks = ficheros distintos, sin dependencias.
- La implementación principal de la portada vive en `src/pages/index.astro`; las fixtures de ejemplo, en `src/landing/ejemploTarjeta.ts` y `src/juego/dev/fixturesFin.ts`.
- No se toca `engine` ni `content`; la portada sigue a 0 kB de JS.
- No se sube `VERSION_OG`: el cambio de contenido ya cambia la URL de la imagen OG de `/` (research.md R11).
- Evitar: tareas vagas, conflictos en el mismo fichero y dependencias entre historias que rompan la independencia.

---

## Notas de revisión (2026-10-04)

Tras la revisión del usuario en el navegador, se ajustó la implementación:

- **Se mantiene el ornamento** (`///`) y el compás sigue fuera del bloque explicativo. **Además, el compás se retira también del bloque de ejemplo**: la portada no conserva ningún compás y ambos bloques usan el ornamento (revisión de 2026-10-04).
- **Más aire**: bloques con separación medida y hero con `min-height` (arranca más abajo). **Se descarta acortar** la portada.
- **Hero estilizado** (entrada principal): `eyebrow`, h1 display con sombra, subtítulo «Del creador de Acordes Gaditanos» en versalitas bajo el título, claim y **CTA a todo el ancho**. El hero **llena la primera pantalla** (`100svh − cabecera`) con un **fondo nocturno a sangre** (navy/índigo de la paleta + velo y fundido inferior); el contenido va dentro del marco de 680 px (revisión de 2026-10-04).
- **Texto**: se quita el micro «Gratis y sin registro · unos minutos»; se quita el 2.º párrafo de `#que-es`; el 1.º pasa a «Coplero es un juego narrativo sobre el Carnaval de Cádiz. Crea tu personaje y, año tras año, decides en verano qué preparar y en febrero cómo jugártela en el concurso».
- **Pasos**: los 4 bloques conservan número, título y **subtítulo**.
- **Corrección**: `.marco { overflow: hidden }` en `src/pages/index.astro` evita el scroll horizontal al 200 % (E-08) provocado por el carril de la trayectoria durante el primer render.
- **Tipografía**: titular del hero `min(22vw, 7rem)`; subtítulo del hero en versalitas (enlace sin subrayado, en tono terciario); cuerpo de los bloques a `--texto-lg` con interlineado 1.5; **subtítulos de los pasos a 1.3**; títulos a `--texto-xl`.
- **Textos finales**: se reescribieron los subtítulos de los 4 pasos (`src/sitio/contenido.ts`) y la descripción de «Tu tarjeta final» (`src/pages/index.astro`).
- **Fondo del hero**: los hex de Claude rompían el test **V-04**; la escena se mapea a tokens (`--c-invierno-nube`, `--c-carnaval-violeta`, `--c-invierno-luna`) con `color-mix`, velo y fundido inferior.
