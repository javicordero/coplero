# Tasks: Estilo de las tarjetas de modalidad: nombres, cita e icono

**Input**: Design documents from `/specs/019-modalidad-estilo-iconos/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/modalidad.md, quickstart.md

**Tests**: La spec pide verificación de contenido (SC-001/SC-002), de iconos (SC-003), de accesibilidad (SC-004/SC-007) y de no regresión (SC-006/SC-008). Se incluyen una prueba unitaria de presentación y una E2E. No hay tests de `engine`/`content` (no se tocan).

**Organization**: Tareas agrupadas por historia de usuario para poder implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1, US2 o US3
- Se incluye la ruta exacta del fichero en cada tarea

## Path Conventions

- Proyecto único: `src/`, `public/` y `tests/` en la raíz.

---

## Phase 1: Setup

**Purpose**: Línea base antes de tocar nada.

- [X] T001 Verificar la línea base: `npm run check` en verde, confirmar que `public/pito_y_caja.svg` existe y que `MODALIDADES_INFO` y `src/juego/pantallas/ElegirModalidad.svelte` están en su estado actual (títulos "Comparsista"/"Chirigotero", sin iconos).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fijar límites y decisiones comunes que respetan todas las historias.

**⚠️ CRITICAL**: Ninguna historia debe salirse de estos límites.

- [X] T002 [P] Confirmar el **alcance**: no tocar `etiquetaModalidad`/`ETIQUETA_MODALIDAD` en `src/juego/presentacion.ts`, ni `src/juego/Tarjeta.svelte`, ni `src/pages/api/og/[codigo].png.ts`, ni `src/sitio/contenido.ts`; los assets se sirven en `/pito_y_caja.svg` y `/guitarra.svg` desde `public/`.
- [X] T003 [P] Confirmar que **no se añaden tokens** (el tamaño del icono es un valor local y el color usa `--c-texto-suave`); no se toca el espejo `src/ui/tokens.css` / `src/ui/tokens.ts` (V-03).

**Checkpoint**: alcance y límites claros; las historias pueden empezar.

---

## Phase 3: User Story 1 - Elegir la modalidad misma, con la cita en cursiva (Priority: P1) 🎯 MVP

**Goal**: Las dos tarjetas se titulan "Comparsa" y "Chirigota"; el subtítulo de Comparsa es la cita literal "¡Pasión, decía Paco Alba, la comparsa es pasión!" en cursiva; el de Chirigota se mantiene.

**Independent Test**: llegar a la pantalla de modalidad y comprobar los dos títulos y que la cursiva aparece solo en el subtítulo de Comparsa; pulsar una tarjeta avanza a variante.

### Tests for User Story 1 ⚠️

> Escribir primero; deben fallar hasta completar la implementación.

- [X] T004 [P] [US1] Actualizar `src/juego/__tests__/presentacion.test.ts`: los títulos de `MODALIDADES_INFO` son exactamente `["Comparsa", "Chirigota"]`; el subtítulo de Comparsa es la cita literal y `cita === true`; el de Chirigota no cambia y no tiene `cita`; `etiquetaModalidad("chirigotero")` sigue siendo "Chirigotero".
- [X] T005 [P] [US1] Crear `tests/e2e/modalidad-tarjetas.spec.ts`: crear personaje, llegar a modalidad y comprobar los títulos "Comparsa"/"Chirigota" (0 con etiquetas antiguas) y `font-style` computado `italic` en el subtítulo de Comparsa y `normal` en el de Chirigota (usar `tests/e2e/apoyo/juego.ts`).

### Implementation for User Story 1

- [X] T006 [US1] Actualizar `MODALIDADES_INFO` en `src/juego/presentacion.ts`: títulos "Comparsa"/"Chirigota", subtítulo de Comparsa literal, subtítulo de Chirigota sin cambios; añadir `cita?: boolean` a `ModalidadInfo` y `cita: true` solo en Comparsa.
- [X] T007 [US1] Renderizar en `src/juego/pantallas/ElegirModalidad.svelte` el subtítulo con la clase `.tarjeta__subtitulo` y la modificadora `--cita` cuando `modalidad.cita` (aplica `font-style: italic`), conservando `data-testid="modalidad"` y los `<button>`.

**Checkpoint**: US1 funcional y verificable por sí sola (MVP).

---

## Phase 4: User Story 2 - Iconos provisionales (pito y caja en Chirigota) (Priority: P2)

**Goal**: Chirigota muestra `public/pito_y_caja.svg` como silueta monocroma del color del subtítulo en la esquina superior derecha; Comparsa muestra un icono genérico inline; ninguno se solapa con el texto ni interfiere con el toque.

**Independent Test**: observar las dos tarjetas y comprobar el icono mono de Chirigota, el genérico de Comparsa, sin solape, y que el toque sigue eligiendo la opción.

### Tests for User Story 2 ⚠️

- [X] T008 [US2] Ampliar `tests/e2e/modalidad-tarjetas.spec.ts`: cada tarjeta tiene `.tarjeta__icono` con `aria-hidden="true"`; cada icono (`--guitarra`/`--pito`) tiene `mask-image` que referencia `guitarra.svg`/`pito_y_caja.svg` y color de pintado igual al del subtítulo; el nombre accesible de la opción no incluye el icono; sin desborde horizontal a 320/390 px y axe WCAG 2.2 AA sin violaciones graves.

### Implementation for User Story 2

- [X] T009 [US2] Añadir los nodos de icono en `src/juego/pantallas/ElegirModalidad.svelte`: Comparsa `<span class="tarjeta__icono tarjeta__icono--guitarra" aria-hidden="true">` y Chirigota `<span class="tarjeta__icono tarjeta__icono--pito" aria-hidden="true">`; ambos dentro del `<button>`.
- [X] T010 [US2] Añadir el CSS en `src/juego/pantallas/ElegirModalidad.svelte`: `.tarjeta { position: relative }`; reserva de espacio a la derecha en `strong`/`.tarjeta__subtitulo`; `.tarjeta__icono` absoluto arriba-derecha, tamaño reducido y `pointer-events: none`; `.tarjeta__icono--pito` con `mask-image: url("/pito_y_caja.svg")` + `background-color: var(--c-texto-suave)`; color `var(--c-texto-suave)` para el SVG de Comparsa.
- [X] T011 [US2] Verificar visualmente en `npm run dev` sobre `src/juego/pantallas/ElegirModalidad.svelte` que el icono no se solapa con la cita en dos líneas ni a 320 px, y que el hover/foco de la tarjeta sigue siendo visible.

**Checkpoint**: ambas tarjetas con su icono, sin romper US1.

---

## Phase 5: User Story 3 - Sin impacto en flujo, accesibilidad ni otras pantallas (Priority: P3)

**Goal**: El cambio se limita a la pantalla de modalidad: sin regresiones de accesibilidad ni cambios en el resto del producto.

**Independent Test**: revisar el diff y verificar con axe y lector de pantalla que solo cambia esta pantalla.

### Implementation for User Story 3

- [X] T012 [US3] Verificar el alcance con `git diff --stat`: solo cambian `src/juego/presentacion.ts`, `src/juego/pantallas/ElegirModalidad.svelte`, `src/juego/__tests__/presentacion.test.ts` y `tests/e2e/modalidad-tarjetas.spec.ts`; `etiquetaModalidad`, `Tarjeta.svelte`, OG y landing intactos.
- [X] T013 [P] [US3] Verificar accesibilidad sobre `src/juego/pantallas/ElegirModalidad.svelte`: los iconos son `aria-hidden`, el nombre accesible es título + subtítulo y axe (WCAG 2.2 AA) no reporta violaciones graves.

**Checkpoint**: alcance y accesibilidad confirmados.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cierre de la feature.

- [X] T014 [P] Ejecutar `npm run check` (definido en `package.json`: typecheck + lint + tests unitarios) y corregir lo que falle.
- [X] T015 [P] Ejecutar la E2E: `npx playwright test tests/e2e/modalidad-tarjetas.spec.ts tests/e2e/layout-previo.spec.ts tests/e2e/jugar.spec.ts tests/e2e/chrome.spec.ts tests/e2e/layout-estable.spec.ts`.
- [X] T016 Validar los escenarios de `specs/019-modalidad-estilo-iconos/quickstart.md` (contenido, cursiva, iconos, accesibilidad y no regresión).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)**: inmediato.
- **Foundational (T002–T003)**: depende de Setup; no bloquea técnicamente, pero fija el alcance de todas las historias.
- **US1 (T004–T007)**: tras Foundational; es la base de contenido de la pantalla.
- **US2 (T008–T011)**: tras Foundational; depende de US1 por compartir `src/juego/pantallas/ElegirModalidad.svelte` (secuencial sobre el mismo fichero).
- **US3 (T012–T013)**: tras US2 (verifica el resultado final).
- **Polish (T014–T016)**: depende de US1–US3.

### User Story Dependencies

- **US1 (P1)**: independiente tras Foundational. MVP.
- **US2 (P2)**: requiere la tarjeta ya existente; modifica el mismo `.svelte` que US1, así que va después.
- **US3 (P3)**: verificación de alcance y accesibilidad sobre US1 + US2.

### Parallel Opportunities

- T002 y T003 (comprobaciones independientes) en paralelo.
- T004 (unit) y T005 (E2E) en paralelo: ficheros distintos.
- T012 y T013 pueden solaparse parcialmente; T014 y T015 en paralelo.
- US2 no puede paralelizarse con US1 por compartir `ElegirModalidad.svelte`.

---

## Parallel Example: User Story 1 (tests)

```bash
Task: "Actualizar src/juego/__tests__/presentacion.test.ts (T004)"
Task: "Crear tests/e2e/modalidad-tarjetas.spec.ts (T005)"
```

## Parallel Example: Polish

```bash
Task: "Ejecutar npm run check (T014)"
Task: "Ejecutar la suite E2E afectada (T015)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Setup + Foundational (T001–T003).
2. Completar US1 (T004–T007).
3. **PARAR y VALIDAR**: títulos "Comparsa"/"Chirigota" y cita en cursiva; elegir avanza.

### Incremental Delivery

1. Foundational → alcance y límites fijados.
2. US1 → nombres y cita (MVP).
3. US2 → iconos (pito y caja monocromo + genérico).
4. US3 → verificación de alcance y accesibilidad.
5. Polish → `npm run check`, E2E y quickstart.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- El asset `public/pito_y_caja.svg` no se edita; se usa como máscara monocroma.
- No se toca `engine` ni `content`; el renombrado se limita a la pantalla de modalidad.
- `npm run check` debe pasar antes de dar por terminada la feature.
