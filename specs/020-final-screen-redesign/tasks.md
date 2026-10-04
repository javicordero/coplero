---

description: "Task list for feature 020-final-screen-redesign (palmarés)"
---

# Tasks: Rediseño de la pantalla final como palmarés

**Input**: Design documents from `/specs/020-final-screen-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: Feature de presentación (el motor solo añade `hitosProgreso`). Se incluyen tareas de test porque los criterios de éxito (SC-001…SC-008) exigen verificación y porque hay specs E2E existentes que cambian con el rediseño. Playwright arranca `astro dev`, así que `/jugar?dev=fin` es utilizable en los tests.

**Organization**: Tareas agrupadas por historia de usuario (US1 palmarés, US2 estética, US3 acciones).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1 / US2 / US3 (solo en fases de historia)
- Cada tarea incluye la ruta exacta de fichero

## Path Conventions

- Proyecto único: `src/`, `tests/` en la raíz.

---

## Phase 1: Setup

**Purpose**: Confirmar la línea base antes de rehacer la pantalla.

- [X] T001 Ejecutar `npm run check` (`package.json`) y confirmar que la línea base está en verde.
- [X] T002 [P] Con `npm run dev`, abrir `/jugar?dev=fin` y sus casos (`campeon`, `retirada`, `sin-premios`) según `src/juego/dev/fixturesFin.ts`; anotar el estado actual.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dejar disponibles los helpers y el texto que usan las historias.

**⚠️ CRITICAL**: Debe completarse antes de US1.

- [X] T003 Añadir en `src/juego/presentacion.ts` el helper `premiosCronologicos(logros)` (orden por año) y la constante de la **frase de cierre** por defecto («La copla termina. La historia queda.»).

**Checkpoint**: helpers y frase listos.

---

## Phase 3: User Story 1 - Ver el palmarés de la carrera (Priority: P1) 🎯 MVP

**Goal**: La tarjeta muestra identidad, mejor posición, **línea temporal vertical** de premios, **colección de cajas** de distinciones y **frase de cierre**.

**Independent Test**: `/jugar?dev=fin` muestra la línea temporal (una fila por año con premio, cronológica), las cajas de distinciones y la frase; no aparecen los bloques retirados.

### Tests for User Story 1

- [X] T004 [P] [US1] Reescribir `tests/e2e/pantalla-final.spec.ts`: línea temporal (una fila por año con premio, orden cronológico, sin años sin premio), **1º en dorado** y 2º/3º atenuados, distinciones como rosetas (una por victoria), frase de cierre presente, ausencia de bloques retirados, 320 px y axe.
- [X] T005 [P] [US1] Añadir tests unitarios de `premiosCronologicos` y de la frase en `src/juego/__tests__/presentacion.test.ts` (escribir primero; deben fallar).

### Implementation for User Story 1

- [X] T006 [US1] Reescribir la sección de premios de `src/juego/Tarjeta.svelte` como **línea temporal vertical** (`<ol>` con `año · nodo · puesto`, cronológica, `--primero`/`data-puesto="1"` en dorado) y retirar la constante `ORDEN_PREMIOS` y sus helpers.
- [X] T007 [US1] Reescribir la sección de distinciones de `src/juego/Tarjeta.svelte` como **colección de rosetas** (una por victoria, SVG propio por premio, agrupadas por tipo), todas al mismo peso.
- [X] T008 [US1] Añadir la **frase de cierre** (`data-testid="frase-cierre"`) antes de los botones en `src/juego/pantallas/FinCarrera.svelte`.

**Checkpoint**: US1 verificable en `/jugar?dev=fin`.

---

## Phase 4: User Story 2 - Palmarés elegante y coherente (Priority: P2)

**Goal**: Composición vertical y aireada sobre negro, sin panel de formulario; dorado solo en el 1º premio; separadores ornamentales sutiles; fondo neutro.

**Independent Test**: comparar con el resto de pantallas (identidad, aire, sin formulario/dashboard); revisar 320 px; fondo neutro en `fin`.

### Tests for User Story 2

- [X] T009 [P] [US2] Ampliar `tests/e2e/pantalla-final-fondo.spec.ts`: `fin` sin fondo estacional, antetítulo fuera de la tarjeta y ausencia de rasgos de panel de formulario (p. ej. sin `box-shadow` de formulario en la tarjeta).

### Implementation for User Story 2

- [X] T010 [US2] Reestilizar `src/juego/Tarjeta.svelte` y `src/juego/pantallas/FinCarrera.svelte`: retirar el lenguaje de panel de formulario, composición vertical y aireada, separadores ornamentales sutiles, dorado solo en el 1º premio, conservando fuentes y tokens.
- [X] T011 [US2] Verificar/ajustar el fondo neutro en `fin` en `src/juego/Juego.svelte` (`data-momento=""`, sin `FondoVerano`/`FondoFebrero`).

**Checkpoint**: US1 y US2 verificables por separado.

---

## Phase 5: User Story 3 - Seguir compartiendo la carrera (Priority: P3)

**Goal**: Se mantienen Compartir, Imagen 9:16 y Empezar de nuevo; sin copiar texto/1:1/enlace.

**Independent Test**: la pantalla ofrece solo esas tres acciones; el enlace se obtiene por `data-codigo` y `/r/<codigo>` reproduce el palmarés.

### Tests for User Story 3

- [X] T012 [US3] Actualizar `tests/e2e/compartir.spec.ts`: acciones conservadas presentes y retiradas ausentes, reproducción del enlace por `data-codigo` y axe en `fin` y `/r/[codigo]`.

### Implementation for User Story 3

- [X] T013 [US3] Confirmar en `src/juego/pantallas/FinCarrera.svelte` las acciones **Compartir**, **Imagen 9:16** y **Empezar de nuevo** (y la ausencia de las retiradas), conservando el aviso accesible.

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Limpieza y verificación final.

- [X] T014 [P] Retirar helpers/imports sin uso tras el rediseño (`src/juego/presentacion.ts`, `src/juego/Tarjeta.svelte`).
- [X] T015 Ejecutar `npm run check` (`package.json`) y corregir cualquier fallo.
- [X] T016 [P] Ejecutar las specs afectadas: `npx playwright test tests/e2e/pantalla-final.spec.ts tests/e2e/pantalla-final-fondo.spec.ts tests/e2e/compartir.spec.ts`.
- [X] T017 Validar los escenarios de `specs/020-final-screen-redesign/quickstart.md` (palmarés, línea temporal, rosetas, frase, estética, acciones y coherencia en portada y `/r`).

---

## Phase 7: Imagen OG espejo del palmarés y ajustes finales

**Goal**: la imagen compartible (9:16, apaisado y 1:1) replica el palmarés; la caché queda versionada; la pantalla final se centra y la acción de imagen se renombra.

**Independent Test**: pedir `/api/og/<codigo>.png` en los tres formatos y comprobar firma PNG y dimensiones; usar el botón «Descargar imagen» desde la pantalla final; comprobar el centrado de la isla y de `/r`.

- [X] T018 [US3] Reescribir `src/pages/api/og/[codigo].png.ts` para calcar `Tarjeta.svelte`: identidad, mejor posición (ordinal 0.4em/0.55em), trayectoria (rejilla 1rem/0.9rem/1rem, nodo 0.7rem, halos y carril de borde a borde) y distinciones (rosetas agrupadas), con los títulos de sección en Anton y el pie de marca dentro de la tarjeta. Todo en `rem`, escalado por formato (`og` 1.35 apaisado, `9x16` 2.7, `1x1` 1.5).
- [X] T019 [US3] Añadir `VERSION_OG` y `urlImagenOg()` en `src/juego/presentacion.ts` y usarlos en `src/pages/index.astro`, `src/pages/r/[codigo].astro` y `src/juego/pantallas/FinCarrera.svelte` (URL versionada `?v=`).
- [X] T020 [US3] Renombrar la acción de imagen a **«Descargar imagen»** en `src/juego/pantallas/FinCarrera.svelte`.
- [X] T021 [US2] Centrar verticalmente el palmarés: `main[data-pantalla="fin"]` en `src/juego/Juego.svelte` y `.resultado` de `src/pages/r/[codigo].astro`.
- [X] T022 [P] [US3] Añadir a `tests/e2e/compartir.spec.ts` la verificación del endpoint OG en los tres formatos (status, `image/png`, firma PNG y dimensiones).
- [X] T023 Actualizar `specs/007-final-card/contracts/rutas.md` (contenido espejo y caché versionada) y `docs/02` §10 / `docs/registro/decisiones-cerradas.md`.

**Checkpoint**: la imagen descargada y la previsualización del enlace reproducen el palmarés; `npm run check` y el E2E de compartir en verde.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup; bloquea US1.
- **US1 (Fase 3)**: depende de Fase 2.
- **US2 (Fase 4)**: puede empezar tras Setup; comparte ficheros con US1 (`Tarjeta.svelte`, `FinCarrera.svelte`) → ejecutar después de US1 o coordinadamente.
- **US3 (Fase 5)**: depende de Fase 2; `compartir.spec.ts` es independiente.
- **Polish (Fase 6)**: depende de las historias entregadas.
- **Imagen OG (Fase 7)**: depende de US1/US2 (el palmarés que se calca) y de US3 (la acción de descarga); se puede cerrar de forma independiente al resto.

### Within Each User Story

- Tests antes de implementar (deben fallar primero).
- T003 antes de US1.
- T006/T007 antes de T010 (reestilizado).

### Parallel Opportunities

- T002 con T001.
- T004 y T005 (ficheros distintos).
- T009 con T004/T005 (fichero distinto).
- T012 con US1/US2 (fichero distinto).
- T014 y T016 en Polish.

## Parallel Example: User Story 1

```text
Task: "Reescribir tests/e2e/pantalla-final.spec.ts (T004)"
Task: "Añadir tests unitarios en src/juego/__tests__/presentacion.test.ts (T005)"
```

## Implementation Strategy

### MVP First (User Story 1)

1. Fase 1 (Setup) + Fase 2 (Foundational).
2. Fase 3 (US1): línea temporal + rosetas + frase + tests.
3. **Parar y validar** US1 en `/jugar?dev=fin`.

### Incremental Delivery

1. US1 → palmarés con contenido y estructura.
2. US2 → estética elegante/aireada y fondo neutro.
3. US3 → acciones definitivas.
4. Fase 6 → limpieza y verificación global.

## Notes

- `[P]` = ficheros distintos, sin dependencias pendientes.
- No tocar `content`; el motor solo añade `hitosProgreso`. El endpoint OG **ahora es espejo del palmarés** (Fase 7), no una pieza aparte.
- Se retira el lenguaje de panel de formulario y las antiguas «opciones de lista» de premios.
- `npm run check` es la puerta de calidad final.
