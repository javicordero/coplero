# Quickstart: Mejoras de usabilidad del formulario de situaciones

**Feature**: `024-form-ux-improvements` · **Date**: 2026-10-05

Guía de validación manual y automática de la feature. No contiene implementación; describe cómo
comprobar que funciona.

## Prerrequisitos

- Node 22+, dependencias instaladas (`npm install`).
- El almacén del panel existe o se puede importar:
  - `npm run panel:importar` (si `content-admin/data/situaciones.json` no existe o está en v1).

## Arranque

```bash
npm run dev
```

Abrir `http://localhost:4321/panel`.

> Fuera de desarrollo la ruta responde **404** (guard `import.meta.env.DEV`). Comprobable con
> `npm run build && npm run preview` y visitando `/panel`.

## Escenarios de validación manual

### E1 · Identificador derivado (situación)

1. Pulsar **Nueva situación**.
2. Escribir en el título: `Te dejan fuera por un punto`.
3. **Esperado**: el campo `id` se rellena solo con `te_dejan_fuera_por_un_punto`.
4. Cambiar el título por `¿Vas a ir al Falla?` antes de que el campo se fije.
5. **Esperado**: id sin acentos ni signos (`vas_a_ir_al_falla`).
6. Editar el id a mano (`mi_id_custom`) y volver a tocar el título.
7. **Esperado**: el id manual **no** se sobrescribe.

### E2 · Colisión de identificador

1. Crear una situación con un título cuyo slug ya exista (p. ej. copiar el título de una situación
   existente).
2. **Esperado**: el id propuesto lleva sufijo (`…_2`) y aparece un aviso de que se ha ajustado.
3. Guardar.
4. **Esperado**: se guarda sin error y sin pisar la existente.

### E3 · Casilla "repetible"

1. **Nueva situación**.
2. **Esperado**: la casilla **repetible** está desmarcada.
3. Rellenar lo mínimo y guardar sin tocarla.
4. Abrir la situación (`Detalle`): **Esperado**: aparece como "una sola vez".
5. Editar, marcar **repetible**, guardar.
6. Abrirla: **Esperado**: aparece como repetible.
7. Abrir una situación existente cualquiera: **Esperado**: la casilla refleja su estado real.

### E4 · Selector de flags (opción)

1. En una opción, abrir el control **flags** y el control **consume**.
2. **Esperado**: ambos ofrecen la lista de flags del banco; permiten marcar cero, una o varias.
3. En el control **flags** (dejar), escribir una flag nueva (p. ej. `mi_flag_nueva`) y añadirla.
4. **Esperado**: queda marcada y disponible en el selector para el resto del formulario. En **consume**, en cambio, no se puede crear una flag nueva.
5. Desmarcar todo en uno: **Esperado**: el campo queda vacío y el guardado no falla.
6. Guardar y reabrir: **Esperado**: las flags marcadas se conservan.

### E5 · Edición de condicionales

1. Cambiar la vista a **Condicionales**.
2. **Esperado**: se listan los condicionales por momento con su etiqueta de entidad.
3. Crear uno rellenando título (id derivado), requisito, ventana y probabilidad.
4. **Esperado**: se guarda validado.
5. Introducir `probabilidad` > 1 e intentar guardar: **Esperado**: rechazo con mensaje legible.

### E6 · Volcado

```bash
npm run panel:volcar
```

- **Esperado**: escribe `src/content/decisiones/{verano,febrero}.ts` **y**
  `src/content/condicionales/{verano,febrero}.ts`, con cabecera "GENERADO".
- `npm run panel:volcar -- --check` no escribe nada.

## Validación automática

```bash
npm run test          # Vitest: incluye identificadores, flags, esquema, crud, generador, importador
npx astro check       # Typecheck (0 errores)
npx biome check .     # Lint/format
```

> `npm run check` completo incluye `vitest run`; los 2 tests de `forma-carrera` (T23) siguen en rojo
> por una decisión ajena a esta feature y **no** cuentan como regresión de la 024.

## Criterios de aceptación verificables

| Escenario | Cubre |
|---|---|
| E1, E2 | US1 · FR-001…FR-006, FR-021 · SC-001, SC-003, SC-005, SC-007 |
| E3 | US2 · FR-007…FR-010, FR-016 · SC-002 |
| E4 | US3 · FR-011…FR-013, FR-015, FR-022 · SC-004 |
| E5 | US4 · FR-017…FR-020 · SC-006 |
| E6 | FR-014 (el modelo y el motor no cambian) |
