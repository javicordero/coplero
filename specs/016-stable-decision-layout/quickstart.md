# Quickstart — Layout estable del bucle jugable

Guía para validar la feature de extremo a extremo. Referencias: [spec.md](./spec.md),
[contracts/layout.md](./contracts/layout.md), [data-model.md](./data-model.md).

## Requisitos

- Node 22+
- `npm install`

## Arranque

```bash
npm run dev        # Astro en http://localhost:4321
```

Abre `http://localhost:4321/jugar` y crea una carrera (nombre + modalidad + variante).

## Escenario 1 — Página de decisión (manual)

1. Avanza hasta una decisión de **verano**.
2. Comprueba que el indicador (**Año N · Verano**, sin tipo) está en la **esquina superior izquierda**
   y el sol en la superior derecha.
3. Comprueba que la situación y las opciones están **centradas** en la pantalla.
4. Continúa hasta una decisión de **febrero** y verifica que el indicador (ahora Año N · Febrero), el
   título y las dos primeras opciones siguen en el **mismo sitio** (± 2 px).

Resultado esperado: ninguna pieza se mueve; no aparece el tipo de decisión.

## Escenario 2 — Resultado (manual)

1. Completa una temporada hasta la pantalla de **resultado**.
2. Comprueba que el indicador (**año y momento**) sigue en la esquina superior izquierda, en la misma
   posición que en las decisiones.

Resultado esperado: continuidad del indicador; el rediseño del acta queda para otra feature.

## Escenario 3 — Sin desbordamiento (manual)

1. Reduce el viewport a **320 px** de ancho.
2. Recorre varias decisiones con textos largos.
3. Comprueba que no hay scroll horizontal y que ningún bloque desborda ni solapa.

## Validación automatizada

```bash
npm run test       # Vitest (engine + content): sin regresiones
npm run test:e2e   # Playwright: carrera-completa, jugar, visual (axe, 320 px, 200 %)
npm run check      # typecheck + lint + format + tests
```

Nuevo test E2E (`tests/e2e/layout-estable.spec.ts`), según los invariantes del contrato:

- **INV-1..INV-4**: medir `boundingBox()` del indicador, título y dos primeras opciones; comparar
  entre decisiones (verano vs febrero, contenido vs personaje) y usar **0 px** en el cambio de
  momento.
- **INV-5**: el indicador del resultado coincide con el de decisión y muestra año y momento.
- **INV-6**: `scrollWidth ≤ innerWidth + 1` a 320 px.
- **INV-7**: `scrollHeight ≤ clientHeight + 1` en cada bloque fijo a lo largo de una carrera.
- **INV-8**: el indicador no muestra tipo ni `data-tipo`.

Actualizar `tests/e2e/carrera-completa.spec.ts`: el selector del indicador ya no está dentro de
`[data-testid="decision"]` y `data-tipo` desaparece; sustituir esa aserción o mover el invariante de
variedad a un test unitario.

Sugerencia de medición: esperar `networkidle` (fuentes cargadas) antes de medir para evitar falsos
positivos por la animación de entrada de 280 ms.

## Criterios de aceptación cubiertos

- FR-001..FR-015 y SC-001..SC-007 de la spec.
- Compatibilidad con la feature 015 (fondo estacional) y con las rutas estáticas (0 kB de JS).
