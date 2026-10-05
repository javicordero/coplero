---
description: "Task list for feature 027-panel-redesign"
---

# Tasks: Rediseño integral del panel de contenido

**Input**: Design documents from `/specs/027-panel-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-panel.md, quickstart.md

**Tests**: No hay tests de componente (no hay herramienta configurada). La validación es `astro check` (compila `.svelte`), `biome check` (`.ts`), `vitest` (sin regresiones) y los escenarios manuales del `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario (US1, US2, US3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1, US2 o US3
- Rutas exactas en cada tarea

## Path Conventions

- Proyecto único: `src/pages/panel.astro` y `src/panel-ui/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el estado de partida y leer los componentes a tocar.

- [x] T001 Ejecutar el baseline: `npx astro check`, `npx biome check .` y `npx vitest run` (anotar; los 2 fallos de `forma-carrera`/T23 son ajenos)
- [x] T002 [P] Leer los componentes a rediseñar y sus estilos: `src/panel-ui/Panel.svelte`, `TablasMomentos.svelte`, `DetalleSituacion.svelte`, `DetalleCondicional.svelte`, y los del formulario (`Seccion`, `Formulario*`, `SelectorFlags`, `EditorRequisito`) (sin editar)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: La capa de identidad compartida que consumen todas las historias.

**⚠️ CRITICAL**: ninguna historia puede empezar sin esto.

- [x] T003 Crear `src/panel-ui/estilos.css`: tokens `--panel-*` (primary, primary-hover, surface, border, text, muted, hover, danger, radius, gap) en `:root` + base (fondo de página, color, tipografía del sistema), per `contracts/ui-panel.md`
- [x] T004 Importar `src/panel-ui/estilos.css` en `src/pages/panel.astro` (estilo global de la única página del panel)

**Checkpoint**: existe la identidad única y se carga globalmente.

---

## Phase 3: User Story 1 - Identidad visual unificada (Priority: P1) 🎯 MVP

**Goal**: Los componentes del formulario (rediseñados en la 026) consumen la identidad compartida en vez de sus propias variables.

**Independent Test**: cambiar un token en `estilos.css` y comprobar que el formulario lo refleja; que ningún componente redefine la identidad.

### Implementation for User Story 1

- [x] T005 [US1] En `src/panel-ui/Seccion.svelte`: usar `var(--panel-*)` y eliminar las definiciones locales `--f-*` (FR-001, FR-002)
- [x] T006 [P] [US1] En `src/panel-ui/FormularioSituacion.svelte`: quitar la definición local `--f-*` del `form` y usar `var(--panel-*)`
- [x] T007 [P] [US1] En `src/panel-ui/FormularioCondicional.svelte`: igual que T006
- [x] T008 [P] [US1] En `src/panel-ui/FormularioOpcion.svelte`: usar `var(--panel-*)` (incluido el bloque de efectos)
- [x] T009 [P] [US1] En `src/panel-ui/SelectorFlags.svelte`: usar `var(--panel-*)`
- [x] T010 [P] [US1] En `src/panel-ui/EditorRequisito.svelte`: usar `var(--panel-*)`

**Checkpoint**: US1 funcional de forma aislada (identidad compartida por el formulario).

---

## Phase 4: User Story 2 - Estructura del panel reconfigurada (Priority: P1)

**Goal**: Carcasa rediseñada con la identidad y con foco en móvil.

**Independent Test**: la cabecera, el conmutador y las acciones se distinguen; en móvil la cabecera se apila sin desbordes; los estados (carga/error/vacío) se ven bien.

### Implementation for User Story 2

- [x] T011 [US2] Rediseñar `src/panel-ui/Panel.svelte` con `var(--panel-*)`: cabecera (título + contador), conmutador de vista con estado activo, acción principal y estados de carga/error/vacío (FR-003, FR-007)
- [x] T012 [US2] En `src/panel-ui/Panel.svelte`: cabecera **apilada en móvil** (título/contador y acciones/conmutador a ancho completo) y una fila en escritorio; eliminar el `:global(body)` (el fondo pasa a `estilos.css`) (FR-003, FR-006)

**Checkpoint**: US2 funcional de forma aislada (carcasa y móvil).

---

## Phase 5: User Story 3 - Listados y detalle rediseñados (Priority: P2)

**Goal**: Tablas y vistas de detalle con la identidad común; tablas con scroll interno en móvil.

**Independent Test**: abrir un listado (sin desbordes; la tabla se desplaza dentro de su contenedor a 360 px) y un detalle (identidad común, jerarquía clara).

### Implementation for User Story 3

- [x] T013 [US3] Rediseñar `src/panel-ui/TablasMomentos.svelte`: identidad común + envolver cada `<table>` en un contenedor con `overflow-x: auto` (scroll interno) (FR-004, FR-006)
- [x] T014 [P] [US3] Rediseñar `src/panel-ui/DetalleSituacion.svelte` con `var(--panel-*)` (FR-005)
- [x] T015 [P] [US3] Rediseñar `src/panel-ui/DetalleCondicional.svelte` con `var(--panel-*)` (FR-005)

**Checkpoint**: US3 funcional de forma aislada (listados y detalle).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación global y cierre.

- [x] T016 Ejecutar `npx astro check` (0 errores) y `npx biome check .` (limpio); corregir lo introducido
- [x] T017 Ejecutar `npx vitest run` y confirmar que no hay regresiones (salvo los 2 de `forma-carrera`/T23)
- [x] T018 Ejecutar los escenarios `quickstart.md` E1–E8 (identidad, tokens, carcasa, estados, tablas móvil, detalle, teclado, el juego no cambia)
- [x] T019 Revisión final de `git status`/`git diff`: solo `src/pages/panel.astro` y `src/panel-ui/**` (el juego no se toca); **no commitear** sin petición explícita

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup; BLOQUEA US1–US3 (tokens).
- **US1 (Fase 3)**: depende de Foundational.
- **US2 (Fase 4)**: depende de Foundational; toca `Panel.svelte` (independiente de US1/US3).
- **US3 (Fase 5)**: depende de Foundational; toca tablas y detalle (independiente de US1/US2).
- **Polish (Fase 6)**: depende de US1–US3.

### User Story Dependencies

- **US1 (P1)**: identidad en el formulario.
- **US2 (P1)**: carcasa.
- **US3 (P2)**: listados y detalle.
- US1, US2 y US3 tocan **ficheros distintos** (formulario / carcasa / tablas+detalle): pueden ir en paralelo tras Foundational.

### Parallel Opportunities

- Setup: T002.
- US1: T006–T010 (componentes distintos).
- US3: T014 y T015 (detalle situación / condicional).
- US2 (T011/T012) es el mismo fichero: secuencial.

---

## Parallel Example: User Story 1

```bash
Task: "T006 FormularioSituacion.svelte usa --panel-*"
Task: "T007 FormularioCondicional.svelte usa --panel-*"
Task: "T008 FormularioOpcion.svelte usa --panel-*"
Task: "T009 SelectorFlags.svelte usa --panel-*"
Task: "T010 EditorRequisito.svelte usa --panel-*"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup → Foundational (tokens) → US1.
2. **STOP and VALIDATE**: el formulario usa la identidad compartida y un cambio de token se propaga.
3. US2 y US3 extienden la identidad al resto del panel.

### Incremental Delivery

1. Foundational + US1 → identidad compartida (formulario).
2. US2 → carcasa rediseñada y móvil.
3. US3 → listados y detalle.
4. Polish → `astro check` + `biome` + `vitest` + quickstart.

### Notes

- Es un cambio **solo de presentación**: no tocar comportamiento, motor ni contenido (FR-009).
- **Un único lugar** para la identidad (`estilos.css`); ningún componente redefine tokens (FR-002).
- Las tablas usan **scroll interno** en móvil; la página no desborda (FR-004/FR-006).
- **No tocar** el juego (`/jugar`) ni las páginas públicas (FR-011).
- No commitear sin petición explícita.
