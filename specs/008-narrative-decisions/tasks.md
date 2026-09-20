---

description: "Task list for narrative decisions feature (008)"
---

# Tasks: Decisiones que no afectan al resultado

**Input**: Design documents from `/specs/008-narrative-decisions/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/{content,engine,simulacion}.md, quickstart.md

**Tests**: Incluidos — el Principio III exige tests deterministas para todo cambio de `engine` y `content`.

**Organization**: Dos historias. US1 deja la regla base (las decisiones no afectan al resultado); US2 añade las pocas excepciones declaradas con intercambio visible.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1, US2
- Rutas exactas en cada tarea

## Path Conventions

Proyecto único (Principio V): `src/`, `scripts/`, `docs/` en la raíz.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Línea base verde y mapa de efectos actuales.

- [X] T001 Ejecutar `npm run check` y confirmar que la línea base está verde.
- [X] T002 [P] Inventariar los `efectos` actuales: `rg "efectos" src/content` y anotar qué opciones los llevan (será la lista de candidatas a excepción).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: La marca de excepción y las reglas de validación, compartidas por las dos historias.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T003 Añadir `excepcion?: boolean` a la interfaz `Opcion` y a `OpcionSchema` en `src/content/schema.ts`, con la regla bicondicional: `efectos` presente ⇔ `excepcion === true` (y `excepcion` sin `efectos` ⇒ error).
- [X] T004 [P] Añadir a `src/content/informe.ts` el recuento de opciones con `excepcion: true` (total y por categoría/momento).
- [X] T005 [P] Añadir a `src/content/__tests__/integridad.test.ts` las reglas: 0 `efectos` sin `excepcion`, 0 `excepcion` sin `efectos`, y recuento total de excepciones por debajo del umbral acordado (≤ 6).
- [X] T006 Ejecutar `npm run check` y comprobar que las reglas nuevas fallan con el banco actual (rojo esperado: hay `efectos` sin declarar). Depende de T003–T005.

**Checkpoint**: la marca y las reglas existen; el banco aún incumple (como se espera).

---

## Phase 3: User Story 1 - Las decisiones no cambian el resultado (Priority: P1) 🎯 MVP

**Goal**: retirar los efectos del banco para que el desenlace dependa solo del destino + azar, y recalibrar para mantener la distribución objetivo.

**Independent Test**: con la mayoría de opciones sin efecto, simular 10.000 carreras con perfiles distintos y comprobar que la distribución no favorece a ninguna estrategia y cuadra con `docs/01` §7.

### Implementation for User Story 1

- [X] T007 [US1] Retirar `efectos` de todas las opciones en `src/content/decisiones/verano/contenido.ts`.
- [X] T008 [US1] Retirar `efectos` en `src/content/decisiones/verano/personaje.ts`.
- [X] T009 [US1] Retirar `efectos` en `src/content/decisiones/febrero/contenido.ts`.
- [X] T010 [US1] Retirar `efectos` en `src/content/decisiones/febrero/personaje.ts`.
- [X] T011 [US1] Retirar `efectos` en `src/content/condicionales/verano.ts` y `src/content/condicionales/febrero.ts`.
- [X] T012 [US1] Recalibrar `src/engine/parametros.ts` (`pesosTecho`, `umbralesNivel`, `multiplicadorRuido`, y `bonoAnoPico` si hace falta) para reproducir `docs/01` §7 (~45% final, ~10% no cuartos, ~7% no preliminares). Ajustar solo parámetros, nunca situaciones.
- [X] T013 [P] [US1] Añadir test de "sin estrategia dominante" en `src/simulacion/__tests__/dominancia.test.ts`: los perfiles `aleatorio`, `codicioso` y `erratico` quedan dentro de un margen (≤ 5 pts de "pisa la final").

**Checkpoint**: US1 cumplido; el banco es narrativa pura y el resultado lo manda el destino + azar.

---

## Phase 4: User Story 2 - Excepciones declaradas con intercambio visible (Priority: P2)

**Goal**: conservar unas pocas decisiones con efecto real sobre atributos, declaradas explícitamente y con la contrapartida visible en el texto.

**Independent Test**: comprobar que solo las excepciones declaradas llevan `efectos`, que son pocas, que su intercambio se lee en el subtítulo y que nunca superan el techo del destino.

### Implementation for User Story 2

- [X] T014 [US2] Elegir (a partir de T002) las pocas opciones que se conservan como excepción y marcarlas con `excepcion: true` conservando/ajustando sus `efectos`, en los ficheros de `src/content/decisiones/**` y `src/content/condicionales/**`.
- [X] T015 [US2] Redactar el intercambio en el `titulo`/`subtitulo` de cada opción excepción (qué mejora y qué empeora), sin revelar el `destino`.
- [X] T016 [P] [US2] Ampliar `src/content/__tests__/integridad.test.ts`: toda `excepcion: true` tiene `efectos` no vacío, y el total de excepciones está dentro del umbral.
- [X] T017 [P] [US2] Añadir test en `src/simulacion/__tests__/dominancia.test.ts`: elegir siempre la opción de excepción más favorable nunca supera `destino.techo` (salvo milagro) y no rompe el margen entre perfiles.

**Checkpoint**: las dos historias conviven; el banco tiene pocas excepciones declaradas y visibles.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T018 [P] Actualizar `docs/01-diseno-juego.md` §2: la decisión no mueve atributos salvo excepción declarada; el resultado lo fían el destino + azar.
- [X] T019 [P] Actualizar `docs/02-arquitectura-tecnica.md` §8: matizar el papel de los atributos (valor estándar) y de la fórmula de resultado.
- [X] T020 Actualizar `docs/registro/decisiones-pendientes.md` (cerrar **C15**) y registrar la decisión en `docs/registro/decisiones-cerradas.md`.
- [X] T021 Ejecutar `npm run simular -- 10000` y confirmar: 0 efectos no declarados, excepciones dentro del umbral, distribución objetivo y sin estrategia dominante.
- [X] T022 Ejecutar `npm run check` y recorrer `specs/008-narrative-decisions/quickstart.md`.
- [X] T023 [P] Comprobar el recuento final de excepciones con `npm run contenido:informe` y anotarlo junto al umbral.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup y **bloquea** las dos historias.
- **US1 (Phase 3)**: depende de Foundational; es el MVP.
- **US2 (Phase 4)**: depende de Foundational y, por contenido, va **después** de US1 (US1 retira efectos; US2 reintroduce los pocos declarados).
- **Polish (Phase 5)**: depende de ambas historias.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias.
- **US2 (P2)**: depende funcionalmente de US1 (sobre el banco ya limpio); sus tests son independientes.

### Within Foundational

- T003 bloquea T005 y T006.
- T004 y T005 son [P] entre sí.
- T006 depende de T003–T005.

### Parallel Opportunities

- T002 en paralelo con T001.
- T004 y T005 en paralelo tras T003.
- T007–T011 tocan ficheros distintos: se pueden repartir en paralelo entre sí (aunque T012 depende de que el banco esté limpio).
- T013 en paralelo con T014–T015 (fichero de test distinto).
- T016 y T017 en paralelo.
- T018, T019 y T023 en paralelo al final.

---

## Parallel Example: User Story 1

```bash
Task: "Retirar efectos en src/content/decisiones/verano/contenido.ts"
Task: "Retirar efectos en src/content/decisiones/verano/personaje.ts"
Task: "Retirar efectos en src/content/decisiones/febrero/contenido.ts"
Task: "Retirar efectos en src/content/decisiones/febrero/personaje.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup.
2. Phase 2: Foundational (bloqueante).
3. Phase 3: US1 → **PARAR y VALIDAR** (banco narrativo, distribución objetivo, sin estrategia dominante).
4. Demo si está listo.

### Incremental Delivery

1. Setup + Foundational → marca de excepción y reglas listas.
2. US1 → las decisiones dejan de afectar al resultado.
3. US2 → recuperar los pocos momentos con intercambio visible.
4. Polish → docs, registro y validación final.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- La feature **no toca el motor** (`coac.ts`/`atributos.ts` se conservan); el trabajo es de contenido, validación y calibración.
- `VERSION_PARTIDA` NO cambia (2).
- El motor ignora `excepcion`; solo consume `efectos`.
- No commitear sin petición explícita.
