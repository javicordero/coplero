# Implementation Plan: Curva de carrera y variedad de resultados

**Branch**: `013-career-arc` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-career-arc/spec.md`

## Summary

La carrera no tiene arco: los atributos son constantes (feature 008), el nivel se recorta contra el techo oculto y la posición se satura en el extremo de la banda, de modo que la carrera vive entera en su techo (siempre 17, siempre 5, siempre 11). Se sustituye la base constante por una **curva de carrera** anclada al año pico, se cambia el ruido blanco por una **forma con memoria** derivada de la semilla, y se **desaturará la posición** dentro del nivel usando un mérito normalizado propio de la carrera. Los pesos del techo y los umbrales **no se tocan**: ya materializan la distribución objetivo de `docs/01` §7. Se añade al simulador el registro de la **secuencia por año** y métricas de forma, que es el hueco que dejó pasar el fallo.

## Technical Context

**Language/Version**: TypeScript 6 (strict). Motor puro, sin DOM ni framework.

**Primary Dependencies**: ninguna nueva. Todo el azar sigue saliendo de `rngPara` (mulberry32/cyrb128).

**Storage**: N/A en el motor. `Partida` sigue siendo serializable; **no cambia su forma**, así que no se sube `VERSION_PARTIDA`.

**Testing**: Vitest (determinismo con secuencia, arco, rachas, diversidad, agregados, snapshot) + simulación masiva de 10.000 carreras.

**Target Platform**: el mismo motor determinista de siempre (navegador y Node).

**Project Type**: proyecto único; el cambio vive en `src/engine/**` y `src/simulacion/**`.

**Performance Goals**: la simulación de 10.000 carreras debe seguir muy por debajo del límite actual (hoy ~1,9 s); la forma se calcula en O(años) por año y no añade estado.

**Constraints**: determinismo total; misma seed + mismas decisiones → misma carrera **incluida la secuencia de resultados**; el techo sigue oculto y no se serializa; `npm run check` MUST pasar.

**Scale/Scope**: `src/engine/{carrera,forma,coac,parametros}.ts`, `src/simulacion/**` (registro + métricas + auditoría) y sus tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Comprobación | Estado |
|---|---|---|
| **I. Motor independiente y determinista** | Todo el azar procede de `rngPara` (semilla + año + clave); cero `Math.random`/`Date.now`. La curva y la forma son funciones puras. El estado no gana campos mutables, así que sigue siendo serializable y el techo sigue sin serializarse. | ✅ |
| **II. Contenido como datos** | No se toca `src/content/**` ni el banco. | ✅ N/A |
| **III. Verificación determinista y balance por simulación** | Se añaden tests de determinismo **con la secuencia de resultados**, de forma (arco, rachas, diversidad) y un test que falla si aparece una carrera plana. El balance se calibra con `npm run simular`; MUST NOT tocarse las situaciones. | ✅ |
| **IV. Rendimiento y mobile-first** | Sin impacto en la UI; sin cambios en el bucle jugable ni en el tamaño del bundle (equivalente en el motor). | ✅ N/A |
| **V. Simplicidad y proyecto único** | Dos módulos nuevos y pequeños (`carrera.ts`, `forma.ts`), sin dependencias ni abstracciones nuevas. La forma se **deriva** de la semilla en lugar de guardarse: menos estado, no más. | ✅ |

**Resultado: sin violaciones.** No se requiere tabla de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/013-career-arc/
├── plan.md              # Este fichero
├── research.md          # Fase 0: decisiones (curva, memoria, posición, calibración, métricas)
├── data-model.md        # Fase 1: entidades y invariantes
├── quickstart.md        # Fase 1: guía de validación
├── contracts/
│   ├── motor.md         # Contrato del motor: lo que cambia y lo que MUST permanecer
│   └── verificacion.md  # Contrato de verificación: umbrales y tests
└── tasks.md             # Fase 2 (/speckit.tasks — no lo crea este comando)
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── carrera.ts            # NUEVO — curva de carrera (aptitud por año)
│   ├── forma.ts              # NUEVO — memoria AR(1) derivada de la semilla
│   ├── coac.ts               # puntuación = aptitud + forma + ruido + carisma + pico; posición por mérito
│   ├── parametros.ts         # nuevos parámetros de curva, memoria y objetivo en el techo
│   ├── index.ts              # exporta lo nuevo que necesiten los tests/simulación
│   └── __tests__/
│       ├── carrera.test.ts   # NUEVO — forma de la curva y monotía por tramos
│       ├── forma.test.ts     # NUEVO — determinismo, autocorrelación, reversion a la media
│       ├── coac.test.ts      # amplía: techo aspiracional, posición no saturada
│       ├── determinismo.test.ts  # amplía: la secuencia de resultados es reproducible
│       └── snapshot.test.ts  # actualiza la partida de referencia
└── simulacion/
    ├── tipos.ts              # RegistroCarrera gana la secuencia por año
    ├── jugar.ts              # registra la secuencia
    ├── estadisticas.ts       # NUEVAS métricas de forma
    ├── auditoria.ts          # NUEVO hallazgo: carrera plana
    ├── informe.ts            # muestra las métricas de forma
    └── __tests__/
        ├── forma-carrera.test.ts   # NUEVO — el test que falla con el comportamiento actual
        └── estadisticas.test.ts    # amplía con las métricas nuevas
scripts/simular.ts             # sin cambios de interfaz; hereda el informe ampliado
```

**Structure Decision**: proyecto único. El motor gana dos módulos puros y pequeños; la forma se **calcula**, no se almacena, para no tocar la persistencia ni la versión del estado. El simulador es el que gana capacidad de diagnóstico, porque el fallo era invisible para él.

## Complexity Tracking

> Sin violaciones constitucionales. Sección vacía intencionadamente.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
