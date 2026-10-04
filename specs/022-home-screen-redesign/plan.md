# Implementation Plan: Rediseño de la portada al estilo del juego

**Branch**: `022-home-screen-redesign` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/022-home-screen-redesign/spec.md`

## Summary

Alinear la **portada** (`/`) con el **lenguaje visual de las pantallas del juego**, darle un **hero a pantalla completa** (fondo nocturno a sangre, contenido en el marco) manteniendo sus **tres bloques** de contenido y **actualizar el contenido de la tarjeta final de ejemplo** a una carrera más larga y con más distinciones.

Concretamente:
1. **Hero** (`eyebrow`, titular «Coplero» grande, subtítulo «Del creador de Acordes Gaditanos», claim y CTA a todo el ancho) que **llena la primera pantalla** con un **fondo nocturno a sangre** (tokens de invierno/carnaval + velo + fundido inferior).
2. **Bloque explicativo** (`h2` + un párrafo + los 4 pasos con subtítulo) con **continuidad visual** respecto al hero: sin filete de corte. Se **retira el compás** y se **sustituye por un ornamento tipográfico** decorativo (aria-hidden, sin texto nuevo).
3. **Ejemplo de tarjeta final** con la misma tarjeta real y el **ornamento** en lugar del compás, pero con **contenido nuevo**: carrera **2027–2040** con más premios y distinciones (FR-019).
4. **Contenido de las fixtures**: se actualizan **las dos** tarjetas de ejemplo —`EJEMPLO_TARJETA` de la portada y el caso dev `campeon`— a la carrera descrita; la **imagen OG** de `/` se regenera a partir del nuevo código.

Todo vive en la web estática (`src/pages/index.astro` y `src/landing/ejemploTarjeta.ts`) más el fixture de desarrollo (`src/juego/dev/fixturesFin.ts`). No se toca `engine` ni `content`, ni la isla de `/jugar` en producción. El cambio retira el compás de la portada, lo que **matiza una decisión cerrada** (feature 012) y se registra en `docs/registro/`.

## Technical Context

**Language/Version**: TypeScript 5.x; Astro (componentes estáticos) + Svelte 5 (`ReglaCompas.svelte` y `Tarjeta.svelte`, servidos como HTML estático sin hidratar)

**Primary Dependencies**: ninguna nueva; `src/ui/tokens.css` (tokens existentes), `src/components/ReglaCompas.svelte`, `src/juego/Tarjeta.svelte` (ejemplo), `src/sitio/contenido.ts` (`PASOS`), `src/landing/ejemploTarjeta.ts`, `src/juego/dev/fixturesFin.ts`, `src/juego/presentacion.ts` (`urlImagenOg`)

**Storage**: N/A

**Testing**: Vitest (`src/juego/__tests__/fixturesFin.test.ts`, `src/landing/__tests__/estatico.test.ts` y nuevo `src/landing/__tests__/ejemploTarjeta.test.ts`) + Playwright E2E (`tests/e2e/landing.spec.ts`, `tests/e2e/visual.spec.ts`) + `@axe-core/playwright`; `npm run check` como puerta

**Target Platform**: web mobile-first desde 320 px; ancho máximo de marco 680 px en escritorio; build Node 22 en Netlify

**Project Type**: proyecto único Astro; la portada es HTML estático y la única isla Svelte vive en `/jugar`

**Performance Goals**: 0 kB de JavaScript añadido; sin rutas ni peticiones nuevas; la portada sigue sin cliente JS; la imagen OG se sirve desde el endpoint ya existente

**Constraints**: no tocar `engine` ni `content`; una sola isla; WCAG 2.2 AA; sin scroll horizontal a 320 px; tema oscuro único; sin colores, tipografías, tokens ni dependencias nuevas; las dos fixtures deben ser `TarjetaFinal` válidos (progresión, mejor fase/puesto, **3 hitos**, `veces` = nº de años) y sobrevivir al códec; registrar en `docs/registro/` el cambio de la decisión del «elemento firma»

**Scale/Scope**: `src/pages/index.astro` (rediseño) + `src/landing/ejemploTarjeta.ts` y `src/juego/dev/fixturesFin.ts` (contenido del ejemplo) + `docs/registro/decisiones-cerradas.md` + tests (`ejemploTarjeta.test.ts` nuevo, `landing.spec.ts` ampliado, `estatico.test.ts` y `fixturesFin.test.ts` revisados); sin componentes ni módulos de producto nuevos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| **I. Motor independiente y determinista** | No se toca el `engine`; el ejemplo es una fixture de presentación estática, no una partida. | ✅ PASS |
| **II. Contenido como datos, no código** | No se modifica el banco (`src/content/`) ni sus esquemas; `EJEMPLO_TARJETA` y `fixturesFin` son datos de presentación/dev, no contenido de juego. | ✅ PASS |
| **III. Verificación determinista y balance** | Tests unit de las fixtures (validez, 3 hitos, códec) y E2E de portada/accesibilidad; no aplica balance. | ✅ PASS |
| **IV. Rendimiento y mobile-first** | La portada sigue a **0 kB de JS**; mobile-first desde 320 px; sin peticiones ni dependencias nuevas; la OG usa el endpoint existente. | ✅ PASS |
| **V. Simplicidad arquitectónica y proyecto único** | Solo edición de una página estática y de dos fixtures; se reutilizan tokens, `ReglaCompas` y `Tarjeta`; sin capas, componentes ni paquetes nuevos. | ✅ PASS |

**Resultado**: sin violaciones. No se requiere `Complexity Tracking`.

**Re-evaluación post-diseño (Fase 1)**: el rediseño y el nuevo contenido son presentación/datos estáticos (I, II); se verifican con unit de fixtures + E2E (III); 0 kB de JS y mobile-first (IV); una página y dos fixtures editadas sin elementos de arquitectura nuevos (V). Sigue sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/022-home-screen-redesign/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── ui.md            # Contrato observable de la portada y del ejemplo
├── checklists/
│   └── requirements.md  # De /speckit.specify
├── spec.md
└── tasks.md             # Fase 2 (lo crea /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── pages/
│   └── index.astro                 # Portada: apertura breve, bloque explicativo y ejemplo
├── components/
│   └── ReglaCompas.svelte          # (existente) se retira su uso en el bloque explicativo; sigue en el ejemplo
├── landing/
│   ├── ejemploTarjeta.ts           # EJEMPLO_TARJETA: nueva carrera 2027–2040 (y CODIGO_EJEMPLO)
│   └── __tests__/
│       ├── estatico.test.ts        # (existente) invariantes de 0 kB de JS
│       └── ejemploTarjeta.test.ts  # NUEVO: validez y coherencia de EJEMPLO_TARJETA
└── juego/
    └── dev/
        └── fixturesFin.ts          # Caso `campeon`: misma carrera nueva

docs/registro/
└── decisiones-cerradas.md          # Matiz de «Elemento firma · regla de compás» (se retira de la portada)

src/juego/__tests__/
└── fixturesFin.test.ts             # (existente) 3 hitos + códec por caso: debe seguir verde

tests/e2e/
├── landing.spec.ts                 # (existente) + compás retirado, separador y ejemplo nuevo
└── visual.spec.ts                  # (existente) axe, responsive, foco, 44 px y reduced-motion: sin cambios
```

**Structure Decision**: proyecto único existente. Todo el trabajo es CSS/markup de una página estática, el contenido de dos fixtures y su documentación/tests. No se crean componentes, rutas, tokens ni dependencias.

## Design

### Lenguaje visual heredado del juego

Se adoptan sin tokens nuevos los recursos que ya usan las pantallas de creación y resultado:

- **Titulares en display mayúsculas** con `font-family: var(--fuente-display)`. El hero usa un **titular grande** (`min(22vw, 7rem)`) con sombra suave; los `h2` de los bloques mantienen la **sombra dura** (`2px 2px 0 var(--c-superficie)`), como `.pantalla__cabecera h2` en `Juego.svelte`.
- **Superficies** con `background: var(--c-superficie)`, borde `var(--c-separador)`/`var(--c-borde-control)`, `border-radius` y `box-shadow`.
- **Acento cálido** (`--c-acento`) para CTA y ornamentos; **hover** coherente con el botón primario.
- **Jerarquía**: `h1` (hero) → `h2` (bloques) → `h3` (pasos).

### Estructura de la portada

| Bloque | Contenido | Tratamiento |
|---|---|---|
| 1. Apertura (hero) | `eyebrow`, `h1` «Coplero», subtítulo «Del creador de Acordes Gaditanos», claim y CTA «Empezar a jugar» | **Fondo nocturno a sangre**; **llena la primera pantalla** (`100svh − cabecera`); contenido en el marco; CTA **a todo el ancho** |
| 2. Explicativo | `h2` «Qué es Coplero y cómo funciona», **un** párrafo y `ol` con los **4 pasos** (título + subtítulo) | Encabezado por el **ornamento**; sin filete de corte que lo aísle del hero |
| 3. Ejemplo | `h2` «Tu tarjeta final», frase, `Tarjeta` de ejemplo y CTA | Usa el **ornamento** en lugar del compás; muestra la **nueva carrera** |

### Hero: fondo a sangre, contenido en el marco

- `main` pasa a **todo el ancho** y cada bloque se centra en el marco de 680 px; así el fondo del hero llega a los bordes y `.apertura__contenido` mantiene el texto en la columna.
- **Fondo nocturno** construido con **tokens** (`--c-invierno-nube`, `--c-carnaval-violeta`, `--c-invierno-luna`) y `color-mix`, con **velo** (oscurece por la izquierda) y **fundido inferior** hacia `--c-fondo`. **Sin hex literales** (lo exige el test V-04).
- El hero **llena la primera pantalla**: `min-height: calc(100svh − var(--alto-cabecera, 2.75rem))` (con reserva `100vh`).

### Ornamento tipográfico (sustituye al compás en los dos bloques)

- Elemento **decorativo** `aria-hidden="true"` y sin texto para lectores de pantalla; se dibuja con CSS (glifo `///` en `--c-acento`).
- Sin fichero de imagen, sin SVG nuevo y sin JavaScript.
- **No** se toca el `ReglaCompas` de la cabecera ni del pie de la tarjeta; el de la **portada** (bloques explicativo y de ejemplo) se sustituye por el ornamento.

### Aire y tipografía

- **Se descarta acortar** la portada (SC-003): los bloques ganan aire (`padding: var(--esp-6)`).
- **Cuerpo de texto** de los bloques a `--texto-lg` con interlineado 1.5; **subtítulos de los pasos** a interlineado 1.3 y **títulos** a `--texto-xl`.
- **Titular del hero** grande (`min(22vw, 7rem)`); **subtítulo** en versalitas bajo el título (enlace sin subrayado).

### Contenido de la tarjeta de ejemplo (FR-019/FR-020)

Misma carrera en las dos fixtures (identidad `El Bauti`, comparsista):

| Campo | Valor |
|---|---|
| Carrera | **2027–2040** (`anosDeCarrera` 14, `anosEnActivo` 14, sin años fuera) |
| `hitosProgreso` | 2027 preliminares (debut) · 2029 cuartos · 2032 semifinales · 2035 final |
| `primerosPremios` | 2037 podio (3º) · **2038 primer premio (1º)** · 2040 podio (2º) |
| `otrosPremios` | **aguja_de_oro ×2 (2036, 2039)** · **copla_para_andalucia ×1 (2034)** |
| `mejorFase` / `mejorPuesto` | `final` / `1` |
| `hitos` (exactamente 3) | debut 2027 · `ganar_coac` 2038 · `duracion` 14 años |
| `cambios` | 2031 → `evolucion_con_raices` |
| Frase de cierre | a elección coherente con «campeón» |

- `Tarjeta.svelte` dibuja la **trayectoria** a partir de `primerosPremios` + `hitosProgreso` (7 hitos) y las **distinciones** como rosetas agrupadas (2 agujas + 1 copla = 3 rosetas).
- La **imagen OG** de `/` se compone desde `CODIGO_EJEMPLO`; al cambiar la fixture cambia el código y, con él, la URL de imagen (la caché se invalida sola). `VERSION_OG` solo se sube si cambia el **diseño** de la imagen, no por cambiar el contenido.

### Registro de decisión

- Se **matiza** la decisión cerrada «Elemento firma · regla de compás» (2026-09-21, feature 012): el compás deja de estar en la portada y se sustituye por un ornamento tipográfico. Se actualiza su fila en `docs/registro/decisiones-cerradas.md` con la fecha y la feature 022.

### Contrato observable (para tests)

- `h1` con nombre «Coplero» y `a[href="/jugar"]` visible; el hero **llena la primera pantalla** y su contenido va en el marco.
- El hero incluye el **subtítulo** «Del creador de Acordes Gaditanos» (enlace) y un **fondo nocturno a sangre**.
- `#que-es` presente con exactamente **4** `li` y su `h2`; `[data-testid="tarjeta"]` visible.
- Tanto `#que-es` como `#ejemplo`: **ningún** `svg.regla-compas` y **sí** un `[data-separador]` decorativo.
- La tarjeta de ejemplo muestra la nueva carrera: `[data-testid="tarjeta-premios"]` con **7** hitos y `[data-testid="tarjeta-distinciones"]` con **3** `.roseta` (2 agujas + 1 copla); `[data-testid="tarjeta-mejor-posicion"]` en tono `oro`.
- La portada no incluye `client:` ni `<script>`; sigue siendo HTML estático.

### Tests

- **Unit** `ejemploTarjeta.test.ts` (nuevo): `EJEMPLO_TARJETA` es válido y coherente (progresión 2027→2035, mejor puesto 1, 3 hitos, `veces` = años) y sobrevive al códec.
- **Unit** `fixturesFin.test.ts`: debe seguir verde (3 hitos + códec) con el caso `campeon` actualizado.
- **Unit** `estatico.test.ts`: se mantiene; confirma que `index.astro` no usa `client:` ni `<script>`.
- **E2E** `landing.spec.ts`: se conservan las comprobaciones actuales (CTA en viewport, `#que-es` con 4 `li`, enlaces, pie, axe) y se **añaden**: ausencia de compás y presencia del ornamento en `#que-es` y `#ejemplo`, y contenido nuevo del ejemplo (7 hitos, 3 rosetas).
- **E2E** `visual.spec.ts`: sin cambios; la portada debe seguir pasando axe, 320 px, 200 %, 44 px, foco y reduced-motion.
- `npm run check` como puerta final.

## Complexity Tracking

> Sin violaciones constitucionales; sección no aplicable.
