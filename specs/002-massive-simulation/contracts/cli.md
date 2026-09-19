# Contract: CLI `simular`

**Feature**: `002-massive-simulation` | **Type**: Contrato de línea de órdenes

## Invocación

```bash
npm run simular -- [N] [opciones]
```

El script del `package.json` MUST ser `tsx scripts/simular.ts` (sin N por defecto hardcodeado), de modo
que `npm run simular -- 10000` pase `10000` al CLI.

## Argumentos

| Argumento | Obligatorio | Por defecto | Descripción |
|---|---|---|---|
| `N` (posicional) | no | `10000` | Número de carreras. Entero positivo ≤ 100.000. |
| `--seed <base>` | no | `"sim"` | Base de las seeds. Cada carrera usa `<base>-<i>`. |
| `--json <ruta>` | no | — | Escribe el informe completo en JSON en esa ruta. |
| `--perfiles <ids>` | no | `aleatorio,codicioso,erratico` | Lista separada por comas. |
| `--quiet` | no | `false` | Omite el informe de texto (útil con `--json`). |
| `--help` | no | — | Muestra la ayuda y termina con código 0. |

El CLI **no** expone un argumento para inyectar el banco de contenido: resuelve internamente el banco
real de `content` cuando exista y, mientras tanto, el banco de pruebas (con nota de deuda en el
arranque). La validación con bancos manipulados (escenarios 5 y 7 de `quickstart.md`) se hace a nivel
de módulo con Vitest, no por CLI.

## Contrato de salida (stdout)

El informe de texto MUST incluir, en este orden:

1. Cabecera: nº de carreras, seed base, perfiles y configuración de la corrida, tiempo de ejecución.
2. Fases: `% pisa final`, `% no supera cuartos`, `% no supera preliminares`, `% no concursó nunca` y
   distribución de mejor fase (recuento + %).
3. Premios: media de primeros premios por carrera, distribución de premios ajenos por tipo, `%` de
   carreras con al menos un premio.
4. Duración media y distribución de años de pico.
5. Situaciones: ranking de más a menos frecuentes y lista de **nunca vistas**.
6. Condicionales: disparados y lista de **nunca disparados**.
7. Atributos: `min / max / media` de cada atributo.
8. Estados imposibles: lista de hallazgos o mensaje explícito de "ninguno detectado" (FR-024).
9. Errores: recuento por tipo o mensaje de "ninguno".

Además MUST incluir el desglose por perfil (todas las métricas) y por configuración (mejor fase,
premios y duración) — FR-028.

## Códigos de salida

| Código | Cuándo |
|---|---|
| `0` | Corrida completada sin errores de motor/contenido. |
| `1` | Corrida completada pero con al menos un error de motor/contenido registrado (FR-027). |
| `2` | Argumentos inválidos (N no entero, ≤ 0, > 100.000; `--json` sin ruta; perfil desconocido) (FR-003). |

## Contrato del JSON (`--json`)

Objeto equivalente a `InformeSimulacion` (ver `modulo-simulacion.md` y `data-model.md`). Debe ser
**comparable** entre corridas (mismas claves, mismos tipos). El tiempo de ejecución queda **fuera** del
JSON para que dos corridas idénticas produzcan JSON idéntico (FR-022).

## Ejemplos

```bash
# 10.000 carreras, informe en consola
npm run simular -- 10000

# 2.000 carreras y volcado a JSON
npm run simular -- 2000 --json informe.json

# Solo dos perfiles, sin texto
npm run simular -- 5000 --perfiles aleatorio,codicioso --json out.json --quiet
```
