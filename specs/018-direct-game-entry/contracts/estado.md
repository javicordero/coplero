# Contrato: arranque del juego y API del estado (`src/juego/estado.svelte.ts`)

**Feature**: `018-direct-game-entry` | **Date**: 2026-10-01

Contrato de comportamiento de la isla. Cambia respecto a la versión anterior en el **enrutado inicial**, la **semántica de `empezar()`/`reiniciar()`/`continuarPartida()`** y la **retirada de `aviso`**.

## Tipo `Pantalla`

```ts
export type Pantalla =
  | "reanudar"        // antes "intro"; solo con partida en curso
  | "crear-personaje"
  | "modalidad"
  | "variante"
  | "cambio-variante"
  | "decision"
  | "resultado"
  | "fin"
  | "error"
```

## Interfaz pública (`Juego`)

| Miembro | Antes | Ahora |
|---------|-------|-------|
| `pantalla` | siempre `"intro"` al cargar | `"reanudar"` si `en-curso`; `"crear-personaje"` en el resto |
| `aviso` | `string \| null` | **eliminado** |
| `estadoGuardado` | igual | igual (solo cambia su uso en el arranque) |
| `empezar()` | iba a `crear-personaje` (tras `reiniciar()`) | lleva a `crear-personaje` **sin borrar** el sobre |
| `reiniciar()` | borraba y volvía a `intro` | borra, resetea y va a `crear-personaje` |
| `continuarPartida()` | ante descarte/ausencia, aviso + `intro` | ante descarte/ausencia, **en silencio** → `crear-personaje` |
| `codigo()`, `crearPersonaje()`, `elegirModalidad()`, `elegirVariante()`, `elegirOpcion()`, `elegirVarianteCambio()`, `continuar()`, `seleccionarGenero()` | sin cambios | sin cambios |

## Precondiciones / postcondiciones

- **Inicialización**: lee el sobre una vez. No lanza nunca (el almacén no-op y `cargar` ya lo garantizan).
  - Postcondición: `pantalla === "reanudar"` **si y solo si** `estadoGuardado === "en-curso"`.
- **`empezar()`**:
  - Precondición: ninguna.
  - Postcondición: `pantalla === "crear-personaje"`; el sobre guardado, si existía, **sigue presente** (no se llama a `borrar`).
- **`reiniciar()`**:
  - Postcondición: sobre borrado, estado reseteado, `pantalla === "crear-personaje"`.
- **`continuarPartida()`**:
  - Con sobre válido: carga la partida y `refrescarPaso()` (misma semántica que antes).
  - Con sobre descartado o ausente: `estadoGuardado === "ninguno"` y `pantalla === "crear-personaje"`; **sin** escribir `aviso`.

## Contrato de la pantalla de reanudación (`Reanudar.svelte`)

- Props: `onContinuar: () => void`, `onNuevaPartida: () => void`.
- Debe exponer:
  - `data-testid="reanudar"` en la sección raíz.
  - Un control `data-testid="continuar"` (acción primaria) que invoca `onContinuar`.
  - Un control `data-testid="nueva-partida"` que invoca `onNuevaPartida`.
- No debe mostrar aviso ni la rama de carrera terminada.
- Accesible: encabezado de nivel 1, controles con nombre accesible, foco operable por teclado.

## Contrato de la portada (`src/pages/index.astro`)

- Sin cambios: una única llamada a la acción hacia `/jugar` y **0 kB de JS**. No muestra opción de continuar.

## Contrato de tests (ganchos estables)

- `crear-personaje`: `data-testid="crear-personaje"` (ya existente).
- `reanudar`: `data-testid="reanudar"` (nuevo).
- `continuar`: `data-testid="continuar"` (se conserva).
- `nueva-partida`: `data-testid="nueva-partida"` (nuevo).
- `empezar`: **deja de existir**; ningún test debe depender de él.
