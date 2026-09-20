# Implementation Plan: Cambios de trayectoria (modalidad y variante)

**Branch**: `006-trajectory-change` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-trajectory-change/spec.md`

## Summary

Añadir al motor el concepto de **trayectoria**: la carrera recuerda su modalidad y variante iniciales, cada cambio con su año y sus valores finales. Los cambios se disparan desde **opciones de situaciones** (`cambiaModalidad`, `cambiaVariante`). El cambio de modalidad se ofrece con **2 situaciones de verano** (seguir / cambiar) y, al cambiar, se abre un **paso de elección de variante** de la nueva modalidad. Después, la selección de contenido usa siempre la modalidad y variante vigentes. Todo es puro, determinista y serializable; la UI solo presenta lo que decide el motor.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node 22+

**Primary Dependencies**: Astro (páginas), Svelte 5 (isla `/jugar`), `engine` puro, Zod (contenido), Vitest, Playwright, Biome

**Storage**: `localStorage` (sobre v1 existente) que ahora serializa una `Partida` con `trayectoria`; el motor sube `VERSION_PARTIDA` a **2** (sin migración, coherente con 005)

**Testing**: Vitest (`src/engine/__tests__/`, `src/content/__tests__/`) + simulación masiva (`npm run simular`) + smoke E2E Playwright; `npm run check`

**Target Platform**: Web mobile-first (4G/WhatsApp); navegadores modernos; misma isla Svelte

**Project Type**: Aplicación web (Astro estático + una isla Svelte). Proyecto único, sin monorepo

**Performance Goals**: sin peticiones de red nuevas (el contenido sigue viajando en el bundle); el paso de variante es un render local sin coste

**Constraints**: `engine` sin DOM ni `Math.random()`/`Date.now()`; azar solo de RNG sembrado; estado serializable sin clases; `content` solo datos validados con Zod; la UI no calcula reglas

**Scale/Scope**: banco actual 27 situaciones + 11 condicionales; esta feature añade **2 situaciones de cambio de modalidad** (repetibles, baja frecuencia) y un **conjunto semilla de situaciones de cambio de variante** (ampliable en el backlog de contenido); carreras de ~20 años

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Resultado |
|---|---|---|
| I. Motor independiente y determinista | Cambios y trayectoria en TS puro; sin DOM; azar solo del RNG sembrado; reducer ampliado sin efectos secundarios; `destino` sigue interno y no se expone | ✅ PASS — nuevos tipos y funciones puras; el RNG se usa solo para elección de contenido/variante en la simulación, nunca para la trayectoria (que es determinista por decisiones) |
| II. Contenido como datos, no código | Los cambios se declaran en los **datos** de las opciones; añadir situaciones no requiere tocar el motor | ✅ PASS — `peso`, `cambiaModalidad`, `cambiaVariante` son campos de datos; el motor solo los interpreta |
| III. Verificación determinista y balance | Tests deterministas + integridad de contenido + `npm run check`; balance con simulador | ✅ PASS — tests de trayectoria, determinismo, integridad de variantes y simulación de 10.000 carreras sin variantes inválidas |
| IV. Rendimiento y mobile-first | Una sola isla; sin cargas de red; mobile-first intacto | ✅ PASS — sin dependencias nuevas ni red; el paso de variante reutiliza la pantalla existente |
| V. Simplicidad arquitectónica y proyecto único | Solución más simple que cumpla el diseño (YAGNI) | ✅ PASS — un campo de historial + un paso de UI; sin eventos, sin máquina de estados nueva más allá de una fase |

**Sin violaciones**: no se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-trajectory-change/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   ├── engine.md        # API pública y tipos del motor
│   └── pantalla.md      # Contrato del paso de elección de variante
├── checklists/
│   └── requirements.md  # De /speckit.specify
├── spec.md
└── tasks.md             # /speckit.tasks (no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── types.ts            # Trayectoria, CambioTrayectoria; Opcion.cambia*; FasePartida "variante"; Paso "variante"; ErrorMotor VARIANTE_INVALIDA; VERSION_PARTIDA 2
│   ├── trayectoria.ts      # (NUEVO) crearTrayectoria, registrarCambio, helpers puros
│   ├── partida.ts          # elegir (aplica cambios), siguientePaso (fase variante), elegirVarianteDeCambio
│   ├── selector.ts         # elegirDe usa Situacion.peso
│   ├── resumen.ts          # ResumenCarrera expone trayectoria
│   └── index.ts            # exporta trayectoria.ts y elegirVarianteDeCambio
├── content/
│   ├── schema.ts           # Situacion.peso; Opcion.cambiaModalidad/cambiaVariante; catálogo de variantes en el banco
│   ├── variantes.ts        # (ya existe) catálogo; se expone como datos del banco
│   ├── index.ts            # incluye variantes en bancoContenido
│   ├── decisiones/verano/personaje.ts   # +2 situaciones de cambio de modalidad (repetibles)
│   ├── decisiones/verano/contenido.ts   # + conjunto semilla de cambio de variante
│   └── __tests__/integridad.test.ts      # +validaciones de variantes y cambios
├── juego/
│   ├── estado.svelte.ts    # pantalla "cambio-variante", elegirVarianteCambio, refrescarPaso
│   ├── Juego.svelte        # renderiza ElegirVariante para el paso "variante"
│   └── presentacion.ts     # textos del paso de cambio de variante
├── simulacion/
│   ├── jugar.ts            # maneja paso "variante" de forma determinista
│   └── auditoria.ts        # valida trayectoria (cambios coherentes, variante válida)
tests/e2e/
└── jugar.spec.ts           # (opcional) smoke del flujo de cambio
docs/
├── 02-arquitectura-tecnica.md   # §7/§8: modelo de trayectoria y fase "variante"
└── 03-banco-verano.md           # documenta las situaciones nuevas
```

**Structure Decision**: Proyecto único (Principio V). La lógica de trayectoria vive en un módulo puro nuevo (`src/engine/trayectoria.ts`) y el reducer se amplía mínimamente; el contenido añade datos; la isla añade una pantalla y su cableado. No se introduce ninguna dependencia ni capa nueva.

## Complexity Tracking

> Sin violaciones de la Constitución; no procede.
