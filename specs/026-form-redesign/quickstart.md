# Quickstart: Formulario del panel: secciones plegables y rediseño

**Feature**: `026-form-redesign` · **Date**: 2026-10-05

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

### E1 · Plegado por defecto (situación)

1. Pulsar **Nueva situación**.
2. **Esperado**: las secciones **Modalidades** y **Variantes** aparecen plegadas; el resto de campos visible.

### E2 · Desplegar, editar y plegar

1. Desplegar **Modalidades**, marcar una; plegarla.
2. **Esperado**: se puede plegar y desplegar; el valor queda marcado.
3. Guardar y reabrir la situación.
4. **Esperado**: el valor se ha conservado (plegar no descarta).

### E3 · Indicador de contenido

1. Crear/editar una situación con **Modalidades** o **Variantes** marcadas y la sección plegada.
2. **Esperado**: la sección muestra un indicador de que tiene contenido, sin abrirla.

### E4 · Plegado en la opción (flags)

1. En una opción, **Esperado**: la sección **Flags** aparece plegada.
2. Desplegarla, marcar flags, plegarla, guardar y reabrir.
3. **Esperado**: los flags se conservan y el indicador aparece si hay alguno marcado.

### E5 · Condicional

1. Vista **Condicionales** → **Nuevo condicional**.
2. **Esperado**: **Modalidades** y **Variantes** plegadas; requisito, ventana y probabilidad visibles.

### E6 · Teclado

1. Recorrer el formulario solo con teclado (Tab/Shift+Tab).
2. **Esperado**: se alcanzan los encabezados de sección y los campos en orden lógico; Enter/Espacio despliega/pliega.

### E7 · Móvil

1. Estrechar la ventana a ~360 px (o modo responsive).
2. **Esperado**: no hay desbordes horizontales; los controles siguen siendo usables.

## Validación automática

```bash
npx astro check     # compila los .svelte (0 errores)
npx biome check .   # lint/format de .ts
npx vitest run      # sin regresiones (los 2 de forma-carrera/T23 son ajenos)
```

## Criterios de aceptación verificables

| Escenario | Cubre |
|---|---|
| E1, E4, E5 | US1 · FR-001, FR-002, FR-005 · SC-001 |
| E2, E3 | US1 · FR-003, FR-004, FR-011 |
| E6 | US2 · FR-006 · SC-002 |
| E7 | US2 · FR-008 · SC-003 |
| Validación automática | FR-009, FR-010 · SC-004 |
