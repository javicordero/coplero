# Implementation Plan: Diseño visual (identidad, juego y compartir)

**Branch**: `012-visual-design` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-visual-design/spec.md`

## Summary

Convertir la presentación actual (colores hex sueltos, `system-ui`, estados incompletos) en un **sistema de diseño mínimo y propio**: tokens CSS en `src/ui/`, tipografía de marca autoalojada y subseateada, paleta con significado (verano/febrero, éxito/error), escala de espaciado, movimiento breve con `prefers-reduced-motion`, matriz de estados y un **elemento firma**; se aplica a las 7 rutas, las 9 pantallas Svelte y la imagen OG, manteniendo 0 kB de JS en estáticas, una sola isla, el marco de 680 px y el bucle de 420–480 px.

Hallazgo que condiciona el plan: `public/fonts/Coplero.ttf` **es DejaVu Sans** (verificado por `name`/`cmap`), la parencia que `satori` exige para el OG. El proyecto **no tiene hoy tipografía de marca** en ninguna superficie.

## Technical Context

**Language/Version**: TypeScript 6 (strict) + CSS moderno (custom properties, `@layer`, `clamp()`); Astro 7, Svelte 5 (runes).

**Primary Dependencies**: **ninguna nueva**. CSS nativo; `@axe-core/playwright` y `@playwright/test` ya presentes. Se descartan Tailwind, CSS-in-JS y librerías de animación.

**Storage**: N/A. Tokens en CSS estático + espejo TS (`src/ui/tokens.ts`) para los tests y para el endpoint edge del OG (que no puede leer CSS).

**Testing**: Vitest (pares de contraste WCAG, integridad de tokens, ausencia de hex fuera de tokens); Playwright + axe (WCAG 2.2 AA, foco, táctil ≥44 px, sin scroll horizontal a 320 px, reduced-motion). Biome para lint/format.

**Target Platform**: navegadores móviles modernos (iOS Safari 16+, Chrome Android), desde 320 px; escritorio con el mismo layout.

**Project Type**: proyecto único (web estática + una isla Svelte en `/jugar`).

**Performance Goals**: 0 kB de JS en landing, `/como-jugar`, legales y `/r/[codigo]` (invariante); sin nuevos bytes de JS en el bundle de la isla; fuente display subseateada ≤ 60 kB woff2 precargada; LCP sin regresión.

**Constraints**: ancho de marco 680 px y bucle jugable 420–480 px; **un solo tema (oscuro)**; WCAG 2.2 AA; `prefers-reduced-motion`; el marco de la imagen OG debe seguir casando con la web.

**Scale/Scope**: 7 rutas, 9 pantallas Svelte + `Tarjeta.svelte`, 1 endpoint OG y ~100 valores hex hardcodeados a consolidar en ~40 tokens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Comprobación | Estado |
|---|---|---|
| **I. Motor independiente y determinista** | No se toca `src/engine/**`. | ✅ N/A |
| **II. Contenido como datos** | No se toca `src/content/**` ni el almacén del panel. | ✅ N/A |
| **III. Verificación determinista y balance** | No se tocan pesos ni simulador. `npm run check` MUST pasar; se añaden tests de contraste e integridad de tokens. | ✅ |
| **IV. Rendimiento y mobile-first** | Tokens en CSS no añaden JS; la isla sigue siendo única; 0 kB en estáticas intacto; ancho de marco 680 px y bucle 420–480 px se codifican como tokens; se **precargan fuentes**, nunca decisiones. | ✅ |
| **V. Simplicidad y proyecto único** | Cero dependencias nuevas; `src/ui/` es carpeta disciplinada dentro de `src/`, ya prevista en `docs/02` §6 como "fase 2". Sin build extra. | ✅ |

**Resultado: sin violaciones.** No se requiere tabla de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/012-visual-design/
├── plan.md              # Este fichero
├── research.md          # Fase 0: decisiones (tokens, tipografía, movimiento, firma, verificación)
├── data-model.md        # Fase 1: entidades del sistema de diseño
├── quickstart.md        # Fase 1: guía de validación
├── contracts/
│   ├── ui.md            # Contrato de tokens, estados y elemento firma
│   └── verificacion.md  # Contrato de verificación (tests y umbrales)
└── tasks.md             # Fase 2 (/speckit.tasks — no lo crea este comando)
```

### Source Code (repository root)

```text
src/
├── ui/                              # NUEVO — sistema de diseño (solo presentación)
│   ├── tokens.css                   # custom properties: color, tipo, espacio, radios, sombras, movimiento
│   ├── base.css                     # reset + base tipográfica + utilitarios + reduced-motion
│   ├── tokens.ts                     # espejo TS (paleta/tipografía) para tests y endpoint OG
│   ├── contraste.ts                  # luminancia y ratio WCAG (función pura, testeable)
│   └── __tests__/tokens.test.ts      # contraste AA de los pares + integridad + sin hex sueltos
├── layouts/Layout.astro              # importa tokens.css y base.css (global, 0 kB JS)
├── components/{Header,Footer}.astro  # pasan a tokens
├── juego/                            # pantallas Svelte y Tarjeta a tokens
├── pages/**                          # índice, como-jugar, legales y /r/[codigo] a tokens
├── pages/api/og/[codigo].png.ts      # usa tokens.ts y la tipografía de marca (subset TTF)
└── panel-ui/**                       # EXCLUIDO: paleta propia, dev-only
public/
├── fonts/                            # tipografía de marca: woff2 (web) + ttf subset (satori)
└── favicon.svg                       # NUEVO — marca (hoy no hay favicon)
tests/e2e/
└── visual.spec.ts                    # NUEVO — a11y AA, táctil, 320 px, reduced-motion
```

**Structure Decision**: proyecto único. Se crea `src/ui/` (previsto en `docs/02` §6) con tokens CSS + espejo TS mínimo; los tokens se importan una sola vez desde `Layout.astro` (global) y llegan tanto a `.astro` como a la isla Svelte por herencia, sin añadir JS a las páginas estáticas. `src/panel-ui/**` queda explícitamente fuera del sistema para no romper el panel (paleta clara, uso interno).

## Complexity Tracking

> Sin violaciones constitucionales. Sección vacía intencionadamente.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
