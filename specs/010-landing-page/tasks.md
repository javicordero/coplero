# Tasks: Landing estática

**Input**: Design documents from `/specs/010-landing-page/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Sí, pero acotados a la UI: un E2E (`tests/e2e/landing.spec.ts`) para secciones, enlaces y
accesibilidad (axe, WCAG 2.2 AA) y una comprobación de **0 kB de JS** sobre el build. No hay cambios
en `engine`/`content` → no se recalibra simulación.

**Organization**: por historia de usuario. US1 (hero + explicación + CTA) es P1; US2 (cómo funciona,
modalidades, ejemplo) P2; US3 (FAQ y pie) P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ir en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1 / US2 / US3
- Cada tarea incluye la ruta exacta del fichero

## Path Conventions

Proyecto único Astro: `src/`, `tests/` en la raíz. Ver `plan.md` §Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: datos y fixture que alimentan la página.

- [x] T001 [P] Crear `src/landing/contenido.ts` con el modelo de contenido (pasos de "cómo funciona", modalidades, FAQ ≥5, redes, autor y enlace a acordesgaditanos) según `data-model.md`
- [x] T002 [P] Crear `src/landing/ejemploTarjeta.ts` con `EJEMPLO_TARJETA` (un `TarjetaFinal` válido) y `CODIGO_EJEMPLO` derivado con el códec del motor

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: esqueleto de la página con metadatos y landmarks.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta cerrar esta fase.

- [x] T003 Reescribir `src/pages/index.astro` con `Layout` (title, description, canonical; **sin** `noindex`) y los landmarks (`header`, `main`, `footer`), sin islas ni directivas `client:*`

**Checkpoint**: `/` carga con los metadatos correctos y el esqueleto listo.

---

## Phase 3: User Story 1 - Entender el juego y empezar a jugar (Priority: P1) 🎯 MVP

**Goal**: hero con nombre, explicación y CTA a `/jugar`; sección "qué es" con la referencia a acordesgaditanos.

**Independent Test**: abrir `/` y comprobar que, sin scroll y sin JavaScript, se ve el nombre, la explicación y el CTA que lleva a `/jugar`.

### Implementation for User Story 1

- [x] T004 [US1] Hero en `src/pages/index.astro`: nombre "Coplero", frase que explica el juego y CTA principal a `/jugar`
- [x] T005 [US1] Sección "qué es" (`#que-es`) en `src/pages/index.astro`: explicación del juego y mención con enlace a acordesgaditanos (mismo autor)
- [x] T006 [US1] Estilos mobile-first del hero y la explicación en `src/pages/index.astro` (ancho máximo, sin desbordes)

**Checkpoint**: US1 verificable por sí sola (CTA visible sin scroll).

---

## Phase 4: User Story 2 - Cómo funciona, modalidades y ejemplo (Priority: P2)

**Goal**: explicar el juego por pasos, las dos modalidades y mostrar una tarjeta final de ejemplo.

**Independent Test**: recorrer `/` y comprobar que existen las secciones "cómo funciona", "modalidades" y el ejemplo de tarjeta, visibles sin JavaScript.

### Implementation for User Story 2

- [x] T007 [US2] Sección "cómo funciona" (`#como-funciona`) en `src/pages/index.astro` con los 4 pasos de `src/landing/contenido.ts`
- [x] T008 [US2] Sección "modalidades" (`#modalidades`) en `src/pages/index.astro` (comparsista y chirigotero, con en qué deciden)
- [x] T009 [US2] Sección "ejemplo de tarjeta" (`#ejemplo`) en `src/pages/index.astro` renderizando `<Tarjeta tarjeta={EJEMPLO_TARJETA} />` **sin** `client:*` (SSR en build)

**Checkpoint**: US1 y US2 se ven completas sin JavaScript.

---

## Phase 5: User Story 3 - Resolver dudas y reconocer al autor (Priority: P3)

**Goal**: FAQ con al menos 5 preguntas y pie reutilizable con redes, autor y acordesgaditanos.

**Independent Test**: comprobar que la FAQ responde a ≥5 dudas sin JS y que el pie incluye redes, autor, copyright y el enlace a acordesgaditanos.

### Implementation for User Story 3

- [x] T010 [P] [US3] Crear `src/components/Footer.astro` con la estructura del pie de acordesgaditanos (redes, autor, referencia a acordesgaditanos, copyright) e iconos **SVG en línea** con nombre accesible
- [x] T011 [US3] Sección FAQ (`#faq`) en `src/pages/index.astro` con `<details>`/`<summary>` y las preguntas de `src/landing/contenido.ts`
- [x] T012 [US3] Integrar `<Footer />` en `src/pages/index.astro` (sustituyendo el pie provisional)

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T013 [P] Metadatos de compartir en `src/pages/index.astro`: declarar una **constante de URL base** (reutilizando `DIRECCION_JUEGO` → `https://coplero.app`) y usarla para `canonical` y para `og:image = `${URL_SITIO}/api/og/${CODIGO_EJEMPLO}.png``, junto con `og:title` y `og:description` (depende del endpoint OG: huecos **C14/T21**)
- [x] T014 [P] Escribir `tests/e2e/landing.spec.ts`: secciones presentes, CTA a `/jugar`, FAQ, y el pie con el **conjunto exacto de enlaces esperados** (redes, autor, acordesgaditanos) comprobando cada `href`, todos los externos con `target="_blank"` y `rel="noopener noreferrer"`, **ningún enlace interno fuera de rutas existentes** y **axe** sin violaciones (WCAG 2.2 AA)
- [x] T015 Convertir la garantía de **0 kB de JS** (SC-001) en un **test** que lea `dist/index.html` y falle si contiene `<script>` (o, como mínimo, verificarlo con `npm run build` y anotar el resultado en `specs/010-landing-page/quickstart.md`)
- [x] T016 Ejecutar `npm run check` y `npx playwright test tests/e2e/landing.spec.ts`; corregir lo que salga
- [x] T017 Recorrer `specs/010-landing-page/quickstart.md` (incluido 320 px sin scroll horizontal) y anotar los resultados en ese mismo fichero

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; **bloquea** US1–US3.
- **US1/US2/US3**: dependen de la Fase 2 cerrada.
- **Polish (Fase 6)**: depende de las historias deseadas.

### User Story Dependencies

- **US1 (P1)**: tras la Fase 2 → **MVP**.
- **US2 (P2)**: tras la Fase 2. Independiente de US1 (pero todas las historias editan `src/pages/index.astro`, así que se **serializan**).
- **US3 (P3)**: tras la Fase 2. `Footer.astro` (T010) es un fichero aparte; la integración (T012) toca `index.astro`.

### Within Each User Story

- Datos antes que secciones; secciones antes que estilos; integración del pie al final.
- No avanzar de fase sin pasar el checkpoint.

### Parallel Opportunities

- T001 y T002 (ficheros distintos).
- T010 (`Footer.astro`) en paralelo con las tareas de `index.astro` de otras historias.
- En Polish, T013 (index.astro) y T014 (tests) en paralelo.
- **Ojo**: casi todas las tareas tocan `src/pages/index.astro`; ese fichero se edita en serie.

---

## Parallel Example: fases iniciales

```bash
# Setup en paralelo (ficheros distintos):
Task: "Crear src/landing/contenido.ts"
Task: "Crear src/landing/ejemploTarjeta.ts"

# En US3, el pie es independiente de las secciones de index.astro:
Task: "Crear src/components/Footer.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Fase 1 (Setup) → Fase 2 (Foundational).
2. Fase 3 (US1): hero + explicación + CTA.
3. **PARAR Y VALIDAR**: abrir `/` en 360×640 y comprobar el CTA sin scroll.
4. US1 ya convierte: un visitante ya puede empezar a jugar.

### Incremental Delivery

1. Setup + Foundational → metadatos y esqueleto.
2. US1 → hero + CTA → MVP.
3. US2 → cómo funciona + modalidades + ejemplo.
4. US3 → FAQ + pie.
5. Polish → OG, E2E/axe, 0 kB, `npm run check` y quickstart.

### Parallel Team Strategy

1. Setup + Foundational juntos.
2. Tras la Fase 2: A → US1, B → US2, C → US3 (con `index.astro` serializado y `Footer.astro` por separado).

---

## Notes

- [P] = ficheros distintos, sin dependencias pendientes.
- La landing debe seguir con **0 kB de JS**: prohibido añadir `client:*` o `<script>`.
- El ejemplo de tarjeta reutiliza `src/juego/Tarjeta.svelte` en SSR (sin hidratar).
- No añadir dependencias (iconos como SVG en línea).
- No commitear sin petición explícita.
