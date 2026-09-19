# Contract: estado de la isla y pantalla inicial

Contrato de comportamiento de `crearJuego` (`src/juego/estado.svelte.ts`) y de la pantalla `Intro.svelte`. La UI no contiene reglas de juego: envuelve al motor y a la capa de persistencia.

## Estado expuesto por `crearJuego(almacen, opciones?)`

| Campo | Tipo | Descripción |
|---|---|---|
| `pantalla` | `Pantalla` | `intro \| crear-personaje \| modalidad \| variante \| decision \| resultado \| fin \| error` |
| `partida` | `Partida \| null` | Carrera en memoria |
| `paso` | `Paso \| null` | Paso actual del motor |
| `resumen` | `ResumenCarrera \| null` | Resumen cuando la carrera termina |
| `error` | `ErrorMotor \| null` | Error del motor (incluye `VERSION_INCOMPATIBLE`) |
| `aviso` | `string \| null` | Mensaje amable y no técnico, o `null` |
| `estadoGuardado` | `"ninguno" \| "en-curso" \| "terminada"` | Sustituye a `hayGuardado`; deriva de la carga inicial |
| `modalidad` | `Modalidad \| null` | Selección en curso |

### Acciones

| Acción | Reglas |
|---|---|
| `empezar()` | Pasa a `crear-personaje`; limpia `aviso` y `error` |
| `crearPersonaje(datos)` | Normaliza; pasa a `modalidad` (aún no hay partida ni guardado) |
| `elegirModalidad(m)` | Pasa a `variante` |
| `elegirVariante(v)` | Crea la partida, calcula el primer paso y **guarda** (FR-002) |
| `elegirOpcion(id)` | Aplica la elección, calcula el siguiente paso y **guarda** (FR-001) |
| `continuar()` | Avanza resultado → siguiente decisión y **guarda** |
| `continuarPartida()` | Carga el sobre; si `descartado`, fija `aviso` y vuelve a `intro`; si `terminada`, muestra el resumen final; si `en-curso`, retoma el punto exacto (FR-003) |
| `reiniciar()` | Borra el sobre, resetea el estado y vuelve a `intro` (FR-009) |

### Invariantes

1. Nunca se guarda un estado intermedio: solo después de crear la partida o de confirmar una elección/avance.
2. Ninguna acción presenta un error técnico al jugador por causas de almacenamiento.
3. Restaurar una carrera produce exactamente el mismo `paso` que antes de cerrar (SC-001).
4. `estadoGuardado` se calcula una sola vez al arrancar; no se relee el almacén en cada render.

## Pantalla inicial (`Intro.svelte`)

Props: `estadoGuardado`, `aviso`, `onEmpezar`, `onContinuar`, `onVerResultado`.

| `estadoGuardado` | Elementos visibles |
|---|---|
| `"ninguno"` | Título + texto + (si `aviso`, aviso) + botón "Empezar" |
| `"en-curso"` | Título + texto + (si `aviso`, aviso) + botón principal "Continuar donde lo dejaste" + botón secundario "Empezar de cero" |
| `"terminada"` | Título + texto + (si `aviso`, aviso) + botón "Ver resultado" + botón "Empezar de cero" (sin "Continuar") |

### Reglas de UI

- Un solo botón principal por estado; "Empezar de cero" es siempre secundario cuando hay guardado.
- El aviso se renderiza como texto llano (nunca HTML) y se anuncia con `role="status"` + `aria-live="polite"` (R11).
- El aviso solo aparece si `cargar` descartó un sobre; como se elimina, no reaparece.
- No se muestra ningún dato de `destino` ni información oculta (FR-014).

## Datos de test (atributos `data-*` existentes)

`[data-testid="intro"]`, `[data-testid="continuar"]`, `[data-testid="empezar"]`; se añade `[data-testid="ver-resultado"]`. El contenedor expone `data-pantalla`, `data-momento` y `data-ano`.
