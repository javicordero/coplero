# Contrato · Páginas nuevas y modificadas

## `/` (portada) — modificada

- Estática, **0 kB de JS**, indexable.
- Orden de secciones: **hero** (Coplero + «crea tu personaje» + «Empezar a jugar») → **sección
  fusionada** «qué es Coplero + cómo funciona».
- **No** incluye: modalidades, FAQ ni cierre «¿hasta dónde llega tu carrera?».
- CTA principal → `/jugar`; mantiene la referencia a acordesgaditanos y los metadatos OG.

## `/como-jugar` — nueva

- Estática, **0 kB de JS**, indexable.
- Secciones: **reglas** (cómo se avanza, tipos de decisión, el techo oculto explicado sin
  desvelarlo, la tarjeta final), **modalidades** (comparsista/chirigotero) y **FAQ** (≥5 preguntas).
- El contenido vive en `src/sitio/reglas.ts` y `src/sitio/contenido.ts`.

## `/politicas/politica-de-privacidad` — nueva

- Estática, **0 kB de JS**, indexable.
- Contenido mínimo y veraz: qué datos se tratan (solo `localStorage` para guardar la partida en el
  dispositivo), sin analítica ni cookies de terceros, responsable (el autor) y cómo ejercer derechos.

## `/politicas/politica-de-cookies` — nueva

- Estática, **0 kB de JS**, indexable.
- Contenido mínimo y veraz: el sitio **no** usa cookies de seguimiento; `localStorage` es
  funcionalidad esencial (guardar la partida) y no requiere consentimiento.

## Enlaces del pie → páginas

| Enlace del pie | Destino |
|---|---|
| Política de privacidad | `/politicas/politica-de-privacidad` |
| Política de cookies | `/politicas/politica-de-cookies` |

Ambos MUST existir (sin enlaces rotos).
