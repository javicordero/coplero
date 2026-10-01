# Quickstart — Validación de la pantalla de modalidad y cabecera estable

Guía para comprobar que la feature funciona de extremo a extremo. No incluye implementación.

## Prerrequisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Servidor de desarrollo en `http://localhost:4321` (`npm run dev`). Playwright usa su propio puerto (4322) por configuración.

## Escenario 1 — Cabecera idéntica (objetivo principal)

1. Abrir `http://localhost:4321/jugar` y pulsar **Empezar**.
2. En la creación de personaje, anotar la posición vertical del título (“Crea tu personaje”) y del subtítulo (“Inicia tu carrera como autor de carnaval”).
3. Rellenar el nombre y pulsar **Continuar**.
4. En la pantalla de modalidad, comprobar que “Elige modalidad” y “Purpurina o plumero” caen **en la misma `y`** (±2 px) y con el **mismo estilo** (tipografía, tamaño, color y mayúsculas) que los anteriores.
5. Repetir a varios tamaños (p. ej. 320×640, 390×844, 480×900) y confirmar que se mantiene.

**Esperado**: sin salto de la cabecera al avanzar; estilo idéntico; nada recortado.

## Escenario 2 — Modalidad con el lenguaje visual de creación

1. En modalidad, comprobar el fondo de puntos y que Comparsista y Chirigotero aparecen como tarjetas con el mismo aspecto que las tarjetas de género (superficie, borde, radio, hover).
2. Pulsar una modalidad: el flujo avanza a la selección de variante.
3. En variante, comprobar el mismo marco (cabecera, puntos y tarjetas).

## Escenario 3 — Bordes

- **320 px de ancho**: sin desplazamiento horizontal.
- **Ventana baja (≤ ~700 px de alto)**: el contenido no se recorta; se permite desplazamiento vertical.
- **Subtítulo de dos líneas**: el título no se mueve.

## Escenario 4 — Sin textura de puntos (FR-006, SC-008)

1. Abrir `/`, `/jugar` (intro), el flujo previo (crear-personaje, modalidad, variante) y una carrera completa.
2. Comprobar que en ningún caso aparece la textura de puntos: ni en el fondo, ni en el header, ni en el pie.

**Esperado**: la textura de puntos no existe en ninguna pantalla.

## Escenario 5 — Header negro y anclado (FR-016, SC-009)

1. En cualquier página, comprobar que el header tiene **fondo negro plano**.
2. Hacer scroll: el header permanece **anclado arriba** y se sobrepone al contenido.
3. En `/jugar`, anotar `--alto-cabecera` (o la posición del `h2`) antes y después de hacer scroll y confirmar que no cambia.

**Esperado**: header opaco y sticky; sin saltos de layout ni alteración de las alturas del resto de pantallas.

## Comandos de verificación

```bash
npm run check          # typecheck + lint + tests unitarios
npx playwright test tests/e2e/layout-previo.spec.ts   # alineación de cabecera (nuevo)
npx playwright test tests/e2e/jugar.spec.ts tests/e2e/chrome.spec.ts tests/e2e/layout-estable.spec.ts
```

## Criterios de aceptación (ver spec)

- Posición del título y subtítulo de modalidad = los de creación (±2 px): SC-001, SC-002.
- Estilo idéntico: SC-007.
- Sin recorte ni scroll horizontal en móviles: SC-003.
- Sin violaciones graves de accesibilidad: SC-004.
- Elección de modalidad en un toque: SC-005.
- Textura de puntos: ausente en todo el producto: SC-008.
- Header negro plano y anclado, sin alterar alturas: SC-009.

## Referencias

- Contrato de layout: [contracts/layout.md](./contracts/layout.md)
- Modelo de layout y tokens: [data-model.md](./data-model.md)
- Decisiones técnicas: [research.md](./research.md)
