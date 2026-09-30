---

description: "Task list for the stable decision layout feature"
---

# Tasks: Layout estable del bucle jugable (anclaje de elementos)

**Input**: Design documents from `/specs/016-stable-decision-layout/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/layout.md, quickstart.md

**Tests**: Se incluyen tareas de test E2E porque los criterios de aceptación son **posicionales y
medibles** (SC-001..SC-007) y los invariantes están fijados en `contracts/layout.md`. No hay cambios
de `engine`/`content`, así que no aplican tests unitarios deterministas del motor (Principio III).

**Organization**: Tareas agrupadas por user story para permitir implementación y verificación
independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias incompletas)
- **[Story]**: US1, US2, US3 (según `spec.md`)
- Rutas de fichero exactas en cada tarea

## Path Conventions

Proyecto único: `src/`, `tests/` en la raíz del repo.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el punto de partida antes de tocar la UI.

- [x] T001 Confirmar baseline verde: ejecutar `npm run check` y `npm run test:e2e`, y anotar el estado actual (debe pasar antes de empezar).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, modelo del indicador y overlay compartido por las tres historias.

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase.

- [x] T002 [P] Añadir a `src/ui/tokens.css` los tokens de layout (`--alto-titulo`, `--alto-texto`, `--alto-opcion`, `--alto-bloque-decision`, `--indicador-arriba`, `--indicador-izquierda`, `--tamano-indicador`) con valores provisionales dimensionados al contenido más largo del banco.
- [x] T003 [P] Quitar `tipo` del modelo `Indicador` en `src/juego/presentacion.ts`; conservar `etiquetaTipo` porque `mensajeError` la sigue usando.
- [x] T004 Ajustar `src/juego/pantallas/IndicadorContexto.svelte`: overlay en la esquina superior izquierda, texto `Año {n} · {momento}` (sin tipo), sin atributo `data-tipo`, tamaño de fuente algo mayor (`--tamano-indicador`) (depende de T002, T003).
- [x] T005 Renderizar el indicador como **overlay de `main`** en `src/juego/Juego.svelte` cuando la pantalla sea `decision` o `resultado` (con año y momento vigentes), de modo que quede fuera de la sección de contenido (depende de T004).

**Checkpoint**: tokens, modelo y overlay listos; las historias pueden empezar.

---

## Phase 3: User Story 1 - La pantalla de decisión, estable y centrada (Priority: P1) 🎯 MVP

**Goal**: La sección de decisión contiene solo situación + opciones, centradas en el medio con
altura constante; título y dos primeras opciones en posiciones fijas.

**Independent Test**: recorrer decisiones de verano y febrero (contenido y personaje, con textos
cortos y largos) y comprobar que el indicador, el título, la opción 1 y la opción 2 no se desplazan
(≤ 2 px) y que el bloque está centrado.

### Tests for User Story 1 ⚠️

> Escribir el test primero y comprobar que falla antes de implementar.

- [x] T006 [US1] Crear `tests/e2e/layout-estable.spec.ts` con INV-1, INV-2, INV-3 (tolerancia ≤ 2 px entre pantallas), INV-4 (alternar verano↔febrero: **0 px**), INV-6 (sin scroll horizontal a 320 px) e INV-8 (sin tipo en el indicador), midiendo `boundingBox()` tras `networkidle` en viewport móvil (390×844) y **escritorio (480×900)**.
- [x] T007 [US1] Actualizar `tests/e2e/carrera-completa.spec.ts`: el indicador ya no está dentro de `[data-testid="decision"]` (usar `[data-testid="indicador"]` global) y `data-tipo` desaparece; sustituir la aserción de variedad de tipos por una comprobación que no dependa de la UI.

### Implementation for User Story 1

- [x] T008 [US1] Refactorizar `src/juego/pantallas/Decision.svelte`: quitar el indicador; dejar solo el título (`h2`) y la lista de opciones; aplicar bloques de altura fija (`data-bloque="titulo"`, `data-bloque="opcion"`, `data-bloque="texto"`) y centrar el bloque situación+opciones con `--alto-bloque-decision` constante; sin scroll, recorte ni autoajuste de fuente.

**Checkpoint**: US1 verificable de forma independiente.

---

## Phase 4: User Story 2 - El indicador se mantiene en el resultado (Priority: P2)

**Goal**: En la pantalla de resultado, el indicador (año y momento) permanece en la esquina
superior izquierda, alineado con las decisiones.

**Independent Test**: comparar `boundingBox()` del indicador entre decisión y resultado (≤ 2 px) y
comprobar que muestra año y momento.

### Tests for User Story 2 ⚠️

- [x] T009 [US2] Añadir a `tests/e2e/layout-estable.spec.ts` el caso INV-5: el indicador del resultado coincide con el de decisión (≤ 2 px) y muestra año y momento.

### Implementation for User Story 2

- [x] T010 [US2] Quitar de `src/juego/pantallas/Resultado.svelte` el render de `IndicadorContexto` (ya lo pinta `Juego.svelte` como overlay); conservar el acta sin cambios.

**Checkpoint**: US1 y US2 funcionan y se validan por separado.

---

## Phase 5: User Story 3 - La estabilidad no rompe el contenido (Priority: P3)

**Goal**: Sin recortes, solapamientos ni scroll horizontal; ningún bloque desborda su altura.

**Independent Test**: con el texto más largo del banco a 320 px, ningún bloque desborda
(`scrollHeight ≤ clientHeight + 1`) y no hay scroll horizontal.

### Tests for User Story 3 ⚠️

- [x] T011 [US3] Añadir a `tests/e2e/layout-estable.spec.ts` INV-7 (ningún bloque fijo desborda a lo largo de una carrera completa) y comprobar INV-6 con textos largos a 320 px.

### Implementation for User Story 3

- [x] T012 [US3] Ajustar en `src/ui/tokens.css` las alturas de bloque si T011 revela desbordamiento (recalibrar el token; nunca añadir scroll, recorte ni autoajuste de fuente).

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cierre de calidad y sincronización de documentación.

- [x] T013 [P] Sincronizar `specs/016-stable-decision-layout/contracts/layout.md` y `data-model.md` con los ganchos y tokens finales realmente implementados.
- [x] T014 Ejecutar la puerta de calidad completa: `npm run check` y `npm run test:e2e`, y `npm run build`; corregir regresiones. Incluye accesibilidad axe y 200 % de zoom de `tests/e2e/visual.spec.ts`, y comprobar que el fondo estacional (momentos verano/febrero) y el tema acta del resultado se mantienen (FR-012), con contraste AA.
- [x] T015 [P] Verificar que no se añade JavaScript ni dependencias y que la feature es solo presentación (FR-009, FR-010): `package.json` sin cambios, rutas estáticas sin scripts (cubierto por `tests/e2e/visual.spec.ts` E-06) y `git diff --name-only` sin rutas de `src/engine` ni de `src/content`.
- [x] T016 Ejecutar la validación manual de `specs/016-stable-decision-layout/quickstart.md` (escenarios 1–3) y anotar resultados.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; BLOQUEA todas las historias.
- **User Stories (Phase 3+)**: dependen de Foundational. US1 → US2 → US3 en orden de prioridad (US2 reutiliza el overlay; US3 valida la robustez de ambas).
- **Polish (Phase 6)**: depende de todas las historias deseadas.

### Task Dependencies

- T004 depende de T002 y T003; T005 depende de T004.
- T008 depende de T005; T007 depende de T005.
- T010 depende de T005.
- T009 depende de T010.
- T011 depende de T008; T012 depende de T011.
- T014 depende de T008, T010 y T012.

### Parallel Opportunities

- T002 y T003 pueden ir en paralelo.
- T013 y T015 pueden ir en paralelo al final.
- Los tests (T006, T009, T011) comparten fichero (`tests/e2e/layout-estable.spec.ts`): secuenciales entre sí.

---

## Parallel Example: Foundational

```bash
# En paralelo (ficheros distintos):
Task: "Añadir tokens de layout en src/ui/tokens.css"
Task: "Quitar tipo del modelo Indicador en src/juego/presentacion.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Fase 1 (T001) + Fase 2 (T002–T005).
2. Fase 3 (T006–T008).
3. **PARAR y VALIDAR**: ejecutar `tests/e2e/layout-estable.spec.ts` y comprobar los anclajes de decisión.
4. Demo si procede.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → validar → demo (MVP).
3. US2 → validar indicador en resultado → demo.
4. US3 → validar robustez (sin desbordes) → demo.
5. Polish → puerta de calidad y docs.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- La etiqueta [Story] mapea la tarea a su user story.
- Prohibido en la implementación: `overflow: auto/scroll`, `line-clamp`/recorte y autoajuste de fuente.
- El indicador MUST NOT vivir dentro de `[data-testid="decision"]`.
- Verificar que los tests fallan antes de implementar.
- No commitear sin petición explícita (regla de Git de AGENTS.md).
