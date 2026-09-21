---
description: "Task list for the visual design system"
---

# Tasks: Diseño visual (identidad, juego y compartir)

**Input**: Design documents from `/specs/012-visual-design/`

**Prerequisites**: plan.md · spec.md · research.md · data-model.md · contracts/ui.md · contracts/verificacion.md

**Tests**: la fase incluye tests **por contrato** (`contracts/verificacion.md` los declara normativos: V-01…V-07 y E-01…E-07). No se relaja ningún umbral para que un test pase (criterio de rechazo 4).

**Organización**: por historia de usuario (US1 → US2 → US3), cada una implementable y verificable de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (ficheros distintos, sin dependencias)
- **[Story]**: US1, US2 o US3
- Rutas exactas en cada tarea

## Path Conventions

Proyecto único: `src/`, `tests/`, `public/` en la raíz.

---

## Phase 1: Setup

**Purpose**: preparar la carpeta del sistema, las funciones puras y las fuentes.

- [X] T001 Crear `src/ui/` con los ficheros vacíos `tokens.css`, `base.css`, `tokens.ts` y `src/ui/__tests__/`, según `plan.md` §Source Code.
- [X] T002 [P] Implementar `src/ui/contraste.ts`: luminancia relativa, ratio WCAG y parseo de hex de 6 dígitos (funciones puras, sin dependencias).
- [X] T003 [P] Descargar y autoalojar las **woff2 subseateadas** (`latin` y `latin-ext`) de `Anton` y `Atkinson Hyperlegible` en `public/fonts/`. Renombrar a `anton-latin.woff2`, `anton-latin-ext.woff2`, `atkinson-latin.woff2`, `atkinson-latin-ext.woff2`.
- [X] T004 [P] Añadir a `public/fonts/` los **TTF completos** de ambas familias (uso exclusivo de `satori`) y los textos de licencia `OFL.txt` de cada una (R2).

**Checkpoint**: fuentes servidas desde el propio dominio y utilidades de contraste listas.

---

## Phase 2: Foundational (Blocking)

**Purpose**: los tokens y su guarda. **Bloquea las tres historias.**

**⚠️ CRITICAL**: ninguna historia empieza hasta cerrar esta fase.

- [X] T005 Declarar `src/ui/tokens.css` completo en `:root` con `color-scheme: dark`: color (E1), tipografía y escala (E2), espaciado/radios/sombras/anchos/foco (E3) y movimiento (E4), con los nombres exactos de `contracts/ui.md`.
- [X] T006 Implementar `src/ui/base.css`: reset, `@font-face` de las cuatro woff2 con `font-display: swap` y `unicode-range`, base tipográfica (`--fuente-texto`, `--texto-base`, `--medida`), utilidades mínimas y el bloque global `@media (prefers-reduced-motion: reduce)`.
- [X] T007 Implementar `src/ui/tokens.ts` como espejo TS de paleta, familias y anchos (lo consumen los tests y el endpoint OG).
- [X] T008 Importar `tokens.css` y `base.css` en `src/layouts/Layout.astro` y **retirar** de ahí los estilos globales duplicados (los `#0a0a0a`, `#ededed` y el `:focus-visible` suelto).
- [X] T009 Preload de `anton-latin.woff2` en `src/layouts/Layout.astro` (solo display `latin`; nunca decisiones, Principio IV).
- [X] T010 [P] Escribir `src/ui/__tests__/tokens.test.ts` con V-01, V-02, V-03, V-05, V-06 y V-07 de `contracts/verificacion.md`.
- [X] T011 [P] Añadir a `src/ui/__tests__/tokens.test.ts` el test anti-hardcode **V-04**, excluyendo `src/ui/**`, `src/panel-ui/**`, `src/engine/**` y `src/content/**`. Debe fallar ahora: es la lista de trabajo de US1–US3.

**Checkpoint**: `npm run test` verde salvo V-04; los tokens heredan a `.astro` y a la isla sin JS nuevo.

---

## Phase 3: User Story 1 — Leer y jugar con comodidad y rapidez (P1) 🎯 MVP

**Goal**: todo el sitio usa la tipografía de marca y los tokens de color; el texto se lee sin zoom y sin scroll horizontal, y las estáticas siguen en 0 kB.

**Independent Test**: recorrer las rutas a 320 px y comprobar tipografía, contraste y ausencia de scroll horizontal, con 0 kB de JS en las páginas estáticas.

### Implementation

- [X] T012 [US1] Aplicar la escala tipográfica a `h1`–`h3` y a la prosa en `src/ui/base.css` (`--fuente-display` en titulares, `--medida` en prosa).
- [X] T013 [P] [US1] Migrar `src/components/Header.astro` y `src/components/Footer.astro` a tokens (incluida la sustitución del `#071019` del pie y de los tres grises distintos).
- [X] T014 [P] [US1] Migrar `src/pages/index.astro` a tokens (hero, claim, CTA, pasos, autor, `.micro`).
- [X] T015 [P] [US1] Migrar `src/pages/como-jugar.astro` y `src/pages/politicas/*.astro` a tokens.
- [X] T016 [P] [US1] Migrar `src/pages/r/[codigo].astro` a tokens.
- [X] T017 [US1] Migrar las pantallas de `src/juego/pantallas/` (Intro, CrearPersonaje, ElegirModalidad, ElegirVariante, Decision, Resultado, FinCarrera, Error, IndicadorContexto) y `src/juego/Juego.svelte` a tokens, sin tocar su lógica.
- [X] T018 [US1] Dar significado al color de momento: `IndicadorContexto` y `Juego.svelte` usan `--c-acento` (verano) y `--c-acento-2` (febrero) **siempre acompañados de la etiqueta textual** (FR-006, FR-007).
- [X] T019 [US1] Corregir el error pintado con color de marca: `src/juego/pantallas/Error.svelte` pasa a `--c-error`.
- [X] T020 [US1] Escribir `tests/e2e/visual.spec.ts` con E-01 (axe AA en las cinco superficies), E-02 (sin scroll horizontal a 320 px) y E-06 (0 scripts en estáticas).
- [X] T021 [US1] Verificar zoom al 200 % y medida de línea (M-03) en `/` y `/como-jugar`; ajustar `--medida` si hiciera falta.
- [X] T022 [US1] Ejecutar `npm run check` y `npm run test:e2e` (la suite existente E-07 debe seguir verde).

**Checkpoint**: US1 entregable por sí sola: legible, rápida y accesible, aunque todavía sin firma ni movimiento.

---

## Phase 4: User Story 2 — Sentir personalidad y que es un juego (P2)

**Goal**: identidad reconocible (elemento firma + display), respuesta visual en cada control y movimiento breve y desactivable.

**Independent Test**: recorrer una partida y comprobar firma visible, respuesta en `hover`/`active`/`focus-visible`, transiciones cortas y desaparición de las mismas con reducción de movimiento.

### Implementation

- [X] T023 [US2] Crear el elemento firma **regla de compás** en `src/components/ReglaCompas.astro` (CSS/SVG inline, `aria-hidden="true"`, colores por tokens, sin fichero de imagen).
- [X] T024 [US2] Colocar la firma en cabecera (`Header.astro`), como separador de secciones en `index.astro` y en el pie de la tarjeta.
- [X] T025 [P] [US2] Aplicar `--fuente-display` a la marca, `h1`, al número de año del indicador y al titular de `Tarjeta.svelte`.
- [X] T026 [P] [US2] Añadir movimiento con tokens en `src/ui/base.css` (transiciones de `background-color`, `border-color`, `color`, `transform`, `opacity`) y la entrada de pantalla del bucle.
- [X] T027 [US2] Implementar la **matriz de estados** completa (E5) en los controles: `src/juego/pantallas/Decision.svelte` (hoy solo tiene `:hover`), `ElegirModalidad.svelte`, `ElegirVariante.svelte`, `CrearPersonaje.svelte`, `Intro.svelte`, `Resultado.svelte` y `FinCarrera.svelte`; incluir `disabled` y `seleccionado` sin depender solo del color.
- [X] T028 [US2] Crear `public/favicon.svg` (marca + compás) y enlazarlo en `src/layouts/Layout.astro` junto a `<meta name="theme-color">` y el `apple-touch-icon`.
- [X] T029 [US2] Ampliar `tests/e2e/visual.spec.ts` con E-03 (táctil ≥ 44 px), E-04 (foco visible por teclado) y E-05 (`prefers-reduced-motion` emulado).
- [X] T030 [US2] Ejecutar `npm run check` y `npm run test:e2e`.

**Checkpoint**: US1 + US2 funcionan de forma independiente; el juego ya "se siente" Coplero.

---

## Phase 5: User Story 3 — Compartir con orgullo (P3)

**Goal**: la tarjeta final y la imagen del enlace comparten tipografía y paleta con la web, y se leen bien en 9:16 y 1:1.

**Independent Test**: generar una tarjeta, descargar los dos formatos y comparar `api/og/<codigo>.png` con la tarjeta en pantalla.

### Implementation

- [X] T031 [P] [US3] Migrar `src/juego/Tarjeta.svelte` a tokens y ajustar la jerarquía para que se lea entera en 9:16 y 1:1 (FR-013).
- [X] T032 [US3] Pasar `src/pages/api/og/[codigo].png.ts` a `src/ui/tokens.ts` para los colores y a las **TTF de marca** para la tipografía, declarando los pesos reales disponibles (hoy DejaVu y pesos falsos).
- [X] T033 [US3] Revisar los tres formatos del OG (`og` 1200×630, `9x16` 1080×1920, `1x1` 1080×1080) para que ninguno recorte texto ni rompa la jerarquía.
- [X] T034 [US3] Revisar `FinCarrera.svelte`: botones de compartir con la matriz de estados y avisos en la región `aria-live` existente.
- [X] T035 [US3] Verificación manual M-01 y M-02 (tarjeta en los dos formatos y vista previa del enlace) y anotar el resultado.

**Checkpoint**: las tres historias completas; web y tarjeta cuentan la misma identidad.

---

## Phase 6: Polish & Cross-Cutting

- [X] T036 [P] Poner **V-04 en verde**: barrer los hex restantes fuera de `src/ui/**` y las exclusiones declaradas; `npm run test` completo.
- [X] T037 [P] Actualizar `docs/02-arquitectura-tecnica.md` §6 (`src/ui/` deja de ser "fase 2") y `docs/05-producto-viralidad-negocio.md` §9 si procede; registrar en `docs/registro/` cualquier decisión no prevista.
- [X] T038 [P] Añadir el crédito de las fuentes (OFL) en el pie o en la página correspondiente, con enlace a sus licencias.
- [X] T039 Ejecutar `npm run build` y comparar `dist/`: 0 kB de JS en estáticas y **sin crecimiento** del bundle de la isla (M-04 baseline).
- [X] T040 Ejecutar la validación de `quickstart.md` de principio a fin y anotar los resultados de M-01…M-04.
- [X] T041 Ejecutar `npm run check` y `npm run test:e2e` como puerta final; comprobar que `package.json` no tiene dependencias nuevas.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)**: sin dependencias.
- **Foundational (2)**: depende de Setup y **bloquea** las tres historias.
- **US1 (3)**, **US2 (4)**, **US3 (5)**: dependen de Foundational. US2 asume los tokens de US1 (T017) y US3 asume `tokens.ts` (T007) y la display (T025).
- **Polish (6)**: depende de US1–US3.

### Within Each Story

- Tokens antes de migrar componentes; migrar componentes antes de los tests de navegador.
- V-04 se escribe en Foundational y **solo se pone verde en Polish**: es el marcador de avance.

### Parallel Opportunities

- T002, T003, T004 en paralelo.
- T010 y T011 en paralelo.
- T013–T016 en paralelo (ficheros distintos).
- T025 y T026 en paralelo; T031 y T032 en paralelo.
- T036, T037 y T038 en paralelo.

---

## Parallel Example: User Story 1

```bash
# Migración de superficies independientes:
Task: "Migrar src/components/Header.astro y Footer.astro a tokens"
Task: "Migrar src/pages/index.astro a tokens"
Task: "Migrar src/pages/como-jugar.astro y legales a tokens"
Task: "Migrar src/pages/r/[codigo].astro a tokens"
```

---

## Implementation Strategy

### MVP First (solo US1)

1. Setup + Foundational.
2. US1 completa.
3. **PARAR Y VALIDAR**: contraste, 320 px, 0 kB, `npm run check`.
4. El sitio ya es legible y accesible; se puede mostrar.

### Incremental

1. US1 → validar → commit.
2. US2 → validar → commit.
3. US3 → validar → commit.
4. Polish → puerta final y validación de `quickstart.md`.

### Reglas de la fase

- **No** se toca `src/engine/**`, `src/content/**`, `content-admin/**` ni la persistencia.
- **No** se añade ninguna dependencia a `package.json`.
- **No** se baja un umbral para pasar un test.
- Los commits se hacen **solo cuando se pidan**.

---

## Notes

- [P] = ficheros distintos, sin dependencias.
- El test anti-hardcode (T011/T036) es la garantía de que la deuda no vuelve.
- `src/panel-ui/**` queda fuera del sistema y del test, por decisión R11.
- Verificar que los tests fallan antes de implementar (T011 debe fallar hasta T036).
