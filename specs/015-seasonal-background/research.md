# Phase 0 — Research: Fondo estacional (tres estilos + lluvia real)

**Feature**: 015-seasonal-background | **Fecha**: 2026-09-30

Incógnitas resueltas. Sin dependencias nuevas. Se decidieron el mecanismo de tema, la técnica de lluvia, la posición de sol/luna y el tercer estilo.

## D1 · Tema por momento mediante remapeo de tokens semánticos

- **Decision**: en `main[data-momento="verano"]` se reasignan los tokens semánticos (`--c-texto`, `--c-texto-suave`, `--c-superficie`, `--c-superficie-alta`, `--c-separador`, `--c-borde-control`, `--c-acento-texto`) a una paleta clara; `febrero` hereda los valores oscuros de `:root`.
- **Rationale**: los componentes siguen referenciando `var(--c-texto)`; solo cambia el valor según el `momento`. Cero cambios en componentes.
- **Alternatives considered**: cambiar colores componente a componente (propaga la lógica de tema); hoja de estilos separada (rompe la única fuente). Rechazadas.

## D2 · Lluvia real: gotas finas con cabeza y cola, un solo keyframe

- **Decision**: usar el patrón probado de **gotas finas** (elementos de 1 px de ancho, gradiente vertical de `transparent` arriba → pálido abajo, lo que da "cabeza y cola"), posicionadas de forma **escalonada** (distintos `left`, `animation-delay` y `animation-duration`) y animadas por **un único `@keyframes`** de caída (`transform: translate3d`), sin JS ni imágenes. Se usan ~20-30 gotas.
- **Rationale**: es la técnica estándar "pure CSS rain" (CodePen/PureCSS/NudaUI): realista, GPU-acelerada (`transform`), sin scripts, sin assets, y se desactiva con `prefers-reduced-motion`. Evita el patrón de "persiana" que daba el `repeating-linear-gradient` anterior.
- **Alternatives considered**:
  - *`repeating-linear-gradient` con `background-position`*: produce bandas uniformes, no parece lluvia (fue el problema reportado). Rechazada.
  - *`box-shadow` de muchas gotas sobre un elemento*: gotas puntuales sin "cola", menos creíble; además una lista larga de sombras es frágil de mantener. Rechazada frente a las gotas con gradiente.
  - *Canvas/JS*: prohibido (la UI envuelve al motor, sin lógica extra; rendimiento).

## D3 · Posición de sol y luna: esquina superior derecha

- **Decision**: el `radial-gradient` del **sol** (verano) y de la **luna** (febrero) se ancla en `at 82% 10%` (esquina superior derecha), en lugar del centro.
- **Rationale**: cumple la petición explícita; evita que el astro compita con el título/indicador centrados y deja respirar el contenido.
- **Alternatives considered**: centro (rechazado por el usuario), esquina izquierda (no pedida).

## D4 · Tercer estilo de "resultado": acta/papel

- **Decision**: la pantalla `resultado` usa un tercer estilo, aplicado por **pantalla** (`main[data-pantalla="resultado"]`), no por `momento`. Visualmente: **acta oficial** — papel crema con líneas de documento y membrete "COAC", texto en **tinta oscura** (tema claro) y acento de sello.
- **Rationale**: el usuario eligió la opción C ("resultado oficial del COAC"): sobria y reconocible, y al ser un tema claro no se confunde con verano (playa) ni con febrero (noche). Al no depender de `momento`, el resultado deja de "parecer febrero".
- **Alternatives considered**: teatro/escenario (opción A, probada y descartada), "noche de premios" (dorado/confeti), "solo cambiar acento". Se descarta A.

## D5 · Contraste en los tres estilos

- **Decision**: V-09 se amplía. Verano (texto oscuro sobre cielo/arena ≥ 4.5:1), febrero (texto claro sobre `--c-fondo` ≥ 4.5:1) y resultado-acta (tinta oscura sobre papel ≥ 4.5:1). Las líneas del acta son decorativas.
- **Rationale**: convierte FR-004/SC-003 en puerta automatizada para los tres estilos.

## D6 · Alcance del remapeo y `color-scheme`

- **Decision**: el remapeo solo en `main[data-momento=…]`; `body` y estáticas intactos. En verano `color-scheme: light`; en febrero y resultado `dark`.
- **Rationale**: FR-007 (estáticas intactas) y coherencia de tema.

## Resumen de incógnitas

| Incógnita | Resolución |
|---|---|
| ¿Cómo alternar tema sin tocar componentes? | Remapeo de tokens semánticos — D1 |
| ¿Cómo lograr lluvia real? | Gotas finas con cabeza/cola + un keyframe de caída — D2 |
| ¿Dónde van sol y luna? | Esquina superior derecha — D3 |
| ¿Tercer estilo del resultado? | Acta/papel (resultado oficial del COAC) por pantalla — D4 |
| ¿Contraste? | Verano claro (texto oscuro), febrero oscuro (texto claro) y resultado-acta (tinta sobre papel), V-09 — D5 |
| ¿Alcance? | Solo `main`; estáticas intactas — D6 |
