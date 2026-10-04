# Implementation Plan: Página de colaboración (apoyo y sugerencias)

**Branch**: `023-colaborar-page` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/023-colaborar-page/spec.md`

## Summary

Crear una **página estática `/colaborar`** (0 kB de JavaScript) que reúne dos acciones de
comunidad y una de conversión:

1. **Apoyar el proyecto** con un enlace a **Buy Me a Coffee** (se reutiliza la cuenta ya decidida,
   con `?utm_source=coplero`), abierto en pestaña nueva.
2. **Proponer una situación u opción** mediante un **formulario sin JavaScript**: envío HTML clásico
   (`POST`) a un servicio externo de formularios (Formspree) con mensaje (máx. 500), tipo y email
   opcional, más un campo trampa antispam. Tras enviar, el servicio muestra su confirmación.
3. **Empezar a jugar** (CTA a `/jugar`).

Además, la **portada** añade un **botón de donación** dentro de su **bloque del ejemplo**, justo
debajo de su CTA final (sin crear un bloque nuevo). La página se enlaza desde el **pie** (global, en
todas las páginas) y desde la **pantalla final** con dos enlaces (donación directa + `/colaborar`).
Se **actualiza la política de privacidad**. No se añade menú de navegación ni dependencias.

## Technical Context

**Language/Version**: TypeScript 6.x; Astro 7 (páginas estáticas) + Svelte 5 (isla de `/jugar`);
Node 22+

**Primary Dependencies**: **ninguna nueva** en el proyecto. Servicios externos de terceros:
**Buy Me a Coffee** (solo enlace saliente) y **Formspree** (receptor del formulario).

**Storage**: N/A. No hay backend ni base de datos; el formulario lo entrega un servicio externo.

**Testing**: Vitest (`src/landing/__tests__/estatico.test.ts` ampliado) + Playwright
(`tests/e2e/colaborar.spec.ts` nuevo, `landing.spec.ts`, `pantalla-final.spec.ts`, `visual.spec.ts`,
`chrome.spec.ts`) + `@axe-core/playwright`; `npm run check` como puerta.

**Target Platform**: web mobile-first desde 320 px; ancho máximo de marco 680 px; build Node 22 en
Netlify.

**Project Type**: proyecto único Astro; las páginas son HTML estático y la única isla Svelte sigue en
`/jugar`.

**Performance Goals**: **0 kB de JavaScript** en `/colaborar` y en la portada (con el botón añadido);
sin peticiones nuevas al cargar (las de terceros solo ocurren al pulsar donación o enviar el
formulario).

**Constraints**: sin JavaScript en páginas estáticas; WCAG 2.2 AA; sin scroll horizontal a 320 px;
textos en español; sin dependencias, colores ni tokens nuevos; HTML5 nativo para validación del
formulario; el botón de la portada es un enlace externo (no porta el `gtag` de acordesgaditanos).

**Scale/Scope**: 1 página nueva, 1 botón nuevo en la portada, 1 cambio en el pie, 1 cambio en la
pantalla final, 1 actualización legal y la ampliación de la suite de tests. Sin `engine` ni
`content`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| **I. Motor independiente y determinista** | No se toca `engine`; la feature es presentación estática. | ✅ PASS |
| **II. Contenido como datos, no código** | No se modifica el banco ni sus esquemas. | ✅ PASS |
| **III. Verificación determinista y balance** | Verificación con tests unit de 0 kB y E2E (estructura, formulario, botón de portada, axe, responsive); no aplica balance. | ✅ PASS |
| **IV. Rendimiento y mobile-first** | `/colaborar` y la portada se sirven a **0 kB de JS**; se mantiene una única isla en `/jugar`; mobile-first desde 320 px; sin peticiones al cargar. | ✅ PASS |
| **V. Simplicidad arquitectónica y proyecto único** | Una página estática y un botón en la portada; reutiliza `Layout` y el pie; sin dependencias ni capas nuevas. | ✅ PASS |

**Resultado**: sin violaciones. No se requiere `Complexity Tracking`.

**Re-evaluación post-diseño (Fase 1)**: la página, el botón de portada y los enlaces son
presentación estática (I, II); se verifican con unit + E2E (III); 0 kB de JS y mobile-first (IV);
una página y cambios mínimos sin elementos de arquitectura nuevos (V). Sigue sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/023-colaborar-page/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── ui.md            # Contrato observable (página, portada, pie y pantalla final)
├── checklists/
│   └── requirements.md  # De /speckit.specify
├── spec.md
└── tasks.md             # Fase 2 (lo crea /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── pages/
│   ├── colaborar.astro                    # NUEVO: página estática de colaboración
│   ├── index.astro                        # Añadir el botón de donación en el bloque del ejemplo
│   └── politicas/
│       └── politica-de-privacidad.astro   # Actualizar: mención del formulario y del proveedor
├── components/
│   └── Footer.astro                       # Añadir enlace de texto "Colaborar"
├── sitio/
│   └── contenido.ts                       # Añadir constantes de donación y del formulario
├── juego/
│   └── pantallas/
│       └── FinCarrera.svelte              # Añadir dos enlaces (donación + /colaborar)
└── landing/
    └── __tests__/
        └── estatico.test.ts               # Añadir colaborar.astro y dist/colaborar/index.html

tests/e2e/
├── colaborar.spec.ts                      # NUEVO: contrato de la página y del formulario
├── landing.spec.ts                        # Añadir /colaborar a enlaces internos + botón de portada + pie
├── pantalla-final.spec.ts                 # Añadir los dos enlaces de la pantalla final
├── visual.spec.ts                         # Añadir /colaborar a las rutas auditadas
└── chrome.spec.ts                         # Añadir /colaborar a las rutas de marco
```

**Structure Decision**: proyecto único existente. Todo el trabajo es markup/CSS de una página
estática nueva, un botón en la portada, un enlace en el pie, dos enlaces en la pantalla final de la
isla existente, una constante compartida de contenido y la actualización de la política de
privacidad. No se crean componentes de UI nuevos, rutas de API, tokens ni dependencias.

## Design

### Estructura de la página `/colaborar`

| Bloque | Contenido | Tratamiento |
|---|---|---|
| 1. Apoyar el proyecto | `h2`, texto breve (donación voluntaria) y botón "Invítame a un café" | Enlace externo a Buy Me a Coffee; pestaña nueva; `rel="noopener noreferrer"` |
| 2. Proponer una sugerencia | `h2`, texto explicativo y formulario | Envío HTML clásico sin JS a Formspree |
| 3. Empezar a jugar | CTA "Empezar a jugar" | Enlace interno a `/jugar` |

- Un único `h1` ("Colaborar") y un `h2` por bloque; jerarquía `h1` → `h2`.
- Se reutiliza `Layout` (cabecera, pie, tokens y fondo), como `/como-jugar` y las legales.

### Botón de donación en la portada

- Se añade **dentro del bloque del ejemplo** (`#ejemplo`) de `src/pages/index.astro`, **justo debajo
  de su CTA final** ("Empezar a jugar"), sin crear un bloque nuevo (FR-016).
- Es un enlace externo a Buy Me a Coffee (con el mismo destino `DONACION` y origen Coplero), con
  **icono de café en SVG en línea** (no se añade `astro-icon`) y texto accesible; altura ≥44 px.
- La portada **sigue a 0 kB de JS**: no se porta el `<script>` de analítica de acordesgaditanos.

### Contrato del formulario (sin JavaScript)

| Aspecto | Valor |
|---|---|
| `action` | `https://formspree.io/f/mdeanyjr` |
| `method` | `POST` |
| `mensaje` | `textarea` **requerido**, `maxlength="500"` |
| `tipo` | `select` requerido: "Una situación" (`situacion`), "Una opción" (`opcion`), "Otro" (`otro`) |
| `email` | `input type="email"` **opcional** (Formspree lo usa como *reply-to*) |
| `_subject` | oculto = `Coplero — Nueva sugerencia` |
| `origen` | oculto = `coplero` |
| `_gotcha` | campo trampa antispam **invisible** (fuera de pantalla, `tabindex="-1"`, `aria-hidden`) |
| Confirmación | Página de agradecimiento del propio Formspree (plan gratuito) |

- Etiquetas `<label>` asociadas a cada campo; errores nativos del navegador (`required`,
  `type="email"`).
- Todos los controles (inputs, select, textarea, botón) con altura ≥44 px.

### Donación (Buy Me a Coffee)

- URL: `https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero` (cuenta reutilizada,
  origen identificado).
- Se declaran constantes compartidas en `src/sitio/contenido.ts` —`DONACION` (URL de Buy Me a
  Coffee) y `SUGERENCIAS` (endpoint y longitud máxima)— para reutilizarlas en `/colaborar`, en la
  portada y en `FinCarrera.svelte` y evitar divergencias.

### Descubrimiento

- **Portada** (`index.astro`): botón de donación dentro del bloque del ejemplo (ver arriba).
- **Pie** (`Footer.astro`): enlace de texto "Colaborar" → `/colaborar`, presente en todas las
  páginas. La posición exacta es secundaria (el pie se rediseñará).
- **Pantalla final** (`FinCarrera.svelte`): bajo las acciones de compartir/descargar/reiniciar, una
  línea discreta con **dos enlaces**: donación directa y `/colaborar`. La isla ya es JavaScript, así
  que añadir anclas no altera la regla de 0 kB de las páginas estáticas.
- **Sin menú**.

### Legal

- `politica-de-privacidad.astro`: añadir un apartado "Formulario de sugerencias" indicando que los
  datos (mensaje y email opcional) se envían a **Formspree** (proveedor externo) con la finalidad de
  recibir y valorar propuestas; el envío es voluntario. Actualizar la fecha.
- `politica-de-cookies.astro`: sin cambios funcionales (el formulario no añade cookies propias).

### Registro de decisiones

- La feature **implementa** lo previsto como **v1.1** en `docs/05` §9 (Buy Me a Coffee y buzón de
  sugerencias) y la donación reutilizando la cuenta ya cerrada (`docs/05` §5). Añadir el botón a la
  portada **matiza** la nota de la feature 022/011 de "sin bloque nuevo en la portada": no se añade
  un bloque, pero sí un elemento dentro del bloque del ejemplo. Se anotará en `docs/registro/`.

### Contrato observable (para tests)

- Existe `h1` "Colaborar" y un CTA a `/jugar` en la página; la portada conserva sus 3 bloques.
- Enlaces de donación (portada, página y pantalla final) a
  `https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero`, con `target="_blank"` y
  `rel="noopener noreferrer"`.
- El botón de la portada está **dentro de `#ejemplo`**, después del CTA final.
- El formulario tiene `action="https://formspree.io/f/mdeanyjr"`, `method="post"`, `textarea`
  `maxlength="500"` requerido, `select` con 3 opciones, email opcional y los campos ocultos
  `_subject`, `origen` y `_gotcha`.
- El pie incluye un enlace `a[href="/colaborar"]` en **todas** las páginas.
- La pantalla final incluye enlace a la donación y a `/colaborar`.
- `/colaborar` y la portada no usan `client:` ni `<script>` (0 kB de JS).

### Tests

- **Unit** `estatico.test.ts`: añadir `src/pages/colaborar.astro` a `FUENTES_ESTATICAS` y
  `dist/colaborar/index.html` a `HTML_CONSTRUIDO` (invariantes de 0 kB; `index.astro` ya está en la
  lista).
- **E2E** `colaborar.spec.ts` (nuevo): estructura, enlace de donación (URL + `target` + `rel`),
  contrato del formulario y **envío sin JavaScript** interceptando la petición a Formspree con
  `page.route` (se fulfill con una página de confirmación y se comprueba que el `POST` lleva
  `mensaje`, `tipo`, `origen` y `_subject`).
- **E2E** `landing.spec.ts`: añadir `/colaborar` a `RUTAS_INTERNAS`; comprobar el **botón de donación
  en `#ejemplo`** (URL + `target` + `rel` + posición tras el CTA) y el enlace "Colaborar" del pie.
- **E2E** `pantalla-final.spec.ts`: con `/jugar?dev=fin`, comprobar los **dos enlaces** de la pantalla
  final (donación directa y `/colaborar`) y su objetivo táctil ≥44 px.
- **E2E** `visual.spec.ts`: añadir `/colaborar` a `ESTATICAS` (axe WCAG 2.2 AA, 320 px, 200 %,
  ≥44 px, foco visible, reduced-motion y ausencia de scripts).
- **E2E** `chrome.spec.ts`: añadir `/colaborar` a `RUTAS` (cabecera y pie presentes).
- `npm run check` como puerta final.

## Complexity Tracking

> Sin violaciones constitucionales; sección no aplicable.
