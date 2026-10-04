# Contrato · Marco del sitio (cabecera y pie)

El marco (cabecera + pie) se renderiza desde `src/layouts/Layout.astro`, así que **toda** página que
use `Layout` lo hereda. Es **HTML estático: 0 kB de JS**.

## Cabecera (`src/components/Header.astro`)

| Aspecto | Contrato |
|---|---|
| Elemento | `<header>` con un enlace a `/` |
| Marca | `<a href="/">` con un `<span data-marca>` que contiene **Coplero** por defecto |
| Marca dinámica | En `/jugar`, la isla escribe `data-marca` con `tituloDelJuego(genero)` (Coplero/Coplera/Coplere) al elegir sexo |
| Posición | **Estática** (se desplaza con el contenido; no fija) |
| Ancho | Contenedor de 680 px centrado en escritorio; ancho completo con padding en móvil |
| JS | Ninguno (la actualización en `/jugar` la hace la isla ya existente) |
| Accesibilidad | Un solo enlace con nombre accesible; contraste AA |

## Pie (`src/components/Footer.astro`)

Estructura **idéntica a la de acordesgaditanos**, en este orden:

| # | Bloque | Marcado | Contenido |
|---|---|---|---|
| 1 | Redes sociales | `<nav aria-label="Redes sociales">` + `<h3>` | X, YouTube, TikTok, Instagram (SVG en línea de 22 px, `aria-label`) |
| 2 | Autor | `<address>` | «Desarrollado por Javier Cordero Toscano» + LinkedIn y GitHub + **chip-enlace a Acordes Gaditanos** |
| 3 | Legal | fila de enlaces | Colaborar · Política de privacidad · Política de cookies (páginas existentes) |
| 4 | Copyright | `<p>` | `© {año en build} Coplero` |

Reglas:

- Todos los enlaces externos: `target="_blank" rel="noopener noreferrer"` + nombre accesible.
- **Sin enlaces rotos**: los enlaces legales apuntan a páginas que existen.
- Mantiene la **referencia a acordesgaditanos** como proyecto del mismo autor, en forma de **chip** dentro del bloque del autor.
- Ancho del contenedor: 680 px en escritorio; ancho completo en móvil.
- **Estilo**: fondo en degradado de `--c-superficie` a `--c-fondo`; bloques compactos con `gap` uniforme; filete (`--c-separador`) antes de la franja legal; contraste AA.
- **Objetivos táctiles** de 44 × 44 px (los márgenes negativos compactan la fila de iconos sin reducir el área de pulsación).

## Integración en `Layout.astro`

```text
<body>
  <Header />
  <slot />      <!-- contenido de la página -->
  <Footer />
</body>
```

- El `slot` no fija ancho: cada página decide su columna (la portada y las páginas de texto usan 680;
  el bucle jugable usa 420–480).
- El fondo del `body` es el mismo en todas las páginas (continuidad percibida).

## Excepciones

- `/panel` (solo-dev) define su propio HTML y **no** usa el marco.
