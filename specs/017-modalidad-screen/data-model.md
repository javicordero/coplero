# Phase 1 — Data Model: Pantalla de selección de modalidad y cabecera estable del flujo previo

No hay entidades de datos: la feature es de presentación y no toca `engine` ni `content`. Este documento describe el **modelo de layout** que se comparte, a efectos de contrato.

## Modelo de layout (no es dato persistido)

| Concepto | Responsabilidad | Regla |
|---|---|---|
| `pantalla` | `section` de cada pantalla del flujo previo | Columna flex, alto = área de juego, `justify-content: flex-start` con padding superior fijo |
| `cabecera` | `h2` + subtítulo opcional | **Altura natural**; contenido alineado arriba; el cuerpo va debajo con gap `--esp-5` |
| `tarjeta` | Opción seleccionable (género, modalidad, variante) | Superficie, borde, radio y hover comunes; layout propio de cada pantalla |
| `header` | Cabecera del sitio (`.site-header`) | Fondo negro plano `--c-fondo`; `position: sticky; top: 0`; sin textura; no altera `--alto-cabecera` |

La **textura de puntos se retira por completo** (FR-006): no existe la clase `textura-puntos` ni ninguna capa de puntos en la UI.

## Tokens añadidos

Ninguno. La posición de la cabecera se resuelve con el anclaje de `main`/`.pantalla` y el gap usa el token existente `--esp-5`. El espejo `tokens.css`/`tokens.ts` (V-03) no se toca.

## Invariantes verificables

- `top(h2 de crear-personaje) ≈ top(h2 de modalidad) ≈ top(h2 de variante)` (≤ 2 px para un mismo viewport).
- `top(subtítulo de modalidad) ≈ top(subtítulo de crear-personaje)` (≤ 2 px).
- La cabecera y el cuerpo caben en `100dvh − cabecera` desde ~720 px de alto; por debajo, el fallback permite scroll sin recortar.
- Sin desborde horizontal a 320 px.
- `body` **no** tiene la clase `textura-puntos` en ninguna pantalla (no existe).
- `.site-header` es `position: sticky`, `top: 0`, con fondo opaco; al hacer scroll sigue visible y `--alto-cabecera` no cambia.

## Estados

- La pantalla de modalidad no tiene estado “seleccionado”: al pulsar una tarjeta se elige y se avanza (mismo comportamiento que hoy).
- Las tarjetas de género sí tienen estado de selección (radio), ya existente; no cambia.
