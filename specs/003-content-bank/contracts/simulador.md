# Contrato: integración del simulador con el banco real (T17)

## Cambio

`scripts/simular.ts` pasa a usar el banco real:

```ts
// antes
import { bancoPrueba } from "../src/engine/__tests__/fixtures"
// después
import { bancoContenido } from "../src/content"
```

El resto de la interfaz de la CLI **no cambia** (ver `specs/002-massive-simulation/contracts/cli.md`): mismos argumentos (`N`, `--seed`, `--json`, `--perfiles`, `--quiet`, `--help`), mismos códigos de salida (`0/1/2`) y mismo formato de informe.

## Garantías

- La CLI no importa de `src/engine/__tests__/` (se retira la deuda temporal comentada).
- El banco de pruebas `src/engine/__tests__/fixtures.ts` **se conserva** para los tests de `engine` y `simulacion`, que lo inyectan explícitamente; deja de ser fuente de la CLI.
- No se modifican parámetros del motor ni se recalibra (T13 queda aparte).
- Ejecución esperada: `npm run simular -- 10000` termina con código `0`.

## Regresión

- El test de imports del módulo de simulación (`src/simulacion/__tests__/imports.test.ts`) sigue prohibiendo que `src/simulacion` importe de `../engine/*` salvo `../engine/index`; el banco real se inyecta desde `scripts/`, no desde el módulo.
