# Implementation Plan: Recorrido E2E de una carrera completa (E2E-001)

**Branch**: `014-e2e-golden-path` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-e2e-golden-path/spec.md`

## Summary

Añadir **una única prueba E2E integrada** del camino feliz —E2E-001— que abra `/jugar`, cree un
personaje, elija modalidad y variante, complete varias decisiones, recorra la carrera entera, vea la
tarjeta final, recargue y recupere la partida, genere el enlace compartible y lo abra en `/r/[codigo]`.
Hoy los diez hitos existen **repartidos** entre `tests/e2e/jugar.spec.ts` y
`tests/e2e/compartir.spec.ts`, pero ninguna prueba encadena el viaje completo. La prueba usa los
anclajes observables que ya existen (`[data-pantalla]`, `data-testid`), añade **un solo atributo**
(`data-tipo`) para distinguir decisiones de contenido y de personaje, y extrae a un módulo de apoyo
los helpers hoy duplicados para que los tres specs compartan una única definición de "cómo se juega".
No se toca `engine` ni `content`.

## Technical Context

**Language/Version**: TypeScript 6 (strict), Node 22+.

**Primary Dependencies**: Playwright (`@playwright/test` 1.63, ya instalado). **Sin dependencias
nuevas.** El test corre contra el `webServer` ya configurado en `playwright.config.ts` (puerto 4321).

**Storage**: `localStorage` (clave `coplero:partida`, feature 005) solo como **observación** de la
recuperación; no se modifica el formato ni la versión.

**Testing**: Playwright E2E. Sin cambios en `engine`/`content` → **no hay recalibración** de la
simulación. La cobertura determinista del motor sigue en Vitest.

**Target Platform**: navegador Chromium headless, en local y **compatible con CI** (T12, hoy diferida); app Astro con la isla Svelte.

**Performance Goals**: el recorrido completo (≈20 años, ~60 interacciones) termina en **menos de
60 s** (SC-004); una sola prueba, un solo arranque de navegador.

**Constraints**: sin red externa; los diez hitos en una sola ejecución; no romper ni degradar los
E2E existentes; esperas por estado observable, nunca fijas; `npm run check` MUST seguir verde.

**Scale/Scope**: 1 spec nuevo + 1 módulo de apoyo + 2 specs refactorizados + 1 atributo en la isla.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I · Motor independiente y determinista** | ✅ No se toca `engine`. No se introduce azar ni tiempo nuevos: la prueba consume la seed aleatoria de producción y verifica flujo/estructura, no valores. La determinismo del motor sigue cubierto por Vitest. |
| **II · Contenido como datos, no código** | ✅ N/A. No se toca `src/content/**`. |
| **III · Verificación determinista y balance** | ✅ La feature **es** verificación: añade cobertura E2E del viaje completo y reutiliza los tests deterministas existentes. Al no cambiar `engine`/`content`, no hay recalibración y `npm run check` no se altera salvo por los E2E (que viven en `npm run test:e2e`). |
| **IV · Rendimiento y mobile-first** | ✅ Sin impacto: un único atributo de datos en la isla, sin JS nuevo ni isla nueva; las páginas estáticas siguen a 0 kB. |
| **V · Simplicidad arquitectónica y proyecto único** | ✅ Proyecto único, sin dependencias nuevas. Un fichero de prueba y un módulo de apoyo; se evita un Page Object completo por sobreingeniería. |

**Resultado**: sin violaciones. No se requiere **Complexity Tracking**.

*Re-check post-diseño (Phase 1)*: se mantiene. Los únicos cambios fuera de `tests/` son un atributo
`data-tipo` en `IndicadorContexto.svelte` (anclaje de observación, coherente con los `data-*` ya
existentes) y, si el plan lo necesita, ningún otro. No hay acoplamiento nuevo entre capas.

## Project Structure

### Documentation (this feature)

```text
specs/014-e2e-golden-path/
├── plan.md              # Este fichero
├── research.md          # Fase 0: decisiones (una prueba, semilla, anclajes, ayuda, recarga, compartir)
├── data-model.md        # Fase 1: modelo de la prueba (hitos, clave de pantalla, enlace)
├── quickstart.md        # Fase 1: guía de validación
├── contracts/
│   └── observabilidad.md  # Contrato de anclajes observables y del arnés E2E
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks — no lo crea este comando)
```

### Source Code (repository root)

```text
tests/e2e/
├── carrera-completa.spec.ts   # NUEVO — E2E-001: el recorrido integrado (10 pasos)
├── apoyo/
│   └── juego.ts               # NUEVO — helpers compartidos (crear, jugar, clave de pantalla, enlace)
├── jugar.spec.ts              # MODIFICADO — usa los helpers de apoyo (sin perder cobertura)
└── compartir.spec.ts          # MODIFICADO — usa los helpers de apoyo (sin perder cobertura)

src/juego/pantallas/
└── IndicadorContexto.svelte   # MODIFICADO — añade `data-tipo` (anclaje mínimo para FR-005)
```

**Structure Decision**: proyecto único. La prueba vive en `tests/e2e/`, junto a las existentes. Los
helpers que hoy están duplicados (bucle de hasta 400 pasos, creación de personaje, clave de pantalla)
se extraen a `tests/e2e/apoyo/juego.ts` para que la nueva prueba no sea una tercera copia y para que
la suite tenga **una sola** definición de "cómo se juega"; es la única abstracción que se introduce.
`playwright.config.ts` no cambia (el `webServer` y el `testDir` ya sirven). El único cambio en `src/`
es un atributo `data-tipo` en el indicador de contexto, porque es el único hito (contenido vs.
personaje) que hoy no tiene anclaje estable sin leer el texto visible.

## Complexity Tracking

> Sin violaciones a la constitución: la tabla queda vacía a propósito.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
