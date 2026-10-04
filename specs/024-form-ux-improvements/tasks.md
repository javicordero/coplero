---
description: "Task list for feature 024-form-ux-improvements"
---

# Tasks: Mejoras de usabilidad del formulario de situaciones

**Input**: Design documents from `/specs/024-form-ux-improvements/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Per the Coplero constitution (Principle III) and research R8, this feature includes deterministic Vitest unit tests for the pure panel logic (identificadores, flags, esquema, crud, generador, importador). No Playwright/E2E (panel is dev-only).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `src/`, `scripts/`, `specs/` at repository root (per plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the workspace and existing panel baseline before touching code.

- [x] T001 Verify current panel tests pass as baseline: run `npx vitest run src/panel` and note the result (the only expected failures repo-wide are the 2 `forma-carrera` tests, T23, which are unrelated)
- [x] T002 [P] Read and confirm the panel pipeline files to modify: `src/panel/esquema.ts`, `src/panel/almacen.ts`, `src/panel/crud.ts`, `src/panel/generador.ts`, `src/panel/importador.ts`, `src/panel/resumen.ts` (no code change yet)
- [x] T003 [P] Read and confirm the panel UI + API files to modify: `src/panel-ui/Panel.svelte`, `src/panel-ui/FormularioSituacion.svelte`, `src/panel-ui/FormularioOpcion.svelte`, `src/panel-ui/DetalleSituacion.svelte`, `src/panel-ui/TablasMomentos.svelte`, `src/pages/api/panel/situaciones.ts`, `src/pages/api/panel/situaciones/[id].ts`, `src/pages/api/panel/importar.ts` (no code change yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure helpers and the full-bank almacén that all stories build on. US4 (conditionals) depends on the almacén v2; US1/US3 use the id and flag helpers.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Create `src/panel/identificadores.ts` (pure): implement `derivarId(texto: string): string` (NFD normalize, lowercase, strip diacritics, non-alphanumeric → `_`, collapse and trim `_`, `""` if empty) and `derivarIdUnico(base: string, usados: ReadonlySet<string>): string` per `contracts/identificadores.md`
- [x] T005 [P] Create `src/panel/__tests__/identificadores.test.ts`: cover accents/uppercase/signs, empty/only-signs → `""`, no collision, `_2`/`_3`, gap reuse, determinism (per `contracts/identificadores.md`)
- [x] T006 [P] Create `src/panel/flags.ts` (pure): export `catalogoFlags(banco): string[]` that reuses `flagsDeclaradas` from `src/content/informe.ts` (declared flags from every option of situations + conditionals), sorted and deduplicated
- [x] T007 [P] Create `src/panel/__tests__/flags.test.ts`: declared flags are included, referenced-only flags are not invented, result is sorted and unique, empty bank → `[]`
- [x] T008 Extend `src/panel/esquema.ts`: bump `VERSION_ALMACEN` to `2`; `Almacen` gains `condicionales: Condicional[]`; `AlmacenSchema` validates `situaciones` + `condicionales` and rejects duplicate ids across the union; keep `ErrorValidacion`/`mensajesDeError`/`formatearErrores` (per `contracts/almacen.md`). **Nota de orden**: al hacer `condicionales` obligatorio, actualizar también los fixtures `Almacen` de `src/panel/__tests__/crud.test.ts` (T026) y `src/panel/__tests__/generador.test.ts` (T036) añadiendo `condicionales: []`, para no dejarlos en rojo entre medias
- [x] T009 Create `src/panel/__tests__/esquema.test.ts`: v2 valid shape, duplicate id across situación/condicional rejected, `version: 3` rejected, empty arrays accepted
- [x] T010 Update `src/panel/almacen.ts`: `leer()` migrates a `version: 1` payload to `{ version: 2, situaciones, condicionales: [] }`; `almacenVacio()` returns v2 with both arrays; writes persist v2 (per `contracts/almacen.md`)
- [x] T011 Update `src/panel/__tests__/almacen.test.ts`: add v1→v2 migration on read, v2 round-trip, and empty-almacén shape (keep existing tests green)
- [x] T012 Update `src/panel/importador.ts`: `leerBancoActual()` returns `{ situaciones, condicionales }` sorted by id; `importarBancoActual()` writes `{ version: 2, situaciones, condicionales }` (per research R4)
- [x] T013 Update `src/panel/__tests__/importador.test.ts`: imports situations **and** conditionals, both sorted, deterministic re-import

**Checkpoint**: Pure helpers exist and the almacén round-trips the full bank (situations + conditionals) with v1→v2 migration.

---

## Phase 3: User Story 1 - Identificadores automáticos a partir del título (Priority: P1) 🎯 MVP

**Goal**: Crear situaciones y opciones sin teclear el id: se deriva del título, es editable y se desambigua solo ante colisión.

**Independent Test**: Escribir un título con acentos y comprobar que el id de la situación (y el de la opción) se rellena solo; forzar una colisión y comprobar que se propone `…_2`.

### Implementation for User Story 1

- [x] T014 [US1] Update `src/panel-ui/FormularioSituacion.svelte`: derive the situation `id` from `titulo` via `derivarId`/`derivarIdUnico` while creating and not hand-edited; keep the field editable; show an "ajustado automáticamente" hint when the result differs from the plain slug; keep `id` disabled and immutable when editing (FR-001, FR-002, FR-006, per `contracts/ui-panel.md`)
- [x] T015 [US1] Add the `usados: Set<string>` prop to `src/panel-ui/FormularioSituacion.svelte` (existing situation + conditional ids) so `derivarIdUnico` avoids collisions (FR-021)
- [x] T016 [US1] Update `src/panel-ui/FormularioOpcion.svelte`: derive the option `id` from its `titulo` with the same rule and disambiguation against the other option ids of the same entity; keep editable (FR-003)
- [x] T017 [US1] Update `src/panel-ui/Panel.svelte`: compute and pass `usados` (ids of loaded situaciones + condicionales) to the forms; keep submit/validation wiring (FR-004)
- [x] T018 [US1] Ensure `src/panel-ui/FormularioSituacion.svelte` blocks submit when the derived `id` is empty and shows a legible message (FR-005)

**Checkpoint**: US1 works independently — no id needs to be typed, and collisions resolve automatically.

---

## Phase 4: User Story 2 - Repetición clara y por defecto segura (Priority: P1)

**Goal**: La casilla "repetible" sale desmarcada por defecto y refleja el estado real al editar; "una sola vez" es el comportamiento por defecto.

**Independent Test**: Abrir "Nueva situación" y ver la casilla desmarcada; guardar sin tocarla y comprobar que la situación es de una sola vez; marcarla y comprobar lo contrario.

### Implementation for User Story 2

- [x] T019 [US2] Update `src/panel-ui/FormularioSituacion.svelte`: replace the "única vez" checkbox with a **"repetible"** checkbox, unchecked by default; map `repetible = !(unicaVez ?? true)` on load and `unicaVez = repetible ? false : undefined` on save (per research R5, FR-007…FR-010, FR-016)
- [x] T020 [US2] Update `src/panel-ui/DetalleSituacion.svelte`: show the repetition state in the "repetible" vocabulary (derive from `unicaVez`) so the detail view matches the form

**Checkpoint**: US2 works independently — the safe default is one occurrence per playthrough.

---

## Phase 5: User Story 3 - Selección de flags sin texto libre (Priority: P2)

**Goal**: Las flags que la opción deja (`flags`) y las que consume (`consume`) se eligen de un selector múltiple con el catálogo del banco; desaparece el texto libre separado por comas.

**Independent Test**: Abrir una opción, ver ambos selectores con las flags del banco, marcar varias y reabrir para comprobar que se conservan.

### Implementation for User Story 3

- [x] T021 [P] [US3] Create `src/panel-ui/SelectorFlags.svelte`: reusable multiselect with props `etiqueta`, `seleccion` (`$bindable`, `string[] | undefined`), `disponibles: string[]`, `permiteNuevas: boolean`, `ayuda?`; empty selection → `undefined`; empty catalog → legible hint that does not block saving; with `permiteNuevas`, a new flag is added to the in-memory catalog (FR-012, FR-022, per `contracts/ui-panel.md`)
- [x] T022 [US3] Update `src/panel-ui/FormularioOpcion.svelte`: replace the comma-separated inputs for `flags` and `consume` with two `SelectorFlags`, receiving `flags: string[]` (catalog) from the parent; enable `permiteNuevas` only for `flags` (dejar), not for `consume` (FR-011, FR-013, FR-015, FR-022)
- [x] T023 [US3] Update `src/panel-ui/Panel.svelte`: load the flag catalog from the `GET` payload (`flags`) and pass it down to the forms
- [x] T024 [US3] Update `src/pages/api/panel/situaciones.ts`: `GET` returns `{ situaciones, condicionales, flags }` using `catalogoFlags` from `src/panel/flags.ts` (per `contracts/ui-panel.md`)

**Checkpoint**: US3 works independently — no comma-separated flag text remains in the form.

---

## Phase 6: User Story 4 - Edición de condicionales con las mismas mejoras (Priority: P2)

**Goal**: El panel permite listar, crear y editar condicionales con sus campos propios (requisito, ventana, probabilidad, consumeFlag), con las mismas mejoras de id, repetible y selector de flags.

**Independent Test**: Abrir la vista Condicionales, crear uno rellenando sus campos y comprobar que se guarda validado; probar una probabilidad fuera de rango y ver el rechazo legible.

### Implementation for User Story 4

- [x] T025 [US4] Update `src/panel/crud.ts`: add CRUD for conditionals (`crearCondicional`, `actualizarCondicional`, `eliminarCondicional`) mirroring the situation functions, validating with `CondicionalSchema` and the full-bank `BancoContenidoSchema` built from the almacén (per research R4)
- [x] T026 [US4] Update `src/panel/__tests__/crud.test.ts`: cover conditional create/update/delete, id immutability, id clash across types, invalid `probabilidad`, and orphan-flag protection on delete
- [x] T027 [P] [US4] Create `src/pages/api/panel/condicionales.ts`: `GET` (list) and `POST` (create) with the dev guard and the `{ errores }` envelope (per `contracts/ui-panel.md`)
- [x] T028 [P] [US4] Create `src/pages/api/panel/condicionales/[id].ts`: `PUT` (update) and `DELETE` with the dev guard and the `{ errores }` envelope
- [x] T029 [US4] Update `src/panel/resumen.ts`: add `agruparCondicionalesPorMomento` (or generalize `agruparPorMomento`) reusing the same groups shape for conditionals
- [x] T030 [US4] Update `src/panel/__tests__/resumen.test.ts`: cover the conditional grouping (count sum, each once, per-momento counts)
- [x] T031 [US4] Create `src/panel-ui/FormularioCondicional.svelte`: same fields as a situation plus `requiere`, `ventanaAnos`, `probabilidad`, `consumeFlag`; reuse `SelectorFlags` and the id/repetible behaviour
- [x] T032 [US4] Create `src/panel-ui/DetalleCondicional.svelte`: read-only view of a conditional (or extend `DetalleSituacion.svelte` to render the extra fields)
- [x] T033 [US4] Update `src/panel-ui/TablasMomentos.svelte`: accept the active entity type, render an "situación/condicional" label, and (for conditionals) surface ventana/probabilidad/requisito compactly
- [x] T034 [US4] Update `src/panel-ui/Panel.svelte`: add the Situaciones | Condicionales view switch, load both from `GET`, and wire create/edit/delete to the conditional endpoints
- [x] T035 [US4] Update `src/panel/generador.ts`: also group and serialize conditionals, and write `src/content/condicionales/{verano,febrero}.ts` (`condicionalesVerano`/`condicionalesFebrero`) with the "GENERADO" header; validate the full almacén bank (per `contracts/generador.md`)
- [x] T036 [US4] Update `src/panel/__tests__/generador.test.ts`: conditionals grouped without loss, deterministic serialization, invalid conditional → `ErrorVolcado`, valid volcado yields the 4 files with header
- [x] T037 [US4] Update `src/pages/api/panel/importar.ts` and `scripts/panel-volcar.ts` output/counts to reflect situations **and** conditionals (per `contracts/generador.md`)

**Checkpoint**: US4 works independently — conditionals are editable in the panel and the volcado regenerates their `.ts` files.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Consistency, docs and full verification across stories.

- [x] T038 [P] Update `specs/009-content-admin/data-model.md` and `specs/009-content-admin/contracts/{almacen,generador,panel}.md` to reflect the v2 full-bank almacén and conditional editing
- [x] T039 [P] Update `docs/02-arquitectura-tecnica.md`: en §11 (panel), indicar que el panel gestiona situaciones **y** condicionales y regenera `decisiones/**` y `condicionales/**`; corregir también el comentario del script `panel:volcar` (línea del árbol de `package.json`, que hoy dice solo `src/content/decisiones/**`) y el título "Panel local de situaciones" si procede
- [x] T040 [P] Register the scope change in `docs/registro/decisiones-cerradas.md` (panel edits conditionals; almacén v2 full bank)
- [x] T041 Run `npm run panel:volcar` and confirm `src/content/decisiones/{verano,febrero}.ts` and `src/content/condicionales/{verano,febrero}.ts` are regenerated with no content change (byte-identical content, only the header/provenance for conditionals)
- [x] T042 Run `npx vitest run src/panel src/content` and confirm all panel + content tests pass
- [x] T043 Run `npx astro check` and `npx biome check .`; fix any issue introduced by this feature
- [x] T044 Execute the `quickstart.md` scenarios E1–E6 manually against `npm run dev` and confirm each expected outcome
- [x] T045 Final `git status`/`git diff` review: confirmar que **no** se toca `src/engine/**` ni `src/content/schema.ts` (FR-014), que no hay secretos ni ficheros no intencionados; **no commitear** sin petición explícita (constitution)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (helpers + almacén v2).
- **User Stories (Phase 3–6)**: All depend on Foundational.
  - `src/panel-ui/Panel.svelte` lo editan T017 (US1), T023 (US3) y T034 (US4): **serializar** esos cambios en ese orden.
  - US1 (P1) y US2 (P1) tocan `src/panel-ui/FormularioSituacion.svelte`/`DetalleSituacion.svelte`; son independientes entre sí pero editan los mismos ficheros, así que **secuenciarlos** (US1 → US2).
  - US3 (P2) toca `src/panel-ui/FormularioOpcion.svelte`, el nuevo `SelectorFlags.svelte`, `Panel.svelte` y el GET de la API.
  - US4 (P2) toca almacén/crud/API/generador/UI de condicionales; depende de Foundational (almacén v2) y se beneficia del `SelectorFlags.svelte` de US3.
- **Polish (Phase 7)**: Depends on all desired stories.

### User Story Dependencies

- **US1 (P1)**: After Foundational. No dependency on other stories. Edita `FormularioSituacion.svelte` y `Panel.svelte` (T017).
- **US2 (P1)**: After Foundational. Independent, but shares `FormularioSituacion.svelte` with US1 (sequence them).
- **US3 (P2)**: After Foundational. Independent; provides `SelectorFlags.svelte` reused by US4; también edita `Panel.svelte` (T023).
- **US4 (P2)**: After Foundational; uses `SelectorFlags.svelte` (US3) and the id helper (Foundational); también edita `Panel.svelte` (T034).

### Within Each User Story

- Tests before implementation where the story adds pure logic (Foundational).
- Models/validators → services (crud/generador) → endpoints → UI.

### Parallel Opportunities

- Setup T002 and T003.
- Foundational T004+T005, T006+T007 (helpers and their tests) and T008–T013 (almacén chain) can partially parallelize; T008–T013 are sequential (same files).
- US3 T021 (`SelectorFlags.svelte`) in parallel with API T024.
- US4 T027 and T028 (separate route files) in parallel.

---

## Parallel Example: Foundational

```bash
# Pure helpers and tests can be built together:
Task: "T004 Create src/panel/identificadores.ts"
Task: "T005 Create src/panel/__tests__/identificadores.test.ts"
Task: "T006 Create src/panel/flags.ts"
Task: "T007 Create src/panel/__tests__/flags.test.ts"
```

## Parallel Example: User Story 4

```bash
# Independent route files:
Task: "T027 Create src/pages/api/panel/condicionales.ts"
Task: "T028 Create src/pages/api/panel/condicionales/[id].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → Phase 2 Foundational → Phase 3 US1.
2. **STOP and VALIDATE**: no id typed by hand; collision auto-resolves.
3. Demo the panel form with derived ids.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → validate → demo (MVP).
3. US2 → validate → demo (safe repetition default).
4. US3 → validate → demo (flag selectors).
5. US4 → validate → demo (conditional editing + volcado).
6. Polish → full verification.

### Parallel Team Strategy

1. Complete Setup + Foundational together.
2. Then: Dev A → US1→US2 (same form file); Dev B → US3; Dev C → US4 (after US3's `SelectorFlags.svelte`).
3. Integrate and run Phase 7.

---

## Notes

- [P] tasks touch different files with no dependencies.
- [Story] labels map tasks to spec user stories for traceability.
- Do not edit generated `src/content/decisiones/**` or `src/content/condicionales/**` by hand; use the panel + `npm run panel:volcar`.
- The 2 `forma-carrera` failures (T23) are pre-existing and out of scope; they are not a regression of this feature.
- Do not commit without an explicit request (constitution).
