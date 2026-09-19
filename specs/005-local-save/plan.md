# Implementation Plan: Persistencia local de la partida

**Branch**: `005-local-save` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-local-save/spec.md`

## Summary

Guardar la carrera en el navegador (`localStorage`, sin backend) tras cada decisión y al crearla, restaurarla al abrir la app, distinguir partida **en curso** de **terminada**, detectar y descartar guardados incompatibles o dañados con un **aviso puntual**, y degradar sin errores si el almacenamiento no está disponible (sin avisar). La capa vive en `web` (`src/juego`), envuelve al `engine` (`serializar`/`deserializar`, `VERSION_PARTIDA`, `fase === "fin"`) y nunca lo contamina con DOM.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node 22+

**Primary Dependencies**: Astro (páginas), Svelte 5 (isla en `/jugar`), `engine` puro (`serializar`/`deserializar`, `VERSION_PARTIDA`), Vitest, Playwright, Biome

**Storage**: `localStorage` del navegador (una sola ranura); sobre JSON `{ version, partida }`; sin backend ni base de datos

**Testing**: Vitest (`src/juego/__tests__/`, almacén en memoria) + smoke E2E Playwright (`tests/e2e/`); `npm run check`

**Target Platform**: Web mobile-first (4G/WhatsApp); navegadores modernos con y sin `localStorage` disponible

**Project Type**: Aplicación web (Astro estático + una isla Svelte)

**Performance Goals**: guardado síncrono imperceptible (< 1 ms típico); sobre de guardado ≈14 KB (muy por debajo del 1% del límite típico de 5 MB); 0 peticiones de red asociadas

**Constraints**: `engine` sin DOM/`Math.random()`; una única ranura; sin migración de versiones en v1; sin backend; multi-pestaña = gana la última que guarda

**Scale/Scope**: 1 partida guardada por navegador; carreras de ~20 años con hasta ~40 decisiones; módulo `persistencia.ts` (~80 líneas) + ajustes en `estado.svelte.ts`, `Intro.svelte`, `Juego.svelte`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Resultado |
|---|---|---|
| I. Motor independiente y determinista | La persistencia MUST vivir fuera del `engine`; `engine` MUST seguir sin DOM/`localStorage`; restaurar MUST reproducir la misma partida | ✅ PASS — el módulo está en `src/juego` y solo usa la API pública del `engine` (`serializar`/`deserializar`, `fase`) |
| II. Contenido como datos, no código | No MUST introducir lógica en `content` | ✅ PASS — no toca `content` |
| III. Verificación determinista y balance | Tests deterministas + `npm run check` antes de dar por válido | ✅ PASS — tests de ida/vuelta, versión incompatible, corrupción, no-disponibilidad y fin de carrera |
| IV. Rendimiento y mobile-first | Isla única; guardado sin coste de red; mobile-first intacto | ✅ PASS — sin dependencias nuevas, sin red, sin tocar el layout |
| V. Simplicidad arquitectónica y proyecto único | Sin backend, sin complejidad injustificada (YAGNI) | ✅ PASS — una ranura, sin migraciones, sin sincronización entre pestañas ni eventos de `storage` |

**Sin violaciones**: no se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/005-local-save/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   ├── persistencia.md
│   └── estado.md
├── checklists/
│   └── requirements.md  # De /speckit.specify
├── spec.md
└── tasks.md             # /speckit.tasks (no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── serializar.ts          # serializar / deserializar (ya existe)
│   └── types.ts               # Partida.version, VERSION_PARTIDA, FasePartida ("fin")
├── juego/
│   ├── persistencia.ts        # Almacen, guardar, cargar, borrar, estadoGuardado  ← núcleo de la feature
│   ├── estado.svelte.ts       # crearJuego: guarda tras decidir, restaura, aviso, empezar de cero
│   ├── Juego.svelte           # almacenNavegador() (fallback seguro), cableado de pantallas
│   ├── presentacion.ts        # textos de aviso (mensaje de guardado no restaurable)
│   ├── pantallas/
│   │   └── Intro.svelte       # "Continuar" / "Ver resultado" / "Empezar de cero" + aviso
│   └── __tests__/
│       ├── persistencia.test.ts   # ida/vuelta, versión, corrupción, sin guardado
│       └── estado.test.ts         # guardado tras decisión, restaurar, fin, reiniciar
└── pages/
    └── jugar.astro            # isla client:only (sin cambios funcionales)

tests/e2e/
└── jugar.spec.ts              # smoke: recargar conserva la partida (ampliar)
```

**Structure Decision**: Proyecto único (Principio V). La feature se concentra en `src/juego/persistencia.ts` (lógica pura y testeable con un `Almacen` inyectable) y en el estado de la isla; el `engine` solo se consume a través de su API pública y no se modifica salvo lo imprescindible.

## Complexity Tracking

> Sin violaciones de la Constitución; no procede.
