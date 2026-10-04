# Implementation Plan: Modo dev y rediseño de la pantalla de resultado del año

**Branch**: `021-year-result-screen` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/021-year-result-screen/spec.md`

## Summary

Habilitar la iteración rápida sobre la pantalla de resultado del año y rediseñarla con el **lenguaje de las pantallas de creación**.

Tres entregas:
1. **Modo dev de resultado** `GET /jugar?dev=resultado[&caso=<caso>]`, en paralelo al ya existente `?dev=fin`. Es una **instantánea aislada**: un `Temporada` de ejemplo más el año, **sin partida real**; «Continuar» queda inerte y no toca partidas guardadas.
2. **Indicador «Año N · Resultado»** en la pantalla de resultado, en lugar de «Año N · Febrero»; las decisiones conservan «Verano»/«Febrero».
3. **Rediseño como panel de creación**: se retira la hoja clara de acta y el resultado pasa al **tema oscuro** por defecto con el contenido en un **panel** (superficie, borde, sombra, etiquetas en mayúsculas), **sin cabecera centrada**. Las **distinciones del año** se muestran en **una fila**, cada una con el **nombre encima y la roseta debajo** (rosetas de la pantalla final). El botón **«Continuar» va dentro del panel**.

Todo vive en la isla de juego (`src/juego`). No se toca `engine` ni `content`. En producción el modo dev se elimina del bundle.

## Technical Context

**Language/Version**: TypeScript 5.x; Astro + Svelte 5 (runes)

**Primary Dependencies**: ninguna nueva; tokens CSS existentes (`src/ui/tokens.css`), rosetas existentes en `public/rosetas/`, helpers de `presentacion.ts`, patrón dev existente (`dev/fixturesFin.ts`)

**Storage**: N/A — la instantánea dev no se persiste; el flujo real sigue usando `localStorage` sin cambios

**Testing**: Vitest (unit de fixtures, presentación y rosetas) + Playwright E2E + `@axe-core/playwright`; `npm run check` como puerta

**Target Platform**: web mobile-first desde 320 px; ancho máximo de marco en escritorio; build Node 22 en Netlify

**Project Type**: proyecto único Astro con una sola isla Svelte en `/jugar`

**Performance Goals**: 0 kB de JavaScript añadido en producción; sin rutas ni peticiones nuevas; la rama dev se elimina del bundle; las rosetas ya se sirven en la pantalla final

**Constraints**: no tocar `engine` ni `content`; una sola isla; WCAG 2.2 AA; sin scroll horizontal a 320 px; conservar fuentes y tokens; el tema del resultado pasa al oscuro por defecto (se retira el acta claro); la instantánea dev no debe reutilizar ni corromper una partida guardada

**Scale/Scope**: 1 módulo de fixtures dev + 1 dispatcher dev (ya existentes) + ediciones en `Juego.svelte`, `Resultado.svelte`, `presentacion.ts`, `Tarjeta.svelte`; ~1 spec E2E actualizada y 2 tests unit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| **I. Motor independiente y determinista** | No se toca el `engine`; los datos de ejemplo del modo dev son presentación (un `Temporada` literal). | ✅ PASS |
| **II. Contenido como datos, no código** | No se modifican esquemas ni banco; el modo dev no introduce contenido de juego. | ✅ PASS |
| **III. Verificación determinista y balance** | Tests unit deterministas y E2E; `npm run check` es la puerta. | ✅ PASS |
| **IV. Rendimiento y mobile-first** | Solo CSS/markup/SVG y una rama dev tree-shaken; 0 kB JS en producción; mobile-first desde 320 px; sin dependencias ni rutas nuevas. | ✅ PASS |
| **V. Simplicidad arquitectónica y proyecto único** | Se reutiliza el patrón dev existente, los tokens, las rosetas y los componentes; se comparte el mapa de rosetas en `presentacion.ts`. Sin capas ni paquetes nuevos. | ✅ PASS |

**Resultado**: sin violaciones. No se requiere `Complexity Tracking`.

**Re-evaluación post-diseño (Fase 1)**: la instantánea dev, el indicador y el panel son presentación pura (I, II); los tests cubren dev, indicador, rosetas y accesibilidad (III); sin JS ni rutas nuevas y con tree-shaking (IV); se reutiliza el modo dev, los tokens y las rosetas (V). Sigue sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/021-year-result-screen/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── ui.md            # Contrato del modo dev, el indicador y la pantalla
├── checklists/
│   └── requirements.md  # De /speckit.specify
├── spec.md
└── tasks.md             # Fase 2 (lo crea /speckit.tasks)
```

### Source Code (repository root)

```text
src/juego/
├── dev/
│   ├── fixturesFin.ts            # (existente) sin cambios
│   ├── fixturesResultado.ts      # Casos de ejemplo + arranqueResultadoDesdeUrl (ya implementado)
│   └── arranque.ts               # Dispatcher dev (fin | resultado) (ya implementado)
├── pantallas/
│   └── Resultado.svelte          # Panel oscuro de creación + fila de rosetas + botón dentro
├── presentacion.ts               # etiquetaMomento("resultado") + ROSETAS compartido
├── Tarjeta.svelte                # Usa ROSETAS de presentacion (se retira el mapa local)
├── estado.svelte.ts              # OpcionesJuego.resultadoInicial (ya implementado)
└── Juego.svelte                  # Se retira el tema claro de acta en `resultado`; arranque dev + indicador

src/juego/__tests__/
├── fixturesResultado.test.ts     # (existente) sin cambios
└── presentacion.test.ts          # + ROSETAS y etiqueta "Resultado"

tests/e2e/
├── resultado-dev.spec.ts         # Modo dev, indicador, rosetas, panel, 320 px y axe
└── layout-estable.spec.ts        # INV-5: el indicador de resultado dice "Resultado"
```

**Structure Decision**: proyecto único existente. El trabajo se concentra en la isla de juego; se reutilizan el patrón dev, los tokens y las rosetas. No se crean dependencias, capas ni rutas.

## Design

### Modo dev de resultado (`dev/fixturesResultado.ts` + `dev/arranque.ts`)

- URL: `/jugar?dev=resultado[&caso=<caso>]`, caso por defecto `campeon` y caída al caso por defecto si el caso es desconocido.
- `dev/arranque.ts` unifica `dev`: `ArranqueDev = { pantalla: "fin"; ... } | { pantalla: "resultado"; ... } | null`.
- `OpcionesJuego.resultadoInicial`: si llega, la isla arranca en `pantalla = "resultado"` con `paso = { tipo: "resultado", temporada }` y `partida = null`; «Continuar» queda inerte.
- Casos: `campeon`, `podio`, `finalista`, `preliminares`, `sin-premios`, `fuera-de-concurso`, `distinciones`.

### Indicador de contexto

- `Indicador.momento` admite `Momento | "resultado"`; `etiquetaMomento("resultado") === "Resultado"`.
- En `resultado`, el indicador es `{ ano, momento: "resultado" }`; las decisiones mantienen `verano`/`febrero`.

### Rediseño: panel de creación (`Resultado.svelte` + `Juego.svelte`)

- Se **retira** el bloque `main[data-pantalla="resultado"]` de `Juego.svelte`: el resultado pasa al **tema oscuro por defecto** (como las pantallas de creación). Se mantiene la exclusión del fondo estacional.
- `Resultado.svelte`:
  - **Sin cabecera centrada**.
  - **Panel** único con `background: var(--c-superficie)`, borde `var(--c-separador)`, `border-radius` y `box-shadow`; etiquetas en mayúsculas.
  - Estructura: etiqueta de llegada («Has llegado a» / «Te has quedado en»), fase, puesto (si lo hay) y distinciones.
  - **Distinciones en una fila**: cada una con el **nombre encima** y la **roseta debajo**; rosetas reutilizadas (`public/rosetas/`). Como máximo una por tipo y año.
  - **Botón «Continuar» dentro del panel**, al final.
- `presentacion.ts` expone `ROSETAS: Record<PremioTipo, string>`; `Tarjeta.svelte` lo importa (se elimina el mapa local duplicado).

### Contrato observable (para tests)

- `[data-testid="resultado"]` visible; `main[data-pantalla="resultado"][data-ano="<año>"]`.
- `[data-testid="indicador"]` con texto `Año <N> · Resultado`.
- Distinciones: `.distincion` (una por premio) con `.distincion__nombre` y `.distincion__roseta`.
- `[data-testid="continuar-ano"]` dentro de `.panel`.

### Tests

- **Unit** `fixturesResultado.test.ts`: casos válidos, caso desconocido → por defecto, `dev=resultado` y dispatcher.
- **Unit** `presentacion.test.ts`: `etiquetaMomento("resultado") === "Resultado"`; `ROSETAS` cubre los tres tipos.
- **E2E** `resultado-dev.spec.ts`: casos por URL; indicador «Resultado»; distinciones en fila con roseta y nombre; botón dentro del panel; «Continuar» inerte en dev; 320 px sin scroll; `axe` sin violaciones graves.
- **E2E** `layout-estable.spec.ts`: INV-5 exige `/Resultado/i`.
- No regresión: `jugar.spec.ts`, `entrada-directa.spec.ts`, `compartir.spec.ts`, `pantalla-final.spec.ts`.

## Complexity Tracking

> Sin violaciones constitucionales; sección no aplicable.
