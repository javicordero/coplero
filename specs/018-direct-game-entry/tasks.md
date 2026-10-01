---
description: "Task list for feature 018-direct-game-entry"
---

# Tasks: Entrada directa al juego y reanudación solo cuando hay partida en curso

**Input**: Design documents from `/specs/018-direct-game-entry/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/estado.md, quickstart.md

**Tests**: Incluidos. El plan define tests unitarios de enrutado (Vitest) y E2E (Playwright); además hay que **actualizar** tests existentes que asumen la pantalla intermedia (`intro`, `empezar`, `aviso`).

**Organization**: Tareas agrupadas por historia de usuario. Cada historia es un incremento verificable de forma independiente.

**Remediación**: esta versión incorpora los hallazgos del análisis (`carrera-completa.spec.ts`, tests con `aviso`, bucle de `layout-previo.spec.ts`, caso sin almacenamiento y verificación de la portada estática).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ir en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1, US2, US3 (ver `spec.md`)
- Rutas de fichero exactas en cada tarea

## Path Conventions

Proyecto único: `src/` y `tests/` en la raíz del repo (ver `plan.md`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el punto de partida antes de tocar código.

- [X] T001 Verificar que la base está verde ejecutando `npm run check` en la raíz del repo y anotar el resultado

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refactor mecánico compartido por las tres historias (renombrado y retirada del aviso). **No** fija aún el enrutado definitivo.

**⚠️ CRITICAL**: Ninguna historia puede darse por terminada hasta completar esta fase.

- [X] T002 [P] Eliminar la constante `AVISO_GUARDADO_DESCARTADO` y sus usos en `src/juego/presentacion.ts`
- [X] T003 [P] Renombrar `src/juego/pantallas/Intro.svelte` a `src/juego/pantallas/Reanudar.svelte`; cambiar props a `onContinuar`/`onNuevaPartida`; quitar el prop `aviso` y la rama de carrera terminada; dejar `data-testid="reanudar"`, `continuar` y `nueva-partida`
- [X] T004 En `src/juego/estado.svelte.ts`: renombrar el miembro `"intro"` de `Pantalla` a `"reanudar"`; eliminar el estado `aviso` (campo, getter y usos); hacer que el fallback de `continuarPartida()` (sin partida o descartado) fije `pantalla = "crear-personaje"` en silencio. **Provisional**: dejar la pantalla inicial en `"reanudar"`; el enrutado definitivo lo fijan T006 (US1) y T017 (US3), cerrando el contrato `contracts/estado.md`
- [X] T005 Actualizar `src/juego/Juego.svelte`: importar `Reanudar`, renderizar la rama `juego.pantalla === "reanudar"` con `onContinuar={juego.continuarPartida}` y `onNuevaPartida={juego.empezar}`, y eliminar `empezarDeCero`, `aviso` y `onVerResultado`

**Checkpoint**: El proyecto compila, sin `intro` ni `aviso`, con la pantalla de reanudación reconvertida.

---

## Phase 3: User Story 1 - Empezar a jugar sin pantalla intermedia (Priority: P1) 🎯 MVP

**Goal**: Sin partida guardada, `/jugar` arranca directamente en la creación de personaje.

**Independent Test**: En un navegador limpio, abrir `/jugar` y comprobar que lo primero es `crear-personaje`, sin botón `empezar`.

### Implementation for User Story 1

- [X] T006 [US1] En `src/juego/estado.svelte.ts`, calcular la pantalla inicial como `estadoGuardado === "ninguno" ? "crear-personaje" : "reanudar"`, y enrutar `reiniciar()` a `"crear-personaje"` (borra el guardado y resetea, como ahora)
- [X] T007 [P] [US1] Quitar el clic en `empezar` de `crearPersonaje` en `tests/e2e/apoyo/juego.ts` (el flujo ya arranca en `crear-personaje`)
- [X] T008 [US1] En `tests/e2e/layout-previo.spec.ts`: eliminar las 4 llamadas `getByTestId("empezar").click()` y, en el test de cabecera que itera 3 tamaños, limpiar el almacenamiento antes de cada `goto("/jugar")` (p. ej. `await page.evaluate(() => localStorage.clear())`) para no arrastrar la partida guardada entre iteraciones
- [X] T009 [P] [US1] Eliminar el `getByTestId("empezar").click()` de `tests/e2e/chrome.spec.ts`
- [X] T010 [US1] Actualizar `tests/e2e/carrera-completa.spec.ts`: en el paso 1, esperar `crear-personaje` (ya no `intro`); en el paso 8, localizar `continuar` dentro de `reanudar`
- [X] T011 [US1] Actualizar `src/juego/__tests__/estado.test.ts`: (a) almacén vacío → `pantalla === "crear-personaje"`; (b) `reiniciar()` → `pantalla === "crear-personaje"` (renombrar el test que esperaba `"intro"`); (c) reescribir "descarta un guardado inservible con un aviso puntual" a descarte **silencioso** (sin `juego.aviso`); (d) reescribir "sin almacenamiento se juega sin aviso" usando `almacenQueLanza()` y comprobando `pantalla === "crear-personaje"` sin error
- [X] T012 [US1] Crear `tests/e2e/entrada-directa.spec.ts` con el escenario A: ventana limpia → `/jugar` muestra `crear-personaje` y **no** existe `empezar` ni `reanudar`

**Checkpoint**: US1 funcional y verificable de forma aislada (MVP).

---

## Phase 4: User Story 2 - Reanudar una partida en curso (Priority: P2)

**Goal**: Con partida en curso, se ofrece continuar o empezar una nueva sin destruir el progreso.

**Independent Test**: Avanzar una partida, recargar y comprobar `reanudar` con `continuar` + `nueva-partida`; «Continuar» retoma el punto exacto; «Nueva partida» conserva el guardado hasta crear la nueva.

### Implementation for User Story 2

- [X] T013 [US2] En `src/juego/estado.svelte.ts`, garantizar que con `estadoGuardado === "en-curso"` la pantalla inicial es `"reanudar"` y que `empezar()` **no** llama a `borrar` (el sobre previo solo se sobrescribe al persistir la nueva partida)
- [X] T014 [P] [US2] Añadir a `src/juego/__tests__/estado.test.ts`: sobre en curso → `pantalla === "reanudar"`; `empezar()` desde reanudar deja `CLAVE_GUARDADO` presente hasta crear la nueva partida
- [X] T015 [US2] Añadir a `tests/e2e/entrada-directa.spec.ts` los escenarios B (reanudar y continuar retoma el mismo punto) y C («Nueva partida» conserva el guardado; recargar vuelve a ofrecer reanudar)
- [X] T016 [US2] Ajustar el escenario de recarga de `tests/e2e/jugar.spec.ts` para localizar `continuar` dentro de `reanudar`

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Volver a empezar tras terminar la carrera (Priority: P3)

**Goal**: Una carrera terminada guardada no se reanuda: al volver se arranca directo en creación de personaje.

**Independent Test**: Completar una carrera, recargar `/jugar` y comprobar que va directo a `crear-personaje`, sin `reanudar`.

### Implementation for User Story 3

- [X] T017 [US3] En `src/juego/estado.svelte.ts`, fijar el enrutado definitivo `estadoGuardado === "en-curso" ? "reanudar" : "crear-personaje"` (excluye `"terminada"`), cerrando la postcondición de `contracts/estado.md`
- [X] T018 [P] [US3] Añadir a `src/juego/__tests__/estado.test.ts` el caso de carrera terminada: al recargar → `pantalla === "crear-personaje"`. Conservar el test de que un sobre con `fase === "fin"` sigue abriendo la tarjeta vía `continuarPartida()` (capacidad interna, no ruta de UI)
- [X] T019 [US3] Añadir a `tests/e2e/entrada-directa.spec.ts` el escenario D (carrera terminada → arranque directo, sin reanudación)

**Checkpoint**: Las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Gobernanza, verificación global, accesibilidad y no-regresión de páginas estáticas.

- [X] T020 [P] Registrar la derogación del aviso puntual (decisión de 005) en `docs/registro/decisiones-cerradas.md` y anotarla en `docs/registro/decisiones-pendientes.md`
- [X] T021 [P] Ejecutar `npm run check` y `npm run test` en la raíz y dejar todo en verde
- [X] T022 Ejecutar `npm run test:e2e` y recorrer los escenarios A–F de `quickstart.md`; corregir lo que falle
- [X] T023 Verificar accesibilidad (axe, WCAG 2.2 AA) en las pantallas `reanudar` y `crear-personaje` dentro de `tests/e2e/entrada-directa.spec.ts`
- [X] T024 [P] Confirmar la no-regresión de las páginas estáticas: ejecutar `tests/e2e/landing.spec.ts` y `tests/e2e/visual.spec.ts` (E-06, 0 kB JS en `ESTATICAS`; `/jugar` ahora muestra `crear-personaje` en contexto limpio)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; **bloquea** todas las historias.
- **US1 (Phase 3)**: depende de Foundational.
- **US2 (Phase 4)**: depende de Foundational; el enrutado `en-curso → reanudar` se apoya en el de US1.
- **US3 (Phase 5)**: depende de Foundational y de US1 (restringe su enrutado); T017 cierra el contrato.
- **Polish (Phase 6)**: depende de las historias deseadas.

### User Story Dependencies

- **US1 (P1)**: independiente tras Foundational.
- **US2 (P2)**: integra con US1 (misma función de enrutado) pero se valida sola.
- **US3 (P3)**: ajusta el enrutado de US1; se valida sola.

### Within Each User Story

- Cambios de estado (`estado.svelte.ts`) antes que los E2E que los verifican.
- Tests unitarios y E2E de la historia antes de darla por terminada; los tests existentes que dejan de compilar (`aviso`, `intro`, `empezar`) se corrigen dentro de US1.

### Parallel Opportunities

- Foundational: T002 y T003.
- US1: T007, T009 y T011 en paralelo; T008 y T010 tocan ficheros distintos pero conviene revisarlos juntos.
- US2/US3: T014 y T018 comparten `estado.test.ts` (coordinar); T015 y T019 comparten `entrada-directa.spec.ts` (no paralelo entre sí).
- Polish: T020, T021 y T024 en paralelo.

---

## Parallel Example: User Story 1

```bash
# Lanzar en paralelo (ficheros distintos):
Task: "T007 Quitar el clic en empezar de tests/e2e/apoyo/juego.ts"
Task: "T009 Eliminar clic en empezar de tests/e2e/chrome.spec.ts"
Task: "T011 Actualizar tests unitarios (crear-personaje, reiniciar, descarte silencioso, sin almacenamiento) en src/juego/__tests__/estado.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup.
2. Completar Phase 2: Foundational (bloqueante).
3. Completar Phase 3: US1 (arranque directo sin guardado).
4. **PARAR Y VALIDAR**: escenario A de `quickstart.md`.
5. Desplegar/demostrar si procede.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → validar → demo (MVP).
3. US2 → validar (reanudar + conservar guardado) → demo.
4. US3 → validar (carrera terminada) → demo.
5. Polish → gobernanza (`docs/registro`), `npm run check`, E2E, accesibilidad y no-regresión de estáticas.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- El renombrado `intro` → `reanudar` y la retirada de `aviso` son de la fase Foundational; el enrutado y la semántica de acciones se reparten en US1–US3 (US3 cierra el contrato).
- La portada (`src/pages/index.astro`) y `src/pages/jugar.astro` **no** se tocan.
- No commitear sin petición explícita.
