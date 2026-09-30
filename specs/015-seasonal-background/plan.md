# Implementation Plan: Fondo estacional del juego (verano / febrero / resultado)

**Branch**: `015-seasonal-background` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-seasonal-background/spec.md` (clarificada: tres estilos — verano claro, febrero oscuro con lluvia real, resultado teatro/escenario; sol y luna en la esquina derecha).

## Summary

Dotar al bucle jugable de **tres estilos**:
- **Verano**: fondo claro (cielo, sol en la esquina superior derecha, arena/playa) con **texto oscuro**.
- **Febrero**: fondo oscuro (noche, luna en la esquina superior derecha, **lluvia real**) con **texto claro**.
- **Resultado**: tercer estilo **acta/papel** (resultado oficial del COAC, claro y sobrio), distinto de los dos anteriores, con texto oscuro.

Es una capa de presentación pura sobre la isla Svelte: se construye con **CSS puro** (gradientes, formas y animación de gotas de lluvia), sin imágenes ni librerías ni JS. El verano y febrero se aplican vía `data-momento`; el resultado vía `data-pantalla` (ambos ya expuestos por `Juego.svelte`). El motor y el contenido no se tocan; las páginas estáticas quedan fuera.

**Clave de diseño**: se remapean los tokens semánticos (`--c-texto`, `--c-superficie`, etc.) dentro de `main[data-momento="verano"]` a una paleta clara, de modo que **los componentes no cambian**. El estilo de resultado reutiliza el tema oscuro y solo añade el fondo de teatro.

## Technical Context

**Language/Version**: Astro + Svelte 5 + TypeScript; CSS puro (custom properties + `@keyframes`). Node 22+.

**Primary Dependencies**: Ninguna nueva.

**Storage**: N/A.

**Testing**: Vitest (`src/ui/__tests__/tokens.test.ts`, V-09 ampliada) + `npm run check` (Biome + astro check) + Playwright opcional.

**Target Platform**: Web móvil (mobile-first, 320–480 px), navegadores modernos.

**Project Type**: Web app (proyecto Astro único, una sola isla Svelte en `/jugar`).

**Performance Goals**: 0 dependencias, 0 imágenes, 0 kB de red; la lluvia usa un solo `@keyframes` con `transform` (promovido a compositor) y ~20-30 gotas; se desactiva con `prefers-reduced-motion`.

**Constraints**: AA en los tres estilos; `prefers-reduced-motion` neutralizado; páginas estáticas con 0 kB de JS; solo afecta a `/jugar`.

**Scale/Scope**: 2 momentos (`verano`, `febrero`) + 1 pantalla (`resultado`), 3 estilos, 1 isla (`src/juego/`), 0 cambios en `engine`/`content`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Resultado | Justificación |
|---|---|---|
| I. Motor independiente y determinista | ✅ PASS | No se toca `engine`; se consume `Partida.momento` y `pantalla`. |
| II. Contenido como datos, no código | ✅ PASS | Sin situaciones ni condicionales nuevos. |
| III. Verificación determinista y balance por simulación | ✅ PASS | Cambio solo visual. |
| IV. Rendimiento y mobile-first | ✅ PASS (verificar) | CSS puro, sin JS ni imágenes; lluvia GPU-friendly y desactivable. Verificar contraste. |
| V. Simplicidad y proyecto único | ✅ PASS | Sin arquitectura nueva. |

**GATE**: pasa. Sin violaciones; `Complexity Tracking` queda vacía.

## Project Structure

### Documentation (this feature)

```text
specs/015-seasonal-background/
├── plan.md              # Este archivo
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── fondo.md         # Contrato de los tres estilos
└── tasks.md             # Phase 2 (/speckit.tasks — se regenera)
```

### Source Code (repository root)

```text
src/
├── ui/
│   ├── tokens.css       # + paleta clara de verano y paleta de acta (canónico)
│   ├── tokens.ts        # + espejo TS (paridad V-03)
│   └── __tests__/
│       └── tokens.test.ts   # V-09 ampliada
└── juego/
    └── Juego.svelte     # + remapeo por momento, fondos (sol/luna/arena), lluvia y estilo de resultado
```

**Structure Decision**: los colores viven en `tokens.css`/`tokens.ts` (única fuente, anti-hex V-04). El remapeo, los fondos, las gotas de lluvia y el estilo de teatro viven en `Juego.svelte` usando solo `var()`.

## Complexity Tracking

> No hay violaciones constitucionales que justificar.
