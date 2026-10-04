# Implementation Plan: Consumo de flags por condicional

**Branch**: `025-conditional-consumption` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/025-conditional-consumption/spec.md`

## Summary

Retirar el **consumo manual** de flags (`Opcion.consume` y `Condicional.consumeFlag`) y sustituirlo
por una regla **automática y por condicional**: al dispararse un condicional, el motor marca como
consumidas —**solo para ese condicional**— las flags de su requisito que estuvieran activas. El
condicional no vuelve a salir; otros condicionales que compartan la flag sí pueden. El estado de
partida cambia de forma (la marca de consumo pasa de un booleano global en la flag a una lista de
condicionales que la han consumido), por lo que se sube la **versión del estado** y las partidas
guardadas anteriores se rechazan.

Es un cambio de **motor + contenido + panel**; no toca la UI del juego ni el código compartible.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node 22+ (Astro 7, Svelte 5, Zod 4, Vitest 3, Biome 2)

**Primary Dependencies**: ninguna nueva. Se trabaja sobre el `engine` puro y el esquema Zod de
`content`.

**Storage**: el **estado de partida** es serializable y lleva `version` (`Partida.version`). El
**almacén del panel** (`content-admin/data/situaciones.json`) también lleva `version`.

**Testing**: Vitest. Se actualizan tests de `engine` (condicionales, serialización, snapshot) y de
`simulacion` (auditoría). Puerta de calidad: `npm run check` (con la excepción conocida de
`forma-carrera`, T23).

**Target Platform**: `engine` puro (sin DOM) + `content` (datos) + panel local (solo-dev).

**Project Type**: Proyecto único Astro; `engine` es TS puro.

**Performance Goals**: N/A (cambio de reglas, sin ruta caliente nueva).

**Constraints**: determinismo total (misma seed + decisiones → misma partida); el `engine` no puede
importar de `content` ni de `web`; el esquema de `content` no puede contener lógica de juego.

**Scale/Scope**: 15 condicionales y 27 situaciones en el banco; ~20 ficheros afectados entre motor,
contenido, panel, simulación, tests y docs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I. Motor independiente y determinista** | ✅ PASS. El cambio vive en `engine/` (TS puro, sin DOM, sin `Math.random`/`Date.now`); el azar sigue viniendo del RNG sembrado. |
| **II. Contenido como datos, no código** | ⚠️ **Requiere enmienda de la constitución**. El Principio II dice: *"'Consumir' una flag MUST NOT borrarla: MUST marcarla como consumida y desactivar su disparo"* (marca **global**). Esta feature redefine el consumo como **por condicional** y elimina el consumo manual. Hay que **enmendar** esa línea (MINOR) y actualizar `docs/01` §6, `docs/02` §7, `AGENTS.md` §5.7 y el registro. No es una violación del espíritu del principio (las flags siguen sin borrarse), sino una redefinición de la regla. |
| **III. Verificación determinista y balance** | ✅ PASS. Se actualizan tests deterministas y el snapshot de referencia; `npm run check` es la puerta. |
| **IV. Rendimiento y mobile-first** | ✅ PASS (no aplica al juego; el panel es solo-dev). |
| **V. Simplicidad arquitectónica** | ✅ PASS. Se **elimina** complejidad (fuera dos campos y una regla manual); no se añade estructura nueva salvo el registro por condicional, estrictamente necesario. |

**Restricciones**: stack cerrado (sin dependencias nuevas) ✅; `engine`/`content` dentro de `src/` ✅;
contradicciones al registro, no en silencio ✅ (se enmienda la constitución y se actualizan docs).

## Project Structure

### Documentation (this feature)

```text
specs/025-conditional-consumption/
├── plan.md              # Este fichero
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   └── consumo.md
└── tasks.md             # Fase 2 (/speckit.tasks, no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── engine/                       # TS puro
│   ├── types.ts                  # MODIFICADO · Flag: consumida → consumidaPor: string[]; VERSION_PARTIDA 2→3
│   ├── condicionales.ts          # MODIFICADO · requisitoCumplido(req, estado, consumidor); consumirFlagsDeRequisito(flags, req, id); actualizarFlags sin `consume`
│   ├── selector.ts               # MODIFICADO · pasa el id del condicional al evaluar el requisito
│   ├── partida.ts                # MODIFICADO · consumo automático del condicional (fuera `consumeFlag`)
│   ├── serializar.ts             # sin cambios (usa VERSION_PARTIDA)
│   └── __tests__/                # condicionales, serializacion, premios, fixtures, snapshot (regen)
├── content/
│   ├── schema.ts                 # MODIFICADO · fuera Opcion.consume y Condicional.consumeFlag
│   ├── condicionales/{verano,febrero}.ts  # GENERADOS · sin consumeFlag (re-volcado)
│   └── __tests__/                # integridad (quitar la comprobación de consume)
├── panel/
│   ├── esquema.ts                # MODIFICADO · VERSION_ALMACEN 3 + migración que quita consume/consumeFlag
│   ├── almacen.ts                # MODIFICADO · migra v2→v3 al leer
│   └── __tests__/                # esquema, almacen, crud, flags, resumen (fixtures sin consumeFlag)
├── panel-ui/
│   ├── FormularioOpcion.svelte   # MODIFICADO · fuera el selector `consume`
│   ├── FormularioCondicional.svelte # MODIFICADO · fuera la casilla `consumeFlag`
│   └── DetalleCondicional.svelte # MODIFICADO · fuera la fila `consumeFlag`
├── pages/api/panel/**            # sin cambios (leen/escriben el almacén)
├── simulacion/
│   ├── tipos.ts                  # MODIFICADO · DecisionRegistrada sin `consume`
│   ├── jugar.ts                  # MODIFICADO · deja de registrar `consume`
│   └── auditoria.ts              # MODIFICADO · regla `flagConsumidaSinRegistro` sobre consumidaPor
└── content-admin/data/situaciones.json  # MIGRADO · sin consumeFlag (v3)

docs/                              # 01 §6, 02 §7, AGENTS.md §5.7, registro
.specify/memory/constitution.md    # ENMIENDA (Principio II, línea de consumo)
```

**Structure Decision**: proyecto único existente. El cambio respeta las capas: `engine` no importa de
`content`; el esquema de `content` sigue siendo datos validados con Zod; el panel reutiliza el esquema
del juego. No se introducen módulos nuevos en `engine` salvo cambios de firma en `condicionales.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Enmienda del Principio II (semántica de "consumir") | La constitución describe el consumo como marca **global**; la feature lo redefine como **por condicional** y retira el consumo manual. | Mantener la regla global impediría que dos condicionales compartan una flag (justo lo que se quiere evitar). No cumplirla en silencio está prohibido por la gobernanza. |
| Subida de `VERSION_PARTIDA` (2→3) | La forma de `Flag` cambia (booleano → lista de condicionales). | Mantener la versión haría que partidas guardadas con la forma antigua se interpretaran mal. Se rechaza explícitamente (sin migración). |

## Phase 0: Research — ver `research.md`

Decisiones resueltas (sin `NEEDS CLARIFICATION`): forma de `Flag`, firma de `requisitoCumplido` con
consumidor, regla de consumo al disparar, retirada de campos, versión del estado y migración del
almacén, y adaptación de la auditoría.
