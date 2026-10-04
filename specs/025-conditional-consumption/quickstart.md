# Quickstart: Consumo de flags por condicional

**Feature**: `025-conditional-consumption` · **Date**: 2026-10-05

Guía de validación de la feature. No contiene implementación; describe cómo comprobar que funciona.

## Prerrequisitos

- Node 22+, dependencias instaladas (`npm install`).
- Banco de contenido migrado (sin `consumeFlag`): `npm run panel:volcar` tras la migración del almacén.

## Validación automática

```bash
npm run test            # Vitest: motor, contenido y simulación
npx astro check         # Typecheck (0 errores)
npx biome check .       # Lint/format
```

> `npm run check` incluye `vitest run`; los 2 fallos de `forma-carrera` (T23) son preexistentes y
> ajenos a esta feature.

### V1 · Un condicional basado en una flag se agota solo

Test unitario (motor): montar una partida con una flag activa y un condicional que la requiere;
forzar su disparo y comprobar que, tras dispararse, `requisitoCumplido(requiere, estado, idCondicional)`
devuelve `false` para ese condicional. **Esperado**: no vuelve a salir.

### V2 · Una flag compartida no se gasta

Test unitario: dos condicionales `c` y `d` que requieren la misma flag. Disparar `c` (consumir para
`c`). **Esperado**: `requisitoCumplido(requiere, estado, "d")` sigue siendo `true`; `d` puede salir.

### V3 · Requisito compuesto `alguna`

Estado con `ano_callejero` activa y `ano_de_gira` ausente; condicional `requiere: alguna(ano_callejero,
ano_de_gira)`. Al dispararse, **esperado**: `ano_callejero.consumidaPor` incluye el condicional y
`ano_de_gira` no se toca.

### V4 · Requisito `ninguna`

Condicional `requiere: ninguna(x)` que se dispara. **Esperado**: no se consume ninguna flag.

### V5 · Re-ganar una flag no limpia el consumo

Flag consumida por `c`; una opción vuelve a dejar la misma flag. **Esperado**: `consumidaPor` sigue
incluyendo `c`; `c` no vuelve a salir por el mero hecho de re-ganarla.

### V6 · Campos de consumo retirados

- `src/content/schema.ts` no contiene `Opcion.consume` ni `Condicional.consumeFlag`.
- `npx vitest run src/content` valida el banco real sin esos campos.
- En el panel (`npm run dev` → `/panel`): el formulario de una opción **no** muestra el selector
  "consume"; el de un condicional **no** muestra la casilla de consumo.

### V7 · Versión del estado

Test unitario: `deserializar(JSON.stringify({ version: 2, ... }))` **esperado**:
`VERSION_INCOMPATIBLE`. Y una partida creada con la versión nueva hace round-trip sin pérdida.

### V8 · Volcado sin `consumeFlag`

```bash
npm run panel:volcar
```

**Esperado**: `src/content/condicionales/{verano,febrero}.ts` regenerados sin `consumeFlag`; el banco
valida.

## Criterios de aceptación verificables

| Escenario | Cubre |
|---|---|
| V1, V2 | US1 · FR-001, FR-002 · SC-001, SC-002 |
| V3, V4, V5 | FR-003, FR-004, FR-005, FR-009 |
| V6 | US2 · FR-006, FR-007, FR-008 · SC-003, SC-004 |
| V7 | US3 · FR-010, FR-011 |
| V8 | FR-008 |
| Validación automática | SC-005 |
