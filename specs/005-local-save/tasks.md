---

description: "Task list for local save (persistence) feature"
---

# Tasks: Persistencia local de la partida

**Input**: Design documents from `/specs/005-local-save/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Incluidos — el Principio III exige tests deterministas y esta feature modificará los tests existentes de `src/juego/__tests__/` (cambio de `hayGuardado` a `estadoGuardado`). El smoke E2E es opcional, pero se amplía porque el spec pide verificar "recargar y continuar".

**Organization**: Tareas agrupadas por historia de usuario para poder implementar y probar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: a qué historia pertenece (US1, US2, US3)
- Rutas exactas en cada tarea

## Path Conventions

Proyecto único (Principio V): `src/`, `tests/`, `docs/` en la raíz.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Línea base verde antes de tocar nada.

- [X] T001 Ejecutar la línea base `npm run check` y `npm run test:e2e` y confirmar que pasan antes de empezar.
- [X] T002 [P] Verificar/instalar Chromium de Playwright: `npx playwright install chromium`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Núcleo del módulo de persistencia del que dependen las tres historias.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T003 [P] Fijar el contrato de tipos y constantes en `src/juego/persistencia.ts`: `Almacen`, `ContenidoGuardado { version; partida }`, `ResultadoCarga`, `EstadoGuardado`, `CLAVE_GUARDADO` y `VERSION_GUARDADO` (independiente de `VERSION_PARTIDA`).
- [X] T004 Implementar `guardar()` y `borrar()` a prueba de fallos (try/catch, nunca lanzan) en `src/juego/persistencia.ts`.
- [X] T005 Implementar `cargar()` (camino feliz) en `src/juego/persistencia.ts`: `{ partida, descartado: false }` si el sobre deserializa y `{ partida: null, descartado: false }` si no hay nada.
- [X] T006 Implementar `almacenNavegador()` en `src/juego/persistencia.ts`: sonda de disponibilidad con `try/catch` y **almacén no-op** si no hay `localStorage` (nunca lanza).
- [X] T007 Cablear `almacenNavegador()` en `src/juego/Juego.svelte` y **eliminar** el fallback en memoria local.

**Checkpoint**: el módulo existe, no lanza y la isla lo usa.

---

## Phase 3: User Story 1 - Continuar la carrera donde la dejé (Priority: P1) 🎯 MVP

**Goal**: guardar tras cada decisión y restaurar la partida exacta al reabrir.

**Independent Test**: crear, decidir, recargar y comprobar que se retoma en la misma decisión, año y momento.

### Tests for User Story 1

> Escribir primero y ver que fallan (Principio III).

- [X] T008 [P] [US1] Test de ida/vuelta exacta y de "guardar tras decidir" en `src/juego/__tests__/persistencia.test.ts`.
- [X] T009 [P] [US1] Test de restauración en el mismo punto (`partida.anoActual` y pantalla) en `src/juego/__tests__/estado.test.ts` (actualizar el uso de `hayGuardado` → `estadoGuardado`).

### Implementation for User Story 1

- [X] T010 [US1] Calcular `estadoGuardado` ("ninguno" / "en-curso") con una **única** carga inicial en `crearJuego` (`src/juego/estado.svelte.ts`), sustituyendo `hayGuardado`.
- [X] T011 [US1] Implementar la restauración en `continuarPartida()` (recomputar `siguientePaso` y retomar el punto exacto) en `src/juego/estado.svelte.ts`.
- [X] T012 [US1] Adaptar `src/juego/pantallas/Intro.svelte` y `src/juego/Juego.svelte` al nuevo contrato (`estadoGuardado`, "Continuar donde lo dejaste", "Empezar" cuando no hay guardado).
- [X] T013 [US1] Ampliar el smoke E2E "crear → decidir → recargar → continuar" en `tests/e2e/jugar.spec.ts`.

**Checkpoint**: US1 funciona y es demostrable por sí sola.

---

## Phase 4: User Story 2 - Empezar de cero sin arrastrar la carrera anterior (Priority: P2)

**Goal**: iniciar una partida nueva reemplaza el guardado; "empezar de cero" lo borra; una carrera terminada ofrece ver el resultado.

**Independent Test**: con partida guardada, empezar de cero la elimina; una carrera acabada muestra "Ver resultado" sin "Continuar".

### Tests for User Story 2

- [X] T014 [P] [US2] Test de "empezar de cero borra el sobre" y "crear partida reemplaza el guardado" en `src/juego/__tests__/estado.test.ts`.
- [X] T015 [P] [US2] Test de carrera terminada: `estadoGuardado === "terminada"` y se muestra el resumen final en `src/juego/__tests__/estado.test.ts`.

### Implementation for User Story 2

- [X] T016 [US2] Asegurar que `reiniciar()` borra el sobre y resetea `estadoGuardado` a "ninguno" en `src/juego/estado.svelte.ts`.
- [X] T017 [US2] Distinguir `"terminada"` en `estadoGuardado` (`partida.fase === "fin"`) y mostrar el resumen final al continuar en `src/juego/estado.svelte.ts`.
- [X] T018 [US2] Añadir "Empezar de cero" (secundario) y "Ver resultado" en `src/juego/pantallas/Intro.svelte`, cableados en `src/juego/Juego.svelte`.

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Recuperación amable ante un guardado inservible (Priority: P3)

**Goal**: descartar guardados incompatibles/dañados con un aviso puntual y no accesible-adverso, y seguir jugando sin almacenamiento sin avisar.

**Independent Test**: sembrar un guardado de versión distinta o ilegible; la app arranca, avisa una vez y ofrece empezar; con almacén no-op se juega sin errores ni aviso.

### Tests for User Story 3

- [X] T019 [P] [US3] Tests de descarte (versión distinta, JSON inválido, tipos inesperados) con eliminación del sobre y `descartado: true` en `src/juego/__tests__/persistencia.test.ts`.
- [X] T020 [P] [US3] Test de almacén que lanza y de almacén no-op: `guardar`/`cargar`/`borrar` no lanzan en `src/juego/__tests__/persistencia.test.ts`.
- [X] T021 [P] [US3] Test de aviso puntual (una sola vez) y de ausencia de aviso con almacén no-op en `src/juego/__tests__/estado.test.ts`.

### Implementation for User Story 3

- [X] T022 [US3] Implementar las ramas de rechazo de `cargar()` que **eliminan** el sobre y devuelven `descartado: true` (versión de sobre, tipos, `deserializar` fallido) en `src/juego/persistencia.ts`.
- [X] T023 [US3] Fijar el aviso puntual en `crearJuego` a partir de `descartado` y el texto amable en `src/juego/presentacion.ts`.
- [X] T024 [US3] Hacer accesible el aviso (`role="status"` + `aria-live="polite"`, texto llano) en `src/juego/pantallas/Intro.svelte`.

**Checkpoint**: las tres historias funcionan y son verificables por separado.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T025 [P] Actualizar `docs/02-arquitectura-tecnica.md` §10 (dos capas de versión, almacén no-op, fin de carrera) y registrar en `docs/registro/decisiones-cerradas.md` si procede.
- [X] T026 [P] Verificar invariantes del quickstart: sobre < 5 KB y 0 resultados en `grep -r "localStorage" src/engine`.
- [X] T027 Ejecutar `npm run check` y `npm run test:e2e` finales y recorrer `specs/005-local-save/quickstart.md`.
- [X] T028 [P] Auditoría de accesibilidad del aviso con la skill `accessibility` (`src/juego/pantallas/Intro.svelte`).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup y **bloquea** las tres historias.
- **User Stories (Phases 3–5)**: dependen de Foundational; pueden ir en paralelo o en orden P1 → P2 → P3.
- **Polish (Phase 6)**: depende de las historias que se quieran cerrar.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias.
- **US2 (P2)**: sin dependencias de US1 (comparte el módulo, ya construido en Foundational).
- **US3 (P3)**: sin dependencias de US1/US2; extiende el rechazo dentro de `cargar()`.

### Within Each User Story

- Tests primero (deben fallar) → estado → UI → E2E.
- Mismo fichero no puede ir en paralelo consigo mismo.

### Parallel Opportunities

- T002 en paralelo con T001.
- T003 en paralelo con cualquier test que no dependa del módulo.
- Tests de una misma historia marcados [P] entre sí (T008/T009, T014/T015, T019/T020/T021).
- T025, T026 y T028 en paralelo al final.

---

## Parallel Example: User Story 3

```bash
# Tests de US3 (ficheros/nodos distintos):
Task: "Tests de descarte (versión/JSON/tipos) en src/juego/__tests__/persistencia.test.ts"
Task: "Test de almacén no-op en src/juego/__tests__/persistencia.test.ts"
Task: "Test de aviso puntual en src/juego/__tests__/estado.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup.
2. Phase 2: Foundational (bloqueante).
3. Phase 3: US1 → **PARAR y VALIDAR** (crear, decidir, recargar, continuar).

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → demo (MVP: continuar la carrera).
3. US2 → demo (empezar de cero / ver resultado).
4. US3 → demo (recuperación amable).
5. Polish → docs, tamaño, accesibilidad, `npm run check` final.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- Etiqueta [Story] para trazabilidad con `spec.md`.
- `src/juego/persistencia.ts` es un solo fichero: sus tareas van en serie.
- Los tests existentes que usan `hayGuardado` deben actualizarse a `estadoGuardado` (no ocultar el fallo, adaptarlo).
- Commit por tarea o grupo lógico; no commitear sin petición explícita.
