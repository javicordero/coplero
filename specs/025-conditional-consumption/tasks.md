---
description: "Task list for feature 025-conditional-consumption"
---

# Tasks: Consumo de flags por condicional

**Input**: Design documents from `/specs/025-conditional-consumption/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/consumo.md, quickstart.md

**Tests**: Incluidos. El Principio III de la constitución exige tests deterministas para cambios de `engine`/`content`, y la spec/plan los asumen.

**Organization**: Tareas agrupadas por historia de usuario (US1, US2, US3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1, US2 o US3
- Rutas exactas en cada tarea

## Path Conventions

- Proyecto único: `src/`, `scripts/`, `specs/` en la raíz (según `plan.md`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el estado de partida y el inventario de consumidores.

- [x] T001 Ejecutar el baseline de tests: `npx vitest run src/engine src/content src/simulacion` y anotar el resultado (los 2 fallos de `forma-carrera`/T23 son preexistentes y ajenos)
- [x] T002 [P] Inventario de consumidores a cambiar (solo lectura, sin editar): buscar `consumida`, `consumeFlag` y `consume:` en `src/engine`, `src/content`, `src/panel`, `src/panel-ui`, `src/simulacion` y `content-admin/data/situaciones.json` para fijar la lista exacta

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: El cambio de modelo de estado del que dependen todas las historias.

**⚠️ CRITICAL**: ninguna historia puede empezar sin esto.

- [x] T003 En `src/engine/types.ts`: cambiar `Flag` de `{ ano, veces, consumida: boolean, anosConsecutivos }` a `{ ano, veces, consumidaPor: string[], anosConsecutivos }`, y subir `VERSION_PARTIDA` de `2` a `3`

**Checkpoint**: el modelo de estado es el nuevo; el resto de ficheros se ajustan en las historias.

---

## Phase 3: User Story 1 - Un condicional basado en una flag se agota solo (Priority: P1) 🎯 MVP

**Goal**: El condicional que se dispara no vuelve a salir, sin bloquear a otros que compartan la flag.

**Independent Test**: test unitario en `src/engine/__tests__/condicionales.test.ts` que dispara un condicional (consume su flag activa) y comprueba que su requisito deja de cumplirse, mientras que el de otro condicional que usa la misma flag sigue cumpliéndose.

### Implementation for User Story 1

- [x] T004 [US1] En `src/engine/condicionales.ts`: `requisitoCumplido(req, estado, consumidor?)` (una flag consumida por `consumidor` no cumple `flag`/`flagRepetida`; los compuestos propagan `consumidor`); `consumirFlagsDeRequisito(flags, req, condicionalId)` (añade el id a `consumidaPor` de las flags referenciadas **que existan**, sin duplicar); `actualizarFlags` deja de procesar `opcion.consume` y conserva `consumidaPor` al re-ganar (per `contracts/consumo.md`)
- [x] T005 [US1] En `src/engine/selector.ts`: evaluar los condicionales con `requisitoCumplido(c.requiere, p, c.id)`
- [x] T006 [US1] En `src/engine/partida.ts`: sustituir el bloque `consumeFlag` por consumo **siempre** del condicional (`consumirFlagsDeRequisito(flags, situacion.requiere, situacion.id)`)
- [x] T007 [P] [US1] En `src/engine/__tests__/condicionales.test.ts`: actualizar el helper `flag()` y añadir tests de (a) consumo por condicional, (b) flag compartida intacta, (c) `alguna` consume solo la activa, (d) `ninguna` no consume, (e) re-ganar no limpia `consumidaPor`, (f) condicional sin requisito efectivo (repetible) no consume nada
- [x] T008 [P] [US1] Actualizar los literales de `Flag` a `consumidaPor: []` en `src/engine/__tests__/premios.test.ts` (el helper `flag()` de `condicionales.test.ts` ya lo cubre T007)
- [x] T009 [US1] En `src/simulacion/auditoria.ts`: adaptar la regla `flagConsumidaSinRegistro` a `flag.consumidaPor.length > 0 && !introducidas.has(id)`
- [x] T010 [P] [US1] En `src/simulacion/__tests__/auditoria.test.ts`: actualizar el literal `perdida` a `consumidaPor: ["c"]` y ajustar el caso de la regla
- [x] T011 [US1] Regenerar el snapshot de referencia: `npx vitest run -u src/engine/__tests__/snapshot.test.ts` (cambia la forma de `Flag`)

**Checkpoint**: US1 funcional y verificable de forma aislada (motor).

---

## Phase 4: User Story 2 - Retirada del consumo manual (Priority: P1)

**Goal**: Fuera `Opcion.consume` y `Condicional.consumeFlag` del modelo, del panel y del banco.

**Independent Test**: `src/content/schema.ts` no contiene los campos; `npx vitest run src/content` valida el banco real; el formulario del panel no muestra el selector "consume" ni la casilla de consumo.

### Implementation for User Story 2

- [x] T012 [US2] En `src/content/schema.ts`: eliminar `consume` de `Opcion`/`OpcionSchema` y `consumeFlag` de `Condicional`/`CondicionalSchema`
- [x] T013 [US2] Normalizar los ficheros generados `src/content/condicionales/verano.ts` y `src/content/condicionales/febrero.ts` quitando `consumeFlag` (para que `content/index.ts` vuelva a validar); **no** tocar a mano el resto
- [x] T014 [US2] En `src/panel/esquema.ts`: subir `VERSION_ALMACEN` a `3` y ampliar `migrarAlmacen` para quitar `consume`/`consumeFlag` (v1→v3 con `condicionales: []`; v2→v3 normalizando)
- [x] T015 [US2] En `src/panel/almacen.ts`: leer con la migración v3 (ya encadenada a `migrarAlmacen`)
- [x] T016 [US2] Normalizar el almacén `content-admin/data/situaciones.json` (quitar `consumeFlag` de los condicionales) y ejecutar `npm run panel:volcar` para regenerar `decisiones/**` y `condicionales/**`
- [x] T017 [P] [US2] En `src/panel-ui/FormularioOpcion.svelte`: eliminar el `SelectorFlags` de `consume` (dejar solo el de `flags`)
- [x] T018 [P] [US2] En `src/panel-ui/FormularioCondicional.svelte`: eliminar la casilla `consumeFlag` (y su campo del borrador)
- [x] T019 [P] [US2] En `src/panel-ui/DetalleCondicional.svelte`: eliminar la fila `consumeFlag`
- [x] T020 [US2] En `src/simulacion/tipos.ts` quitar `consume` de `DecisionRegistrada`, en `src/simulacion/jugar.ts` dejar de registrar `consume`, y quitar `consume: []` del helper `decision()` en `src/simulacion/__tests__/auditoria.test.ts`
- [x] T021 [P] [US2] Actualizar tests afectados: `src/content/__tests__/integridad.test.ts` (quitar la comprobación de `consume`), `src/panel/__tests__/{esquema,almacen,crud,flags,resumen}.test.ts` (fixtures sin `consumeFlag`), `src/engine/__tests__/fixtures.ts` (quitar `consumeFlag` del condicional de prueba) y `src/simulacion/__tests__/contenido-muerto.test.ts`
- [x] T022 [US2] Ejecutar `npx vitest run src/content src/panel src/simulacion` y corregir hasta verde

**Checkpoint**: US2 funcional de forma aislada (contenido y panel sin consumo manual).

---

## Phase 5: User Story 3 - Compatibilidad del estado guardado (Priority: P2)

**Goal**: El estado lleva la versión nueva y una partida anterior se rechaza con error explícito.

**Independent Test**: `deserializar(JSON.stringify({ version: 2, ... }))` devuelve `VERSION_INCOMPATIBLE`; una partida de la versión nueva hace round-trip sin pérdida.

### Implementation for User Story 3

- [x] T023 [US3] En `src/engine/__tests__/serializacion.test.ts`: actualizar la aserción de versión a `expect(VERSION_PARTIDA).toBe(3)` y añadir un caso que rechace una partida `version: 2` con `VERSION_INCOMPATIBLE`
- [x] T024 [US3] Verificar el round-trip (`serializar`/`deserializar`) con la versión nueva y que `VERSION_CODIGO` (tarjeta) no cambia

**Checkpoint**: US3 verificable de forma aislada (compatibilidad de versión).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Gobernanza, documentación y verificación global.

- [x] T025 [P] Enmendar `.specify/memory/constitution.md` (Principio II, línea de "consumir una flag"): reflejar el consumo **por condicional** y la retirada del consumo manual; subir versión (MINOR) y anotar en el Sync Impact Report
- [x] T026 [P] Actualizar `docs/01-diseno-juego.md` §6 y `docs/02-arquitectura-tecnica.md` §7 (quitar `consume`/`consumeFlag`; describir el consumo por condicional)
- [x] T027 [P] Actualizar `AGENTS.md` §5.7 (regla de flags/consumo) y `docs/registro/decisiones-cerradas.md` (nueva fila del cambio de consumo y de la versión)
- [x] T028 [P] Actualizar las specs que documentan el consumo: `specs/001-deterministic-engine` (FR-009, data-model, spec), `specs/002-massive-simulation` (FR-019), `specs/003-content-bank` (FR-006, data-model), `specs/009-content-admin/data-model.md`
- [x] T029 Ejecutar `npm run check` completo (astro check + biome + vitest) y dejar en verde salvo los 2 fallos de `forma-carrera` (T23)
- [x] T030 Ejecutar los escenarios `quickstart.md` V1–V8 y confirmar cada resultado esperado
- [x] T031 Revisión final de `git status`/`git diff` (sin secretos, sin ficheros no intencionados); **no commitear** sin petición explícita

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup; BLOQUEA todas las historias (cambia `Flag` y la versión).
- **US1 (Fase 3)**: depende de Foundational. Es el núcleo del motor.
- **US2 (Fase 4)**: depende de Foundational; puede solaparse con US1 en el tiempo, pero comparte ficheros de tests con US1 (secuenciar las ediciones de tests).
- **US3 (Fase 5)**: depende de US1 (versión y snapshot).
- **Polish (Fase 6)**: depende de US1–US3.

### User Story Dependencies

- **US1 (P1)**: motor (consumo, `Flag`, selector, partida, auditoría, snapshot).
- **US2 (P1)**: contenido y panel (quitar campos, migrar almacén).
- **US3 (P2)**: compatibilidad de versión (tests).

### Within Each User Story

- Código antes que tests de la misma unidad; tests deterministas antes de dar por cerrada la historia.
- `engine` antes que `simulacion` (la auditoría consume el nuevo modelo).

### Parallel Opportunities

- Setup: T002.
- US1: T007, T008, T010 (ficheros de test distintos).
- US2: T017, T018, T019 (componentes Svelte distintos), T021.
- Polish: T025, T026, T027, T028.

---

## Parallel Example: User Story 1

```bash
Task: "T007 condicionales.test.ts (consumo por condicional)"
Task: "T008 literales Flag en premios.test.ts / helpers.ts / fixtures.ts"
Task: "T010 auditoria.test.ts (regla consumidaPor)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup → Foundational → US1.
2. **STOP and VALIDATE**: test unitario de consumo por condicional + flag compartida + snapshot.
3. US1 es el comportamiento central del motor.

### Incremental Delivery

1. Foundational + US1 → motor listo.
2. US2 → contenido y panel sin consumo manual.
3. US3 → compatibilidad de versión verificada.
4. Polish → gobernanza, docs y `npm run check`.

### Notes

- **Orden de migración delicado**: al quitar campos del esquema estricto, normalizar primero `content/condicionales/*.ts` (T013) para que `content/index.ts` valide; después el almacén (T016) y el volcado.
- El snapshot (T011) y `VERSION_PARTIDA` (T003/T023) van juntos: cambia la forma de `Flag`.
- No editar a mano los ficheros "GENERADO" salvo la normalización puntual de T013; el resto lo hace `npm run panel:volcar`.
- Los 2 fallos de `forma-carrera` (T23) son preexistentes y ajenos.
- No commitear sin petición explícita.
