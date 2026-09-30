# Quickstart — Validar el fondo estacional (tres estilos)

**Feature**: 015-seasonal-background | **Fecha**: 2026-09-30

Guía para comprobar de punta a punta que los tres estilos cambian y no rompen nada. Detalle en [`contracts/fondo.md`](./contracts/fondo.md).

## Requisitos previos

- Node 22+ y dependencias instaladas (`npm install`).
- **Ninguna dependencia nueva**: `package.json` no debe cambiar.

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:4321
```

## 1. Verificación automática (la puerta)

```bash
npm run check        # astro check + biome + vitest (incluye V-09)
```

**Resultado esperado**: `check` verde; V-09 pasa (texto oscuro sobre verano-claro y texto claro sobre febrero/resultado-oscuro, AA).

## 2. Sin colores sueltos fuera del sistema

```bash
git grep -nE "#[0-9a-fA-F]{6}" -- src | Select-String -NotMatch "src/ui/","src/panel-ui/"
npm run build; git diff --stat package.json
```

**Resultado esperado**: sin resultados en el primer comando; `package.json` sin cambios.

## 3. Recorrido manual

Con `npm run dev`, abrir `/jugar`:

1. **Verano**: fondo claro (cielo, sol en la **esquina superior derecha**, arena) y texto oscuro legible.
2. **Febrero**: fondo nocturno (luna en la **esquina superior derecha**) con **lluvia** de gotas cayendo; texto claro.
3. **Resultado**: tras el COAC, la pantalla de resultado muestra el estilo **acta/papel** (papel crema, membrete "COAC"), distinto de febrero.
4. **Lluvia**: en febrero se ven gotas cayendo de forma realista (cabeza/cola), no un patrón estático.
5. **Reducción de movimiento**: con el sistema en "reducir movimiento", la lluvia se congela y los cambios no animan.
6. **320 px**: sol, luna, arena, papel y lluvia se degradan sin scroll horizontal ni bandas.
7. **Estáticas**: `/` y `/como-jugar` no muestran fondo estacional ni ejecutan JS.

## 4. Comprobación de peso

```bash
npm run build
npm run preview
```

**Resultado esperado**: el bundle de la isla no crece de forma relevante (solo CSS; 0 imágenes, 0 dependencias nuevas).

## Referencias

- Reglas y tokens: [`contracts/fondo.md`](./contracts/fondo.md)
- Entidades y validación: [`data-model.md`](./data-model.md)
- Decisiones y alternativas: [`research.md`](./research.md)
