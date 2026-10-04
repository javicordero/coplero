---
description: "Task list for feature 026-form-redesign"
---

# Tasks: Formulario del panel: secciones plegables y rediseño

**Input**: Design documents from `/specs/026-form-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-form.md, quickstart.md

**Tests**: No hay tests de componente (no hay herramienta configurada). La validación es `astro check` (compila `.svelte`), `biome check` (`.ts`), `vitest` (sin regresiones) y los escenarios manuales del `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario (US1, US2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1 o US2
- Rutas exactas en cada tarea

## Path Conventions

- Proyecto único: `src/panel-ui/` (componentes Svelte del panel).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el estado de partida y leer los componentes a tocar.

- [x] T001 Ejecutar el baseline: `npx astro check`, `npx biome check .` y `npx vitest run` (anotar; los 2 fallos de `forma-carrera`/T23 son ajenos)
- [x] T002 [P] Leer los componentes del formulario y sus estilos actuales: `src/panel-ui/FormularioSituacion.svelte`, `FormularioCondicional.svelte`, `FormularioOpcion.svelte`, `SelectorFlags.svelte`, `EditorRequisito.svelte` (sin editar)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: El componente reutilizable de sección plegable que usan ambas historias.

**⚠️ CRITICAL**: ninguna historia puede empezar sin esto.

- [x] T003 Crear `src/panel-ui/Seccion.svelte`: `<details>` (sin `open`) + `<summary>` con `titulo`, indicador si `tieneContenido` y contenido por snippet `children`; accesible por teclado y con estado expuesto de forma nativa (per `contracts/ui-form.md`)

**Checkpoint**: existe la sección plegable reutilizable.

---

## Phase 3: User Story 1 - Formulario compacto con secciones plegables (Priority: P1) 🎯 MVP

**Goal**: Las secciones secundarias aparecen plegadas por defecto, con indicador si tienen contenido, sin perder valores.

**Independent Test**: abrir el formulario y comprobar que modalidades/variantes (y flags en la opción) están plegadas; desplegarlas, editarlas, plegarlas, guardar y reabrir (los valores se conservan); ver el indicador cuando hay contenido.

### Implementation for User Story 1

- [x] T004 [US1] En `src/panel-ui/FormularioSituacion.svelte`: envolver **Modalidades** y **Variantes** en `Seccion`, con `tieneContenido` calculado de `borrador.modalidades/variantes` (FR-001, FR-004, FR-005)
- [x] T005 [US1] En `src/panel-ui/FormularioCondicional.svelte`: envolver **Modalidades** y **Variantes** en `Seccion`, con su indicador (FR-001, FR-004, FR-005)
- [x] T006 [US1] En `src/panel-ui/FormularioOpcion.svelte`: envolver el selector de **flags** en `Seccion`, con `tieneContenido` de `opcion.flags` (FR-002, FR-004, FR-005)
- [x] T007 [US1] Verificar que plegar no descarta valores: el contenido de `Seccion` permanece montado y el guardado conserva lo marcado (FR-011); comprobar en el quickstart E2/E4

**Checkpoint**: US1 funcional de forma aislada (plegado + indicador + conservación).

---

## Phase 4: User Story 2 - Rediseño del formulario (Priority: P2)

**Goal**: El formulario tiene una identidad visual propia (paleta y tipografía modernas), claro, sin desbordes y accesible por teclado.

**Independent Test**: abrir el formulario y comprobar que se lee con claridad, que se distingue de las tablas, que no hay desbordes a 360 px y que el foco es visible al navegar con teclado.

### Implementation for User Story 2

- [x] T008 [US2] Definir la identidad nueva del formulario (paleta y **fuentes del sistema**) como CSS dentro de `src/panel-ui/Seccion.svelte` y los formularios; **sin** cargar ficheros de fuente (FR-012, FR-013)
- [x] T009 [P] [US2] Rediseñar `src/panel-ui/FormularioSituacion.svelte`: jerarquía, espaciado, secciones y estados (foco/hover), rejilla responsive (FR-007, FR-008)
- [x] T010 [P] [US2] Rediseñar `src/panel-ui/FormularioCondicional.svelte` con el mismo lenguaje visual (FR-007, FR-008)
- [x] T011 [P] [US2] Rediseñar `src/panel-ui/FormularioOpcion.svelte` (campos, efectos y sección de flags) (FR-007, FR-008)
- [x] T012 [US2] Rediseñar `src/panel-ui/SelectorFlags.svelte` y `src/panel-ui/EditorRequisito.svelte` para encajar en la identidad nueva (FR-007, FR-012)
- [x] T013 [US2] Pasar responsive/foco: sin desbordes a 360 px y foco visible en `summary` y campos (FR-006, FR-008, SC-002, SC-003)

**Checkpoint**: US2 funcional (formulario claro y con identidad propia) sin romper US1.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verificación global y cierre.

- [x] T014 Ejecutar `npx astro check` (0 errores) y `npx biome check .` (limpio); corregir lo introducido
- [x] T015 Ejecutar `npx vitest run` y confirmar que no hay regresiones (salvo los 2 de `forma-carrera`/T23)
- [x] T016 Ejecutar los escenarios `quickstart.md` E1–E7 (plegado, indicador, conservación, condicional, teclado, móvil)
- [x] T017 Revisión final de `git status`/`git diff` (solo `src/panel-ui/**` y specs 026; sin tocar tablas ni detalle); **no commitear** sin petición explícita

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup; BLOQUEA US1 y US2 (`Seccion.svelte`).
- **US1 (Fase 3)**: depende de Foundational.
- **US2 (Fase 4)**: depende de Foundational; **edita los mismos componentes que US1**, así que va **después** de US1 (secuenciar).
- **Polish (Fase 5)**: depende de US1 y US2.

### User Story Dependencies

- **US1 (P1)**: plegado + indicador (independiente y testeable).
- **US2 (P2)**: rediseño; comparte ficheros con US1 (secuenciar US1 → US2).

### Parallel Opportunities

- Setup: T002.
- US2: T009/T010/T011 son ficheros distintos, pero comparten el lenguaje visual de T008; se pueden paralelizar tras T008.

---

## Parallel Example: User Story 2

```bash
# Tras T008 (identidad definida), los formularios son ficheros distintos:
Task: "T009 Rediseñar FormularioSituacion.svelte"
Task: "T010 Rediseñar FormularioCondicional.svelte"
Task: "T011 Rediseñar FormularioOpcion.svelte"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup → Foundational (`Seccion.svelte`) → US1.
2. **STOP and VALIDATE**: secciones plegadas, indicador, valores conservados.
3. US1 ya reduce el alto del formulario.

### Incremental Delivery

1. Foundational + US1 → plegado e indicador.
2. US2 → identidad nueva y rediseño.
3. Polish → `astro check` + `biome` + `vitest` + quickstart.

### Notes

- Es un cambio **solo de presentación**: no tocar modelo, validación ni motor (FR-009).
- El contenido de `Seccion` **no se desmonta** al plegar (FR-011): usar `<details>` y renderizar el contenido siempre.
- No rediseñar `TablasMomentos`, `DetalleSituacion` ni `DetalleCondicional` (FR-007).
- Sin dependencias nuevas ni ficheros de fuente (FR-010, FR-013).
- No commitear sin petición explícita.
