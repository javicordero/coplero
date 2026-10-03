# Phase 1 — Data Model: Estilo de las tarjetas de modalidad y variante (nombres, cita e icono)

No hay entidades de datos persistidas ni de motor: la feature es de presentación y no toca `engine` ni `content`. Este documento describe el **modelo de presentación** que se ajusta, a efectos de contrato.

## Dato de presentación: `ModalidadInfo`

Vive en `src/juego/presentacion.ts` (presentación, no contenido validado con Zod).

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `Modalidad` (`comparsista` \| `chirigotero`) | Sin cambios; es la clave del motor y del contenido |
| `titulo` | `string` | **Cambia**: `comparsista` → "Comparsa"; `chirigotero` → "Chirigota" |
| `subtitulo` | `string` | Comparsa → "¡Pasión, decía Paco Alba, la comparsa es pasión!"; Chirigota → sin cambios. Los subtítulos de modalidad son citas y se muestran en cursiva |

`MODALIDADES_INFO` contiene exactamente dos elementos, uno por modalidad.

## Catálogo de variantes: `src/content/variantes.ts`

| Aspecto | Regla |
|---|---|
| Campo `cita` | `cita?: boolean` en `Variante`; `true` marca un subtítulo que es cita y va en cursiva |
| Orden (comparsista) | "Clásico" → "Evolución con raíces" → "Nueva escuela" |
| Orden (chirigotero) | "Clásico" → "Interpretar el personaje" → "Lolosedismo" |
| Subtítulo de "Evolución con raíces" (comparsa) | "Amigo veterano, no pienses que mi copla va contra tu legado por nuestro descaro y solo es una moda" (`cita: true`) |
| Subtítulo de "Clásico" (chirigota) | "Vuelve ya el 3x4, el 3x4 bueno" (`cita: true`) |
| Subtítulo de "Interpretar el personaje" (chirigota) | "Aquí, de toda la vida, se han cantao pasodobles pa que vibre el coliseo, aquí no deberían permitirse pasodobles de cachondeo" (`cita: true`) |
| Resto de subtítulos de variante | En redonda (sin `cita`) |

## Recursos de presentación: `public/iconos/caja.svg`, `public/iconos/guitarra.svg`, `public/iconos/bigote.svg`, `public/iconos/raices.svg`, `public/iconos/nueva_escuela.svg`

| Aspecto | Regla |
|---|---|
| Origen | Recursos estáticos en `public/iconos/`; **no se editan** |
| Uso | Iconos insertados como **SVG inline** en componentes (`IconoCaja`, `IconoGuitarra`, `IconoBigote`, `IconoRaices`, `IconoNuevaEscuela`); no se usan como máscara |
| Color | `fill: currentColor` con `color: var(--c-texto-suave)` (el color del subtítulo) |
| Reparto | Chirigota → caja; variantes de chirigota → guitarra; "Clásico" (comparsa) → bigote; "Evolución con raíces" (comparsa) → raíces; "Nueva escuela" (comparsa) → nueva escuela |

## Fuera de alcance (permanecen intactos)

| Elemento | Valor actual | Motivo |
|---|---|---|
| `etiquetaModalidad("comparsista"/"chirigotero")` | "Comparsista" / "Chirigotero" | Se usa en tarjeta final (`Tarjeta.svelte`) y en la imagen OG |
| `Tarjeta.svelte`, `api/og/[codigo].png.ts`, portada (`src/sitio/contenido.ts`) | Etiquetas actuales | El renombrado se limita a la elección de modalidad y variante (confirmado) |

## Modelo visual de la tarjeta

| Concepto | Responsabilidad | Regla |
|---|---|---|
| `.tarjeta` | Opción seleccionable | Superficie/borde/radio/hover existentes; `position: relative` |
| `strong` | Título de la tarjeta | Muestra el título; reserva espacio a la derecha del icono |
| `.tarjeta__subtitulo` | Subtítulo de la tarjeta | Reserva espacio a la derecha del icono; `text-wrap: balance`. Normal por defecto |
| `.tarjeta__subtitulo--cita` | Subtítulos que son cita | `font-style: italic` y texto entre comillas “ ”; se aplica en modalidad y en las variantes marcadas con `cita` |
| `.tarjeta__icono` | Icono provisional | SVG inline; `position: absolute` arriba-derecha; `pointer-events: none`; `aria-hidden="true"` |
| `.tarjeta__icono--guitarra` | Comparsa y variantes | `2rem` |
| `.tarjeta__icono--caja` | Chirigota | `1.5rem` |
| `.tarjeta__icono--bigote` | "Clásico" (comparsa) | `2.25rem` |
| `.tarjeta__icono--raices` | "Evolución con raíces" (comparsa) | `2rem` |
| `.tarjeta__icono--nueva-escuela` | "Nueva escuela" (comparsa) | `1.75rem` |

## Tokens

Ninguno. Se reutilizan `--c-texto-suave` (color del subtítulo/icono) y tokens de espaciado (`--esp-*`). El espejo `tokens.css`/`tokens.ts` (V-03) no se toca.

## Invariantes verificables

- Los dos títulos de `MODALIDADES_INFO` son exactamente "Comparsa" y "Chirigota".
- El subtítulo de Comparsa es la cita literal; el de Chirigota no cambia.
- En pantalla, todo subtítulo marcado como cita (modalidad y variantes con `cita`) tiene `fontStyle === "italic"` y se muestra entre comillas “ ”; el resto, `"normal"` y sin comillas.
- Cada tarjeta contiene un nodo `.tarjeta__icono` con `aria-hidden="true"` que no aporta texto al nombre accesible.
- Chirigota usa `--caja`; las variantes de chirigota, `--guitarra`; las de comparsa usan `--bigote` (Clásico), `--raices` (Evolución con raíces) y `--nueva-escuela` (Nueva escuela); el cambio de variante no tiene icono.
- El color de cada icono coincide con el de su subtítulo.
- El nombre accesible de cada opción = título + subtítulo (sin el icono).
- Sin desborde horizontal a 320 px (`scrollWidth == clientWidth`).
- `etiquetaModalidad` sigue devolviendo "Comparsista"/"Chirigotero" (sin regresión fuera de alcance).

## Estados

- La pantalla de elección no tiene estado "seleccionado": al pulsar una tarjeta se elige y se avanza (sin cambios).
- Los iconos son puramente decorativos: no tienen estado, foco ni interacción propios.
