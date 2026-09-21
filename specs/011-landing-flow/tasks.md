# Tasks: Reordenar la landing, cabecera/pie persistentes y páginas nuevas

**Input**: Design documents from `/specs/011-landing-flow/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Sí, acotados a la UI: `tests/e2e/chrome.spec.ts` (marco, marca dinámica, axe) y la
actualización de `tests/e2e/landing.spec.ts`. Sin cambios en `engine`/`content` → no se recalibra.

**Organization**: US1 (marco persistente + marca dinámica, P1), US2 (portada corta, P2), US3
(`/como-jugar` + pie legal, P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ir en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1 / US2 / US3
- Cada tarea incluye la ruta exacta del fichero

## Path Conventions

Proyecto único Astro: `src/`, `tests/` en la raíz. Ver `plan.md` §Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: contenido compartido del sitio.

- [x] T001 [P] Mover `src/landing/contenido.ts` a `src/sitio/contenido.ts` (redes, autor, acordesgaditanos, pasos, modalidades, FAQ) y actualizar sus imports
- [x] T002 [P] Crear `src/sitio/reglas.ts` con el contenido de las reglas del juego para `/como-jugar`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: el marco del sitio. **Bloquea** todas las historias.

**⚠️ CRITICAL**: ninguna historia puede cerrarse hasta que el marco funcione.

- [x] T003 [P] Crear `src/components/Header.astro`: cabecera con marca `<span data-marca>Coplero</span>` y enlace a `/`, estática y accesible
- [x] T004 [P] Reestructurar `src/components/Footer.astro` con los 4 bloques de acordesgaditanos (redes → autor → legal → copyright), enlaces legales y referencia al mismo autor
- [x] T005 Modificar `src/layouts/Layout.astro` para envolver el contenido con `<Header />` y `<Footer />` en todas las páginas
- [x] T006 [P] Crear `src/pages/politicas/politica-de-privacidad.astro` y `src/pages/politicas/politica-de-cookies.astro` (texto mínimo veraz), para que el pie no tenga enlaces rotos

**Checkpoint**: cabecera y pie visibles en portada, juego, tarjeta compartida y páginas nuevas.

---

## Phase 3: User Story 1 - Marco persistente y marca dinámica (Priority: P1) 🎯 MVP

**Goal**: al jugar, el marco permanece y la marca refleja el sexo del personaje.

**Independent Test**: abrir `/jugar`, comprobar cabecera y pie, y ver la marca cambiar a «Coplera»/«Coplere» al elegir sexo.

### Implementation for User Story 1

- [x] T007 [US1] Centrar la columna del juego (420–480 px) dentro del marco y unificar el fondo en `src/juego/Juego.svelte`
- [x] T008 [US1] Actualizar la marca de la cabecera desde la isla con `tituloDelJuego(genero)` (`src/juego/presentacion.ts`) **al montar (si hay partida guardada) y cada vez que el sexo cambie**, en `src/juego/Juego.svelte`; antes de elegir sexo se muestra «Coplero»
- [x] T009 [US1] Ajustar `src/pages/r/[codigo].astro` para que la tarjeta compartida conviva con el marco sin romper el póster

**Checkpoint**: US1 verificable: marco visible al jugar y marca dinámica.

---

## Phase 4: User Story 2 - Portada corta y directa (Priority: P2)

**Goal**: portada con hero + sección fusionada; sin modalidades, FAQ ni cierre.

**Independent Test**: recorrer `/` y confirmar que existe el bloque Coplero y la sección fusionada, y que **no** existen modalidades, FAQ ni cierre.

### Implementation for User Story 2

- [x] T010 [US2] Reescribir `src/pages/index.astro`: hero + sección que fusiona «qué es» y «cómo funciona»; retirar modalidades, FAQ y cierre (los datos salen de `src/sitio/contenido.ts`)
- [x] T011 [US2] Mantener en `src/pages/index.astro` los metadatos/OG, el canonical y la referencia a acordesgaditanos

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Reglas, FAQ y pie legal (Priority: P3)

**Goal**: `/como-jugar` con reglas, modalidades y FAQ, y pie con enlaces legales que funcionan.

**Independent Test**: abrir `/como-jugar` (reglas + FAQ ≥5) y comprobar que los enlaces de privacidad y cookies abren sus páginas.

### Implementation for User Story 3

- [x] T012 [US3] Crear `src/pages/como-jugar.astro` con reglas (`src/sitio/reglas.ts`), modalidades y la FAQ retirada (`src/sitio/contenido.ts`), estática e indexable

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T013 [P] Escribir `tests/e2e/chrome.spec.ts`: cabecera y pie en `/`, `/jugar`, `/como-jugar`, legales y `/r/[codigo]`; marca dinámica; en `/jugar` la pantalla de inicio (`data-testid="intro"`) visible y sin el bloque «qué es Coplero»; mismo fondo, cabecera y pie entre `/` y `/jugar`; sin scroll horizontal desde 320 px; **axe** WCAG 2.2 AA
- [x] T014 Actualizar `tests/e2e/landing.spec.ts` (portada sin modalidades/FAQ/cierre, con sección fusionada) y `src/landing/__tests__/estatico.test.ts` (incluir `Header.astro` y las páginas estáticas nuevas sin `<script>`)
- [x] T015 Verificar **0 kB de JS** en `dist/index.html` y `dist/como-jugar/index.html` tras `npm run build`; anotar el resultado en `specs/011-landing-flow/quickstart.md`
- [x] T016 Ejecutar `npm run check` y `npx playwright test`; corregir lo que salga
- [x] T017 [P] Actualizar `docs/02-arquitectura-tecnica.md` (§6 estructura y §10 rutas) con el marco y las páginas nuevas

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; **bloquea** US1–US3.
- **US1/US2/US3**: dependen de la Fase 2 cerrada.
- **Polish (Fase 6)**: depende de las historias.

### User Story Dependencies

- **US1 (P1)**: tras la Fase 2 → **MVP**. Toca `Juego.svelte` y `r/[codigo].astro`.
- **US2 (P2)**: tras la Fase 2. Solo `index.astro`.
- **US3 (P3)**: tras la Fase 2. Solo `como-jugar.astro` (más T006, que es foundational).

### Within Each User Story

- Marco antes que páginas; contenido antes que estilos; sin avanzar sin pasar el checkpoint.

### Parallel Opportunities

- T001 y T002 (ficheros distintos).
- T003, T004 y T006 (Header, Footer y legales).
- T013 y T017 en Polish.
- **Ojo**: T005 (`Layout.astro`) toca el marco de todas las páginas; T007–T009, T010 y T012 tocan
  ficheros de página distintos entre sí.

---

## Parallel Example: fases iniciales

```bash
# Setup en paralelo:
Task: "Mover src/landing/contenido.ts a src/sitio/contenido.ts"
Task: "Crear src/sitio/reglas.ts"

# Marco en paralelo:
Task: "Crear src/components/Header.astro"
Task: "Reestructurar src/components/Footer.astro"
Task: "Crear las páginas legales"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Fase 1 (Setup) → Fase 2 (Foundational, el marco).
2. Fase 3 (US1): juego con marco y marca dinámica.
3. **PARAR Y VALIDAR**: abrir `/jugar`, comprobar marco y marca.
4. US1 ya aporta el cambio más visible.

### Incremental Delivery

1. Setup + Foundational → marco en todo el sitio.
2. US1 → juego con marco + marca → MVP.
3. US2 → portada corta.
4. US3 → `/como-jugar` + pie legal.
5. Polish → E2E/axe, 0 kB, `npm run check` y docs.

---

## Notes

- [P] = ficheros distintos, sin dependencias pendientes.
- La portada, `/como-jugar` y las legales MUST seguir con **0 kB de JS** (nada de `client:*`).
- La marca se actualiza con una escritura de `textContent` desde la isla; no se añaden islas nuevas.
- No añadir dependencias.
- No commitear sin petición explícita.
