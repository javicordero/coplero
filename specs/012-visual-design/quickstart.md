# Quickstart — Validar el sistema de diseño

**Feature**: 012-visual-design | **Fecha**: 2026-09-21

Guía para comprobar de punta a punta que la fase cumple. Los umbrales y el detalle de cada prueba viven en [`contracts/verificacion.md`](./contracts/verificacion.md); aquí solo está cómo ejecutarlo.

## Requisitos previos

- Node 22+ y dependencias instaladas (`npm install`).
- Navegadores de Playwright instalados (`npx playwright install`).
- **Ninguna dependencia nueva**: si `package.json` cambia durante esta fase, es un fallo (ver §5 de rechazo).

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:4321
```

## 1. Verificación automática (la puerta)

```bash
npm run check        # astro check + biome + vitest
npm run test:e2e     # Playwright: suite existente + visual.spec.ts
npm run build        # confirma el build de producción
```

**Resultado esperado**: `check` verde con los tests V-01…V-07 incluidos; `test:e2e` verde con E-01…E-07; build sin errores.

## 2. Contraste de la paleta (sin navegador)

```bash
npm run test -- src/ui/__tests__/tokens.test.ts
```

**Resultado esperado**: todos los pares de `contracts/ui.md` §2 pasan su umbral; si añades un color, el test falla hasta que declares su par y su umbral.

## 3. Sin colores sueltos ni dependencias de más

```bash
git grep -nE "#[0-9a-fA-F]{6}" -- src | Select-String -NotMatch "src/ui/","src/panel-ui/"
npm run build; git diff --stat package.json
```

**Resultado esperado**: sin resultados en el primer comando (fuera de `src/ui/` y `src/panel-ui/`); `package.json` sin cambios.

## 4. Recorrido manual

Con `npm run dev`:

1. `/` — la marca, el titular y el CTA usan la tipografía de marca y el elemento firma (regla de compás) es visible; el hero no desborda a 320 px.
2. `/jugar` — abrir una partida y comprobar: indicador de contexto con **color + texto** de momento; opciones con `hover`, `active` y foco visible por teclado; ningún control por debajo de 44 px.
3. Terminar una carrera — la tarjeta final se lee entera; probar "Compartir", "Copiar texto" y las dos descargas; los avisos aparecen en la región `aria-live`.
4. `/r/<codigo>` — navegar a una tarjeta compartida y compararla con la de `/jugar`: misma tipografía y paleta.
5. Abrir `http://localhost:4321/api/og/<codigo>.png` y `?t=9x16` y `?t=1x1` — la imagen usa la tipografía de marca, no DejaVu.
6. Con el sistema en "reducir movimiento", repetir el paso 2: sin transiciones perceptibles.
7. Zoom del navegador al 200 %: sin scroll horizontal ni solapamientos.

## 5. Comprobación de rendimiento

```bash
npm run build
npm run preview
```

**Resultado esperado**: la portada, `/como-jugar`, las legales y `/r/[codigo]` no ejecutan JavaScript; el bundle de la isla no crece respecto al baseline de la fase (comparar `dist/` antes y después).

## Referencias

- Tokens y su semántica: [`contracts/ui.md`](./contracts/ui.md)
- Entidades y reglas de validación: [`data-model.md`](./data-model.md)
- Decisiones y alternativas: [`research.md`](./research.md)
- Umbrales y criterios de rechazo: [`contracts/verificacion.md`](./contracts/verificacion.md)
