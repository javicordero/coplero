# Implementation Plan: Textos de situación adaptados al género del personaje

**Branch**: `028-gender-text-variants` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/028-gender-text-variants/spec.md`

## Summary

Añadir **variantes femeninas opcionales** a los textos visibles de una decisión (título y texto de la
situación; título y subtítulo de cada opción) y **resolver en el motor** qué texto mostrar según el
género del personaje:

- **Femenino** + variante escrita → femenino; si no hay variante → forma por defecto.
- **Masculino** → siempre forma por defecto.
- **No binario** → elección por **azar determinista sembrado**, **por cada campo de texto de forma
  independiente** (puede mezclar formas dentro de una misma decisión).

El contenido se edita desde el **panel** (los cuatro campos femeninos) y se exporta al juego sin tocar
código. La **UI del juego no cambia**: el motor entrega `SituacionPublica` con el texto ya resuelto
(FR-008).

## Technical Context

**Language/Version**: TypeScript 5.x + Svelte 5 (runes) sobre Astro 7; Zod para validar contenido.

**Primary Dependencies**: ninguna nueva. Se reutilizan el RNG sembrado (`rngPara`) y los esquemas Zod.

**Storage**: almacén del panel `content-admin/data/situaciones.json` (JSON local, solo-dev). Los campos
nuevos son opcionales: **no sube `VERSION_ALMACEN`**. La partida compartible (códec) **no cambia**:
el texto resuelto no se serializa, solo se calcula al construir el paso; **no sube `VERSION_PARTIDA`**.

**Testing**: Vitest (unitarios de motor, contenido y panel) + `npm run check` (Astro check + Biome +
tests). Snapshot de la partida de referencia (personaje **masculino**) debe permanecer intacto.

**Target Platform**: juego web mobile-first (isla Svelte en `/jugar`); panel solo-dev. El motor es TS
puro, sin DOM.

**Project Type**: proyecto único Astro (sin monorepo). `engine` / `content` / `web` en `src/`.

**Performance Goals**: N/A. La resolución es un intercambio de cadenas al construir el paso; coste
despreciable y sin carga adicional en el bundle del juego.

**Constraints**: motor **puro y determinista** (sin `Math.random`/`Date.now`; azar solo de `rngPara`),
`content` como datos validados, **la UI no contiene lógica de juego**, **sin dependencias nuevas**,
contenido sin variantes femeninas válido y sin regresión.

**Scale/Scope**: 4 campos femeninos opcionales por entidad (2 en situación, 2 en opción); banco de
60-80 situaciones a futuro. Se tocan ~2 módulos de motor + esquema de contenido + 4 componentes del
panel + tests + documentación. El juego no se toca.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I. Motor independiente y determinista** | ✅ PASS. La resolución vive en el `engine`, es pura y usa **RNG sembrado** (`rngPara`), sin `Math.random`/`Date.now`. El azar no binario se deriva de un **stream propio** (`"genero"`), así que no altera las secuencias existentes. No añade estado serializado (sin subir `VERSION_PARTIDA`). |
| **II. Contenido como datos, no código** | ✅ PASS. Son **campos de datos opcionales** validados con Zod; no hay lógica de juego en `content`. Las situaciones siguen filtrándose por `momento`/`modalidades`/`variantes`. |
| **III. Verificación determinista y balance** | ✅ PASS. Tests deterministas nuevos (`genero.test.ts`), se mantiene integridad del contenido y snapshot; el balance no se toca (no cambian situaciones ni pesos). `npm run check` debe pasar. |
| **IV. Rendimiento y mobile-first** | ✅ PASS. El juego (`/jugar`) **no cambia** y no gana JS: la isla sigue igual. El panel es solo-dev. |
| **V. Simplicidad arquitectónica** | ✅ PASS. Sin dependencias nuevas ni nuevas capas: campos opcionales + un módulo de resolución puro. |

**Restricciones**: stack cerrado ✅; sin contradicciones nuevas; actualización de la documentación
fuente (`docs/01`, `docs/02`) y del registro ✅.

## Project Structure

### Documentation (this feature)

```text
specs/028-gender-text-variants/
├── plan.md              # Este fichero
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── genero-textos.md # Contrato de campos + reglas de resolución + API
└── tasks.md             # Fase 2 (/speckit.tasks, no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/content/
├── schema.ts                     # MODIFICADO · campos femeninos opcionales en Situacion y Opcion
└── decisiones/{verano,febrero}.ts # (OPCIONAL) añadir variantes femeninas de ejemplo vía panel

src/engine/
├── types.ts                      # MODIFICADO · campos femeninos en Situacion y Opcion
├── genero.ts                     # NUEVO · resolución pura de texto según género
├── selector.ts                   # MODIFICADO · toPublica(s, contextoGenero?)
├── partida.ts                    # MODIFICADO · construye el contexto (seed + id + campo)
└── index.ts                      # MODIFICADO · exporta resolverTexto / tipos de género

src/panel-ui/
├── FormularioSituacion.svelte    # MODIFICADO · sección "Variante femenina"
├── FormularioCondicional.svelte  # MODIFICADO · sección "Variante femenina"
├── FormularioOpcion.svelte       # MODIFICADO · sección "Variante femenina"
└── DetalleSituacion.svelte       # MODIFICADO · muestra las variantes femeninas si existen

src/engine/__tests__/genero.test.ts     # NUEVO · reglas de resolución + determinismo no binario
src/engine/__tests__/selector.test.ts   # MODIFICADO · toPublica con contexto
src/content/__tests__/integridad.test.ts# MODIFICADO · acepta los campos opcionales
src/panel/__tests__/generador.test.ts   # MODIFICADO · round-trip (rellenos incluidos, vacíos omitidos)

docs/01-diseno-juego.md           # MODIFICADO · nota de variantes de texto por género
docs/02-arquitectura-tecnica.md   # MODIFICADO · interfaces Opcion/Situacion
AGENTS.md                         # MODIFICADO · reglas de contenido (§5, §12) y referencia de plan
```

> El juego (`src/juego/**`, `src/pages/jugar.astro`, la isla y la tarjeta) **no se modifica**.

**Structure Decision**: se mantiene el proyecto único existente. La resolución se concentra en un
módulo puro del motor (`src/engine/genero.ts`) consumido por `toPublica`; el contenido solo declara
campos opcionales; el panel los edita y el generador ya omite `undefined`. Esto respeta la separación
`engine`/`content`/`web` sin nuevas capas ni dependencias.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Ninguna | — | — |

## Phase 0: Research — ver `research.md`

Decisiones resueltas (sin `NEEDS CLARIFICATION`): forma y nombres de los campos, semántica de
resolución, clave de azar del no binario, ubicación de la resolución (motor), normalización de vacíos,
persistencia/versionado y alcance del contenido.

## Phase 1: Design & Contracts

- `data-model.md` — campos, reglas de validación y tabla de resolución; clave de determinismo.
- `contracts/genero-textos.md` — contrato de contenido, API del motor y comportamiento del panel.
- `quickstart.md` — validación manual guiada.

## Post-design Constitution re-check

Tras el diseño, los cinco principios siguen en ✅. No hay violaciones que justificar. El diseño no
introduce estado serializado nuevo, no añade dependencias y no toca la presentación del juego.
