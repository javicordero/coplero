# Implementation Plan: Layout estable del bucle jugable (anclaje de elementos)

**Branch**: `016-stable-decision-layout` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-stable-decision-layout/spec.md`

## Summary

Estabilizar la pantalla de decisión y reorganizarla: el **indicador de contexto** (año y momento, sin el tipo) sale de la sección y pasa a un **overlay fijo en la esquina superior izquierda** del área de juego (simétrico al sol/luna de la derecha), visible en decisión y resultado. La sección de decisión queda **solo con la situación y las opciones**, centradas en el medio de la pantalla con **altura reservada constante**, de modo que el título ocupa siempre el mismo espacio y la primera y la segunda opción aparecen siempre en el mismo sitio y con el mismo tamaño, con independencia del texto, del momento (verano/febrero), del tipo y del número de opciones.

El enfoque es **presentación pura con CSS y la isla Svelte existente**: bloques de altura fija, un overlay posicionado para el indicador y el centrado de un bloque de altura constante. No se usa scroll interno, ni recorte, ni reducción automática de fuente. No se toca `engine` ni `content`. La pantalla de resultado se rediseñará más adelante; aquí solo se garantiza que el indicador se mantiene alineado.

## Technical Context

**Language/Version**: TypeScript 5.x (Astro 5 + Svelte 5 con runes)

**Primary Dependencies**: Astro, Svelte 5, sistema de tokens CSS propio (`src/ui/tokens.css`); **sin dependencias nuevas**

**Storage**: N/A (no aplica; la persistencia de partida no se modifica)

**Testing**: Vitest (unitario) + Playwright (E2E); `@axe-core/playwright` ya presente para accesibilidad

**Target Platform**: Web mobile-first (desde 320 px), ancho máximo del bucle 420–480 px en escritorio; build Node 22 en Netlify

**Project Type**: proyecto único Astro con una sola isla Svelte en `/jugar`

**Performance Goals**: 0 kB de JavaScript añadido; páginas estáticas intactas (siguen sin JS); sin nuevos assets

**Constraints**: no tocar `engine`/`content`; una sola isla; sin scroll/recorte/autoajuste; contraste AA conservado; compatible con `prefers-reduced-motion`

**Scale/Scope**: pantallas de **decisión** y **resultado** del bucle; ~15–20 decisiones por carrera; 2–3 opciones por situación; cambio en 4 componentes Svelte, tokens y 1–2 tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| **I. Motor independiente y determinista** | No se importa ni modifica el motor; el cambio vive solo en `src/juego` (UI). Sin azar ni tiempo. | ✅ PASS |
| **II. Contenido como datos, no código** | No se cambian esquemas ni estructuras de `content`. Si se acorta algún texto para caber, es por autoría. | ✅ PASS |
| **III. Verificación determinista y balance por simulación** | No es una feature de balance. Se añaden tests de layout reproducibles; `npm run check` debe pasar. No se alteran pesos ni situaciones. | ✅ PASS |
| **IV. Rendimiento y mobile-first** | Solo CSS, 0 kB JS añadidos, mobile-first real desde 320 px. | ✅ PASS |
| **V. Simplicidad arquitectónica y proyecto único** | Solución mínima con CSS y tokens en la isla existente; sin capas ni dependencias nuevas. | ✅ PASS |

**Resultado**: sin violaciones. No se requiere `Complexity Tracking`.

## Project Structure

### Documentation (this feature)

```text
specs/016-stable-decision-layout/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   └── layout.md        # Contrato de anclajes y ganchos de test
└── tasks.md             # Fase 2 (lo crea /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── juego/
│   ├── Juego.svelte                    # Renderiza el indicador como overlay de `main`; conserva el bloque centrado
│   ├── presentacion.ts                 # `Indicador` sin `tipo` (etiquetaTipo se mantiene solo para errores)
│   └── pantallas/
│       ├── IndicadorContexto.svelte    # Overlay esquina superior izquierda: año · momento (sin tipo), tamaño algo mayor
│       ├── Decision.svelte             # Solo situación + opciones; bloques fijos; centrado con altura constante
│       └── Resultado.svelte            # Deja de renderizar el indicador (pasa a `main`); acta sin cambios
├── ui/
│   └── tokens.css                      # Nuevos tokens de altura/anclaje del indicador y del bloque de decisión

tests/
└── e2e/
    ├── layout-estable.spec.ts          # Nuevo: anclajes y ausencia de desbordamiento
    └── carrera-completa.spec.ts        # Actualizar: el indicador ya no está dentro de la sección ni expone data-tipo
```

**Structure Decision**: proyecto único existente. El cambio se concentra en la isla `src/juego` y en los tokens compartidos. No se crean carpetas de código nuevas; se añade un test E2E y se actualiza otro.

## Complexity Tracking

> Sin violaciones constitucionales; sección no aplicable.
