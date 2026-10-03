# Implementation Plan: Estilo de las tarjetas de modalidad y variante: nombres, cita e icono

**Branch**: `019-modalidad-estilo-iconos` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-modalidad-estilo-iconos/spec.md`

## Summary

Cambio de presentación acotado a las pantallas de selección de modalidad y variante: las tarjetas de modalidad pasan a titularse con la **modalidad misma** ("Comparsa" y "Chirigota"), con sus subtítulos (citas) en cursiva; la pantalla de variante pasa a titularse **"Elige tu estilo"** y todas sus tarjetas llevan icono. Cada tarjeta incorpora un **icono provisional** en su esquina superior derecha, del color del subtítulo, como **SVG inline monocromo** (`fill: currentColor`), a partir de los recursos de `public/iconos/` (`caja.svg`, `guitarra.svg`, `bigote.svg`, `raices.svg`, `nueva_escuela.svg`). Se resuelve con datos de presentación, componentes de icono y estilos globales de tarjeta: sin dependencias nuevas, sin tocar `engine`/`content` y sin afectar a la tarjeta final, la imagen OG ni la portada.

## Technical Context

**Language/Version**: TypeScript 5.x; Astro 5 + Svelte 5 (runes)

**Primary Dependencies**: ninguna nueva; sistema de tokens CSS existente (`src/ui/tokens.css`), recursos estáticos de `public/iconos/` (`caja.svg`, `guitarra.svg`, `bigote.svg`, `raices.svg`, `nueva_escuela.svg`) y SVG inline (`fill: currentColor`)

**Storage**: N/A (no aplica)

**Testing**: Vitest (unitario de presentación) + Playwright (E2E) + `@axe-core/playwright` (accesibilidad)

**Target Platform**: web mobile-first (desde 320 px); ancho máximo del marco en escritorio; build Node 22 en Netlify

**Project Type**: proyecto único Astro con una sola isla Svelte en `/jugar`

**Performance Goals**: 0 kB de JavaScript añadido; los SVG van inline (markup); páginas estáticas intactas

**Constraints**: no tocar `engine`/`content`; una sola isla; WCAG 2.2 AA; sin scroll horizontal a 320 px; el renombrado se limita a modalidad y variante (confirmado); no se editan los assets de `public/`

**Scale/Scope**: 2 pantallas, 1 módulo de presentación + catálogo de variantes, 3 iconos inline, 3 recursos SVG y 2 pruebas (unit + E2E)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| **I. Motor independiente y determinista** | No se importa ni modifica el motor; todo vive en `src/juego` (UI) y `public/` (asset). | ✅ PASS |
| **II. Contenido como datos, no código** | No se tocan esquemas ni el banco; el texto de modalidad es presentación, no contenido validado. | ✅ PASS |
| **III. Verificación determinista y balance por simulación** | No es balance; se añaden una prueba unitaria de presentación y una E2E reproducible; `npm run check` debe pasar. | ✅ PASS |
| **IV. Rendimiento y mobile-first** | Solo CSS + SVG inline; 0 kB JS añadido; mobile-first real desde 320 px; sin dependencias. | ✅ PASS |
| **V. Simplicidad arquitectónica y proyecto único** | Reutiliza la isla, los datos de modalidad y variante, los tokens y assets ya existentes en `public/`; sin capas ni paquetes nuevos. | ✅ PASS |

**Resultado**: sin violaciones. No se requiere `Complexity Tracking`.

**Re-evaluación post-diseño (Fase 1)**: el renombrado y el reordenado son cambios de presentación/datos de catálogo (I, II); la cursiva y los iconos (SVG inline) son CSS/markup puro en `web` (IV); la verificación es unitaria + E2E determinista (III); no se añaden dependencias, capas ni edición de assets (V). Sigue sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/019-modalidad-estilo-iconos/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── modalidad.md     # Contrato de estructura, estilos y ganchos de test de las tarjetas
└── tasks.md             # Fase 2 (lo crea /speckit.tasks)
```

### Source Code (repository root)

```text
public/
└── iconos/
    ├── bigote.svg                       # Icono de "Clásico" (comparsa)
    ├── caja.svg                         # Icono de Chirigota
    ├── guitarra.svg                     # Icono de las variantes de chirigota
    ├── nueva_escuela.svg                # Icono de "Nueva escuela" (comparsa)
    └── raices.svg                       # Icono de "Evolución con raíces" (comparsa)

src/
├── content/
│   └── variantes.ts                     # Catálogo: orden de comparsa y subtítulo de "Evolución con raíces"
├── juego/
│   ├── presentacion.ts                 # MODALIDADES_INFO: títulos y subtítulos de modalidad
│   ├── Juego.svelte                    # Estilos globales de tarjeta + prop `iconos` de variante
│   └── pantallas/
│       ├── ElegirModalidad.svelte      # Iconos guitarra/caja + subtítulos en cursiva
│       ├── ElegirVariante.svelte       # Título "Elige tu estilo" + iconos (bigote/guitarra)
│       ├── IconoGuitarra.svelte        # SVG inline
│       ├── IconoCaja.svelte            # SVG inline
│       ├── IconoBigote.svelte          # SVG inline
│       ├── IconoRaices.svelte          # SVG inline
│       └── IconoNuevaEscuela.svelte    # SVG inline
└── __tests__/
    └── presentacion.test.ts            # Assertions de títulos y subtítulos de modalidad
tests/
└── e2e/
    └── modalidad-tarjetas.spec.ts      # E2E: contenido, cursiva, iconos, 320 px y accesibilidad
```

**Structure Decision**: proyecto único existente. El cambio se concentra en el módulo de presentación (`presentacion.ts`), los componentes de pantalla (`ElegirModalidad.svelte`, `ElegirVariante.svelte`), los iconos compartidos (`IconoGuitarra.svelte`, `IconoCaja.svelte`, `IconoBigote.svelte`), los estilos globales de tarjeta en `Juego.svelte`, el catálogo de variantes (`variantes.ts`) y las pruebas. No se crean dependencias ni carpetas nuevas. No se tocan `engine` ni `etiquetaModalidad` (tarjeta final, imagen OG y portada quedan intactas).

## Design

### Datos de presentación (presentacion.ts, variantes.ts)

- `MODALIDADES_INFO` cambia los títulos a "Comparsa" y "Chirigota". El **subtítulo de Comparsa** pasa a la cita literal; el de **Chirigota** se mantiene ("Humor, tipo y crítica desde la calle."). Los subtítulos de modalidad son citas (cursiva); los de variante, no.
- En `VARIANTES` se reordena comparsa ("Clásico" → "Evolución con raíces" → "Nueva escuela") y chirigota ("Clásico" → "Interpretar el personaje" → "Lolosedismo"); se añade la propiedad `cita` a las variantes que lo son ("Evolución con raíces" en comparsa y "Clásico" en chirigota, con el subtítulo "Vuelve ya el 3x4, el 3x4 bueno").
- **No** se modifica `etiquetaModalidad` ni `ETIQUETA_MODALIDAD`: esas etiquetas ("Comparsista"/"Chirigotero") siguen usándose en la tarjeta final y la imagen OG, fuera del alcance confirmado.

### Tarjetas (ElegirModalidad.svelte, ElegirVariante.svelte)

- En modalidad, los subtítulos (`.tarjeta__subtitulo--cita`) van en cursiva y entre comillas “ ” (son citas). En variante, idem solo los marcados con `cita` en el catálogo; el resto, en redonda y sin comillas.
- Cada `button.tarjeta` con icono recibe `position: relative` y un **icono provisional** decorativo en la esquina superior derecha:
  - **Variantes de comparsa**: `IconoBigote` ("Clásico"), `IconoRaices` ("Evolución con raíces") e `IconoNuevaEscuela` ("Nueva escuela") (SVG inline, `2rem`).
  - **Chirigota (modalidad)**: `IconoCaja` (SVG inline `--caja`, `1.5rem`).
  - **Variantes de chirigota**: `IconoGuitarra` (SVG inline `--guitarra`, `2rem`).
  - SVG inline con `fill: currentColor` y `color: var(--c-texto-suave)`; `pointer-events: none`; sin máscaras.
  - El título y el subtítulo reservan espacio a la derecha para que el texto nunca quede bajo el icono, tampoco con el subtítulo en dos líneas (FR-010).
- La pantalla de variante muestra los iconos solo en la elección inicial (prop `iconos`), no en el cambio de variante; su título es "Elige tu estilo" y su subtítulo se mantiene.
- Se conservan `data-testid`, los `<button>` de opción y el avance en un solo toque (FR-006, FR-007).

### Accesibilidad y responsive

- Los iconos son decorativos (`aria-hidden`, `focusable="false"`, `pointer-events: none`); el nombre accesible de cada opción sigue siendo título + subtítulo (SC-004).
- Si el icono se retira, la tarjeta sigue legible y seleccionable (edge case de la spec).
- Sin desborde horizontal a 320 px: la tarjeta crece en alto y el icono no fuerza ancho (SC-006).
- Contraste del título y del subtítulo según tokens existentes; sin cambios que degraden AA (SC-007).

### Tests

- **Unitario** (`presentacion.test.ts`): títulos `["Comparsa", "Chirigota"]`; subtítulo de Comparsa literal; subtítulo de Chirigota sin cambios.
- **E2E** (`tests/e2e/modalidad-tarjetas.spec.ts`):
  - Modalidad: títulos, subtítulos literales y `font-style` `italic`.
  - Iconos: Comparsa `--guitarra` y Chirigota `--caja`, decorativos, del color del subtítulo.
  - Variante: título "Elige tu estilo"; en comparsa, `--bigote`/`--raices`/`--nueva-escuela`; en chirigota, `--guitarra`; y subtítulos en cursiva solo si la variante tiene `cita`.
  - Sin desborde horizontal a 320 px y axe sin violaciones graves (WCAG 2.2 AA) en ambas pantallas.
- Se mantienen `layout-previo.spec.ts` (cabecera intacta), `jugar`, `chrome` y `layout-estable`.

## Complexity Tracking

> Sin violaciones constitucionales; sección no aplicable.
