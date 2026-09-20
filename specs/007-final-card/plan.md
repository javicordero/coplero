# Implementation Plan: Tarjeta final de carrera y compartir

**Branch**: `007-final-card` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-final-card/spec.md`

## Summary

Convertir el fin de carrera en una **TarjetaFinal** generada por el motor (pura, determinista y serializable) y presentarla como una **tarjeta-póster** inspirada en la referencia externa (identidad, datos destacados, fila de trayectoria, premios y pie con marca de agua), **sin número héroe**. La tarjeta se comparte con: **código autocontenido en la URL** (base64url + `fflate`, sin `seed` ni datos ocultos), **página de resultado** SSR a partir del código, **imágenes PNG 9:16 / 1:1 y previsualización social** (`satori` + `resvg-js` en endpoint on-demand) y **acciones de compartir** (nativo, copiar texto/enlace, descargar imagen, enlace), con opción de **ocultar el nombre**. Los textos de hitos y frase de cierre viven como **contenido inyectado**; el motor sigue sin importar `content`.

## Technical Context

**Language/Version**: TypeScript 5.x/6.x (strict), Node 22+

**Primary Dependencies**: Astro (`@astrojs/netlify`), Svelte 5 (isla `/jugar`), `fflate` (código), `satori` + `@resvg/resvg-js` (imágenes OG/PNG), `engine` puro, Zod (contenido), Vitest, Playwright, Biome

**Storage**: sin base de datos. El código viaja en la URL (base64url comprimido). `localStorage` (005) no cambia; `VERSION_PARTIDA` sigue en **2** (la tarjeta no altera la forma de `Partida`)

**Testing**: Vitest (`src/engine/__tests__/`, `src/content/__tests__/`, `src/juego/__tests__/`) + simulación masiva (`npm run simular`) + E2E Playwright con auditoría de accesibilidad; `npm run check`

**Target Platform**: Web mobile-first (4G/WhatsApp); navegadores modernos con Web Share; rutas on-demand en Netlify

**Project Type**: Aplicación web (Astro estático + una isla Svelte). Proyecto único, sin monorepo

**Performance Goals**: la tarjeta dentro del bucle es render local sin red; `/r/:codigo` se sirve como HTML con 0 kB de JS; las imágenes se generan on-demand y se cachean; el código de una carrera completa < 2000 caracteres (SC-008)

**Constraints**: `engine` sin DOM, sin `Math.random()`/`Date.now()`, sin importar `content`/`web`; azar solo del RNG sembrado; estado serializable sin clases; la tarjeta, el código y las imágenes **nunca** exponen `destino`; sin `seed` en el código; saneamiento de texto libre; WCAG 2.2 AA

**Scale/Scope**: banco de 27 situaciones + 15 condicionales (sin cambios de situaciones); se añade un catálogo de textos de tarjeta; carreras de ~20 años; 1 módulo de motor nuevo (`tarjeta.ts`), 1 codec (`codec.ts`), 1 componente de presentación reutilizable, 2 rutas on-demand

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Resultado |
|---|---|---|
| I. Motor independiente y determinista | `TarjetaFinal` y `codec` en TS puro; sin DOM; sin `Math.random()`/`Date.now()`; determinismo sin `seed` (hash estable de datos visibles); `destino` nunca se expone | ✅ PASS — `tarjeta.ts` y `codec.ts` no importan `content`/`web`; los textos se inyectan por el banco; test que prohíbe claves de `destino` en la tarjeta |
| II. Contenido como datos, no código | Los textos de hitos y frase viven como datos validados con Zod e inyectados en el banco | ✅ PASS — `src/content/textos/tarjeta.ts` + `TextosTarjetaSchema`; añadir textos no toca el motor |
| III. Verificación determinista y balance | Tests deterministas + integridad de contenido + `npm run check`; simulación de 10.000 carreras | ✅ PASS — tests de tarjeta, codec (roundtrip/versión/tamaño), integridad de textos y simulación con 0 tarjetas que expongan datos ocultos |
| IV. Rendimiento y mobile-first | Una sola isla; `/r/:codigo` con 0 kB de JS; mobile-first 420-480 px | ✅ PASS — la tarjeta es un componente renderizable en servidor; sin dependencias en el bundle del bucle |
| V. Simplicidad arquitectónica y proyecto único | Solución más simple que cumpla el diseño (YAGNI) | ✅ PASS — un módulo de motor, un codec y un componente reutilizado por isla y página; sin backend ni estado nuevo |

**Sin violaciones**: no se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/007-final-card/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   ├── engine.md        # API pública y tipos del motor
│   ├── codec.md         # Formato y contrato del código de partida
│   ├── rutas.md         # Página de resultado y endpoint de imágenes
│   └── ui.md            # Contrato de presentación y acciones de compartir
├── checklists/
│   └── requirements.md  # De /speckit.specify
├── spec.md
└── tasks.md             # /speckit.tasks (no lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── types.ts            # TarjetaFinal, HitoTarjeta, LogroCOAC, PremioResumen, TextosTarjeta, VERSION_TARJETA; Paso "fin" con tarjeta
│   ├── tarjeta.ts          # (NUEVO) construirTarjeta(p, banco), hashEstable, sinNombre
│   ├── codec.ts            # (NUEVO) codificar/decodificar (fflate + base64url puro), VERSION_CODIGO
│   ├── resumen.ts          # se retira (sustituido por tarjeta.ts)
│   ├── partida.ts          # siguientePaso "fin" → construirTarjeta; resumen(p, banco)
│   └── index.ts            # exporta tarjeta.ts y codec.ts
├── content/
│   ├── schema.ts           # TextosTarjetaSchema; BancoContenido.textosTarjeta
│   ├── textos/tarjeta.ts   # (NUEVO) TEXTOS_TARJETA (hitos, hitos neutros, frases por bucket)
│   └── index.ts            # incluye textosTarjeta en bancoContenidoBruto
├── juego/
│   ├── Tarjeta.svelte      # (NUEVO) tarjeta-póster; reutilizada por la isla y por /r/:codigo
│   ├── pantallas/FinCarrera.svelte  # tarjeta + panel de compartir y toggle de nombre
│   ├── estado.svelte.ts    # paso "fin" expone tarjeta; acción de compartir/ocultar nombre
│   └── presentacion.ts     # etiquetas y textos de compartir/errores de código
├── utilities/
│   └── compartir.ts        # (NUEVO) acciones Web Share/clipboard/descarga (sin lógica de juego)
├── layouts/
│   └── Layout.astro        # props Open Graph opcionales (solo cabecera)
├── pages/
│   ├── r/[codigo].astro    # (NUEVO) prerender=false: decodifica y renderiza la tarjeta (0 kB JS)
│   └── api/og/[codigo].png.ts  # (NUEVO) prerender=false: PNG og/9x16/1x1 con satori + resvg
├── simulacion/
│   ├── jugar.ts            # paso "fin" produce tarjeta
│   └── auditoria.ts        # regla tarjetaIncoherente (3 hitos, sin datos ocultos)
public/fonts/               # fuentes TTF para satori (marca de agua e imágenes)
tests/e2e/
└── compartir.spec.ts       # (NUEVO) fin → tarjeta → compartir + accesibilidad
```

**Structure Decision**: Proyecto único (Principio V). La novedad se concentra en dos módulos puros del motor (`tarjeta.ts`, `codec.ts`) y un componente de presentación reutilizado por la isla y por la página de resultado; las dos rutas nuevas se sirven on-demand con el adapter ya configurado. No se introduce backend ni capa nueva.

## Complexity Tracking

> Sin violaciones de la Constitución; no procede.
