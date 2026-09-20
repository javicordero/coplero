---

description: "Task list for trajectory changes (modality and variant) feature"
---

# Tasks: Cambios de trayectoria (modalidad y variante)

**Input**: Design documents from `/specs/006-trajectory-change/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/engine.md, contracts/pantalla.md, quickstart.md

**Tests**: Incluidos — el Principio III de la constitución exige tests deterministas para todo cambio de `engine` y `content`. El E2E es opcional.

**Organization**: Tareas agrupadas por historia para poder implementar y verificar cada una por separado. El núcleo del motor (trayectoria y reducer) es infraestructura compartida y vive en la fase Foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: a qué historia pertenece (US1, US2, US3)
- Rutas exactas en cada tarea

## Path Conventions

Proyecto único (Principio V): `src/`, `tests/`, `docs/` en la raíz.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Línea base verde y mapa de impacto antes de tocar nada.

- [X] T001 Ejecutar `npm run check` y `npm run test` y confirmar que la línea base está verde.
- [X] T002 [P] Localizar todos los consumidores de `Paso`, `FasePartida`, `Situacion` y `ResumenCarrera` que habrá que adaptar (`rg "Paso|FasePartida|siguientePaso|ResumenCarrera" src tests`) y anotarlos.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Núcleo del motor de trayectoria y del contrato de datos, compartido por las tres historias.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T003 Ampliar `src/engine/types.ts`: `CambioTrayectoria`, `Trayectoria`; `Opcion.cambiaModalidad`/`Opcion.cambiaVariante`; `Situacion.peso`; `BancoContenido.variantes`; `FasePartida` con `"variante"`; `Paso` con `{ tipo: "variante"; modalidad }`; `ErrorMotor` con `VARIANTE_INVALIDA`; `ResumenCarrera.trayectoria`; `VERSION_PARTIDA = 2`.
- [X] T004 [P] Crear `src/engine/trayectoria.ts` con helpers puros: `crearTrayectoria(modalidad, variante)`, `registrarCambio(trayectoria, modalidad, variante, ano)` y `variantePertenece(catalogo, modalidad, varianteId)`.
- [X] T005 Inicializar `trayectoria` en `crearPartida` (`src/engine/partida.ts`) con los valores iniciales y `cambios: []`.
- [X] T006 [P] Ponderar por `s.peso ?? 1` en `elegirDe` (`src/engine/selector.ts`).
- [X] T007 Aplicar cambios en `elegir` (`src/engine/partida.ts`): `cambiaModalidad` actualiza modalidad, pasa el momento a febrero y deja `fase = "variante"`; `cambiaVariante` actualiza la variante y registra el cambio en la trayectoria.
- [X] T008 Manejar `p.fase === "variante"` en `siguientePaso` (`src/engine/partida.ts`) devolviendo `{ tipo: "variante", modalidad: p.modalidad }`.
- [X] T009 Implementar `elegirVarianteDeCambio(p, varianteId, banco, params?)` en `src/engine/partida.ts`: valida pertenencia contra `banco.variantes`, registra el cambio, fija la variante y devuelve la fase a `"decision"`.
- [X] T010 [P] Exponer `trayectoria` en `construirResumen` (`src/engine/resumen.ts`) sin incluir `destino`.
- [X] T011 Exportar `trayectoria.ts` y `elegirVarianteDeCambio` desde `src/engine/index.ts` (depende de T004 y T009).
- [X] T012 [P] Ampliar `src/content/schema.ts` (`peso`, `cambiaModalidad`, `cambiaVariante`, `variantes` del banco) y `src/content/index.ts` (incluir el catálogo de `VARIANTES` en `bancoContenido`).
- [X] T013 Manejar el paso `{ tipo: "variante" }` en `src/simulacion/jugar.ts` eligiendo una variante válida con `rngPara` y llamando a `elegirVarianteDeCambio`; anotar `VARIANTE_INVALIDA` si falla.
- [X] T014 Adaptar los tests existentes que rompan por la nueva forma/versión (`src/engine/__tests__/serializacion.test.ts`, `snapshot.test.ts`, tests de `content` con recuentos/`strictObject`) para dejar la suite verde.

**Checkpoint**: el motor compila, `npm run check` pasa y el paso de variante existe sin contenido todavía.

---

## Phase 3: User Story 1 - Cambiar de modalidad a mitad de carrera (Priority: P1) 🎯 MVP

**Goal**: el jugador puede cambiar de modalidad en verano, elige una nueva variante de la nueva modalidad y la carrera sigue con ella.

**Independent Test**: forzar la situación de cambio de modalidad, elegir cambiar, comprobar que se pide la nueva variante y que las decisiones siguientes usan la nueva modalidad.

### Tests for User Story 1

- [X] T015 [US1] Test de motor del flujo de modalidad (elegir `cambiaModalidad` → `fase "variante"` → `elegirVarianteDeCambio` válido/ inválido → `"decision"`) en `src/engine/__tests__/trayectoria.test.ts`.
- [X] T016 [P] [US1] Test de que la selección posterior usa la nueva modalidad en `src/engine/__tests__/selector.test.ts`.

### Implementation for User Story 1

- [X] T017 [US1] Añadir 2 situaciones de cambio de modalidad (chirigotero → comparsista y comparsista → chirigotero) en `src/content/decisiones/verano/personaje.ts`, con 2 opciones (seguir/cambiar), filtradas por modalidad, repetibles, `minAno` y frecuencia baja.
- [X] T018 [US1] Añadir el test de integridad de las situaciones de modalidad (2 opciones, nunca en febrero, filtro de modalidad correcto) en `src/content/__tests__/integridad.test.ts`.
- [X] T019 [US1] Añadir la pantalla `"cambio-variante"`, la acción `elegirVarianteCambio()` y el manejo del paso en `refrescarPaso()` en `src/juego/estado.svelte.ts`.
- [X] T020 [US1] Renderizar el paso con `ElegirVariante` y `paso.modalidad` en `src/juego/Juego.svelte`.
- [X] T021 [P] [US1] Añadir el texto del paso en `src/juego/presentacion.ts` y un `titulo` opcional en `src/juego/pantallas/ElegirVariante.svelte`.
- [X] T022 [US1] Test de la isla: elegir cambio de modalidad lleva a `cambio-variante` y elegir variante continúa en febrero en `src/juego/__tests__/estado.test.ts`.
- [X] T023 [US1] Documentar las 2 situaciones en `docs/03-banco-verano.md`.
- [ ] T024 [US1] (Opcional) Smoke E2E del flujo de cambio de modalidad en `tests/e2e/jugar.spec.ts`.

**Checkpoint**: US1 es demostrable de principio a fin (motor + contenido + UI).

---

## Phase 4: User Story 2 - Evolución de estilo sin que se note la mecánica (Priority: P2)

**Goal**: la variante cambia por dentro a través de decisiones normales, en cualquier dirección y de forma repetible, con baja frecuencia.

**Independent Test**: forzar una situación de cambio de variante, comprobar que se muestra como decisión normal, que la variante cambia por dentro y que la selección posterior la usa.

### Tests for User Story 2

- [X] T025 [US2] Test de motor: `cambiaVariante` actualiza la variante y registra la trayectoria; repetible en `src/engine/__tests__/trayectoria.test.ts`.
- [X] T026 [P] [US2] Test de ponderación por `peso` y de filtro por variante en `src/engine/__tests__/selector.test.ts`.

### Implementation for User Story 2

- [X] T027 [US2] Añadir el conjunto semilla de situaciones de cambio de variante (cualquier dirección entre las variantes de la modalidad, repetibles, frecuencia baja) en `src/content/decisiones/verano/contenido.ts`.
- [X] T028 [US2] Test de integridad de variantes: `cambiaVariante` y los filtros `variantes` referencian ids válidos de su modalidad en `src/content/__tests__/integridad.test.ts`.
- [X] T029 [US2] Documentar las situaciones en `docs/03-banco-verano.md`.

**Checkpoint**: US2 funciona y es verificable sin tocar la UI.

---

## Phase 5: User Story 3 - Trayectoria coherente y registrada (Priority: P3)

**Goal**: la trayectoria se conserva al guardar/restaurar y la simulación detecta cualquier estado incoherente.

**Independent Test**: completar una carrera con cambios, guardar, restaurar y comprobar que la trayectoria es idéntica; simular y comprobar 0 incoherencias.

### Tests for User Story 3

- [X] T030 [P] [US3] Test: `construirResumen` incluye `trayectoria` y no incluye `destino` en `src/engine/__tests__/resumen.test.ts`.
- [X] T031 [P] [US3] Test de persistencia: ida/vuelta con trayectoria y con `fase = "variante"` en `src/juego/__tests__/estado.test.ts`.
- [X] T032 [P] [US3] Test de determinismo: misma semilla + decisiones ⇒ misma trayectoria en `src/engine/__tests__/determinismo.test.ts`.

### Implementation for User Story 3

- [X] T033 [US3] Añadir a `src/simulacion/auditoria.ts` las comprobaciones de trayectoria (`trayectoriaIncoherente`, `varianteInvalida`) y sus códigos en `src/simulacion/tipos.ts`.

**Checkpoint**: las tres historias funcionan y son verificables por separado.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T034 [P] Actualizar `docs/02-arquitectura-tecnica.md` §7/§8 con el modelo de trayectoria y la fase `"variante"`.
- [X] T035 [P] Registrar en `docs/registro/decisiones-cerradas.md` lo que proceda (repetibilidad de los cambios, versión 2).
- [X] T036 Ejecutar `npm run simular -- --n 10000` y comprobar 0 `varianteInvalida`/`trayectoriaIncoherente`; calibrar la frecuencia de las situaciones de cambio.
- [X] T037 Ejecutar `npm run check` y recorrer `specs/006-trajectory-change/quickstart.md`.
- [X] T038 [P] Revisar accesibilidad de la pantalla de cambio de variante (skill `accessibility`).
- [X] T039 [P] Verificar pureza del motor: `rg "Math\.random|Date\.now|document\.|window\." src/engine` = 0 resultados.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup y **bloquea** las tres historias.
- **User Stories (Phases 3–5)**: dependen de Foundational; pueden ir en paralelo o en orden P1 → P2 → P3.
- **Polish (Phase 6)**: depende de las historias que se quieran cerrar.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias; es el MVP.
- **US2 (P2)**: sin dependencias de US1 (comparte el reducer ya construido en Foundational); no toca la UI.
- **US3 (P3)**: sin dependencias de US1/US2; verifica persistencia y auditoría.

### Within Foundational

- T003 bloquea a T004–T012.
- T005 → T007 → T008 → T009 (todas en `src/engine/partida.ts`, en serie).
- T011 depende de T004 y T009; T013 depende de T009; T014 depende de todo lo anterior.

### Within Each User Story

- Tests primero (deben fallar) → contenido → UI → integración.
- Los ficheros que se repiten entre historias (`trayectoria.test.ts`, `selector.test.ts`, `integridad.test.ts`, `estado.test.ts`) van en serie entre sí.

### Parallel Opportunities

- T004, T006, T010 y T012 son [P] entre sí tras T003 (ficheros distintos).
- T016 en paralelo con T017/T018 (test y contenido, ficheros distintos).
- T021 en paralelo con T022/T023.
- T026 en paralelo con T027.
- T030, T031 y T032 en paralelo entre sí.
- T034, T035, T038 y T039 en paralelo al final.

---

## Parallel Example: Foundational (tras T003)

```bash
# Ficheros distintos, sin dependencias entre sí:
Task: "Crear src/engine/trayectoria.ts"
Task: "Ponderar por Situacion.peso en src/engine/selector.ts"
Task: "Exponer trayectoria en src/engine/resumen.ts"
Task: "Ampliar src/content/schema.ts y src/content/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup.
2. Phase 2: Foundational (bloqueante).
3. Phase 3: US1 → **PARAR y VALIDAR** (motor + 2 situaciones + pantalla de cambio).
4. Demo si está listo.

### Incremental Delivery

1. Setup + Foundational → motor de trayectoria listo.
2. US1 → demo (cambio de modalidad).
3. US2 → demo (evolución de variante).
4. US3 → verificación de persistencia y auditoría.
5. Polish → docs, simulación 10.000, quickstart, accesibilidad.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- Etiqueta [Story] para trazabilidad con `spec.md`.
- Todo el núcleo del motor vive en Foundational porque `Paso`/`FasePartida` afectan a compilación de `simulacion` y tests.
- `VERSION_PARTIDA` sube a 2: no migrar, el guardado v1 se descarta (política 005).
- No commitear sin petición explícita.
