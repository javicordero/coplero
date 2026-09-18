# Implementation Plan: Motor determinista de Coplero (ENGINE-001)

**Branch**: `N/A (no hay hook de rama; trabajo sobre main)` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-deterministic-engine/spec.md`

## Summary

Construir el núcleo TypeScript puro del juego (`src/engine/`) como una librería determinista y sin
dependencias de UI: crear partida y destino oculto, avanzar por verano/febrero, seleccionar
situaciones (con banco **inyectado**), evaluar condicionales y flags, aplicar efectos, resolver el
COAC y los premios ajenos, registrar historial y producir un resumen mínimo de carrera. Todo el azar
sale de un PRNG sembrado y el estado es JSON-serializable. La verificación se hace con Vitest en
Node; no hay UI, Astro del juego ni Svelte.

Enfoque técnico: reducer puro por funciones (`crearPartida`, `siguientePaso`, `elegir`, `resumen`,
`serializar`/`deserializar`) sobre un `GameState` plano; el banco de contenido y los parámetros
numéricos se inyectan por parámetro; los errores esperables (versión incompatible, opción inválida)
se devuelven como resultado explícito, no como excepción.

## Technical Context

**Language/Version**: TypeScript en modo `strict` (6.x) sobre Node 22+. El motor no depende de Node
ni del DOM; debe poder ejecutarse igual en el navegador.

**Primary Dependencies**: Ninguna en runtime para el núcleo. Zod vive en `content` (validación en
build), no en `engine`. `fflate` se reserva para el `codec` de URL, **fuera del alcance de esta
feature** (ver research D8).

**Storage**: N/A. Estado en memoria y serialización JSON con `version` de esquema; sin base de datos.

**Testing**: Vitest (unit) e integración de simulación en Node. Playwright/E2E no aplica a esta
feature.

**Target Platform**: Entorno JavaScript estándar (Node 22+ para tests/simulador; más tarde la isla
del navegador). Sin APIs de plataforma.

**Project Type**: Librería dentro de proyecto único (`src/engine/`), sin monorepo.

**Performance Goals**: 10.000 carreras completas sin errores en menos de 30 s en hardware de
desarrollo (provisional; ver research D11).

**Constraints**: TS puro; prohibido DOM/framework/`Math.random`/`Date.now`; determinista; estado
serializable; banco de contenido inyectado (el `engine` no importa de `content`); inmutabilidad sin
mutar el estado anterior; decisiones por año parametrizables.

**Scale/Scope**: ~14 módulos de motor; banco actual de ~27 situaciones base que crecerá a 60-80; una
partida por defecto de 20 años (provisional) con 2 decisiones por año.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Puerta (constitución) | Estado | Cómo se verifica |
|---|---|---|---|
| G1 | **I. Motor independiente y determinista**: `engine` sin imports de `web`/`content`/frameworks, sin DOM, sin `Math.random`/`Date.now` | PASS | Revisión estática de imports + test que fija la semilla y compara estados |
| G2 | **I. Reproducibilidad**: misma seed + decisiones → misma partida | PASS | Test de determinismo (FR-004, SC-001) |
| G3 | **I. Estado serializable**: sin clases, con `version` | PASS | Test de round-trip serializar/deserializar (FR-003, SC-002) |
| G4 | **II. Contenido como datos**: banco inyectado; engine no importa content | PASS | Firma de API con `banco` por parámetro + test con banco de prueba (FR-022) |
| G5 | **II. Momento y tipo**: separación verano/febrero y contenido/personaje | PASS | Tests de selección por momento/tipo (FR-005, FR-006) |
| G6 | **II. Flags persistentes**: no se borran; ventana de disparo | PASS | Tests de flags consumidas y ventanas expiradas (FR-009) |
| G7 | **III. Verificación**: tests deterministas, integridad de contenido, snapshot, simulación | PASS | Suites en `src/engine/__tests__/` (integridad sobre fixtures); la integridad del banco real llegará con la feature de content (FR de testing, SC-004) |
| G8 | **IV. Rendimiento**: motor ligero y sin dependencias de plataforma | PASS | Sin deps de runtime; presupuesto SC-004 (D11) |
| G9 | **V. Simplicidad**: proyecto único, sin nuevas capas ni paquetes | PASS | Plan crea solo ficheros de `src/engine/`; sin nuevas deps |

**Resultado**: sin violaciones; `Complexity Tracking` se deja vacío.

**Re-check post-diseño (Fase 1)**: PASS. El modelo de datos y el contrato mantienen el motor puro, con
banco inyectado, sin dependencias nuevas y con tests deterministas; no aparecen violaciones nuevas.

## Project Structure

### Documentation (this feature)

```text
specs/001-deterministic-engine/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1 (API pública del motor)
│   └── engine-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── engine/                     # TS puro — todo lo de esta feature
│   ├── index.ts                # API pública (barrel)
│   ├── types.ts                # tipos del dominio (personaje, atributos, decisión, partida, coac)
│   ├── seed.ts                 # PRNG sembrado + hash de semilla (existente, se amplía)
│   ├── partida.ts              # crearPartida, siguientePaso, elegir, resumen (reducer puro)
│   ├── destino.ts              # generación del techo oculto
│   ├── selector.ts             # elección de situación (momento × tipo, filtros)
│   ├── condicionales.ts        # requisitos, ventanas, probabilidades
│   ├── atributos.ts            # aplicación de efectos y clamps
│   ├── coac.ts                 # resolución de fase y puesto
│   ├── premios.ts              # premios ajenos al COAC
│   ├── narrativa.ts            # textos de resultado (mínimos en esta feature)
│   ├── resumen.ts              # resumen mínimo de carrera
│   ├── serializar.ts           # JSON con versión y errores explícitos
│   ├── parametros.ts           # parámetros numéricos configurables + defaults provisionales
│   └── __tests__/
│       ├── determinismo.test.ts
│       ├── pureza.test.ts       # sin imports de UI/content, sin Math.random/Date.now
│       ├── partida.test.ts
│       ├── selector.test.ts
│       ├── condicionales.test.ts
│       ├── coac.test.ts
│       ├── premios.test.ts
│       ├── serializacion.test.ts
│       ├── resumen.test.ts
│       ├── integridad.test.ts   # banco de fixtures: ids, flags y alcanzabilidad
│       ├── extension.test.ts    # añadir situación sin tocar el engine (SC-005)
│       ├── snapshot.test.ts
│       └── simulacion.test.ts   # lote de carreras (SC-004)
├── content/                    # datos (fuera de alcance salvo el banco de prueba)
│   └── schema.ts               # Zod (existente; se ampliará en su feature)
└── ...                         # web (Astro/Svelte): fuera de alcance
```

**Structure Decision**: Se mantiene la estructura de `docs/02` adaptada a los nombres ya existentes
del scaffold (`seed.ts`, `types.ts`, `schema.ts`). Toda la lógica nueva vive en `src/engine/`; no se
crean paquetes ni carpetas fuera de `src/`.

## Complexity Tracking

> Sin violaciones de la constitución; no aplica.
