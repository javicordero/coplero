# Quickstart — Recorrido E2E de una carrera completa (E2E-001)

Guía para validar la prueba integrada del camino feliz. Contrato en
[contracts/observabilidad.md](./contracts/observabilidad.md) y modelo en [data-model.md](./data-model.md).

## Requisitos

- Node 22+ y dependencias instaladas (`npm install`).
- Navegadores de Playwright instalados (`npx playwright install chromium` si hace falta).
- El `webServer` de Playwright arranca `npm run dev` por su cuenta (puerto 4321).

## 1 · Ejecutar solo E2E-001 (SC-001)

```bash
npx playwright test tests/e2e/carrera-completa.spec.ts
```

**Esperado**: 1 prueba verde, con los **10 pasos** de `test.step()` visibles en el informe, en menos
de 60 s (SC-004). El paso 7 muestra la tarjeta; el 8 recupera tras recargar; el 10 reproduce la
tarjeta desde el enlace.

## 2 · Ejecutar la suite E2E completa (SC-006)

```bash
npm run test:e2e
```

**Esperado**: todas las pruebas verdes, incluidas `jugar.spec.ts`, `compartir.spec.ts`,
`chrome.spec.ts`, `landing.spec.ts` y `visual.spec.ts`. Ninguna cobertura previa se pierde.

## 3 · Comprobar la reproducibilidad (SC-003)

```bash
1..5 | ForEach-Object { npx playwright test tests/e2e/carrera-completa.spec.ts }
```

**Esperado**: las cinco ejecuciones dan el mismo veredicto (verde) con seeds distintas, porque la
prueba verifica flujo y estructura, no valores concretos.

## 4 · Comprobar la diagnosis (SC-002, SC-007)

Rompe un hito a propósito, por ejemplo cambiando el `data-testid` del botón `continuar` o forzando
`pantalla = "error"`, y vuelve a ejecutar.

**Esperado**: la prueba **falla** y el informe señala el paso concreto ("recargar y recuperar"),
no un tiempo agotado genérico. Revertir el cambio la devuelve a verde.

## 5 · Comprobación global

```bash
npm run check
npm run test:e2e
```

**Esperado**:
- `npm run check`: `astro check`, Biome y Vitest verdes; sin cambios en `engine`/`content` (SC-006).
- `npm run test:e2e`: suite E2E verde.

## Trazabilidad con los criterios

| Paso | Criterios |
|---|---|
| 1 | SC-001, SC-004, SC-007 |
| 2 | SC-006 |
| 3 | SC-003 |
| 4 | SC-002, SC-007 |
| 5 | SC-006 |

## Hitos cubiertos

| # | Hito | Paso del test |
|---|---|---|
| 1 | Entrar en `/jugar` | `test.step("1 · entrar en /jugar")` |
| 2 | Crear personaje | `test.step("2 · crear personaje")` |
| 3 | Elegir modalidad | `test.step("3 · elegir modalidad")` |
| 4 | Elegir variante | `test.step("4 · elegir variante")` |
| 5 | Completar varias decisiones | `test.step("5 · completar varias decisiones")` |
| 6 | Completar la carrera | `test.step("6 · completar la carrera")` |
| 7 | Tarjeta final | `test.step("7 · tarjeta final")` |
| 8 | Recargar y recuperar | `test.step("8 · recargar y recuperar partida")` |
| 9 | Código compartible | `test.step("9 · generar código compartible")` |
| 10 | Abrir `/r/[codigo]` | `test.step("10 · abrir /r/[codigo]")` |

## Resultados de la validación (2026-09-21)

| Comprobación | Resultado |
|---|---|
| E2E-001 (10 hitos) | **1/1 verde**, ~19 s; los 10 `test.step` visibles en el informe |
| Reproducibilidad (SC-003) | **5/5 verde** con `--repeat-each=5` (~19 s cada una) |
| Duración (SC-004) | ~19 s **< 60 s** |
| Red externa (SC-005) | **0** peticiones a orígenes externos (listener verde) |
| Diagnóstico (SC-002, SC-007) | Al romper `data-testid="continuar"`, falla nombrando «**8 · recargar y recuperar partida**»; anclaje revertido |
| Suite E2E completa (SC-006) | **27/27 verde** (1,2 m) |
| `npm run check` | astro check 0 errores, Biome limpio, **311 tests** Vitest verdes |

> El hito 8 (recargar y recuperar) se ejecuta **a mitad de carrera**, antes de terminar (hito 6) y de la tarjeta (hito 7): la recuperación es una acción de mitad de partida. Los `test.step` conservan su numeración de hito, no el orden de ejecución.
