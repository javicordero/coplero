# Quickstart: validación de la simulación masiva

**Feature**: `002-massive-simulation` | **Date**: 2026-09-18

Guía para validar de punta a punta el simulador. Detalles de forma en `contracts/cli.md` y
`contracts/modulo-simulacion.md`; tipos en `data-model.md`.

## Prerrequisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Banco de contenido disponible. Mientras no exista el banco real de `content`, el CLI usa el banco de
  pruebas con una nota de deuda visible en el arranque.

## Escenario 1 — Informe básico (P1)

```bash
npm run simular -- 200
```

**Esperado**: termina sin errores; imprime cabecera, fases, premios, duración, años de pico,
situaciones, condicionales, atributos, estados imposibles y errores; desglose por perfil y
configuración. Código de salida `0`.

## Escenario 2 — Volumen y rendimiento (P1)

```bash
npm run simular -- 10000
```

**Esperado**: completa 10.000 carreras en **< 30 s**; ninguna carrera abortada; código de salida `0`.

## Escenario 3 — JSON comparable (P3)

```bash
npm run simular -- 1000 --seed base-a --json a.json
npm run simular -- 1000 --seed base-a --json a2.json
```

**Esperado**: `a.json` y `a2.json` son **idénticos** (determinismo, FR-022). El tiempo de ejecución no
aparece en el JSON.

## Escenario 4 — Variedad de perfiles (P2)

```bash
npm run simular -- 3000 --perfiles aleatorio,codicioso,erratico
```

**Esperado**: el desglose por perfil muestra resultados distintos; con 3000 carreras y 3 perfiles, cada
perfil cubre 1000.

## Escenario 5 — Detección de anomalías (P2)

**Validación a nivel de módulo (Vitest), no por CLI**: el CLI no permite inyectar bancos. Se usa
`simular()` con un banco de prueba propio (una situación `unicaVez` inalcanzable o un condicional con
ventana incompatible).

**Esperado**: la situación/condicional aparece en las listas de "nunca vistas"/"nunca disparados". Si se
inyecta un estado incoherente conocido, aparece en "estados imposibles" con su `regla` y `seed`. Con un
banco sano, el informe dice explícitamente "ninguno detectado".

## Escenario 6 — Argumentos inválidos (Edge)

```bash
npm run simular -- 0
npm run simular -- abc
npm run simular -- 10 --perfiles inexistente
```

**Esperado**: mensaje de error claro y código de salida `2`; no se ejecuta ninguna carrera.

## Escenario 7 — Errores de contenido (Edge / FR-027)

**Validación a nivel de módulo (Vitest), no por CLI**: se llama a `simular()` con un banco que solo
cubre `verano`, de modo que falte contenido de `febrero`.

**Esperado**: se registra `CONTENIDO_INSUFICIENTE` agregado por tipo, el informe se emite igualmente y
`meta.generadoConError` es `true` (que en el CLI implica código de salida `1`).

## Puertas de calidad

```bash
npm run check
```

**Esperado**: `astro check` sin errores, `biome check` limpio y todos los tests de Vitest en verde,
incluidos los de `src/simulacion/__tests__/`.

## Criterios de aceptación cubiertos

| Escenario | Requisitos |
|---|---|
| 1 | FR-001, FR-002, FR-007, FR-008–FR-019, FR-028 |
| 2 | SC-003, FR-023 |
| 3 | FR-022, FR-025, SC-004 |
| 4 | FR-005, FR-006, SC-005 |
| 5 | FR-016, FR-017, FR-019, FR-024, SC-005, SC-006 |
| 6 | FR-003 |
| 7 | FR-027, SC-003 |
