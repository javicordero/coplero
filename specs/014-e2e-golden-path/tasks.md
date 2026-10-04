# Tasks: Recorrido E2E de una carrera completa (E2E-001)

**Input**: Design documents from `/specs/014-e2e-golden-path/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/observabilidad.md, quickstart.md

**Tests**: la feature **es** una prueba E2E; no hay "tests de la feature" aparte de la propia prueba.
Sin cambios en `engine`/`content` → no se recalibra la simulación (constitución III intacta).

**Organization**: US1 (viaje completo, hitos 1–7, P1), US2 (recuperar tras recarga, hito 8, P2),
US3 (compartir y abrir el enlace, hitos 9–10, P3). Las tres historias viven en
`tests/e2e/carrera-completa.spec.ts` y se añaden de forma incremental.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ir en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1 / US2 / US3
- Cada tarea incluye la ruta exacta del fichero

## Path Conventions

Proyecto único Astro: `src/`, `tests/` en la raíz. Ver `plan.md` §Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: los helpers compartidos que usará toda la suite.

- [x] T001 [P] Crear `tests/e2e/apoyo/juego.ts` con los helpers compartidos: `clavePantalla` (lee `pantalla|momento|ano` de `[data-pantalla]`), `crearPersonaje`, `elegirModalidadYVariante`, `avanzar` (resuelve una pantalla del bucle y espera el cambio de clave), `completarCarrera` (bucle de hasta 400 pasos hasta `fin`) y `enlaceCompartido` (pulsa `copiar-enlace` y lee el portapapeles). Sin `waitForTimeout`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: el anclaje mínimo y la deduplicación de la suite. **Bloquea** todas las historias.

**⚠️ CRITICAL**: ninguna historia puede cerrarse hasta que esto esté hecho.

- [x] T002 [P] *(Retirado el 2026-10-04.)* `data-tipo` ya no aplica al eliminarse el tipo.

- [x] T006 [US1] Añadir en `tests/e2e/carrera-completa.spec.ts` los `test.step` 5–6: resolver el bucle con `avanzar` sin asumir el orden de pantallas (`decision`, `resultado`, `cambio-variante`) hasta `fin`
- [x] T003 [P] Refactorizar `tests/e2e/jugar.spec.ts` para usar los helpers de `tests/e2e/apoyo/juego.ts` (misma cobertura, sin duplicar el bucle de hasta 400 pasos)
- [x] T004 [P] Refactorizar `tests/e2e/compartir.spec.ts` para usar los helpers de `tests/e2e/apoyo/juego.ts` (misma cobertura, incluido `jugarHastaFin`)

**Checkpoint**: anclaje disponible y suite existente verdes usando los helpers compartidos.

---

## Phase 3: User Story 1 - El viaje completo de principio a fin (Priority: P1) 🎯 MVP

**Goal**: una prueba integrada que abre `/jugar`, crea personaje, elige modalidad y variante, atraviesa varias decisiones y completa la carrera hasta la tarjeta final (hitos 1–7).

**Independent Test**: `npx playwright test tests/e2e/carrera-completa.spec.ts` en verde, con los pasos 1–7 visibles en el informe.

### Implementation for User Story 1

- [x] T005 [US1] Crear `tests/e2e/carrera-completa.spec.ts` con un único `test()` y `test.setTimeout(90_000)`, y los `test.step` 1–4: entrar en `/jugar` y pulsar `empezar`, crear personaje (rellenar `Nombre o apodo` + `crear`), elegir modalidad y elegir variante; incluir un **listener de peticiones** que registre orígenes externos y falle al final si los hay (SC-005)
- [x] T006 [US1] Añadir en `tests/e2e/carrera-completa.spec.ts` los `test.step` 5–6: resolver el bucle con `avanzar` sin asumir el orden de pantallas (`decision`, `resultado`, `cambio-variante`) hasta `fin`, comprobando con `[data-tipo]` al menos una decisión de `contenido` y una de `personaje`
- [x] T007 [US1] Añadir en `tests/e2e/carrera-completa.spec.ts` el `test.step` 7: comprobar `[data-testid="fin"]`, `[data-testid="tarjeta"]` y que `[data-testid="tarjeta-nombre"]` muestra el nombre creado

**Checkpoint**: US1 verificable por sí sola (hitos 1–7) y ejecutable más rápido al no incluir recarga ni compartir.

---

## Phase 4: User Story 2 - La partida sobrevive a una recarga (Priority: P2)

**Goal**: a mitad de carrera, recargar la página y recuperar la partida continuando en el mismo punto (hito 8).

**Independent Test**: ejecutar la prueba y comprobar que el paso 8 recarga, encuentra `continuar` y retoma la misma clave de pantalla antes de seguir hasta el final.

### Implementation for User Story 2

- [x] T008 [US2] Añadir en `tests/e2e/carrera-completa.spec.ts` el `test.step` 8: capturar la clave de pantalla a mitad de carrera, `page.reload()`, comprobar `[data-testid="continuar"]`, pulsarlo y verificar que la clave coincide; continuar hasta `fin`

**Checkpoint**: US1 + US2 verificables; la continuidad tras recarga queda probada dentro del recorrido.

---

## Phase 5: User Story 3 - El resultado se comparte y se reproduce (Priority: P3)

**Goal**: generar el enlace compartible al terminar y abrirlo en `/r/[codigo]` reproduciendo la tarjeta (hitos 9–10).

**Independent Test**: ejecutar la prueba y comprobar que el paso 9 obtiene un enlace con `/r/` y el paso 10 reproduce `tarjeta-nombre` con el mismo personaje.

### Implementation for User Story 3

- [x] T009 [US3] Añadir en `tests/e2e/carrera-completa.spec.ts` `test.use({ permissions: ["clipboard-read", "clipboard-write"] })` y el `test.step` 9: pulsar `[data-testid="copiar-enlace"]` y leer el portapapeles comprobando que contiene `/r/`
- [x] T010 [US3] Añadir en `tests/e2e/carrera-completa.spec.ts` el `test.step` 10: limpiar `localStorage`, navegar al enlace y comprobar que `[data-testid="tarjeta-nombre"]` coincide con el personaje creado

**Checkpoint**: las tres historias funcionan y E2E-001 cubre los 10 hitos.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T011 Verificar la reproducibilidad y medir la duración: ejecutar 5 veces `npx playwright test tests/e2e/carrera-completa.spec.ts`, confirmar el mismo veredicto con seeds distintas (SC-003) y anotar la duración del recorrido para comprobar el objetivo de **< 60 s** (SC-004)
- [x] T012 Verificar la diagnosis: romper temporalmente un anclaje (por ejemplo, renombrar `data-testid="continuar"` o forzar `pantalla = "error"`) y comprobar que la prueba falla nombrando el paso 8; revertir el cambio (SC-002, SC-007)
- [x] T013 Ejecutar `npm run test:e2e` (suite completa, SC-006) y `npm run check` (SC-006); corregir lo que salga
- [x] T014 [P] Anotar los resultados de validación en la sección «Resultados de la validación» de `specs/014-e2e-golden-path/quickstart.md` (10/10 hitos, tiempos, reproducción)
- [x] T015 [P] Documentar E2E-001 en `docs/02-arquitectura-tecnica.md` §11 («Tests que sí importan») como el recorrido integrado del camino feliz

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup (T001); **bloquea** US1–US3.
- **US1 (Phase 3)**: depende de la Fase 2. Es el MVP.
- **US2 (Phase 4)** y **US3 (Phase 5)**: dependen de US1 (mismo fichero, se añaden después).
- **Polish (Phase 6)**: depende de las historias.

### User Story Dependencies

- **US1 (P1)**: crea el fichero y cubre hitos 1–7. Sin dependencias de otras historias → **MVP**.
- **US2 (P2)**: añade el hito 8 sobre el fichero de US1; es independiente en comportamiento, pero
  comparte fichero, así que va después.
- **US3 (P3)**: añade los hitos 9–10 sobre el mismo fichero; después de US1 (y puede ir antes o
  después de US2).

### Within Each User Story

- Helpers (T001) antes que cualquier spec; anclaje (T002) antes de T006.
- En `carrera-completa.spec.ts` el orden de **ejecución** en el viaje es T005 → T006 (primeras decisiones) → **T008 (recarga, a mitad de carrera)** → T006/T007 (terminar + tarjeta) → T009 → T010. El hito 8 MUST ocurrir antes de terminar la carrera.

### Parallel Opportunities

- T002, T003 y T004 pueden ir en paralelo tras T001 (ficheros distintos).
- T011 y T012 no se paralelizan entre sí (comparten el `webServer` de Playwright).
- T014 y T015 en paralelo (ficheros distintos).

---

## Parallel Example: Foundational

```bash
# Tras crear los helpers (T001), en paralelo:
Task: "Añadir data-tipo a src/juego/pantallas/IndicadorContexto.svelte"
Task: "Refactorizar tests/e2e/jugar.spec.ts para usar los helpers"
Task: "Refactorizar tests/e2e/compartir.spec.ts para usar los helpers"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Fase 1 (Setup): helpers compartidos.
2. Fase 2 (Foundational): anclaje `data-tipo` + suite existente usando los helpers.
3. Fase 3 (US1): `carrera-completa.spec.ts` con los hitos 1–7.
4. **PARAR Y VALIDAR**: `npx playwright test tests/e2e/carrera-completa.spec.ts`.
5. Ese recorrido ya demuestra que el juego se completa de principio a fin.

### Incremental Delivery

1. Setup + Foundational → helpers y anclaje listos.
2. US1 → hitos 1–7 (MVP).
3. US2 → hito 8 (recuperación tras recarga).
4. US3 → hitos 9–10 (compartir y reproducir).
5. Polish → reproducibilidad, diagnosis, suite completa, `npm run check` y docs.

---

## Notes

- [P] = ficheros distintos, sin dependencias pendientes.
- Los hitos 5–6 MUST resolver cualquier pantalla del bucle sin asumir orden; nunca `waitForTimeout`.
- La prueba MUST NOT asercionar posiciones, fases, premios ni número de años (semilla aleatoria).
- El único cambio en `src/` es `data-tipo` en `IndicadorContexto.svelte`; no se toca `engine` ni `content`.
- No añadir dependencias; no commitear sin petición explícita.
