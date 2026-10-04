# Quickstart — Validación del rediseño de la portada

Guía para validar la feature de punta a punta. No incluye implementación; los detalles están en [contracts/ui.md](./contracts/ui.md) y [data-model.md](./data-model.md).

## Requisitos

- Node 22+ y dependencias instaladas (`npm install`).
- La portada actual (`/`) y las pantallas del juego operativas para comparar el lenguaje visual.

## 1. Validación manual del rediseño

```bash
npm run dev
```

Abrir `http://localhost:4321/` en vista móvil (DevTools, 320 px y 390 px) y comprobar:

1. **Hero**: se ven el `eyebrow`, el titular grande «Coplero», el subtítulo «Del creador de Acordes Gaditanos», el claim y el CTA «Empezar a jugar» (a todo el ancho y visible sin scroll); el hero **llena la primera pantalla** con un **fondo nocturno a sangre**.
2. **Continuidad**: el hero y el bloque explicativo se perciben como una unidad, con el mismo lenguaje visual que las pantallas del juego (display mayúsculas, superficies, acento).
3. **Bloque explicativo**: `h2` «Qué es Coplero y cómo funciona», la explicación y **4 pasos** (título + subtítulo); **no** aparece el compás SVG, sino un **ornamento tipográfico**.
4. **Ejemplo**: la tarjeta final de ejemplo con la **nueva carrera** (2027–2040: trayectoria hasta la final de 2035 y primer premio 2038; **2 agujas de oro** y **1 coplas por Andalucía**), su `h2` y su **ornamento**.
5. Sin scroll horizontal a 320 px ni con zoom al 200 %.

Comparar con `http://localhost:4321/jugar` (pantallas de creación) para confirmar que el lenguaje visual coincide.

## 2. Tests automáticos

```bash
# Unit: invariantes de 0 kB de JS en las páginas estáticas
npm run test -- estatico

# Unit: validez/coherencia de las fixtures de tarjeta (portada y dev)
npm run test -- ejemploTarjeta fixturesFin

# E2E: contrato de la portada (estructura, compás retirado, separador, ejemplo nuevo, enlaces, pie y axe)
npm run test:e2e -- landing

# E2E: accesibilidad, responsive, zoom, foco y reduced-motion de todas las superficies
npm run test:e2e -- visual

# Puerta completa
npm run check
```

**Resultado esperado**:
- `estatico.test.ts` verde: `index.astro` sin `client:` ni `<script>`.
- `ejemploTarjeta.test.ts` y `fixturesFin.test.ts` verdes: 3 hitos, códec y coherencia de la carrera 2027–2040.
- Portada con un `h1`, `#que-es` con 4 `li`, `[data-testid="tarjeta"]` con **7** hitos y **3** rosetas, sin `svg.regla-compas` en `#que-es` y con `[data-separador]`.
- `visual.spec.ts` verde: axe sin violaciones, sin scroll a 320 px ni al 200 %, objetivos ≥44 px, foco visible y sin movimiento con reduced-motion.
- `npm run check` pasa.

## 3. Registro de decisiones

- Confirmar que `docs/registro/decisiones-cerradas.md` recoge, en la fila «Elemento firma · regla de compás», la nota de que el compás se retira de la portada (2026-10-04, feature 022).

## 4. Producción

```bash
npm run build
```

- `dist/index.html` no incluye `<script>` y muestra la nueva portada.
- `/como-jugar`, las páginas legales, `/jugar` y `/r/[codigo]` no cambian.
