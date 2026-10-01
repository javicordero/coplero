# Implementation Plan: Entrada directa al juego y reanudación solo cuando hay partida en curso

**Branch**: `018-direct-game-entry` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-direct-game-entry/spec.md`

## Summary

**Objetivo principal**: eliminar la pantalla de arranque intermedia de `/jugar`. Al entrar, el juego decide en función del guardado:

- **Sin partida recuperable** (no hay guardado, se descartó por incompatibilidad, o es una carrera terminada) → **empieza directamente en la creación de personaje**.
- **Con partida en curso** → muestra una **pantalla de reanudación** con «Continuar» y «Empezar una partida nueva».

Además: el descarte de un guardado inservible pasa a ser **silencioso** (deroga el aviso puntual de la feature 005, que debe registrarse en `docs/registro/`), y «Nueva partida» **no borra** el guardado anterior hasta que la nueva partida se crea (protección ante clic accidental, sin confirmación).

Es un cambio de **presentación y enrutado de la isla (`src/juego`)**: no se toca `engine` ni `content`, y la portada sigue siendo HTML estático con 0 kB de JS.

## Technical Context

**Language/Version**: TypeScript 5.x; Astro 5 + Svelte 5 (runes)

**Primary Dependencies**: sistema de tokens CSS propio (`src/ui/`) y la isla existente; **sin dependencias nuevas**

**Storage**: `localStorage` mediante `src/juego/persistencia.ts` (clave `coplero:partida`, `VERSION_GUARDADO`); sin cambios de formato

**Testing**: Vitest (unitario del estado y persistencia) + Playwright (E2E) + `@axe-core/playwright` (accesibilidad)

**Target Platform**: web mobile-first (desde 320 px); build Node 22 en Netlify

**Project Type**: proyecto único Astro con una sola isla Svelte en `/jugar`

**Performance Goals**: 0 kB de JavaScript añadido; la portada y las páginas estáticas no cambian; el bundle de la isla no crece de forma apreciable (se retira código)

**Constraints**: no tocar `engine`/`content`; una sola isla; sin scroll horizontal; contraste AA; compatible con `prefers-reduced-motion`; determinismo intacto

**Scale/Scope**: `src/juego/estado.svelte.ts`, `src/juego/Juego.svelte`, la pantalla de inicio reconvertida en pantalla de reanudación, `src/juego/presentacion.ts`, tests unitarios y E2E

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| **I. Motor independiente y determinista** | No se importa ni modifica el motor; todo vive en `src/juego` (UI) y el determinismo no se altera. | ✅ PASS |
| **II. Contenido como datos, no código** | No se toca esquema ni banco; solo se cambia el arranque de la UI. | ✅ PASS |
| **III. Verificación determinista y balance por simulación** | Se añaden tests unitarios de enrutado y E2E del flujo; no es balance. `npm run check` debe pasar. | ✅ PASS |
| **IV. Rendimiento y mobile-first** | Se retira código; la portada sigue estática (0 kB JS); una sola isla; mobile-first intacto. | ✅ PASS |
| **V. Simplicidad arquitectónica y proyecto único** | Se reutiliza la isla y el sistema de tokens; no hay capas ni paquetes nuevos. | ✅ PASS |

**Resultado**: sin violaciones. No se requiere `Complexity Tracking`.

**Re-evaluación post-diseño (Fase 1)**: todo el cambio es de enrutado y presentación dentro de `web` (Principios I, II, V), no añade peso a las páginas estáticas (IV) y se verifica con tests deterministas de enrutado y E2E (III). Sigue sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/018-direct-game-entry/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── estado.md        # Contrato del enrutado de arranque y API del estado
└── tasks.md             # Fase 2 (lo crea /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── juego/
│   ├── estado.svelte.ts               # Enrutado inicial + empezar/reiniciar/continuarPartida + retirada de `aviso`
│   ├── presentacion.ts                # Retirada de AVISO_GUARDADO_DESCARTADO
│   ├── Juego.svelte                   # Render condicional de la pantalla de reanudación; quita `empezarDeCero`
│   └── pantallas/
│       └── Reanudar.svelte            # NUEVO (renombra a Intro.svelte): solo «Continuar» + «Nueva partida»
├── pages/
│   ├── index.astro                    # Sin cambios (una sola CTA, estática)
│   └── jugar.astro                    # Sin cambios
tests/
└── e2e/
    ├── apoyo/juego.ts                 # `crearPersonaje` sin clic en «empezar»
    ├── layout-previo.spec.ts          # Quita los clics en «empezar»
    ├── chrome.spec.ts                 # Quita el clic en «empezar»
    ├── jugar.spec.ts                  # Conserva el escenario de reanudar
    └── entrada-directa.spec.ts        # NUEVO: enrutado de arranque (sin/en curso/terminada) + preservado
docs/
└── registro/
    ├── decisiones-cerradas.md         # Registrar la derogación del aviso puntual (005) y el nuevo arranque
    └── decisiones-pendientes.md       # (si procede) nota de la decisión tomada
```

**Structure Decision**: proyecto único existente. El cambio se concentra en la isla `src/juego` (estado, enrutado y una pantalla reconvertida), la retirada de un texto de presentación y la actualización de tests E2E y unitarios. No se crean carpetas de código ni dependencias nuevas. La portada y `jugar.astro` no cambian.

## Design

### Enrutado de arranque (núcleo de la feature)

En `crearJuego` (`src/juego/estado.svelte.ts`) se calcula la pantalla inicial a partir del guardado ya existente:

| Estado del guardado | Pantalla inicial |
|---------------------|------------------|
| `ninguno` (no hay o se descartó) | `crear-personaje` |
| `en-curso` | `reanudar` |
| `terminada` | `crear-personaje` |

- La lectura inicial ya existe (`cargar`) y no cambia; solo cambia la decisión de pantalla.
- **Descarte silencioso**: se elimina el estado `aviso` y la constante `AVISO_GUARDADO_DESCARTADO`. Si `cargar` descarta el sobre, se enruta a `crear-personaje` sin mensaje.
- **Renombre**: la pantalla `intro` pasa a llamarse `reanudar` (tipo `Pantalla`), el componente `Intro.svelte` pasa a `Reanudar.svelte` y su `data-testid` a `reanudar`. La pantalla solo se usa cuando hay partida en curso.

### Semántica de las acciones

- **`empezar()`** (botón «Nueva partida» y arranque desde crear-personaje): lleva a `crear-personaje` **sin borrar** el guardado. La partida anterior permanece recuperable hasta que la nueva partida se cree y `persistir()` la sobrescriba (FR-007).
- **`reiniciar()`** (tras fin de carrera o error): borra el guardado, resetea el estado y enruta a `crear-personaje` (antes iba a la intro). El guardado terminado no es reanudable, así que borrarlo es inocuo.
- **`continuarPartida()`**: carga el sobre y refresca el paso. Si el sobre ya no es recuperable (`descartado`) o no hay partida, fija `estadoGuardado = "ninguno"` y enruta a `crear-personaje` **en silencio** (sin aviso).
- Se retira `empezarDeCero()` de `Juego.svelte` (reiniciar + empezar); ya no hay pantalla previa que lo invoque.

### Pantalla de reanudación (`Reanudar.svelte`)

- Reutiliza el lenguaje visual del inicio actual (sección centrada, título «Coplero», subtítulo).
- Contenido: un encabezado (`h1` «Coplero`) y dos acciones:
  - **Continuar donde lo dejaste** (`data-testid="continuar"`, `class="primario"`) → `continuarPartida()`.
  - **Empezar una partida nueva** (`data-testid="nueva-partida"`) → `empezar()`.
- Se eliminan la rama de carrera terminada («Ver resultado»), el bloque de `aviso` y el botón «Empezar» incondicional.

### Juego.svelte

- `PANTALLAS_PREVIAS` no cambia (`crear-personaje`, `modalidad`, `variante`). La pantalla de reanudación no es "prepartida": se muestra centrada como el inicio actual.
- El bloque de render pasa a `{:else if juego.pantalla === "reanudar"}` con `onContinuar` y `onNuevaPartida`.

### Compatibilidad y casos límite

- **Sin almacenamiento**: `almacenNavegador()` devuelve un almacén no-op; `estadoGuardado = "ninguno"` → arranque directo. Sin errores visibles.
- **Botón atrás / recarga**: la decisión de arranque se recalcula en cada carga, así que una partida en curso reabre la pantalla de reanudación y una terminada arranca directo.
- **Carrera terminada**: el guardado se conserva en `localStorage`, pero no se ofrece reanudación; la tarjeta solo queda accesible por su enlace (`/r/[codigo]`).
- **Enlace compartido**: `/r/[codigo].astro` no se toca.
- **Determinismo**: intacto; el motor y el orden de pasos no cambian.

### Presentación

- Se elimina `AVISO_GUARDADO_DESCARTADO` de `src/juego/presentacion.ts`.
- La portada (`src/pages/index.astro`) no cambia: mantiene una sola llamada a la acción.

### Registro de decisiones

- La derogación del aviso puntual (decisión cerrada de 005) **no se resuelve en silencio**: se anota en `docs/registro/decisiones-cerradas.md` (fila de "Guardado no restaurable") y en `docs/registro/decisiones-pendientes.md` si se considera un cambio de decisión a documentar.

### Tests

- **Unitarios (`src/juego/__tests__/estado.test.ts`)**:
  - Arranque sin guardado → `crear-personaje`.
  - Arranque con partida en curso → `reanudar`.
  - Arranque con carrera terminada → `crear-personaje`.
  - `empezar()` desde reanudar **no** borra el guardado (sigue presente hasta crear la nueva partida).
  - `reiniciar()` → `crear-personaje` y guardado borrado.
  - Descarte silencioso: sobre inservible → `crear-personaje`, `estadoGuardado === "ninguno"`, sin `aviso`.
  - Actualizar los tests existentes que esperan `intro`, `aviso` o "vuelve a la intro".
- **E2E**:
  - `apoyo/juego.ts`: `crearPersonaje` deja de pulsar `empezar` (el flujo arranca en `crear-personaje`).
  - Quitar los `getByTestId("empezar").click()` de `layout-previo.spec.ts` (4), `chrome.spec.ts` (1).
  - `jugar.spec.ts`: el escenario de recarga sigue esperando `continuar` (ahora dentro de `reanudar`).
  - **Nuevo `entrada-directa.spec.ts`**: arranque directo sin guardado; reanudación con `continuar` y `nueva-partida`; `nueva-partida` conserva el guardado (recargar vuelve a ofrecer reanudar); carrera terminada → arranque directo; axe AA.

## Complexity Tracking

> Sin violaciones constitucionales; sección no aplicable.
