# Implementation Plan: Simulación masiva del motor

**Branch**: `002-massive-simulation` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-massive-simulation/spec.md`

## Summary

Herramienta de línea de órdenes, de uso interno, que juega miles de carreras completas de Coplero de
forma automática y determinista, y produce un **informe de balance** (fases, premios, duración, años
de pico, atributos), un **ranking de frecuencia de situaciones**, la lista de **condicionales que
nunca se disparan** y un **detector de estados imposibles**. Se ejecuta con `npm run simular -- 10000`,
imprime un informe legible y puede volcarlo a JSON. **No modifica pesos ni parámetros del motor**: solo
lee su API pública.

Enfoque técnico: un módulo puro `src/simulacion/` (perfiles de jugador, configuraciones, agregación de
estadísticas y auditoría) más un CLI delgado `scripts/simular.ts`. El banco de contenido se **inyecta**
(agnóstico al banco); mientras el banco real de `content` no exista, el CLI resuelve el banco de
pruebas con una nota de deuda explícita.

## Technical Context

**Language/Version**: TypeScript 6.x (strict), ESM, Node 22+

**Primary Dependencies**: API pública de `src/engine` (interna). `tsx` (dev) para ejecutar el CLI. Sin nuevas dependencias de runtime.

**Storage**: Ninguno. Salida opcional a un archivo JSON indicado por argumento.

**Testing**: Vitest (unitarias de perfiles, estadísticas, auditoría y determinismo). El CLI se valida en `quickstart.md`.

**Target Platform**: CLI local de desarrollo (Windows/Linux/macOS), mismo runtime del proyecto.

**Project Type**: Herramienta de desarrollo (CLI) dentro del proyecto único Astro.

**Performance Goals**: 10.000 carreras completas en < 30 s (un solo proceso, todo en memoria).

**Constraints**: Determinista; sin `Math.random()` ni `Date.now()` en la lógica de simulación; sin tocar pesos ni parámetros del motor; el simulador no entra en `src/engine/`; el motor no importa nada del simulador.

**Scale/Scope**: hasta 100.000 carreras configurables por argumento; 3 perfiles × catálogo de configuraciones por defecto.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Motor independiente y determinista | ✅ El simulador vive en `src/simulacion/` y consume solo la API pública del motor. No se toca el motor. La simulación es determinista (RNG sembrado vía `rngPara`; sin `Math.random()`/`Date.now()`). |
| II. Contenido como datos | ✅ El simulador recibe un `BancoContenido` por inyección; no conoce ni depende de un banco concreto. No añade contenido. |
| III. Verificación determinista y balance por simulación | ✅ Implementa exactamente la simulación masiva que exige la constitución; `npm run check` debe pasar. |
| IV. Rendimiento y mobile-first | ➖ No aplica (herramienta de desarrollo, no se sirve al jugador); aun así cumple el objetivo de 10.000 carreras < 30 s. |
| V. Simplicidad arquitectónica y proyecto único | ✅ Sin nuevas dependencias, sin paquetes, sin persistencia. Un módulo `src/simulacion/` + CLI delgado. |

**Resultado**: PASS. Sin violaciones que justificar; `Complexity Tracking` vacío.

## Project Structure

### Documentation (this feature)

```text
specs/002-massive-simulation/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   ├── cli.md
│   └── modulo-simulacion.md
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # Fase 2 (/speckit.tasks - NO creado aquí)
```

### Source Code (repository root)

```text
src/
├── engine/              # (existente) motor puro. NO se modifica.
│   └── ...
├── simulacion/          # NUEVO módulo puro (solo importa la API pública del engine)
│   ├── tipos.ts         # PerfilJugador, ConfiguracionPartida, OpcionesSimulacion, InformeSimulacion, Hallazgo
│   ├── perfiles.ts      # aleatorio uniforme, codicioso simple, errático
│   ├── configuraciones.ts # catálogo por defecto de configuraciones de partida
│   ├── jugar.ts         # juega una carrera completa con un perfil (usa siguientePaso/elegir/continuar)
│   ├── estadisticas.ts  # agregación de métricas del informe
│   ├── auditoria.ts     # detector de estados imposibles (catálogo de reglas)
│   ├── informe.ts       # formato de texto y serialización JSON
│   ├── simular.ts       # orquestador: N carreras → InformeSimulacion
│   ├── index.ts         # API pública del módulo
│   └── __tests__/
│       ├── perfiles.test.ts
│       ├── estadisticas.test.ts
│       ├── auditoria.test.ts
│       ├── informe.test.ts
│       └── simular.test.ts
scripts/
└── simular.ts           # CLI (reescrito): argumentos, banco inyectado, salida y código de salida
```

**Structure Decision**: Proyecto único (Opción 1). El motor permanece intacto; la lógica de simulación
es un módulo puro separado (`src/simulacion/`) y el CLI `scripts/simular.ts` es un envoltorio fino. La
separación respeta la regla de dependencias: `engine` no importa de `simulacion`; `simulacion` solo
importa de `engine`.

## Complexity Tracking

> Sin violaciones de la constitución. Tabla intencionadamente vacía.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
