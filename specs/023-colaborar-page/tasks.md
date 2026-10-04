---

description: "Task list — Página de colaboración (apoyo y sugerencias)"
---

# Tasks: Página de colaboración (apoyo y sugerencias)

**Input**: Design documents from `/specs/023-colaborar-page/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Per the Coplero constitution (Principle III), engine and content changes MUST include deterministic tests; E2E tests are OPTIONAL unless explicitly requested in the feature specification. Esta feature es de UI estática: se incluyen las tareas de test necesarias para verificar el contrato de la página y de la portada, el envío sin JavaScript, el descubrimiento desde la portada/pie/pantalla final y las invariantes de 0 kB de JS.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/`, `docs/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No hay inicialización de proyecto; se fija el baseline y se confirma que no se añaden dependencias.

- [X] T001 Revisar el baseline en `src/pages/como-jugar.astro` (patrón de página estática), `src/pages/index.astro` (bloque del ejemplo y CTA final), `src/components/Footer.astro`, `src/juego/pantallas/FinCarrera.svelte`, `src/pages/politicas/politica-de-privacidad.astro`, `src/sitio/contenido.ts` y `tests/e2e/landing.spec.ts`, y confirmar que el trabajo no requiere dependencias, tokens ni assets nuevos (research.md R1–R10)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constantes compartidas y esqueleto de la página que reutilizan las historias.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Añadir en `src/sitio/contenido.ts` las constantes de la feature: `DONACION` (URL `https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero`) y `SUGERENCIAS` (endpoint `https://formspree.io/f/mdeanyjr` y longitud máxima del mensaje 500) (research.md R4; data-model.md)
- [X] T003 Crear `src/pages/colaborar.astro` con `Layout` (title/description), un único `h1` "Colaborar", los tres bloques (`#apoyo`, `#sugerencias`, `#jugar`) con sus `h2` y el CTA `a[href="/jugar"]` "Empezar a jugar" (contracts/ui.md §1)

**Checkpoint**: Base lista — las historias pueden empezar

---

## Phase 3: User Story 1 - Apoyar económicamente el proyecto (Priority: P1) 🎯 MVP

**Goal**: El bloque de apoyo de `/colaborar` muestra el texto de donación voluntaria y un botón que abre Buy Me a Coffee (cuenta reutilizada, origen Coplero) en pestaña nueva.

**Independent Test**: Abrir `/colaborar` y comprobar que existe el `h1` "Colaborar", un botón de donación visible con `href` `https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero`, `target="_blank"` y `rel="noopener noreferrer"`, y un CTA a `/jugar`.

### Implementation for User Story 1

- [X] T004 [US1] Implementar el bloque de apoyo en `src/pages/colaborar.astro`: `h2`, texto breve de donación voluntaria y enlace "Invítame a un café" usando `DONACION`, con `target="_blank"`, `rel="noopener noreferrer"`, nombre accesible y altura ≥44 px (spec.md FR-002, FR-005, FR-006; contracts/ui.md §2; data-model.md V-03, V-09)

### Tests for User Story 1

- [X] T005 [P] [US1] Crear `tests/e2e/colaborar.spec.ts` con el contrato de la página y de la donación: `h1` "Colaborar", CTA a `/jugar`, y enlace de donación con URL exacta, `target="_blank"` y `rel="noopener noreferrer"` (contracts/ui.md §1, §2; data-model.md V-01…V-03)

**Checkpoint**: User Story 1 funcional y verificable de forma independiente (MVP)

---

## Phase 4: User Story 2 - Proponer una situación u opción (Priority: P1)

**Goal**: El bloque de sugerencias de `/colaborar` ofrece un formulario sin JavaScript que envía mensaje, tipo y email opcional a Formspree, con protección antispam.

**Independent Test**: Rellenar y enviar el formulario con JavaScript desactivado e interceptar la petición para comprobar que el `POST` a `https://formspree.io/f/mdeanyjr` incluye `mensaje`, `tipo`, `origen` y `_subject`.

### Implementation for User Story 2

- [X] T006 [US2] Implementar el bloque de sugerencias en `src/pages/colaborar.astro`: formulario `action`=`SUGERENCIAS.endpoint`, `method="post"`, `textarea[name="mensaje"]` requerido con `maxlength="500"`, `select[name="tipo"]` con `situacion`/`opcion`/`otro`, `input[name="email"]` opcional `type="email"`, ocultos `_subject` ("Coplero — Nueva sugerencia"), `origen="coplero"` y `_gotcha` (invisible, no enfocable), con `<label>` asociados y altura ≥44 px (spec.md FR-007…FR-012; contracts/ui.md §3; data-model.md V-04…V-10)

### Tests for User Story 2

- [X] T007 [US2] Ampliar `tests/e2e/colaborar.spec.ts` con el contrato del formulario (action, method, campos, `maxlength`, ocultos y honeypot) y el envío sin JavaScript interceptando `https://formspree.io/**` con `page.route` para comprobar que el `POST` lleva `mensaje`, `tipo`, `origen` y `_subject` (contracts/ui.md §3; data-model.md V-04…V-10; research.md R9)

**Checkpoint**: User Stories 1 y 2 funcionales de forma independiente

---

## Phase 5: User Story 3 - Descubrir la colaboración desde cualquier punto del sitio (Priority: P2)

**Goal**: La colaboración es accesible desde el **botón de donación de la portada**, desde el **pie** de todas las páginas y desde la **pantalla final** del juego (donación directa y enlace a la página).

**Independent Test**: Abrir la portada y comprobar el botón de donación al final del bloque del ejemplo; recorrer `/`, `/como-jugar` y `/r/codigo-invalido` y comprobar el enlace `a[href="/colaborar"]` en el pie; abrir la pantalla final (`/jugar?dev=fin`) y comprobar que ofrece donación y `/colaborar`.

### Implementation for User Story 3

- [X] T008 [US3] Añadir en `src/components/Footer.astro` un enlace de texto "Colaborar" → `/colaborar`, con el mismo tratamiento y objetivo táctil ≥44 px que los demás enlaces del pie (spec.md FR-013; contracts/ui.md §4)
- [X] T009 [P] [US3] Añadir en `src/juego/pantallas/FinCarrera.svelte` una línea discreta con **dos enlaces**: donación directa (usando `DONACION`) y `a[href="/colaborar"]` (spec.md FR-014; contracts/ui.md §4)
- [X] T010 [P] [US3] Añadir en `src/pages/index.astro`, **dentro del bloque `#ejemplo` y justo debajo de su CTA final**, el botón de donación a Buy Me a Coffee (usando `DONACION`) con **icono de café en SVG en línea**, texto accesible, `target="_blank"`, `rel="noopener noreferrer"` y altura ≥44 px; sin `<script>` (la portada sigue a 0 kB de JS) (spec.md FR-016; contracts/ui.md §4; research.md R4)

### Tests for User Story 3

- [X] T011 [US3] Actualizar `tests/e2e/landing.spec.ts`: añadir `/colaborar` a `RUTAS_INTERNAS`; comprobar el **botón de donación dentro de `#ejemplo`** (después del CTA final, con URL/`target`/`rel`) y el enlace "Colaborar" del pie (research.md R8; contracts/ui.md §4, §7)
- [X] T012 [P] [US3] Ampliar `tests/e2e/pantalla-final.spec.ts`: con `/jugar?dev=fin`, comprobar los **dos enlaces** de la pantalla final (donación directa con `href` `DONACION` y `a[href="/colaborar"]`) y que ambos cumplen el objetivo táctil ≥44 px (spec.md FR-014; contracts/ui.md §4; research.md R8)

**Checkpoint**: Las tres historias son funcionales de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Legal, cobertura de tests de la nueva ruta, registro y validación final.

- [X] T013 [P] Actualizar `src/pages/politicas/politica-de-privacidad.astro` con un apartado del formulario de sugerencias: datos enviados (mensaje y email opcional) a Formspree como proveedor externo, finalidad y carácter voluntario; actualizar la fecha (spec.md FR-017; research.md R10; contracts/ui.md §6)
- [X] T014 [P] Actualizar `src/landing/__tests__/estatico.test.ts`: añadir `src/pages/colaborar.astro` a `FUENTES_ESTATICAS` y `dist/colaborar/index.html` a `HTML_CONSTRUIDO` (contracts/ui.md §5; data-model.md V-01)
- [X] T015 [P] Actualizar `tests/e2e/visual.spec.ts`: añadir `/colaborar` a `ESTATICAS` (axe WCAG 2.2 AA, 320 px, 200 %, ≥44 px, foco, reduced-motion y ausencia de scripts) (contracts/ui.md §5)
- [X] T016 [P] Actualizar `tests/e2e/chrome.spec.ts`: añadir `/colaborar` a `RUTAS` (cabecera y pie presentes) (contracts/ui.md §4)
- [X] T017 [P] Anotar en `docs/registro/` el avance de la fase v1.1 de `docs/05` §9 (Buy Me a Coffee y buzón de sugerencias implementados) y que la portada incorpora el botón de donación dentro del bloque del ejemplo (matiza la nota de "sin bloque nuevo"), sin cambiar las decisiones cerradas de fondo
- [X] T018 Ejecutar `npm run check` y la validación de `specs/023-colaborar-page/quickstart.md`: axe WCAG 2.2 AA, sin scroll a 320 px ni al 200 %, objetivos ≥44 px, foco visible, reduced-motion y 0 kB de JS en `/colaborar` y en la portada
- [X] T019 [P] Revisar `specs/023-colaborar-page/quickstart.md` y `specs/023-colaborar-page/contracts/ui.md` y actualizar cualquier selector o paso que haya cambiado durante la implementación

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; puede empezar de inmediato.
- **Foundational (Phase 2)**: depende de Setup; **bloquea** todas las historias.
- **User Stories (Phase 3+)**: dependen de Foundational. US1 → US2 (ambas editan `src/pages/colaborar.astro`, así que no se paralelizan entre sí) y US3 después (sus enlaces apuntan a `/colaborar`, que debe existir).
- **Polish (Phase 6)**: depende de que las historias deseadas estén completas.

### User Story Dependencies

- **US1 (P1)**: tras Foundational; sin dependencias de otras historias. **MVP**.
- **US2 (P1)**: tras Foundational; comparte `src/pages/colaborar.astro` con US1, por lo que va **después** de US1 (no puede paralelizarse con ella).
- **US3 (P2)**: tras Foundational; sus enlaces necesitan que la página exista (US1). T008 (`Footer.astro`), T009 (`FinCarrera.svelte`) y T010 (`index.astro`) son ficheros distintos y paralelizables entre sí; T011 (`landing.spec.ts`) depende de T008 y T010; T012 (`pantalla-final.spec.ts`) depende de T009.

### Within Each User Story

- Implementación antes que su test de E2E asociado.
- US2 requiere el formulario implementado (T006) antes del test de envío (T007).
- US3 requiere los enlaces/botón implementados (T008, T009, T010) antes de los tests (T011, T012).
- Cada historia debe quedar verificable de forma independiente antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- T002 (`src/sitio/contenido.ts`) es independiente de T003 (`src/pages/colaborar.astro`); T003 usa sus constantes, así que conviene completar T002 antes.
- T005 (test de donación) es un fichero nuevo y puede escribirse en paralelo con T004.
- T008 (`src/components/Footer.astro`), T009 (`src/juego/pantallas/FinCarrera.svelte`) y T010 (`src/pages/index.astro`) son ficheros distintos y paralelizables.
- T011 (`tests/e2e/landing.spec.ts`) y T012 (`tests/e2e/pantalla-final.spec.ts`) son ficheros distintos y paralelizables entre sí.
- T013 (`src/pages/politicas/politica-de-privacidad.astro`), T014 (`src/landing/__tests__/estatico.test.ts`), T015 (`tests/e2e/visual.spec.ts`), T016 (`tests/e2e/chrome.spec.ts`), T017 (`docs/registro/`) y T019 (`specs/023-colaborar-page/`) son ficheros distintos y paralelizables.
- T005 y T007 editan el mismo `tests/e2e/colaborar.spec.ts`: no son paralelizables entre sí.

---

## Parallel Example: User Story 3 (descubrimiento)

```bash
# Ficheros distintos, en paralelo:
Task: "T008 Añadir el enlace Colaborar en src/components/Footer.astro"
Task: "T009 Añadir los dos enlaces de la pantalla final en src/juego/pantallas/FinCarrera.svelte"
Task: "T010 Añadir el botón de donación en el bloque del ejemplo de src/pages/index.astro"

# Ficheros distintos, en paralelo (tras T008/T009/T010):
Task: "T011 Actualizar tests/e2e/landing.spec.ts"
Task: "T012 Ampliar tests/e2e/pantalla-final.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Fase 1: Setup.
2. Completar Fase 2: Foundational (CRÍTICA).
3. Completar Fase 3: US1.
4. **PARAR Y VALIDAR**: probar US1 de forma independiente (`npm run test:e2e -- colaborar`).
5. Desplegar/demostrar si está listo.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 (donación en `/colaborar`) → verificar → demo (MVP).
3. US2 (formulario de sugerencias) → verificar → demo.
4. US3 (descubrimiento: portada + pie + pantalla final) → verificar → demo.
5. Polish (legal + cobertura + `npm run check`).

---

## Notes

- [P] tasks = ficheros distintos, sin dependencias.
- La página vive en `src/pages/colaborar.astro`; el botón de portada, en `src/pages/index.astro`; las constantes compartidas (`DONACION`, `SUGERENCIAS`), en `src/sitio/contenido.ts`.
- No se toca `engine` ni `content`; `/colaborar` y la portada siguen a 0 kB de JS y el formulario funciona sin JavaScript.
- El enlace del pie cambia el conjunto de enlaces internos de la portada: actualizar `RUTAS_INTERNAS` en `tests/e2e/landing.spec.ts` (research.md R8). El botón de la portada es un enlace **externo**, así que no afecta a esa lista.
- **Requisitos sin tarea (no-acción)**: FR-012 (no mostrar texto públicamente), FR-015 (sin menú), FR-021 (español) son restricciones o consecuencias inherentes; se verifican por inspección y no requieren tarea propia.
- **Verificación manual**: la validez de los enlaces externos (Buy Me a Coffee y Formspree) y la confirmación real del envío se comprueban en `quickstart.md` (no son verificables de forma hermética en CI; research.md R1, R9).
- Evitar: tareas vagas, conflictos en el mismo fichero y dependencias entre historias que rompan la independencia.
