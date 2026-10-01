# Phase 1 — Data Model: Entrada directa al juego

**Feature**: `018-direct-game-entry` | **Date**: 2026-10-01

Este cambio **no modifica** el modelo de datos del motor (`Partida`) ni el formato del sobre guardado. Solo cambia cómo la UI decide su pantalla inicial a partir del estado ya existente (`EstadoGuardado`).

## Entidades existentes

### EstadoGuardado

Valor derivado del sobre guardado, ya presente en `src/juego/persistencia.ts`:

| Valor | Origen | Nueva interpretación en el arranque |
|-------|--------|-------------------------------------|
| `ninguno` | no hay sobre, o se descartó por inválido/incompatible | arranque directo en `crear-personaje` (sin aviso) |
| `en-curso` | sobre válido con `partida.fase !== "fin"` | pantalla de reanudación (`reanudar`) |
| `terminada` | sobre válido con `partida.fase === "fin"` | arranque directo en `crear-personaje` (no se ofrece reanudar) |

### Pantalla (UI)

Tipo del estado de la isla (`src/juego/estado.svelte.ts`). Cambios:

- Se renombra `intro` → `reanudar`.
- El resto de valores (`crear-personaje`, `modalidad`, `variante`, `cambio-variante`, `decision`, `resultado`, `fin`, `error`) no cambian.

## Reglas de arranque (contrato de decisión)

| Condición | `pantalla` inicial | Acción disponible |
|-----------|--------------------|-------------------|
| `EstadoGuardado === "en-curso"` | `reanudar` | `continuarPartida()` o `empezar()` |
| `EstadoGuardado === "ninguno"` | `crear-personaje` | `crearPersonaje()` |
| `EstadoGuardado === "terminada"` | `crear-personaje` | `crearPersonaje()` |
| almacén no disponible | `crear-personaje` | `crearPersonaje()` |

## Transiciones de estado relevantes

```text
  [carga] ── en-curso ──► reanudar ── continuarPartida() ──► decision | resultado | cambio-variante | fin
                              │
                              └─ empezar() ──► crear-personaje   (NO borra el sobre)

  [carga] ── ninguno/terminada ──► crear-personaje

  crear-personaje ─► modalidad ─► variante ─► (crearPartida + guardar → sobrescribe el sobre) ─► decision

  decision | resultado ─► ... ─► fin ── reiniciar() ──► crear-personaje   (borra el sobre)
```

## Invariantes

- El sobre anterior **solo** se sobrescribe cuando se persiste una partida nueva (`persistir()` tras crear/elegir). `empezar()` no borra (FR-007).
- El descarte de un sobre inválido no produce mensajes (`aviso` eliminado) — FR-008.
- `estadoGuardado === "terminada"` no da lugar a la pantalla de reanudación — FR-005.
- El motor (`Partida`, `Paso`, `TarjetaFinal`) y `VERSION_GUARDADO`/`VERSION_PARTIDA` no se modifican — FR-009.

## Entidades de UI nuevas

### Pantalla de reanudación (`Reanudar.svelte`)

- **Entradas**: `onContinuar: () => void`, `onNuevaPartida: () => void`.
- **Salidas (semántica)**: invoca una de las dos acciones.
- **Ganchos de test**: `data-testid="reanudar"`, `data-testid="continuar"`, `data-testid="nueva-partida"`.
- **No** recibe `estadoGuardado`, `aviso` ni `onVerResultado`.

### Estado `aviso` (retirado)

- Se elimina de `Juego` (`estado.svelte.ts`) y de `presentacion.ts` (`AVISO_GUARDADO_DESCARTADO`), junto con sus usos en `Juego.svelte` y en la antigua `Intro.svelte`.
