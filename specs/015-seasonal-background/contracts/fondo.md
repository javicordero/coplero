# Contrato — Fondo estacional y temas (tres estilos)

**Feature**: 015-seasonal-background | **Fecha**: 2026-09-30

Interfaz estable entre el fondo estacional y el resto del código. Extiende `012-visual-design` (`contracts/ui.md`); los nombres de token son normativos.

## 1. Superficie pública

```text
src/ui/tokens.css   → + paleta clara de verano (--c-verano-*), paleta de acta (--c-acta-*) y --c-acento-texto
src/ui/tokens.ts    → + espejo TS (paridad V-03)
src/juego/Juego.svelte → remapeo por momento, fondos, gotas de lluvia y estilo de resultado
```

Reglas:

- `tokens.css` y `tokens.ts` MUST declarar los mismos tokens con el mismo valor (V-03).
- El remapeo y los elementos MUST vivir en `Juego.svelte` usando solo `var()`; sin hex literal (V-04).
- `engine` y `content` MUST NOT importar de `src/ui/`.
- Las páginas estáticas MUST NOT cargar el fondo ni JS (FR-007).

## 2. Estilos por pantalla (contrato de aplicación)

| Selector | Estilo | `color-scheme` | Texto |
|---|---|---|---|
| `main[data-momento="verano"]` | verano claro | `light` | oscuro (`--c-verano-texto`) |
| `main[data-momento="febrero"]` | febrero oscuro | `dark` | claro (`--c-texto`) |
| `main[data-pantalla="resultado"]` | acta/papel | `light` | oscuro (`--c-acta-tinta`) |

**Sobrescritura en verano** (dentro de `main[data-momento="verano"]`):

| Token semántico | → Valor de verano |
|---|---|
| `--c-texto` | `var(--c-verano-texto)` |
| `--c-texto-suave` | `var(--c-verano-texto-suave)` |
| `--c-superficie` | `var(--c-verano-superficie)` |
| `--c-superficie-alta` | `var(--c-verano-superficie-alta)` |
| `--c-separador` | `var(--c-verano-separador)` |
| `--c-borde-control` | `var(--c-verano-borde-control)` |
| `--c-acento-texto` | `var(--c-verano-acento-texto)` |

**Prohibido**: cambiar los componentes para pintar el tema; reasignar tokens fuera de `main`; duplicar valores en TS.

## 3. Contrato de elementos

| Estilo | Fondo | Elementos |
|---|---|---|
| Verano | gradiente cielo → arena | sol (esquina superior derecha), franja de arena inferior |
| Febrero | gradiente nocturno | luna (esquina superior derecha), gotas de lluvia animadas |
| Resultado | papel claro (acta) | líneas de documento y membrete "COAC" |

- Sol y luna MUST anclarse a la **esquina superior derecha** (`at 82% 10%`), no centrados.

**Prohibido**: imágenes, librerías, animaciones de layout, hex fuera de `src/ui/`.

## 4. Contrato de movimiento (lluvia)

- La lluvia MUST ser gotas finas (1 px) con gradiente `transparent → pálido`, escalonadas y animadas por **un único `@keyframes`** con `transform` (promovida a compositor).
- MUST desactivarse con `prefers-reduced-motion` (bloqueo global de `base.css`).
- Ninguna transición/animación de feedback supera 300 ms (herencia de `contracts/ui.md` §4); la lluvia es animación ambiente continua.

## 5. Contrato de accesibilidad

- Sol, luna, arena, telón, foco y gotas son decorativos: sin `aria-*`, sin información.
- AA en verano (texto oscuro sobre claro) y en febrero (texto claro sobre oscuro); en el resultado, tinta oscura sobre papel, verificado en V-09.
- El `momento` sigue indicándose por texto + color en `IndicadorContexto` (nunca solo por color).

## 6. Trazabilidad con 012

Amplía `contracts/ui.md` §2 (añade paleta clara de verano y tokens de teatro) y §7 (remapeo y estilos actúan solo en la superficie "Isla (`/jugar`)"). No modifica umbrales ni el presupuesto de JS de las estáticas.
