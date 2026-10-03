# Contract — Tarjetas de modalidad y variante

Interfaz interna (UI) de las pantallas de selección de modalidad y variante. No es una API externa.

## Estructura DOM esperada

Modalidad:

```html
<section class="pantalla" data-testid="modalidad">
  <div class="pantalla__cabecera">
    <h2>Elige modalidad</h2>
    <p>Purpurina o plumero</p>
  </div>

  <div class="pantalla__cuerpo">
    <ul class="opciones">
      <li>
        <button class="tarjeta tarjeta--icono" type="button">
          <svg class="tarjeta__icono tarjeta__icono--guitarra" aria-hidden="true" focusable="false">…</svg>
          <strong>Comparsa</strong>
          <span class="tarjeta__subtitulo">¡Pasión, decía Paco Alba, la comparsa es pasión!</span>
        </button>
      </li>
      <li>
        <button class="tarjeta tarjeta--icono" type="button">
          <svg class="tarjeta__icono tarjeta__icono--caja" aria-hidden="true" focusable="false">…</svg>
          <strong>Chirigota</strong>
          <span class="tarjeta__subtitulo">Humor, tipo y crítica desde la calle.</span>
        </button>
      </li>
    </ul>
  </div>
</section>
```

Variante (elección inicial, con `iconos` activo):

```html
<section class="pantalla" data-testid="variante">
  <div class="pantalla__cabecera">
    <h2>Elige tu estilo</h2>
    <p>Elige tu estilo</p>
  </div>

  <div class="pantalla__cuerpo">
    <ul class="opciones">
      <li>
        <button class="tarjeta tarjeta--icono" type="button">
          <svg class="tarjeta__icono tarjeta__icono--bigote" aria-hidden="true" focusable="false">…</svg>
          <strong>Clásico</strong>
          <span class="tarjeta__subtitulo">Más clásico que un tenor con bigote.</span>
        </button>
      </li>
      …
    </ul>
  </div>
</section>
```

Notas de contrato:

- El subtítulo de **modalidad** va en cursiva y entre comillas “ ” (son citas); el de **variante** idem si la variante está marcada con `cita` (p. ej. "Evolución con raíces" en comparsa; "Clásico" e "Interpretar el personaje" en chirigota); el resto, en redonda y sin comillas. El dato guarda la cita sin comillas; las comillas se añaden al renderizar.
- El icono es un `<svg>` inline decorativo (componentes `IconoGuitarra`/`IconoCaja`/`IconoBigote`/`IconoRaices`/`IconoNuevaEscuela`). En variante se muestra solo cuando `iconos` es verdadero (elección inicial), nunca en el cambio de variante.
- El orden título → subtítulo y la presencia de `<strong>` + `<span>` se conservan; el icono es un nodo adicional **dentro** del `button`.
- Los textos provienen de `MODALIDADES_INFO` (`src/juego/presentacion.ts`) y de `VARIANTES` (`src/content/variantes.ts`); los componentes no llevan textos literales.

## Contrato de estilos

| Elemento/clase | Propiedad | Contrato |
|---|---|---|
| `.tarjeta` | `position` | `relative` (ancla del icono) |
| `.tarjeta__subtitulo--cita` | `font-style` | `italic` (modalidad y variantes marcadas como cita) |
| `.tarjeta__subtitulo` | `text-wrap` | `balance` |
| `.tarjeta--icono strong`, `.tarjeta--icono .tarjeta__subtitulo` | `padding-right` | `2.75rem` (reserva el hueco del icono) |
| `.tarjeta__icono` | `position` | `absolute`, esquina superior derecha (`top`/`right` con `--esp-*`) |
| `.tarjeta__icono` | `color` | `var(--c-texto-suave)` (mismo color que el subtítulo) |
| `.tarjeta__icono` | `pointer-events` | `none` |
| `.tarjeta__icono--guitarra` | tamaño | `2rem` |
| `.tarjeta__icono--caja` | tamaño | `1.5rem` |
| `.tarjeta__icono--bigote` | tamaño | `2.25rem` |
| `.tarjeta__icono--raices` | tamaño | `2rem` |
| `.tarjeta__icono--nueva-escuela` | tamaño | `1.75rem` |

Sin tokens nuevos. Sin dependencias nuevas. Los assets de `public/iconos/` no se editan.

## Contrato de accesibilidad

| Regla | Contrato |
|---|---|
| Iconos | `aria-hidden="true"` y `focusable="false"`; no aportan texto accesible |
| Nombre accesible de la opción | Título + subtítulo (el icono no cuenta) |
| Interacción | La tarjeta sigue siendo un único `<button>` elegible en un toque (`pointer-events: none` en el icono) |
| Contraste | Título y subtítulo mantienen AA con los tokens existentes |
| 320 px | Sin desborde horizontal (`scrollWidth == clientWidth`) |

## Ganchos de observabilidad (no romper)

- `main[data-pantalla]`, `data-prepartida`, `[data-testid="modalidad"]` y `[data-testid="variante"]` (existentes).
- Los botones de opción siguen siendo `<button>` (los E2E pulsan `[data-testid="modalidad"] button` / `[data-testid="variante"] button`).
- Gancho de los iconos: `.tarjeta__icono` con `aria-hidden="true"` (modificadores `.tarjeta__icono--guitarra` y `.tarjeta__icono--caja`).

## Invariantes verificables

| Invariante | Tolerancia | Cómo se comprueba |
|---|---|---|
| Títulos de modalidad = "Comparsa" / "Chirigota" (0 con etiquetas antiguas) | exacto | E2E lee el texto de las tarjetas |
| Subtítulo de Comparsa literal | exacto | Unit + E2E |
| `font-style` de los subtítulos de modalidad = `italic` | exacto | E2E `getComputedStyle` |
| `font-style` de cada subtítulo de variante = `italic` si tiene `cita`, si no `normal` | exacto | E2E |
| Los subtítulos de cita se muestran entre comillas “ ” | exacto | E2E (texto) |
| Cada tarjeta tiene `.tarjeta__icono` decorativo (sin texto accesible) | booleano | E2E (atributo + nombre accesible) |
| Comparsa usa `--guitarra` y Chirigota `--caja` | exacto | E2E (clase) |
| Las variantes de comparsa usan `--bigote`/`--raices`/`--nueva-escuela`; las de chirigota, `--guitarra`; el cambio de variante, 0 iconos | exacto | E2E |
| Color de cada icono = color de su subtítulo | exacto | E2E `getComputedStyle` |
| Título de variante = "Elige tu estilo" | exacto | E2E |
| Sin desborde horizontal a 320 px en modalidad y variante | 0 px | E2E `scrollWidth - clientWidth` |
| Accesibilidad en modalidad y variante | 0 violaciones graves | axe WCAG 2.2 AA |
| `etiquetaModalidad` sin cambios | exacto | Unit existente ("Chirigotero") |

## Reglas de dependencia

- El cambio vive en `web` (`src/juego`); no afecta a `engine` ni a `content`.
- `MODALIDADES_INFO` es presentación; `VARIANTES` es catálogo de contenido (títulos y subtítulos).
