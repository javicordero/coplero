# Implementation Plan: Reordenar la landing, cabecera/pie persistentes y páginas nuevas

**Branch**: `011-landing-flow` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-landing-flow/spec.md`

## Summary

Convertir la web en un sitio con **marco común**: una **cabecera** y un **pie** que se muestran en
**todas** las páginas (portada, juego, cómo jugar, legales y tarjeta compartida). La cabecera lleva
la marca, que cambia a **«Coplero»/«Coplera»/«Coplere»** según el sexo del personaje (ya existe
`tituloDelJuego(genero)` en `src/juego/presentacion.ts`). Se **acorta la portada** (se fusionan «qué
es» y «cómo funciona»; se retiran modalidades, FAQ y cierre), se crean **`/como-jugar`** (reglas +
FAQ) y **dos páginas legales**, y se **reestructura el pie** para que replique el de
acordesgaditanos. La portada sigue con **0 kB de JS** y el bucle jugable conserva su columna de
420–480 px dentro del marco de 680 px.

## Technical Context

**Language/Version**: TypeScript 6 (strict), Node 22+.

**Primary Dependencies**: Astro (sin cambios) + Svelte 5 (isla del juego). **Sin dependencias nuevas.**

**Storage**: `localStorage` (ya existente, 005) para la partida guardada; de ahí sale el sexo que
alimenta la marca de la cabecera al jugar.

**Testing**: Playwright E2E (`tests/e2e/landing.spec.ts` actualizado + `tests/e2e/chrome.spec.ts`) y
Vitest para el mapeo de la marca. Sin cambios en `engine`/`content` → no se recalibra simulación.

**Target Platform**: web estática (Netlify); público móvil.

**Performance Goals**: la portada, `/como-jugar` y las legales se sirven como **HTML estático con
0 kB de JS**; el juego mantiene su isla.

**Constraints**: marco de 680 px; bucle jugable 420–480 px (constitución IV intacta); WCAG 2.2 AA;
sin enlaces rotos; español.

**Scale/Scope**: 4 páginas nuevas o modificadas + 2 componentes compartidos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I · Motor independiente y determinista** | ✅ No se toca el `engine`; la marca reutiliza `tituloDelJuego`, que ya es `web` y se apoya en `Genero` del motor. |
| **II · Contenido como datos, no código** | ✅ No se toca el banco de contenido. Las FAQ y reglas son contenido estático de páginas, no situaciones. |
| **III · Verificación determinista y balance** | ✅ Sin cambios en `engine`/`content` → no hay recalibración. Se añaden E2E (marco, marca, páginas nuevas) y un unitario del mapeo de la marca. |
| **IV · Rendimiento y mobile-first** | ✅ Portada, `/como-jugar` y legales siguen con **0 kB de JS**. El bucle jugable **mantiene su columna 420–480** dentro del marco de 680; no se añade ninguna isla nueva. |
| **V · Simplicidad arquitectónica y proyecto único** | ✅ Proyecto único, sin dependencias nuevas; la cabecera y el pie son componentes Astro estáticos reutilizados por el `Layout`. |

**Resultado**: sin violaciones. No se necesita **Complexity Tracking**.

*Re-check post-diseño (Phase 1)*: se mantiene. El único acoplamiento nuevo es que la isla actualiza
el texto de la marca en la cabecera cuando el jugador elige sexo (una escritura de `textContent`,
sin bundle extra); se documenta en `contracts/chrome.md`.

## Project Structure

### Documentation (this feature)

```text
specs/011-landing-flow/
├── plan.md              # Este fichero
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   ├── chrome.md        # Contrato de cabecera y pie (todas las páginas)
│   └── paginas.md       # Contrato de /como-jugar y las legales
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Header.astro            # NUEVO: marca (enlace a portada) con `data-marca`
│   └── Footer.astro            # REESTRUCTURADO: 4 bloques como acordesgaditanos + legales
├── layouts/
│   └── Layout.astro            # MODIFICADO: envuelve el slot con Header y Footer
├── juego/
│   ├── Juego.svelte            # MODIFICADO: centra la columna 420–480 y actualiza la marca
│   └── presentacion.ts         # (reutilizado) tituloDelJuego(genero) → Coplero/Coplera/Coplere
├── sitio/                      # NUEVO: contenido compartido del sitio
│   ├── contenido.ts            # MOVER desde landing/: redes, autor, acordesgaditanos, FAQ
│   └── reglas.ts               # NUEVO: reglas y modalidades para /como-jugar
├── landing/
│   └── ejemploTarjeta.ts       # (sin cambios)
└── pages/
    ├── index.astro             # MODIFICADO: portada corta (sin modalidades/FAQ/cierre)
    ├── como-jugar.astro        # NUEVO: reglas + FAQ (0 kB)
    └── politicas/
        ├── politica-de-privacidad.astro   # NUEVO (0 kB)
        └── politica-de-cookies.astro      # NUEVO (0 kB)

tests/e2e/
├── landing.spec.ts             # MODIFICADO: nueva estructura de la portada
└── chrome.spec.ts              # NUEVO: cabecera/pie en todas las páginas + marca dinámica
```

**Structure Decision**: el **marco** (cabecera + pie) vive en `Layout.astro`, así que todas las
páginas que ya lo usan lo heredan sin duplicar marcado, y basta con que las páginas nuevas usen
`Layout`. El contenido compartido del sitio (redes, autor, FAQ) se mueve de `src/landing/` a
`src/sitio/` porque ya no es solo de la portada: lo usan el pie y `/como-jugar`. El fixture de la
tarjeta de ejemplo se queda en `src/landing/`.

## Complexity Tracking

> Sin violaciones a la constitución: la tabla queda vacía a propósito.
