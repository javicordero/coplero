# Implementation Plan: Landing estática

**Branch**: `010-landing-page` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-landing-page/spec.md`

## Summary

Convertir `/` en la **landing real de Coplero**: hero + explicación + CTA, "cómo funciona",
modalidades, ejemplo de tarjeta, FAQ y un **pie reutilizable** inspirado en el de acordesgaditanos,
con una referencia visible al mismo autor.

Enfoque técnico: la página se mantiene **100% estática** (HTML + CSS, **0 kB de JS**): ni islas ni
scripts. El **ejemplo de tarjeta** reutiliza el componente real `Tarjeta.svelte` **renderizado en el
servidor** (sin directiva `client:*`, así que no envía JS). El **pie** se extrae a un componente
Astro reutilizable con iconos **SVG en línea** (sin `astro-icon` ni dependencias nuevas). La imagen
Open Graph de la landing reutiliza el endpoint de OG existente con un **código de ejemplo derivado
del mismo fixture** que se muestra en la página.

## Technical Context

**Language/Version**: TypeScript 6 (strict), Node 22+.

**Primary Dependencies**: Astro (sin cambios) + Svelte 5 **solo para SSR en build** del ejemplo de
tarjeta. **Sin dependencias nuevas**.

**Storage**: N/A (contenido estático en la página/módulos de datos).

**Testing**: Playwright E2E (`tests/e2e/landing.spec.ts`) para secciones, enlaces y accesibilidad
(axe, WCAG 2.2 AA). La garantía de **0 kB de JS** se verifica sobre el HTML construido (`dist/index.html`).

**Target Platform**: web estática (Netlify). Público principal: móvil, enlace abierto desde WhatsApp.

**Project Type**: proyecto único Astro (web).

**Performance Goals**: `/` con **0 kB de JS** y todo el contenido en el HTML (SC-001); CTA visible
sin scroll en 360×640 (SC-002).

**Constraints**: mobile-first real; WCAG 2.2 AA; español; indexable (sin `noindex`); sin enlaces rotos.

**Scale/Scope**: una página (`/`) + un componente de pie reutilizable; ~7 secciones.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| **I · Motor independiente y determinista** | ✅ No se toca el `engine`; solo se **consume** su tipo `TarjetaFinal` y el códec para el fixture de ejemplo. |
| **II · Contenido como datos, no código** | ✅ El texto de la landing es contenido estático de la página (no es el banco de situaciones) y no introduce lógica de juego. |
| **III · Verificación determinista y balance** | ✅ No cambia el contenido ni el motor → no requiere recalibrar simulación. Se añade un E2E (secciones/enlaces/axe) y una comprobación de 0 kB sobre el build. |
| **IV · Rendimiento y mobile-first** | ✅ La landing sigue siendo **HTML estático con 0 kB de JS**; el ejemplo de tarjeta se renderiza **en build** (SSR) y **no** añade isla. El bucle jugable sigue siendo la única isla en `/jugar`. El **ancho máximo de 420–480 px del Principio IV aplica al bucle jugable**; la landing es una página de marketing estática y usa **680 px centrados** (acordado aquí; no contradice la regla del juego). |
| **V · Simplicidad arquitectónica y proyecto único** | ✅ Proyecto único, sin dependencias nuevas (iconos SVG en línea), sin backend. |

**Resultado**: sin violaciones. No se necesita **Complexity Tracking**.

*Re-check post-diseño (Phase 1)*: se mantiene. Los contratos (página y pie) no introducen JS de
cliente ni dependencias; el pie es un componente Astro reutilizable.

## Project Structure

### Documentation (this feature)

```text
specs/010-landing-page/
├── plan.md              # Este fichero
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   ├── landing.md       # Contrato de la página `/`
│   └── footer.md        # Contrato del componente de pie
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Footer.astro            # pie reutilizable: redes, autor, acordesgaditanos, legal, copyright
├── landing/
│   ├── contenido.ts            # datos de las secciones: pasos, modalidades, FAQ, redes, autor
│   └── ejemploTarjeta.ts       # fixture `TarjetaFinal` para el ejemplo y su código OG
├── layouts/
│   └── Layout.astro            # sin cambios (ya soporta title/description/og/canonical)
└── pages/
    └── index.astro             # landing `/` (0 kB JS); reutiliza Tarjeta.svelte en SSR

tests/e2e/
└── landing.spec.ts             # secciones, CTA, enlaces del pie y accesibilidad (axe)
```

**Structure Decision**: la landing vive en `src/pages/index.astro`; el **pie** se extrae a
`src/components/Footer.astro` para reutilizarlo en futuras páginas estáticas (`/como-jugar`, legales).
El **texto y los datos** (pasos, modalidades, FAQ, redes y autor) se aíslan en `src/landing/` para
mantener la página legible; el **fixture de la tarjeta de ejemplo** también vive ahí y se renderiza con
el componente real `src/juego/Tarjeta.svelte` sin directiva de cliente.
