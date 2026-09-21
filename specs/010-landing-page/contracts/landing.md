# Contrato · Página `/` (landing)

## Render

- **Estática**: HTML + CSS generados en build. **0 kB de JavaScript**: sin islas, sin directivas
  `client:*` y sin etiquetas `<script>`.
- **Contenedor**: mobile-first; ancho completo con padding lateral en móvil y **680 px centrados** en
  escritorio.
- Indexable: `title`, `meta description` y `link rel="canonical"` presentes; **sin** `noindex`.
- Idioma `es`.

## Estructura (orden contractual)

| # | Sección | Ancla | Contenido mínimo |
|---|---|---|---|
| 1 | Hero | — | "Coplero", frase que explica el juego y **CTA principal** a `/jugar` |
| 2 | Qué es | `#que-es` | Explicación del juego + mención y enlace a acordesgaditanos |
| 3 | Cómo funciona | `#como-funciona` | 4 pasos en orden |
| 4 | Modalidades | `#modalidades` | Comparsista y chirigotero, con en qué deciden |
| 5 | Ejemplo de tarjeta | `#ejemplo` | Tarjeta final de ejemplo (componente real en SSR) |
| 6 | FAQ | `#faq` | ≥ 5 preguntas con respuesta (`<details>` nativo) |
| 7 | Pie | — | Componente `Footer.astro` (ver `footer.md`) |

## CTA

- El CTA principal enlaza a **`/jugar`**.
- Debe ser **visible sin scroll** a 360×640 (el hero ocupa el primer viewport).
- Puede repetirse al final de la página (mismo destino).

## Metadatos

- `title`: "Coplero — juego narrativo del Carnaval de Cádiz" (o equivalente).
- `description`: una frase con las palabras clave reales ("juego", "Carnaval de Cádiz", "COAC").
- `canonical`: `https://coplero.app/`.
- Open Graph/Twitter: título, descripción e **imagen** apuntando a `/api/og/<codigo-ejemplo>.png`
  (el código del fixture de ejemplo).

## Enlaces

- Todos los enlaces internos apuntan a rutas existentes (`/jugar`).
- Los enlaces externos (redes, autor, acordesgaditanos) abren en pestaña nueva con
  `target="_blank" rel="noopener noreferrer"` y nombre accesible.
- **Sin enlaces rotos** (FR-014).

## Accesibilidad

- Un solo `<h1>`; jerarquía de encabezados sin saltos.
- Regiones con landmarks (`header`, `main`, `nav`, `footer`).
- Enlaces de icono con `aria-label`.
- Contraste suficiente y foco visible (WCAG 2.2 AA).
