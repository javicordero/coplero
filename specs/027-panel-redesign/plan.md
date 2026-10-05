# Implementation Plan: Rediseño integral del panel de contenido

**Branch**: `027-panel-redesign` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/027-panel-redesign/spec.md`

## Summary

Unificar la identidad visual de **todo el panel** (hoy los formularios usan la identidad de la 026, pero
la carcasa, las tablas y el detalle siguen con el estilo antiguo) y **reconfigurar su diseño**. Se
extrae la identidad a un **conjunto de tokens compartidos** que consumen todas las vistas, se rediseña
la carcasa (cabecera, conmutador de vista, acciones y mensajes), las **tablas** (con scroll horizontal
en un contenedor propio en móvil) y las **vistas de detalle**. Es un cambio **solo de presentación**:
no cambia el comportamiento del panel ni toca el juego.

## Technical Context

**Language/Version**: TypeScript 5.x + Svelte 5 (runes) sobre Astro 7.

**Primary Dependencies**: ninguna nueva. La identidad se implementa con **CSS custom properties** y
**fuentes del sistema**.

**Storage**: N/A (no cambia el modelo ni la persistencia).

**Testing**: no hay test de componentes; la validación es `astro check` (compila los `.svelte`) +
`biome check` (`.ts`) + `vitest` (sin regresiones) + el `quickstart.md` manual.

**Target Platform**: navegador de desarrollo del diseñador; isla Svelte **solo-dev** (no entra en el
bundle del juego).

**Project Type**: proyecto único Astro; isla Svelte.

**Performance Goals**: N/A (herramienta local mono-usuario).

**Constraints**: mobile-first (sin desbordes a 360 px; las tablas con scroll interno); accesible por
teclado; **sin dependencias nuevas** ni ficheros de fuente; **sin modo oscuro**; solo presentación.

**Scale/Scope**: carcasa del panel + 2 tablas (situaciones/condicionales) + 2 vistas de detalle + los 6
componentes del formulario (para consumir los tokens compartidos). ~10 componentes `.svelte` + 1 hoja de
estilos global + la página `panel.astro`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I. Motor independiente y determinista** | ✅ PASS. No se toca `engine`. |
| **II. Contenido como datos, no código** | ✅ PASS. No cambia el esquema ni el contenido. |
| **III. Verificación determinista y balance** | ✅ PASS. No hay cambios de motor/contenido; se mantiene la suite. |
| **IV. Rendimiento y mobile-first** | ✅ PASS. El panel es **solo-dev** y no entra en el bundle del juego; se respeta mobile-first y la isla única. |
| **V. Simplicidad arquitectónica** | ✅ PASS. Sin dependencias nuevas; un único conjunto de tokens compartidos reduce duplicación (no añade capas). |

**Restricciones**: stack cerrado ✅; contradicciones al registro, no en silencio ✅ (es presentación).

## Project Structure

### Documentation (this feature)

```text
specs/027-panel-redesign/
├── plan.md              # Este fichero
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   └── ui-panel.md
└── tasks.md             # Fase 2 (/speckit.tasks, no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/pages/
└── panel.astro                  # MODIFICADO · importa los estilos globales (tokens) y aplica fondo/fuente

src/panel-ui/
├── estilos.css                  # NUEVO · tokens compartidos (--panel-*) + base (fondo, tipografía)
├── Panel.svelte                 # MODIFICADO · carcasa (cabecera, conmutador, acciones, estados) con tokens
├── TablasMomentos.svelte        # MODIFICADO · rediseño + contenedor con scroll horizontal en móvil
├── DetalleSituacion.svelte      # MODIFICADO · rediseño con tokens
├── DetalleCondicional.svelte    # MODIFICADO · rediseño con tokens
├── Seccion.svelte               # MODIFICADO · consume los tokens compartidos (sin definir --f-*)
├── FormularioSituacion.svelte   # MODIFICADO · consume los tokens compartidos
├── FormularioCondicional.svelte # MODIFICADO · consume los tokens compartidos
├── FormularioOpcion.svelte      # MODIFICADO · consume los tokens compartidos
├── SelectorFlags.svelte         # MODIFICADO · consume los tokens compartidos
└── EditorRequisito.svelte       # MODIFICADO · consume los tokens compartidos
```

**Structure Decision**: proyecto único existente. La identidad se centraliza en
`src/panel-ui/estilos.css` (tokens `--panel-*` y base), importada una sola vez desde `panel.astro` como
estilo global; los componentes (carcasa, tablas, detalle y formularios) la consumen con `var(--panel-*)`.
Así un cambio de token se propaga a todas las vistas (FR-002, SC-004). No se toca el juego.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Ninguna | — | — |

## Phase 0: Research — ver `research.md`

Decisiones resueltas (sin `NEEDS CLARIFICATION`): ubicación y nombres de los tokens, unificación de la
identidad de la 026, patrón de tablas en móvil (scroll interno), rediseño de carcasa y detalle, sin modo
oscuro, y alcance (solo panel).
