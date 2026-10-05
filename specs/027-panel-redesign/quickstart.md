# Quickstart: Rediseño integral del panel de contenido

**Feature**: `027-panel-redesign` · **Date**: 2026-10-05

Guía de validación. No contiene implementación.

## Prerrequisitos

- Node 22+, dependencias instaladas (`npm install`).
- Panel con contenido: `npm run panel:importar` si el almacén está vacío.

## Arranque

```bash
npm run dev
```

Abrir `http://localhost:4321/panel`.

## Escenarios de validación manual

### E1 · Identidad unificada

1. Abrir el panel (listado), abrir un detalle y un formulario.
2. **Esperado**: los tres usan la misma paleta, tipografía y estilos de control; no parece una herramienta distinta.

### E2 · Un solo lugar para la identidad

1. Cambiar temporalmente un token (p. ej. `--panel-primary` en `src/panel-ui/estilos.css`) y recargar.
2. **Esperado**: el cambio se refleja en cabecera, conmutador, tablas, detalle y formulario a la vez.
3. Revertir el cambio.

### E3 · Carcasa reconfigurada

1. **Esperado**: cabecera, conmutador de vista (situaciones/condicionales) y acción principal se distinguen con claridad; el conmutador marca la vista activa.
2. Estrechar la ventana a ~360 px: **Esperado** la cabecera se **apila** (título y contador; acciones y conmutador a ancho completo), sin desbordes.

### E4 · Estados

1. Con el almacén vacío: **Esperado** estado vacío que invita a importar.
2. Provocar un error de carga (p. ej. parar el servidor): **Esperado** mensaje legible con la identidad.

### E5 · Tablas en móvil (scroll interno)

1. Estrechar la ventana a ~360 px y abrir un listado con muchas columnas.
2. **Esperado**: la **página no desborda**; la **tabla** se desplaza horizontalmente dentro de su contenedor.

### E6 · Detalle

1. Abrir el detalle de una situación y de un condicional.
2. **Esperado**: identidad común, jerarquía clara y legible.

### E7 · Teclado

1. Recorrer el panel solo con teclado.
2. **Esperado**: conmutador, acciones, filas y formularios se alcanzan en orden lógico, con foco visible.

### E8 · El juego no cambia

1. Abrir `/jugar` y una página pública.
2. **Esperado**: sin cambios; el panel no afecta al juego.

## Validación automática

```bash
npx astro check     # compila los .svelte (0 errores)
npx biome check .   # lint/format de .ts
npx vitest run      # sin regresiones (los 2 de forma-carrera/T23 son ajenos)
```

## Criterios de aceptación verificables

| Escenario | Cubre |
|---|---|
| E1, E2 | US1 · FR-001, FR-002 · SC-001, SC-004 |
| E3, E4 | US2 · FR-003, FR-007 |
| E5, E6 | US3 · FR-004, FR-005, FR-006 · SC-002 |
| E7 | FR-008 · SC-003 |
| E8 | FR-011 |
| Validación automática | FR-009, FR-010 · SC-005 |
