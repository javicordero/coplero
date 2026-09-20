# Implementation Plan: Decisiones que no afectan al resultado

**Branch**: `008-narrative-decisions` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-narrative-decisions/spec.md`

## Summary

Hacer que las decisiones sean **narrativa** por defecto: el desenlace de la carrera lo determinan el **destino oculto + el azar**, no las decisiones. Los **atributos parten de un valor estándar** y solo cambian por un puñado de **excepciones declaradas** con efecto **inmediato** sobre atributos (con intercambio visible). Esto se consigue **sin rediseñar el motor**: se conserva `resolverCoac` (atributos → puntuación acotada por `[suelo, techo]`) y el trabajo es de **contenido** (retirar `efectos` de casi todas las opciones, conservar unas pocas) más **validación** en la simulación (**sin estrategia dominante**) y **recalibración** de los parámetros del techo/ruido para volver a la distribución objetivo de `docs/01` §7. Quedan fuera de alcance el efecto diferido (impulso con caída) y el resultado incierto (60/40).

## Technical Context

**Language/Version**: TypeScript 5.x/6.x (strict), Node 22+

**Primary Dependencies**: `engine` puro (sin dependencias nuevas), `content` con Zod, módulo `src/simulacion/`, `scripts/simular.ts`; Vitest, Biome. Sin dependencias nuevas.

**Storage**: N/A — no cambia la persistencia. `VERSION_PARTIDA` sigue en **2** (la forma de `Partida` no cambia).

**Testing**: Vitest (`src/content/__tests__/`, `src/engine/__tests__/`, `src/simulacion/__tests__/`) + simulación masiva (`npm run simular`, 10.000 carreras) + `npm run check`.

**Target Platform**: Web mobile-first (sin cambios de UI previstos).

**Project Type**: Aplicación web (Astro + isla Svelte). Proyecto único, sin monorepo.

**Performance Goals**: la simulación de 10.000 carreras mantiene el presupuesto existente (~30 s).

**Constraints**: `engine` sin DOM, sin `Math.random()`/`Date.now()`, sin importar `content`/`web`; determinismo total; contenido validado con Zod; la UI no contiene lógica de juego.

**Scale/Scope**: 27 situaciones + 15 condicionales revisados; **unas pocas** excepciones (orden de 3–6 opciones); motor sin cambios funcionales; recalibración de parámetros.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Resultado |
|---|---|---|
| I. Motor independiente y determinista | No se toca `resolverCoac`; sin azar implícito; el resultado sigue siendo determinista | ✅ PASS — el cambio vive en `content`; el motor no gana dependencias |
| II. Contenido como datos, no código | La excepción se declara en los datos (`Opcion.excepcion`) y se valida con Zod | ✅ PASS — nueva regla de esquema: `efectos` solo si `excepcion: true`; sin lógica en `content` |
| III. Verificación determinista y balance | Tests de contenido (excepciones) + simulación (sin estrategia dominante) + recalibración | ✅ PASS — se añade auditoría `efectoNoDeclarado` y un test de distribución por perfil |
| IV. Rendimiento y mobile-first | Sin cambios de UI ni de red | ✅ PASS |
| V. Simplicidad arquitectónica | Cambio mínimo, sin dependencias nuevas ni capa nueva | ✅ PASS — se reutiliza el motor y la simulación existentes |

**Sin violaciones**: no se requiere Complexity Tracking. La recalibración se hace sobre `pesosTecho`/`umbralesNivel`/`multiplicadorRuido`, **nunca** sobre las situaciones (Constitución III).

## Project Structure

### Documentation (this feature)

```text
specs/008-narrative-decisions/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   ├── content.md       # Marca de excepción y regla de esquema
│   ├── engine.md        # Invariantes (sin cambios de API)
│   └── simulacion.md    # Auditoría y validación de "sin estrategia dominante"
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # /speckit.tasks (no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── schema.ts                     # Opcion.excepcion + superRefine (efectos ⇔ excepción)
│   ├── decisiones/{verano,febrero}/{contenido,personaje}.ts  # retirar efectos salvo excepciones
│   ├── condicionales/{verano,febrero}.ts                     # ídem
│   ├── informe.ts                    # recuento de excepciones por categoría
│   └── __tests__/integridad.test.ts  # nuevas reglas de excepción
├── engine/
│   ├── coac.ts                       # SIN cambios (se conserva atributos → puntuación → clamp)
│   └── parametros.ts                 # recalibración: pesosTecho/umbralesNivel/multiplicadorRuido
├── simulacion/
│   └── auditoria.ts                  # regla: excepción declarada + recuento
scripts/
└── simular.ts                        # (sin cambios; se usa para recalibrar y validar)
docs/
├── 01-diseno-juego.md                # §2: la decisión no mueve atributos salvo excepción
└── 02-arquitectura-tecnica.md        # §8: matiz de la fórmula y del papel de los atributos
```

**Structure Decision**: Proyecto único (Principio V). La feature es un **ajuste de datos + validación + calibración**, no una capa nueva: no hay módulos nuevos en `engine` y no se añaden dependencias.

## Complexity Tracking

> Sin violaciones de la Constitución; no procede.
