---
description: "Task list for ENGINE-001 — Motor determinista de Coplero"
---

# Tasks: Motor determinista de Coplero (ENGINE-001)

**Input**: Design documents from `/specs/001-deterministic-engine/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/engine-api.md, quickstart.md

**Tests**: Per the Coplero constitution (Principle III), engine and content changes MUST include deterministic tests; E2E tests are OPTIONAL.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Motor: `src/engine/` con tests en `src/engine/__tests__/`
- Tests del motor: `src/engine/__tests__/` (incluye integridad sobre fixtures)
- Scripts: `scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinear el scaffold existente con el plan de ENGINE-001.

- [X] T001 Definir el barrel público y el mapa de módulos del motor en `src/engine/index.ts` (re-exports; sin lógica)
- [X] T002 [P] Crear banco de contenido de prueba reutilizable en `src/engine/__tests__/fixtures.ts`
- [X] T003 [P] Confirmar el glob de tests y el alias `@engine` en `vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos e infraestructura determinista que TODAS las historias necesitan.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta completar esta fase.

- [X] T004 Extender los tipos del dominio en `src/engine/types.ts` (Atributo(s), Momento, TipoDecision, Categoria, Opcion, Situacion, Condicional, Requisito, Personaje, Destino, Flag, Temporada, Premio, EventoHistorial, Partida, FasePartida, Paso, BancoContenido, Resultado, ErrorMotor, ResumenCarrera)
- [X] T005 Implementar el PRNG contextual en `src/engine/seed.ts` (mulberry32 + `rngPara(seed, contexto)`)
- [X] T006 [P] Implementar parámetros configurables con valores provisionales en `src/engine/parametros.ts`
- [X] T007 [P] Implementar aplicación de efectos y clamp de atributos en `src/engine/atributos.ts`

**Checkpoint**: Tipos, azar contextual, parámetros y clamp listos.

---

## Phase 3: User Story 1 - Partida reproducible desde una semilla (Priority: P1) 🎯 MVP

**Goal**: Crear una partida con destino oculto determinista y estado serializable.

**Independent Test**: Crear dos partidas con la misma semilla/input y comprobar estado idéntico; `deserializar(serializar(p))` equivalente y versión incompatible devuelve error.

### Tests for User Story 1

- [X] T008 [P] [US1] Test de determinismo en `src/engine/__tests__/determinismo.test.ts`
- [X] T009 [P] [US1] Test de serialización y versión incompatible en `src/engine/__tests__/serializacion.test.ts`

### Implementation for User Story 1

- [X] T010 [US1] Implementar la generación del destino oculto en `src/engine/destino.ts`
- [X] T011 [US1] Implementar `crearPartida` en `src/engine/partida.ts`
- [X] T012 [US1] Implementar `serializar`/`deserializar` con error `VERSION_INCOMPATIBLE` en `src/engine/serializar.ts`
- [X] T013 [US1] Exportar `crearPartida`, `serializar`, `deserializar` y `VERSION_PARTIDA` en `src/engine/index.ts`

**Checkpoint**: US1 funcional y testeable por sí sola.

---

## Phase 4: User Story 2 - Ciclo estacional, decisiones, efectos y flags (Priority: P1)

**Goal**: Avanzar por verano/febrero seleccionando situaciones, aplicando efectos y gestionando flags.

**Independent Test**: Recorrer varios años comprobando reparto contenido/personaje, filtrado por momento/modalidad/variante, clamp de atributos y persistencia/consumo de flags.

### Tests for User Story 2

- [X] T014 [P] [US2] Test del selector (filtros, asignación de tipo D5, `variantes` inalcanzables, degradación B→D, coherencia de estado) en `src/engine/__tests__/selector.test.ts`
- [X] T015 [P] [US2] Test de requisitos, ventanas y consumo de flags en `src/engine/__tests__/condicionales.test.ts`
- [X] T016 [P] [US2] Test del flujo de partida (`siguientePaso`/`elegir`, `saltaCOAC`, coherencia SC-006) en `src/engine/__tests__/partida.test.ts`

### Implementation for User Story 2

- [X] T017 [US2] Implementar selección de situaciones en `src/engine/selector.ts` (filtros, tipo por año, `variantes` contra la variante actual, degradación B→D, `unicaVez`)
- [X] T018 [US2] Implementar evaluación de `Requisito`, ventanas y consumo de flags en `src/engine/condicionales.ts`
- [X] T019 [US2] Implementar `siguientePaso` y `elegir` en `src/engine/partida.ts` (efectos, flags, `saltaCOAC`, contador determinista)

**Checkpoint**: Bucle jugable completo sin COAC.

---

## Phase 5: User Story 3 - Resolución del COAC y premios ajenos (Priority: P2)

**Goal**: Resolver fase/puesto de la temporada y premios ajenos, y registrarlos en el historial.

**Independent Test**: Dada una partida, resolver una temporada y verificar fase dentro de `[suelo, techo]`, batacazo/milagro y premios solo con participación.

### Tests for User Story 3

- [X] T020 [P] [US3] Test de resolución de fase, puesto, batacazo y milagro en `src/engine/__tests__/coac.test.ts`
- [X] T021 [P] [US3] Test de premios ajenos en `src/engine/__tests__/premios.test.ts`

### Implementation for User Story 3

- [X] T022 [US3] Implementar resolución de fase y `puesto` por bandas en `src/engine/coac.ts`
- [X] T023 [US3] Implementar premios ajenos con afinidad **inyectada** y desempate determinista en `src/engine/premios.ts`
- [X] T024 [US3] Integrar COAC y premios en `src/engine/partida.ts` (cálculo con estado previo a febrero; exposición tras la decisión)

**Checkpoint**: Temporadas resueltas y persistidas.

---

## Phase 6: User Story 4 - Resumen mínimo de carrera (Priority: P2)

**Goal**: Producir el resumen mínimo al terminar la carrera, sin revelar el destino.

**Independent Test**: Ejecutar una carrera hasta la retirada y comprobar campos mínimos y ausencia de `destino`.

### Tests for User Story 4

- [X] T025 [P] [US4] Test del resumen mínimo y ausencia de destino en `src/engine/__tests__/resumen.test.ts`

### Implementation for User Story 4

- [X] T026 [US4] Implementar `resumen` en `src/engine/resumen.ts`
- [X] T027 [US4] Garantizar que `destino` no aparece en `Paso` ni `ResumenCarrera` en `src/engine/partida.ts` y `src/engine/resumen.ts`

**Checkpoint**: Fin de carrera con resumen compartible mínimo.

---

## Phase 7: User Story 5 - Ejecución automática masiva sin interfaz (Priority: P3)

**Goal**: Ejecutar lotes de carreras completas para validar balance.

**Independent Test**: Ejecutar 10.000 carreras en Node sin UI y obtener un agregado de fases.

### Tests for User Story 5

- [X] T028 [P] [US5] Test de simulación por lote (10.000 carreras, presupuesto provisional) en `src/engine/__tests__/simulacion.test.ts`

### Implementation for User Story 5

- [X] T029 [US5] Implementar el simulador en `scripts/simular.ts`
- [X] T030 [US5] Añadir el script `simular` (`tsx scripts/simular.ts 10000`) en `package.json`

**Checkpoint**: Balance medible con datos.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Integridad, snapshot y consistencia documental.

- [X] T031 [P] Test de integridad del banco de fixtures (ids únicos, flags referenciadas, momento/tipo, situaciones alcanzables) en `src/engine/__tests__/integridad.test.ts` (la integridad del banco real llegará con la feature de content)
- [X] T032 [P] Snapshot de una partida de referencia en `src/engine/__tests__/snapshot.test.ts`
- [X] T033 Actualizar `docs/02-arquitectura-tecnica.md` y `docs/registro/` con la refinación de `FasePartida` y la decisión D5
- [X] T034 Ejecutar `npm run check` y corregir cualquier fallo (tipos, lint, tests)
- [X] T035 [P] Test de pureza del engine (sin imports de UI/`content`, sin `Math.random`/`Date.now`) en `src/engine/__tests__/pureza.test.ts`
- [X] T036 [P] Test de extensibilidad de contenido (añadir una situación a los fixtures sin tocar el engine, SC-005) en `src/engine/__tests__/extension.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup y **bloquea** todas las historias.
- **US1 (Phase 3)**: depende de Foundational.
- **US2 (Phase 4)**: depende de Foundational; usa los tipos de US1 para el estado.
- **US3 (Phase 5)**: depende de Foundational y del flujo de US2.
- **US4 (Phase 6)**: depende de US3 (necesita temporadas).
- **US5 (Phase 7)**: depende de US1–US4 para carreras completas.
- **Polish (Phase 8)**: depende de las historias deseadas.

### Within Each User Story

- Tests antes de la implementación (deben fallar primero).
- Modelos/tipos antes de servicios; servicios antes de la integración en `partida.ts`.

### Parallel Opportunities

- T002, T003 (Setup) en paralelo.
- T006, T007 (Foundational) en paralelo.
- Los bloques de tests de cada historia (`T008`/`T009`, `T014`–`T016`, `T020`/`T021`, `T025`, `T028`) en paralelo entre sí.
- T031, T032, T035 y T036 (Polish) en paralelo.

---

## Parallel Example: User Story 2

```bash
# Tests de US2 en paralelo:
Task: "Selector tests in src/engine/__tests__/selector.test.ts"
Task: "Conditional/flag tests in src/engine/__tests__/condicionales.test.ts"
Task: "Partida flow tests in src/engine/__tests__/partida.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Fase 1 (Setup) y Fase 2 (Foundational).
2. Completar US1 (Phases 3).
3. **VALIDAR**: determinismo y serialización en verde.
4. Es un incremento válido aunque todavía no haya bucle jugable.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → determinismo y serialización (MVP mínimo).
3. US2 → bucle jugable con decisiones, efectos y flags.
4. US3 → COAC y premios.
5. US4 → resumen.
6. US5 → simulación a escala.
7. Polish → integridad, snapshot y documentación.

---

## Notes

- [P] = archivos distintos, sin dependencias.
- Verificar que los tests fallan antes de implementar.
- Commit tras cada tarea o grupo lógico (sin commitear sin petición explícita).
- No incluir UI, Astro del juego, Svelte, `codec`/`fflate`, OG ni persistencia.
- FR-025 (la UI no contiene lógica) solo se verifica en la feature de UI; ENGINE-001 fija la frontera.
- US5 (simulación) prima que funcione: el presupuesto de 30 s es provisional.

## Estado de implementación (2026-09-18)

Todas las tareas T001–T036 completadas. `npm run check` en verde y simulación de 10.000 carreras ejecutada.
Desviaciones respecto al contrato inicial (documentadas): se añadió `continuar(p)` para avanzar desde el resultado de temporada, y el `Paso` incluye la variante `error`.
