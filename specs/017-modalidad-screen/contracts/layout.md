# Contract — Layout del flujo previo a partida

Interfaz interna (UI) entre las pantallas del flujo previo y el marco compartido. No es una API externa.

## Clases compartidas (globales, definidas en `Juego.svelte`)

| Clase | Elemento | Contrato |
|---|---|---|
| `.pantalla` | `section` de la pantalla | Columna flex; alto del área de juego; anclada arriba con padding superior fijo |
| `.pantalla__cabecera` | cabecera | **Altura natural** (`h2` + subtítulo); alineada arriba |
| `.pantalla__cuerpo` | cuerpo de la pantalla | Va debajo de la cabecera con `margin-top: var(--esp-5)` |
| `.tarjeta` | opción seleccionable | Superficie/borde/radio/hover comunes; el layout lo pone cada pantalla |

## Tokens

Ninguno nuevo. La cabecera se ancla con el layout (`main[data-prepartida]` + `.pantalla`) y el gap usa `--esp-5`.

## Textura de puntos (FR-006, SC-008)

Retirada por completo: no existe la clase `textura-puntos`, ni la regla `body.textura-puntos::before`, ni la prop `textura` de `Layout.astro`. No se muestra en ninguna pantalla, header ni pie.

## Header del sitio (FR-016, SC-009)

| Propiedad | Contrato |
|---|---|
| `background` | `var(--c-fondo)` (negro plano, opaco) → sin textura |
| `position` | `sticky` con `top: 0` (permanece en el flujo; no altera `--alto-cabecera`) |
| `z-index` | Por encima del contenido de `main` para sobreponerse al hacer scroll |
| Textura | Ausente en todas las páginas |

## Estructura DOM esperada

```html
<section class="pantalla" data-testid="modalidad">
  <div class="pantalla__cabecera">
    <h2>Elige modalidad</h2>
    <p>Purpurina o plumero</p>
  </div>
  <ul class="opciones">
    <li><button class="tarjeta" type="button">…</button></li>
    …
  </ul>
</section>
```

## Ganchos de observabilidad (no romper)

- `main[data-pantalla]` con `data-momento` y `data-ano` (ya existentes).
- `[data-testid="crear-personaje"]`, `[data-testid="modalidad"]`, `[data-testid="variante"]`.
- Los botones de opción siguen siendo `<button>` (los E2E pulsan `[data-testid="modalidad"] button`).

## Invariantes de layout

| Invariante | Tolerancia | Cómo se comprueba |
|---|---|---|
| `top(h2)` igual en crear/modalidad/variante | ≤ 2 px | E2E mide `getBoundingClientRect().top` |
| `top(subtítulo)` igual en crear/modalidad | ≤ 2 px | E2E |
| Cabecera fija también en ventanas bajas (fallback) | ≤ 2 px | E2E a 390×700 |
| Cabecera y cuerpo caben en `100svh − cabecera` (≥ 720 px alto) | 0 recorte | E2E / medición |
| Altura del área de juego estable al scrollear (`svh`, no `dvh`) | 0 px de cambio | E2E / revisión |
| Sin desborde horizontal a 320 px | 0 px | E2E (`scrollWidth == clientWidth`) |
| `body` SIN clase `textura-puntos` en cualquier pantalla | booleano | E2E |
| `.site-header` sticky (`top: 0`) y con fondo opaco | booleano / alfa = 1 | E2E `getComputedStyle` |
| `--alto-cabecera` no cambia al hacer scroll | 0 px | E2E mide antes/después |
| Accesibilidad | 0 violaciones graves | axe WCAG 2.2 AA |

## Reglas de dependencia

- Las clases y tokens viven en `web` (`src/juego`, `src/ui`); no afectan a `engine` ni `content`.
- El cuerpo de cada pantalla conserva sus selectores scoped; el marco compartido usa `:global`.
