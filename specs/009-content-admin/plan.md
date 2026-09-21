# Implementation Plan: Panel local de situaciones y volcado al juego

**Branch**: `009-content-admin` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-content-admin/spec.md`

## Summary

Herramienta **local** de un solo usuario (el diseñador) para ver, crear, editar y eliminar
situaciones, más un **volcado** que regenera el contenido del juego a partir de un almacén JSON
que pasa a ser la **fuente de verdad**.

Enfoque técnico: se reutiliza el proyecto Astro existente (sin monorepo ni dependencias nuevas).
El panel es una **ruta on-demand solo de desarrollo** (`prerender = false` + guard
`import.meta.env.DEV`) que sirve una **isla Svelte 5** en `/panel` y una **API JSON también
solo-dev**; el almacén es un fichero versionado (`content-admin/data/situaciones.json`) leído y
escrito con `node:fs` de forma atómica y con copia de seguridad. El **volcado**
(`npm run panel:volcar`) y la **importación** (`npm run panel:importar`) son scripts `tsx` que
reutilizan los mismos módulos y los **esquemas Zod de `src/content/schema.ts`** (nada de reglas
duplicadas). En producción todas las rutas del panel responden **404**.

## Technical Context

**Language/Version**: TypeScript 6 (strict), Node 22+.

**Primary Dependencies**: Astro 7, Svelte 5 (isla del panel), Zod 4 (validación), `tsx` (scripts).
Sin dependencias nuevas (`json-server` descartado en el spec).

**Storage**: fichero JSON local versionado `content-admin/data/situaciones.json` (fuente de
verdad). Copias de seguridad en `content-admin/data/backups/` (ignoradas en git). Sin base de datos.

**Testing**: Vitest (unitario de los módulos de almacén/generador/importador y guard) + los tests
existentes del content. Sin Playwright para el panel (no se justifica E2E en una herramienta local).

**Target Platform**: máquina local del diseñador (`astro dev`). En producción el panel **no es
accesible** (404), aunque el build lo compile.

**Project Type**: proyecto único Astro (web) con isla Svelte.

**Performance Goals**: ninguno de cara al jugador (el panel no aporta kB a la app pública). El panel
debe abrir con el banco completo en < 1 s en local.

**Constraints**: solo local; sin BD ni servicios externos; reutilizar Zod; salida del volcado
**determinista** e idempotente; los ficheros generados deben pasar Biome sin cambios.

**Scale/Scope**: banco actual de ~27 situaciones (ampliable a unos cientos); un solo usuario; 4
ficheros de contenido generados (`decisiones/{verano,febrero}/{contenido,personaje}.ts`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I · Motor independiente y determinista** | ✅ El panel es «web» y no toca `engine` ni introduce azar/tiempo. No importa nada hacia `engine`. |
| **II · Contenido como datos, no código** | ✅ El JSON es datos y el contenido generado sigue siendo objetos de datos `.ts` validados con Zod en build. Se **reutiliza** `Schema.ts`; no se crea un modelo paralelo. |
| **III · Verificación determinista y balance** | ✅ Se añaden tests: round-trip sin pérdida, determinismo/idempotencia, rechazo de inválidos, guard 404. No cambia el motor → no recalibra simulación. |
| **IV · Rendimiento y mobile-first** | ✅ No afecta a la app pública: el panel es solo-dev y responde 404 en producción, así que no suma kB al jugador. La isla del panel **no forma parte del bucle jugable** (que sigue siendo una única isla en `/jugar`). |
| **V · Simplicidad arquitectónica y proyecto único** | ✅ Proyecto único, sin monorepo ni dependencias nuevas, sin BD. Guard de desarrollo + `node:fs` en lugar de un servicio aparte. |

**Resultado**: sin violaciones. No se necesita **Complexity Tracking**.

*Re-check post-diseño (Phase 1)*: se mantiene. Los contratos (almacén JSON, API dev-only, volcado,
importación) no añaden dependencias ni capas nuevas; el diseño no toca `engine` ni `content` más
allá de generar ficheros que ya cumplen el esquema vigente.

## Project Structure

### Documentation (this feature)

```text
specs/009-content-admin/
├── plan.md              # Este fichero
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   ├── almacen.md
│   ├── panel.md
│   ├── generador.md
│   └── importador.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
content-admin/
└── data/
    ├── situaciones.json        # almacén local (fuente de verdad, versionado)
    ├── .gitkeep
    └── backups/                # copias automáticas (ignoradas en git)

src/
├── panel/                      # lógica SOLO servidor (node:fs) — nunca importar desde el cliente
│   ├── guard.ts                # esDesarrollo() / respuesta404()
│   ├── almacen.ts              # leer/escribir/backup atómico del JSON
│   ├── esquema.ts              # esquema Zod del almacén (reutiliza SituacionSchema)
│   ├── generador.ts            # situaciones → ficheros .ts (puro + escritura)
│   ├── importador.ts           # banco .ts actual → almacén
│   └── __tests__/
│       ├── almacen.test.ts
│       ├── generador.test.ts     # round-trip + idempotencia
│       └── guard.test.ts
├── panel-ui/                   # isla Svelte 5 del panel (solo tipos desde src/panel)
│   ├── Panel.svelte
│   ├── TablasCategorias.svelte
│   ├── FormularioSituacion.svelte
│   ├── FormularioOpcion.svelte
│   └── DetalleSituacion.svelte
├── pages/
│   ├── panel.astro             # dev-only, prerender=false → <Panel client:load />
│   └── api/panel/
│       ├── situaciones.ts      # GET lista · POST crea
│       ├── situaciones/[id].ts # PUT actualiza · DELETE elimina
│       └── importar.ts         # POST ejecuta la importación
├── content/                    # (sin cambios, salvo los ficheros generados)
│   ├── decisiones/verano/{contenido,personaje}.ts   # GENERADOS por el volcado
│   └── decisiones/febrero/{contenido,personaje}.ts  # GENERADOS por el volcado
└── ...

scripts/
├── panel-importar.ts           # tsx → src/panel/importador
└── panel-volcar.ts             # tsx → src/panel/generador
```

**Structure Decision**: proyecto único (constitución, principio V). `src/panel/` concentra la lógica
de servidor (depende de `node:fs`, por lo que **nunca** se importa desde el bundle cliente);
`src/panel-ui/` contiene solo la isla Svelte, que habla por HTTP con los endpoints. Los cuatro
ficheros `src/content/decisiones/**` pasan a estar **generados**; el volcado no toca
`condicionales/**`, `textos/**` ni `variantes.ts`.

## Complexity Tracking

> Sin violaciones a la constitución: la tabla queda vacía a propósito.
