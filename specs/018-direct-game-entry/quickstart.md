# Quickstart: validar la entrada directa al juego

**Feature**: `018-direct-game-entry` | **Date**: 2026-10-01

Guía de validación end-to-end. No incluye implementación; los detalles están en `plan.md`, `data-model.md` y `contracts/estado.md`.

## Requisitos

- Node 22+
- Dependencias instaladas (`npm install`)

## Comandos

```bash
npm run dev          # servidor de desarrollo (Astro)
npm run check        # typecheck + lint + format + tests unitarios
npm run test         # Vitest (estado y persistencia)
npm run test:e2e     # Playwright
```

## Escenario A — Primera visita sin partida (debe empezar directo)

1. Abrir una ventana de incógnito (sin `localStorage`).
2. Ir a `/jugar`.
3. **Esperado**: se ve directamente la creación de personaje; **no** aparece ninguna pantalla con «Empezar»/«Continuar».

## Escenario B — Reanudar una partida en curso

1. En `/jugar`, crear un personaje, elegir modalidad y variante, y avanzar una decisión.
2. Recargar la página.
3. **Esperado**: aparece la pantalla de reanudación con «Continuar donde lo dejaste» y «Empezar una partida nueva».
4. Pulsar «Continuar donde lo dejaste».
5. **Esperado**: se retoma la partida en el mismo punto (mismo año/momento que antes de recargar).

## Escenario C — «Nueva partida» no destruye el progreso (FR-007)

1. Partiendo del escenario B (con partida en curso), pulsar «Empezar una partida nueva».
2. **Esperado**: se accede a la creación de personaje; el guardado anterior **sigue** en `localStorage` (`coplero:partida`).
3. Recargar sin crear personaje.
4. **Esperado**: vuelve a aparecer la pantalla de reanudación (el progreso anterior no se perdió).

## Escenario D — Carrera terminada arranca directo (FR-005)

1. Completar una carrera hasta la tarjeta final.
2. Recargar `/jugar`.
3. **Esperado**: arranque directo en creación de personaje, sin pantalla de reanudación.

## Escenario E — Descarte silencioso (FR-008)

1. Con `localStorage` disponible, escribir en `coplero:partida` un sobre inválido:
   `{"version":999,"partida":"{}"}`.
2. Entrar a `/jugar`.
3. **Esperado**: arranque directo en creación de personaje, **sin ningún aviso**.

## Escenario F — Sin almacenamiento

1. Abrir el navegador en modo privado con almacenamiento bloqueado (o simular un almacén no-op).
2. Ir a `/jugar`.
3. **Esperado**: se puede jugar con normalidad; sin errores visibles ni avisos.

## Verificación automatizada

- Unitarios: `npm run test` — arranque según guardado, `empezar()` sin borrado, `reiniciar()` → `crear-personaje`, descarte silencioso.
- E2E: `npm run test:e2e` (o `npx playwright test tests/e2e/entrada-directa.spec.ts`) — escenarios A–E y accesibilidad (axe AA).
- Calidad global: `npm run check`.

## Criterios de aceptación cubiertos

- `spec.md` FR-001…FR-013 y SC-001…SC-007.
- Contrato de ganchos de test: `contracts/estado.md`.
