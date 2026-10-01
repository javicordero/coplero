# Tasks: Pantalla de selección de modalidad y cabecera estable del flujo previo

**Input**: Design documents from `/specs/017-modalidad-screen/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/layout.md, quickstart.md

**Tests**: La spec pide un **E2E de layout** (SC-001, SC-002, SC-007), un **E2E de ausencia de textura** (SC-008) y un **E2E de header** (SC-009). No hay tests de `engine`/`content` (no se tocan).

**Organization**: Tareas agrupadas por historia de usuario para poder implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1, US2, US3 o US4
- Se incluye la ruta exacta del fichero en cada tarea

## Path Conventions

- Proyecto único: `src/` y `tests/` en la raíz.

---

## Phase 1: Setup

**Purpose**: Línea base antes de tocar nada.

- [X] T001 Verificar la línea base: `npm run check` en verde y anotar las posiciones actuales de título/subtítulo en `crear-personaje` y `modalidad` (390×780) para comparar al final (referencia: 145 px vs 304 px).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Marco de pantalla compartido que necesitan todas las historias.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase.

- [X] T002 [P] Confirmar que **no se añaden tokens**: la cabecera usa altura natural (descartado `--alto-cabecera-pantalla`); no se toca el espejo `src/ui/tokens.css` / `src/ui/tokens.ts` (V-03).
- [X] T003 Definir las clases globales del marco de pantalla (`.pantalla`, `.pantalla__cabecera`, `.pantalla__cuerpo`, `.tarjeta`) como reglas `:global` en `src/juego/Juego.svelte`.
- [X] T004 Generalizar en `src/juego/Juego.svelte` el forzado de altura (`height: calc(100svh - cabecera)`, `min-height: 0`, `flex: 0 0 auto`) y el anclaje superior (`justify-content: flex-start`) de `main` a las pantallas `crear-personaje | modalidad | variante`.
- [X] T005 Verificar en el navegador que la cabecera mantiene su posición a 320 px de ancho y desde ~720 px de alto, con scroll de respaldo por debajo (`@media (max-height: 719px)` en `src/juego/Juego.svelte`).

**Checkpoint**: marco listo; las historias pueden empezar.

---

## Phase 3: User Story 1 - Elegir modalidad con el lenguaje visual de creación (Priority: P1) 🎯 MVP

**Goal**: La pantalla de modalidad muestra título, subtítulo “Purpurina o plumero” y dos tarjetas (Comparsista/Chirigotero) con el aspecto de las tarjetas de género.

**Independent Test**: desde la creación de personaje, avanzar a modalidad y comprobar título, subtítulo y tarjetas; pulsar una modalidad avanza a variante.

### Implementation for User Story 1

- [X] T006 [US1] Añadir la constante de subtítulo de modalidad `SUBTITULO_MODALIDAD = "Purpurina o plumero"` en `src/juego/presentacion.ts`.
- [X] T007 [US1] Rediseñar `src/juego/pantallas/ElegirModalidad.svelte` usando `.pantalla`/`.pantalla__cabecera`/`.pantalla__cuerpo`, con `h2` “Elige modalidad” y el subtítulo; conservar `data-testid="modalidad"` y los `<button>`.
- [X] T008 [US1] Estilar las tarjetas de modalidad en `src/juego/pantallas/ElegirModalidad.svelte` (ancho completo, `strong` + `span`, lenguaje visual de `.tarjeta` y hover; sin estado “seleccionado”).

**Checkpoint**: modalidad funcional y verificable por sí sola.

---

## Phase 4: User Story 2 - Cabecera idéntica en posición y estilo (Priority: P2) ⭐ objetivo principal

**Goal**: El título y el subtítulo de modalidad caen en la misma posición (±2 px) y con el mismo estilo que los de creación de personaje; variante mantiene el mismo marco.

**Independent Test**: E2E que mide y compara la cabecera entre `crear-personaje`, `modalidad` y `variante` en varios tamaños.

### Tests for User Story 2 ⚠️

> Escribir primero; debe fallar hasta completar la implementación.

- [X] T009 [P] [US2] Crear `tests/e2e/layout-previo.spec.ts`: comprobar que `top(h2)` y `top(subtítulo)` coinciden entre `crear-personaje`, `modalidad` y `variante` (±2 px), que el estilo computado coincide (familia, tamaño, color y `text-transform`) y que no hay desborde horizontal a 320 px.

### Implementation for User Story 2

- [X] T010 [US2] Refactorizar `src/juego/pantallas/CrearPersonaje.svelte` para usar el marco/cabecera compartidos, sin cambiar su cuerpo ni su comportamiento.
- [X] T011 [US2] Refactorizar `src/juego/pantallas/ElegirVariante.svelte` para usar el marco compartido (título + subtítulo), conservando el uso con la prop `titulo` (cambio de variante).
- [X] T012 [US2] Ajustar estructura y estilos hasta que el E2E de alineación y estilo de `tests/e2e/layout-previo.spec.ts` pase.

**Checkpoint**: la cabecera es idéntica en las tres pantallas.

---

## Phase 5: User Story 3 - Sin fondo de puntos en ninguna pantalla (Priority: P3)

**Goal**: La textura de puntos no aparece en ninguna pantalla, header ni pie.

**Independent Test**: recorrer portada, intro, flujo previo y escenas y comprobar que no hay textura de puntos.

### Implementation for User Story 3

- [X] T013 [US3] Retirar la textura: borrar la regla `body.textura-puntos::before` de `src/ui/base.css`, eliminar la prop `textura` de `src/layouts/Layout.astro` y su uso en `src/pages/index.astro`, y quitar el `$effect` que activaba la clase en `src/juego/Juego.svelte`.
- [X] T014 [US3] Actualizar `tests/e2e/layout-previo.spec.ts` para comprobar que `body` **no** tiene la clase `textura-puntos` en portada, intro y flujo previo.
- [X] T015 [US3] Verificar que no queda ninguna referencia a `textura-puntos` ni capa de puntos en `src/`.

**Checkpoint**: no existe textura de puntos en el producto.

---

## Phase 6: User Story 4 - Header negro anclado en todo el sitio (Priority: P3)

**Goal**: El header del sitio tiene fondo negro plano y queda anclado arriba (`sticky`) en todas las páginas, sin alterar las alturas del resto de pantallas.

**Independent Test**: comprobar en cualquier página que `.site-header` es `sticky` con `top: 0` y fondo opaco; al hacer scroll sigue visible y `--alto-cabecera` no cambia.

### Implementation for User Story 4

- [X] T016 [US4] Estilar el header en `src/components/Header.astro`: `background: var(--c-fondo)` (negro plano), `position: sticky; top: 0` y `z-index` por encima del contenido de `main`.
- [X] T017 [US4] Verificar que el header `sticky` no altera `--alto-cabecera` (medida desde `.site-header` en `src/juego/Juego.svelte`) ni los `height: calc(100svh - var(--alto-cabecera))` de `main`.
- [X] T018 [P] [US4] Añadir a `tests/e2e/layout-previo.spec.ts` el E2E de header: `.site-header` con `position: sticky`, `top: 0` y `background-color` opaco; tras hacer scroll sigue en `top: 0` y `--alto-cabecera` no cambia.

**Checkpoint**: header coherente en todo el sitio sin descuadrar el juego.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cierre de la feature.

- [X] T019 [P] Estabilizar la altura del área de juego con `100svh` (reserva `100vh`) en `src/juego/Juego.svelte`: evita el salto de altura al scrollear en móvil (R10).
- [X] T020 [P] Ejecutar `npm run check` y corregir lo que falle.
- [X] T021 [P] Ejecutar axe (WCAG 2.2 AA) y las E2E existentes (`jugar`, `chrome`, `layout-estable`, `landing`).
- [X] T022 Validar los escenarios de `quickstart.md`, incluido el **Escenario 4 — Sin textura** y el **Escenario 5 — Header negro y anclado**.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)**: inmediato.
- **Foundational (T002–T005)**: depende de Setup y BLOQUEA todas las historias.
- **User Stories (T006–T018)**: dependen de Foundational. US1, US3 y US4 pueden ir en paralelo; US2 depende del marco de cabecera.
- **Polish (T019–T022)**: depende de las historias deseadas.

### User Story Dependencies

- **US1 (P1)**: independiente tras Foundational.
- **US2 (P2)**: tras Foundational; refactoriza crear y variante y verifica contra modalidad (US1).
- **US3 (P3)**: tras Foundational; retirada de la textura.
- **US4 (P3)**: tras Foundational; header negro sticky.

### Parallel Opportunities

- T009 [P] (test) en paralelo con T010/T011.
- T018 [P] (test) en paralelo con T016/T017.
- T019, T020 y T021 en paralelo (T019 toca `Juego.svelte`; T020/T021 son verificación).
- US3 y US4 pueden abordarse en paralelo salvo `layout-previo.spec.ts` (T014 y T018 comparten fichero: secuenciales).

---

## Parallel Example: Foundational

```bash
Task: "Confirmar que no se añaden tokens (T002)"
Task: "Definir clases globales del marco en src/juego/Juego.svelte (T003)"
Task: "Generalizar altura/anclaje de main en src/juego/Juego.svelte (T004)"
```

## Parallel Example: Polish

```bash
Task: "Estabilizar la altura con 100svh en src/juego/Juego.svelte (T019)"
Task: "Ejecutar npm run check (T020)"
Task: "Ejecutar axe y E2E existentes (T021)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Setup + Foundational (T001–T005).
2. Completar US1 (T006–T008).
3. **PARAR y VALIDAR**: modalidad con subtítulo y tarjetas; elegir avanza.

### Incremental Delivery

1. Foundational → marco listo.
2. US1 → modalidad con el lenguaje visual (MVP).
3. US2 → cabecera idéntica en las tres pantallas + E2E.
4. US3 → retirada de la textura de puntos (T013–T015).
5. US4 → header negro sticky en todo el sitio (T016–T018).
6. Polish → altura estable `svh` (T019), `npm run check`, axe y quickstart.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- El objetivo principal (cabecera idéntica en posición y estilo) se cubre en US2; US1 es el MVP.
- La textura de puntos se retiró por completo (US3); el header pasó a negro `sticky` (US4); la altura del área de juego usa `100svh` para no saltar al scrollear (T019).
- `npm run check` debe pasar antes de dar por terminada la feature.
