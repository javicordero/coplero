# Implementation Plan: Versión mínima jugable (/jugar)

**Branch**: `004-playable-ui` | **Date**: 2026-09-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-playable-ui/spec.md`

## Summary

Primera UI jugable de Coplero: una **única isla Svelte 5** en `/jugar` que presenta el estado del motor y le envía las acciones del jugador, sin lógica de juego. Recorre el flujo completo (intro → personaje → modalidad → variante → años de decisiones → resultado → fin) con pantallas deliberadamente sencillas, persistencia local y determinismo por semilla. Queda fuera todo lo de producto (compartir, OG, analítica, monetización, sonido, logros, diseño final).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Svelte 5 (runes), Astro 7 (isla), Node 22+

**Primary Dependencies**: `@astrojs/svelte` y Svelte 5 (ya instalados); `engine` y `content` existentes. Sin dependencias nuevas.

**Storage**: `localStorage` en el cliente, con versión de esquema; el guardado usa `serializar`/`deserializar` del motor.

**Testing**: Vitest (lógica de estado, persistencia y presentación, con almacenamiento inyectado), Playwright (smoke E2E de una carrera completa).

**Target Platform**: navegadores móviles modernos (caso real: enlace abierto desde WhatsApp en 4G); salida estática en Netlify con la isla hidratada.

**Project Type**: proyecto único (Astro + isla Svelte), sin monorepo.

**Performance Goals**: landing y páginas no interactivas con 0 kB de JS; una sola isla en `/jugar`; sin cargas entre pantallas (el banco viaja en el bundle).

**Constraints**: la UI NO contiene lógica de juego; mobile-first real con ancho máximo 420-480 px; sin compartir, OG, analítica, monetización, sonido, logros, animaciones complejas ni diseño final.

**Scale/Scope**: ~8 pantallas; una carrera (~20 años, ~40 decisiones) jugable de principio a fin.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Evidencia |
|---|---|---|
| I. Motor independiente y determinista | ✅ PASS | La isla solo llama a la API del motor (`crearPartida`, `siguientePaso`, `elegir`, `continuar`, `resumen`); no reimplementa reglas ni usa azar propio (la semilla se genera una vez y se inyecta). |
| II. Contenido como datos, no código | ✅ PASS | El catálogo de variantes (títulos/subtítulos) se añade como **datos** en `src/content`, no en la UI. |
| III. Verificación determinista y balance | ✅ PASS | Tests de estado/persistencia en Vitest; smoke E2E de una carrera completa. Los cambios de motor/content no aplican aquí. |
| IV. Rendimiento y mobile-first | ✅ PASS | Landing estática sin isla; una sola isla en `/jugar`; layout con ancho máximo 420-480 px. |
| V. Simplicidad arquitectónica | ✅ PASS | Sin capas ni paquetes nuevos; estado como fábrica (sin stores globales). |

Sin violaciones. No se requiere *Complexity Tracking*.

## Project Structure

### Documentation (this feature)

```text
specs/004-playable-ui/
├── plan.md              # Este fichero
├── research.md          # Fase 0: decisiones de diseño
├── data-model.md        # Fase 1: entidades y máquina de estados de pantallas
├── quickstart.md        # Fase 1: guía de validación
├── contracts/
│   ├── pantallas.md     # Contrato de pantallas y transiciones
│   └── estado.md        # Contrato del módulo de estado y del guardado
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── pages/
│   ├── index.astro                 # landing estática (sin isla; se retira GameIsland)
│   └── jugar.astro                 # shell estático + <Juego client:load />
├── layouts/
│   └── Layout.astro                # ya existe
├── components/
│   └── GameIsland.svelte           # se elimina (era un ejemplo del scaffold)
├── juego/
│   ├── Juego.svelte                # isla raíz: monta el estado y enruta por pantalla
│   ├── estado.svelte.ts            # estado reactivo (runes) que envuelve el engine
│   ├── persistencia.ts             # localStorage + versión de esquema (almacén inyectable)
│   ├── presentacion.ts             # etiquetas/títulos (fase, momento, tipo, premios, género)
│   ├── pantallas/
│   │   ├── Intro.svelte
│   │   ├── CrearPersonaje.svelte
│   │   ├── ElegirModalidad.svelte
│   │   ├── ElegirVariante.svelte
│   │   ├── Decision.svelte
│   │   ├── Resultado.svelte
│   │   ├── FinCarrera.svelte
│   │   └── Error.svelte
│   └── __tests__/
│       ├── estado.test.ts
│       ├── persistencia.test.ts
│       └── presentacion.test.ts
├── content/
│   └── variantes.ts                # ⭐ DATOS: variantes por modalidad (título y subtítulo)
└── simulacion/ · engine/           # sin cambios

tests/e2e/
└── jugar.spec.ts                   # smoke: una carrera completa en /jugar
```

**Structure Decision**: se mantiene el proyecto único. La isla vive en `src/juego/` (pantallas + estado), el shell estático en `src/pages/jugar.astro`, y los datos de variantes en `src/content/` (son datos, no UI). Se elimina el ejemplo `GameIsland.svelte` y la landing deja de montar una isla, cumpliendo "0 kB de JS" fuera de `/jugar`.

## Complexity Tracking

> No hay violaciones constitucionales que justificar.
