---
description: "Task list for feature 028-gender-text-variants"
---

# Tasks: Textos de situación adaptados al género del personaje

**Input**: Design documents from `/specs/028-gender-text-variants/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/genero-textos.md, quickstart.md

**Tests**: Obligatorios para `engine` y `content` según la constitución (Principio III): toda tarea que toque motor o contenido incluye su test determinista. No hay tests E2E de navegador (la UI del juego no cambia).

**Organization**: Tareas agrupadas por historia de usuario (US1, US2, US3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1, US2 o US3
- Rutas exactas en cada tarea

## Path Conventions

- Proyecto único: `src/engine/`, `src/content/`, `src/panel-ui/`, `src/panel/`, `docs/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el estado de partida y leer los ficheros a tocar.

- [x] T001 Ejecutar el baseline y anotarlo: `npx vitest run`, `npx astro check`, `npx biome check .` (no editar todavía)
- [x] T002 [P] Leer los ficheros a modificar sin editar: `src/content/schema.ts`, `src/engine/types.ts`, `src/engine/selector.ts`, `src/engine/partida.ts`, `src/engine/index.ts`, `src/panel-ui/FormularioSituacion.svelte`, `FormularioCondicional.svelte`, `FormularioOpcion.svelte`, `DetalleSituacion.svelte`, `src/panel/generador.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: El contrato de datos (campos opcionales) que necesitan todas las historias.

**⚠️ CRITICAL**: ninguna historia puede empezar sin estos campos.

- [x] T003 Añadir a `src/content/schema.ts` los campos opcionales de `Situacion` (`tituloFemenino?`, `textoFemenino?`) y de `Opcion` (`tituloFemenino?`, `subtituloFemenino?`) con `z.string().optional()`; mantener `strictObject` y las reglas cruzadas intactas (FR-001, FR-002, FR-003)
- [x] T004 Añadir los mismos campos opcionales a las interfaces `Situacion` y `Opcion` de `src/engine/types.ts` (mantener en sincronía con `src/content/schema.ts`)
- [x] T005 [P] Ampliar `src/content/__tests__/integridad.test.ts`: contenido con y sin campos femeninos valida; un campo desconocido sigue siendo rechazado; los ids no cambian (FR-013)

**Checkpoint**: el contrato de datos está listo y validado; pueden empezar las historias.

---

## Phase 3: User Story 1 - El jugador femenino lee en femenino (Priority: P1) 🎯 MVP

**Goal**: Con género femenino, un campo con variante femenina escrita usa esa variante; sin variante, la forma por defecto. Con masculino, siempre la forma por defecto.

**Independent Test**: test unitario de resolución + `toPublica` con contexto (femenino/masculino/vacío); y en `/jugar` con contenido que tenga variante femenina.

### Implementation for User Story 1

- [x] T006 [US1] Crear `src/engine/genero.ts` con `resolverTexto(porDefecto, femenino, genero, campo, azar)`: femenino válido + género femenino → femenino; masculino → por defecto; vacío/solo espacios → por defecto. (La rama no binaria se añade en T020; aquí devuelve por defecto.) (FR-003, FR-004, FR-005)
- [x] T007 [US1] En `src/engine/selector.ts`: definir `ContextoGenero { genero; azar }` y `toPublica(s, contexto?)` que resuelve `titulo`/`texto` y `titulo`/`subtitulo` de cada opción con claves de campo `"titulo"`, `"texto"`, `"opcion:<id>:titulo"`, `"opcion:<id>:subtitulo"`; sin contexto devuelve las formas por defecto (retrocompatible) (FR-008)
- [x] T008 [US1] En `src/engine/partida.ts` (`siguientePaso`): construir `const azar = (campo) => rngPara(p.seed, "genero", situacion.id, campo)()` y llamar a `toPublica(situacion, { genero: p.personaje.genero, azar })` (FR-014)
- [x] T009 [US1] En `src/engine/index.ts`: exportar `resolverTexto` y el tipo `ContextoGenero` (FR-008)
- [x] T010 [P] [US1] Crear `src/engine/__tests__/genero.test.ts`: tabla de resolución para masculino/femenino, `femenino` ausente/vacía/solo espacios; INVs 1–3 de `data-model.md`
- [x] T011 [P] [US1] Ampliar `src/engine/__tests__/selector.test.ts`: `toPublica` con contexto femenino (título/texto y opciones), sin contexto (formas por defecto) y con un `Condicional` (que extiende `Situacion`) resolviendo igual (FR-009)
- [x] T012 [US1] Confirmar que el snapshot de la partida de referencia (personaje masculino) **no cambia**: `npx vitest run src/engine/__tests__/snapshot.test.ts` (SC-006)
- [ ] T013 [US1] Validación manual (quickstart §3, femenino/masculino) sobre contenido con variante femenina

**Checkpoint**: la resolución por género funciona y es determinista; el juego no cambia de código.

---

## Phase 4: User Story 2 - El autor escribe la variante femenina desde el panel (Priority: P1)

**Goal**: El panel permite escribir los cuatro textos femeninos y el volcado los incluye (rellenos) u omite (vacíos), sin tocar código.

**Independent Test**: crear/editar una situación con variantes femeninas en el panel, `npm run panel:volcar` y comprobar en `src/content/decisiones/*.ts` que aparecen los rellenos y no los vacíos.

### Implementation for User Story 2

- [x] T014 [P] [US2] En `src/panel-ui/FormularioSituacion.svelte`: añadir una `Seccion titulo="Variante femenina"` con `tituloFemenino` y `textoFemenino`; al enviar, omitir los campos vacíos (`undefined`) (FR-011, FR-012)
- [x] T015 [P] [US2] En `src/panel-ui/FormularioCondicional.svelte`: igual que T014 (mismos campos de situación) (FR-011, FR-012)
- [x] T016 [P] [US2] En `src/panel-ui/FormularioOpcion.svelte`: añadir una `Seccion titulo="Variante femenina"` con `tituloFemenino` y `subtituloFemenino`; omitir vacíos al guardar (FR-011, FR-012)
- [x] T017 [US2] En `src/panel-ui/DetalleSituacion.svelte`: mostrar las variantes femeninas cuando existan (título/texto y por opción) (FR-011)
- [x] T018 [US2] Ampliar `src/panel/__tests__/generador.test.ts`: round-trip del volcado con campos femeninos rellenos (se incluyen) y vacíos/ausentes (se omiten) (FR-012)
- [ ] T019 [US2] Validación manual (quickstart §2): rellenar desde el panel, `npm run panel:volcar` y comprobar el resultado en el juego (SC-004)

**Checkpoint**: el autor puede introducir los textos femeninos de punta a punta.

---

## Phase 5: User Story 3 - El jugador no binario ve una mezcla (Priority: P2)

**Goal**: Con género no binario, la forma se elige por azar determinista sembrado, por campo, sin fijarse siempre en la por defecto.

**Independent Test**: test unitario de la rama no binaria (determinismo + ambas formas a lo largo de varios campos); y en `/jugar` reanudar una partida no binaria muestra los mismos textos.

### Implementation for User Story 3

- [x] T020 [US3] En `src/engine/genero.ts`: añadir la rama no binaria `azar(campo) < 0.5 ? femenino : porDefecto` (solo si hay variante femenina válida) (FR-006, FR-007)
- [x] T021 [P] [US3] Ampliar `src/engine/__tests__/genero.test.ts`: para no binario, misma clave → mismo resultado; a lo largo de varios campos aparecen ambas formas; sin variante → por defecto (INV-4, SC-003)
- [x] T022 [P] [US3] Ampliar `src/engine/__tests__/determinismo.test.ts`: misma semilla + decisiones + género no binario → misma secuencia de `Paso`; reanudar reproduce los mismos textos (FR-014, SC-005)
- [ ] T023 [US3] Validación manual (quickstart §4): determinismo al reanudar y al repetir semilla/decisiones

**Checkpoint**: el comportamiento no binario es reproducible y muestra mezcla.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentación fuente y verificación global.

- [x] T024 Actualizar `docs/02-arquitectura-tecnica.md` §7: campos femeninos en las interfaces `Opcion`/`Situacion` y nota de la resolución por género
- [x] T025 [P] Actualizar `docs/01-diseno-juego.md` §1: nota de las variantes de texto por género y la regla de resolución
- [x] T026 [P] Actualizar `AGENTS.md` §5 (reglas del content) y §12 (trabajo con contenido): campos femeninos opcionales y su semántica
- [ ] T027 [P] (Opcional) Añadir variantes femeninas de ejemplo a 1–2 situaciones reales usando el panel y `npm run panel:volcar`
- [x] T028 Ejecutar `npm run check` (Astro check + Biome + Vitest) y corregir lo introducido (SC-007)
- [ ] T029 Ejecutar el `quickstart.md` completo y revisar `git status`/`git diff` (solo `src/engine/**`, `src/content/**`, `src/panel-ui/**`, `docs/**`, `AGENTS.md`; el juego no se toca). **No commitear** sin petición explícita

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup; BLOQUEA US1–US3 (campos del contrato).
- **US1 (Fase 3)**: depende de Foundational. Es el tronco del motor.
- **US2 (Fase 4)**: depende de Foundational; toca el panel (`src/panel-ui/**`, `src/panel/**`), independiente de US1.
- **US3 (Fase 5)**: depende de US1 (mismo `src/engine/genero.ts`).
- **Polish (Fase 6)**: depende de US1–US3.

### User Story Dependencies

- **US1 (P1)**: resolución femenino/masculino + cableado al paso. Sin dependencia de otras historias.
- **US2 (P1)**: autoría en el panel. Independiente de US1 (ficheros distintos).
- **US3 (P2)**: rama no binaria; extiende `genero.ts` de US1.

### Within Each User Story

- Datos (Foundational) antes de motor y panel.
- Implementación antes de validación manual.
- Test que falle antes (o junto) a la implementación.

### Parallel Opportunities

- Setup: T002.
- Foundational: T005 (test) en paralelo con T003/T004.
- US1: T010 y T011 (tests distintos).
- US2: T014, T015 y T016 (componentes distintos); T017 y T018 en paralelo tras los formularios.
- US3: T021 y T022 (tests distintos).
- Polish: T025, T026 y T027.

---

## Parallel Example: User Story 2

```bash
Task: "T014 FormularioSituacion.svelte: sección Variante femenina"
Task: "T015 FormularioCondicional.svelte: sección Variante femenina"
Task: "T016 FormularioOpcion.svelte: sección Variante femenina"
```

---

## Parallel Example: User Story 3

```bash
Task: "T021 genero.test.ts: no binario determinista y mezcla"
Task: "T022 determinismo.test.ts: misma semilla/género → misma secuencia"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup → Foundational (contrato de datos) → US1.
2. **STOP and VALIDATE**: `toPublica` resuelve femenino/masculino; snapshot intacto; tests en verde.
3. US2 completa el circuito de autoría; US3 añade el no binario.

> Nota: US1 y US2 son ambas P1; lo demoable de verdad (ver texto femenino en el juego) requiere **US1 + US2**. Se recomienda entregar US1+US2 como primer incremento.

### Incremental Delivery

1. Foundational + US1 → resolución por género (motor).
2. US2 → el panel permite escribir y volcar los textos.
3. US3 → el no binario alterna de forma determinista.
4. Polish → documentación + `npm run check` + quickstart.

### Notes

- El **juego no se toca**: la isla Svelte y `src/juego/**` quedan fuera (FR-008, FR-010).
- **Sin dependencias nuevas** ni cambios de `VERSION_ALMACEN`/`VERSION_PARTIDA`.
- El azar no binario usa un **stream propio** (`"genero"`): no altera selección, condicionales ni COAC.
- El historial interno y la tarjeta final quedan fuera de alcance.
- No commitear sin petición explícita.
