# Implementation Plan: Mejoras de usabilidad del formulario de situaciones

**Branch**: `024-form-ux-improvements` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/024-form-ux-improvements/spec.md`

## Summary

Mejorar la experiencia de edición del panel local de contenido (`/panel`, solo desarrollo) y ampliar
su cobertura. En concreto: (1) **derivar el identificador** de situaciones, condicionales y opciones a
partir del título (editable, con desambiguación automática ante colisión); (2) invertir el control de
repetición a una casilla **"repetible" desmarcada por defecto** (solo etiqueta de interfaz: el dato
subyacente no cambia); (3) sustituir los campos de texto libre de flags (`flags` y `consume`) por
**selectores múltiples** alimentados por el catálogo de flags declaradas del banco (el de `flags`
permite además crear una flag nueva); y (4) **editar también los condicionales** desde el panel, con
sus campos propios.

El cambio es **solo de panel**: no altera el modelo validado de `content` ni el comportamiento del
`engine`. La extensión a condicionales obliga a que el **almacén del panel deje de ser solo de
situaciones** y pase a gestionar el banco completo (situaciones + condicionales), y a que el
**generador** vuelque también `src/content/condicionales/**`.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node 22+ (Astro 7, Svelte 5, Zod 4, Vitest 3, Biome 2)

**Primary Dependencies**: Astro + isla Svelte 5; Zod (validación); `node:fs` (almacén, solo servidor);
Vitest (tests). Sin dependencias nuevas.

**Storage**: Fichero JSON local `content-admin/data/situaciones.json` (almacén del panel, versionado
en git, con copias en `content-admin/data/backups/`). No hay base de datos.

**Testing**: Vitest (`src/panel/__tests__/`, `src/content/__tests__/`). Playwright no aplica (panel
solo-dev, sin cobertura e2e del panel). Puerta de calidad: `npm run check`.

**Target Platform**: Entorno local de desarrollo del diseñador (navegador + Astro dev server). El
panel responde 404 fuera de desarrollo (`import.meta.env.DEV`).

**Project Type**: Proyecto único Astro; el panel es una isla Svelte con endpoints de servidor on-demand.

**Performance Goals**: N/A (herramienta local mono-usuario). El banco (~30-40 elementos) cabe holgado
en una sola carga; no hacen falta paginación ni streaming.

**Constraints**: El panel es **solo de desarrollo** (no se construye en el deploy). La UI no puede
importar módulos con `node:fs`. Reutiliza los esquemas Zod del juego: nada de reglas duplicadas. Los
identificadores de situación/opción son **inmutables al editar** entidades ya guardadas. Mantener
`npm run check` en verde (con la excepción ya acordada de `forma-carrera`, T23, ajena a esta feature).

**Scale/Scope**: Panel mono-usuario. Entidades afectadas: `Situacion` (18+9), `Condicional` (7+4) y
sus opciones. UI: `Panel.svelte`, `FormularioSituacion.svelte`, `FormularioOpcion.svelte`,
`DetalleSituacion.svelte`, `TablasMomentos.svelte` + componentes nuevos para condicionales y
selector de flags.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I. Motor independiente y determinista** | ✅ PASS. No se toca `src/engine/`; el panel no importa el motor para nada nuevo. La derivación de ids es una función pura de presentación. |
| **II. Contenido como datos, no código** | ✅ PASS. No se cambia el esquema de `content`; el panel sigue produciendo datos validados con Zod. La casilla "repetible" es solo UI. |
| **III. Verificación determinista y balance** | ✅ PASS. Se añaden tests unitarios de panel (Vitest). El balance del motor no se altera; no se recalibra nada. |
| **IV. Rendimiento y mobile-first** | ✅ PASS (matiz). El panel es solo-dev y mono-usuario; **no** entra en el bundle del juego ni en el HTML estático de producción, por lo que su peso es irrelevante. El juego (`/jugar`) no se toca. |
| **V. Simplicidad arquitectónica** | ⚠️ **Requiere justificación**: ampliar el almacén del panel de "solo situaciones" a "banco completo (situaciones + condicionales)" es la desviación que registra Complexity Tracking. Es necesaria para cumplir FR-017/FR-018 (Q4) sin duplicar esquemas. Alternativa más simple (un segundo almacén aparte) se rechaza por duplicar la maquinaria de validación, backup y volcado. |

**Restricciones adicionales de la constitución**:
- Stack cerrado → sin dependencias nuevas. ✅
- `engine`/`content` dentro de `src/` → se mantiene. ✅
- Contradicciones al registro, no resueltas en silencio → el cambio de alcance del panel se registra
  en `docs/registro/decisiones-cerradas.md` y se actualizan `specs/009-content-admin/` y `docs/02` §11.
- Commits convencionales, sin commitear sin petición. ✅ (no se commitea en esta fase).

## Project Structure

### Documentation (this feature)

```text
specs/024-form-ux-improvements/
├── plan.md              # Este fichero
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   ├── identificadores.md
│   ├── almacen.md
│   ├── generador.md
│   └── ui-panel.md
└── tasks.md             # Fase 2 (/speckit.tasks, no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── panel/                        # lógica de servidor del panel (node:fs)
│   ├── identificadores.ts        # NUEVO · slug determinista + desambiguación (puro)
│   ├── esquema.ts                # MODIFICADO · Almacen con situaciones + condicionales
│   ├── almacen.ts                # MODIFICADO · leer/escribir el banco completo
│   ├── crud.ts                   # MODIFICADO · CRUD también de condicionales
│   ├── resumen.ts                # MODIFICADO · agrupar situaciones y condicionales
│   ├── generador.ts              # MODIFICADO · volcar también condicionales
│   ├── importador.ts             # MODIFICADO · importar situaciones + condicionales
│   ├── flags.ts                  # NUEVO · catálogo de flags declaradas (puro, reutiliza informe)
│   ├── guard.ts                  # sin cambios
│   └── __tests__/                # tests unitarios (ampliados)
│       ├── identificadores.test.ts   # NUEVO
│       ├── flags.test.ts             # NUEVO
│       ├── esquema.test.ts           # NUEVO
│       └── … (crud/generador/importador/almacen actualizados)
├── panel-ui/                     # isla Svelte (solo-dev)
│   ├── Panel.svelte              # MODIFICADO · pestañas situaciones/condicionales, carga flags
│   ├── FormularioSituacion.svelte# MODIFICADO · id derivado, casilla repetible
│   ├── FormularioOpcion.svelte   # MODIFICADO · id derivado + multiselect flags/consume
│   ├── SelectorFlags.svelte      # NUEVO · multiselect reutilizable
│   ├── FormularioCondicional.svelte # NUEVO · campos propios del condicional
│   ├── DetalleCondicional.svelte # NUEVO · vista de solo lectura (o reutilizar DetalleSituacion)
│   └── TablasMomentos.svelte     # MODIFICADO · etiqueta situación/condicional
├── pages/
│   ├── panel.astro               # sin cambios
│   └── api/panel/
│       ├── situaciones.ts        # sin cambios (o añade flags en GET)
│       ├── situaciones/[id].ts   # sin cambios
│       ├── condicionales.ts      # NUEVO (GET/POST)
│       ├── condicionales/[id].ts # NUEVO (PUT/DELETE)
│       ├── flags.ts              # NUEVO (GET catálogo de flags) — o incluido en GET situaciones
│       └── importar.ts           # MODIFICADO · importa el banco completo
└── content/                      # sin cambios de esquema; solo se regeneran datos al volcar
    ├── decisiones/{verano,febrero}.ts   # generados (sin cambios de formato)
    └── condicionales/{verano,febrero}.ts# GENERADOS también por el volcado (hoy a mano)
```

**Structure Decision**: Proyecto único existente. Se respeta la regla de dependencias: `panel` (node)
nunca se importa desde el cliente; la isla `panel-ui` importa solo módulos **puros** (`identificadores`,
`flags`, `resumen`, `esquema` sin runtime de fs). La derivación de ids y el catálogo de flags viven en
módulos puros para poder usarse tanto en servidor como en la isla.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| El almacén del panel pasa de `situaciones` a `situaciones + condicionales` (sube `VERSION_ALMACEN`) | FR-017/FR-018 exigen editar condicionales (decisión Q4); el volcado debe regenerar `condicionales/**` de forma determinista como ya hace con `decisiones/**`. | Un segundo almacén (`condicionales.json`) y una segunda tubería de CRUD/volcado duplicaría el esquema Zod, las copias de seguridad y la validación cruzada del banco. Un único almacén refleja que situaciones y condicionales son el mismo banco. |

## Phase 0: Research — ver `research.md`

Decisiones resueltas (sin NEEDS CLARIFICATION residuales): algoritmo de slug, política de
desambiguación, forma de exponer el catálogo de flags, y encaje de condicionales en almacén/volcado.
