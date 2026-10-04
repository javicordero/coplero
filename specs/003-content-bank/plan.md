# Implementation Plan: Banco de contenido real (importación del banco documentado)

**Branch**: `003-content-bank` | **Date**: 2026-09-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-content-bank/spec.md`

## Summary

Convertir el banco de situaciones descrito en `docs/03-banco-verano.md` y `docs/04-banco-febrero.md` en **datos** dentro de `src/content`, validados con Zod en build time, más los tests de integridad correspondientes y un informe de contenido. El banco resultante es compatible (estructuralmente) con `BancoContenido` del motor **sin que `content` importe del motor**. Además, se conecta la simulación masiva (T17) al banco real y se retira el banco de pruebas como fuente.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 22+

**Primary Dependencies**: Zod (validación de contenido), Vitest (tests), Biome (lint/format), `tsx` (ejecución de scripts). Sin dependencias nuevas.

**Storage**: N/A. El contenido son ficheros `.ts` versionados en el repositorio; se resuelve en build time.

**Testing**: Vitest. Tests de integridad y compatibilidad en `src/content/__tests__/`.

**Target Platform**: Repositorio único Astro (salida estática en Netlify) + motor TS puro + scripts Node.

**Project Type**: Proyecto único (single project), sin monorepo.

**Performance Goals**: Validación del contenido en build time (< 100 ms para el banco actual); sin impacto en el bundle del jugador (el contenido se importa en build time).

**Constraints**: `content` MUST NOT importar de `engine` ni de `web`; ids únicos; flags referenciadas existentes; sin situaciones inventadas; sin nombres reales.

**Scale/Scope**: 27 situaciones base documentadas (18 verano + 9 febrero), 11 condicionales (7 verano + 4 febrero) y 1 situación de 3 opciones. El banco crecerá a 60-80; el diseño debe soportarlo sin cambios de motor. Desde 2026-10-04 no hay `tipo` ni `categoria`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Evidencia |
|---|---|---|
| I. Motor independiente y determinista | ✅ PASS | El feature no toca el motor ni introduce azar/tiempo. El motor sigue sin importar `content`. |
| II. Contenido como datos, no código | ✅ PASS | Objetos declarativos validados con Zod; `momento` obligatorio; flags que no se borran; `saltaCOAC` en las opciones que no concursan; sin nombres reales. |
| III. Verificación determinista y balance | ✅ PASS | Tests de integridad (ids, momento, flags, cobertura) + simulación sobre el banco real. Los valores de efecto se copian de la doc; recalibrar es T13 y queda fuera. |
| IV. Rendimiento y mobile-first | ✅ PASS (N/A) | No hay UI en este feature; no añade JS al jugador. |
| V. Simplicidad y proyecto único | ✅ PASS | Sin capas nuevas ni paquetes; el contenido vive en `src/content` y su forma se verifica con un test de compatibilidad estructural. |

Sin violaciones. No se requiere *Complexity Tracking*.

## Project Structure

### Documentation (this feature)

```text
specs/003-content-bank/
├── plan.md              # Este fichero
├── research.md          # Fase 0: decisiones de diseño
├── data-model.md        # Fase 1: entidades y reglas
├── quickstart.md        # Fase 1: guía de validación
├── contracts/
│   ├── contenido.md     # Contrato de datos del banco
│   ├── integridad.md    # Reglas de integridad e informe
│   └── simulador.md     # Integración simulador ↔ banco real (T17)
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks, no creado aquí)
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── schema.ts                    # Zod: Opcion, Situacion, Condicional, Requisito, Banco, enums
│   ├── modalidades.ts               # Modalidades y variantes válidas
│   ├── decisiones/
│   │   ├── verano/
│   │   │   ├── contenido.ts         # Situaciones de contenido de verano
│   │   │   └── personaje.ts         # Situaciones de personaje de verano
│   │   └── febrero/
│   │       ├── contenido.ts
│   │       └── personaje.ts
│   ├── condicionales/
│   │   ├── verano.ts
│   │   └── febrero.ts
│   ├── index.ts                     # Banco ensamblado + parseo Zod (bancoContenido)
│   ├── informe.ts                   # Cálculos estáticos del informe (recuentos, flags, alcanzabilidad)
│   └── __tests__/
│       ├── integridad.test.ts       # Reglas de integridad del banco real
│       ├── integridad-negativos.test.ts  # Cada regla falla ante contenido inválido
│       ├── alcanzabilidad.test.ts   # Ninguna situación inalcanzable
│       ├── imports.test.ts          # content no importa de engine/web
│       ├── carrera.test.ts          # Carrera completa con el banco real
│       ├── informe.test.ts          # Recuentos del informe
│       └── compatibilidad.test.ts   # El banco satisface BancoContenido del motor
├── engine/                          # Sin cambios
└── simulacion/                      # Sin cambios (el banco se le inyecta)

scripts/
├── simular.ts                       # Pasa a usar el banco real (retira T17)
└── informe-contenido.ts             # Informe de integridad (recuentos y flags)

package.json                         # Nuevo script de informe de contenido
```

**Structure Decision**: Proyecto único existente. El contenido se organiza por **momento** en ficheros `.ts` bajo `src/content/`, se ensambla y valida en `src/content/index.ts`, y se expone como `bancoContenido: BancoContenido`. El motor no cambia: `web` y `scripts/` serán quienes importen `content` y lo inyecten. Se separa `schema.ts`/`modalidades.ts` de los datos para que añadir situaciones no toque el esquema ni el motor.

## Complexity Tracking

> No hay violaciones constitucionales que justificar.
