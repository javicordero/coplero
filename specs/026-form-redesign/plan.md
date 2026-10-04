# Implementation Plan: Formulario del panel: secciones plegables y rediseño

**Branch**: `026-form-redesign` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/026-form-redesign/spec.md`

## Summary

Hacer más manejable y claro el formulario del panel local de contenido (`/panel`, solo desarrollo):
(1) las secciones secundarias (**modalidades** y **variantes** en situación/condicional; **flags** en
cada opción) pasan a **plegarse por defecto**, con un **indicador** cuando tienen contenido; y (2) un
**rediseño visual** del formulario (situación/condicional/opciones). Es un cambio **solo de
presentación**: no toca el modelo, la validación ni el motor.

Se implementa sobre el estado del panel tras la **025** (ya no existe el `consume` manual), así que no
hay sección de consumo que plegar.

## Technical Context

**Language/Version**: TypeScript 5.x + Svelte 5 (runes, snippets) sobre Astro 7.

**Primary Dependencies**: ninguna nueva. Se usa el elemento nativo `<details>`/`<summary>` para el
plegado (accesible y sin JS extra).

**Storage**: N/A (no cambia el modelo ni la persistencia).

**Testing**: no hay herramienta de test de componentes; la validación es `astro check` (compilación de
los `.svelte`) + `biome check` (`.ts`) + `vitest` (sin regresiones) + el `quickstart.md` manual.

**Target Platform**: navegador de desarrollo del diseñador; isla Svelte solo-dev (no entra en el
bundle del juego).

**Project Type**: proyecto único Astro; isla Svelte.

**Performance Goals**: N/A (herramienta local mono-usuario).

**Constraints**: mobile-first (sin desbordes a 360 px); accesible por teclado; **sin dependencias
nuevas**; solo presentación (no cambiar comportamiento).

**Scale/Scope**: 2 formularios + el subformulario de opción + el selector de flags; ~5 componentes
`.svelte` y un componente nuevo reutilizable de sección.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I. Motor independiente y determinista** | ✅ PASS. No se toca `engine`. |
| **II. Contenido como datos, no código** | ✅ PASS. No cambia el esquema ni el contenido. |
| **III. Verificación determinista y balance** | ✅ PASS. No hay cambios de motor/contenido; se mantiene la suite. |
| **IV. Rendimiento y mobile-first** | ✅ PASS. El panel es **solo-dev** y no entra en el bundle del juego; se respeta mobile-first y la isla única. |
| **V. Simplicidad arquitectónica** | ✅ PASS. Sin dependencias nuevas; se usa HTML nativo (`<details>`) y un único componente reutilizable. |

**Restricciones**: stack cerrado ✅; contradicciones al registro, no en silencio ✅ (no hay
contradicciones: es presentación).

## Project Structure

### Documentation (this feature)

```text
specs/026-form-redesign/
├── plan.md              # Este fichero
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   └── ui-form.md
└── tasks.md             # Fase 2 (/speckit.tasks, no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/panel-ui/
├── Seccion.svelte               # NUEVO · sección plegable reutilizable (<details> + indicador)
├── FormularioSituacion.svelte   # MODIFICADO · usa Seccion para modalidades/variantes; rediseño
├── FormularioCondicional.svelte # MODIFICADO · igual
├── FormularioOpcion.svelte      # MODIFICADO · usa Seccion para flags; rediseño
├── SelectorFlags.svelte         # MODIFICADO · encaja en la sección plegable; rediseño
├── EditorRequisito.svelte       # MODIFICADO · rediseño (sin plegado propio)
├── Panel.svelte                 # sin cambios de comportamiento (solo lo necesario)
├── DetalleSituacion.svelte      # sin cambios (fuera de alcance)
└── DetalleCondicional.svelte    # sin cambios (fuera de alcance)
```

**Structure Decision**: proyecto único existente. Se añade un único componente reutilizable
(`Seccion.svelte`) para no duplicar el patrón de plegado en los tres formularios. El resto son cambios
de marcado y CSS dentro de los componentes existentes. No se tocan tablas ni vistas de detalle.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Ninguna | — | — |
