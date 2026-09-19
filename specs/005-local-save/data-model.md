# Phase 1 — Data Model: Persistencia local de la partida

Sin backend. Todos los datos viven en el `localStorage` del navegador. Las entidades son serializables y sin clases.

## Entities

### Sobre de guardado (`ContenidoGuardado`)

| Campo | Tipo | Regla |
|---|---|---|
| `version` | `number` | MUST ser un número y coincidir con `VERSION_GUARDADO`; si no, el sobre es no restaurable |
| `partida` | `string` | MUST ser la `Partida` serializada por el `engine`; un tipo distinto lo hace no restaurable |

Un único sobre por navegador, bajo la clave `coplero:partida`.

### Partida guardada (`Partida` del `engine`)

Sin cambios en el motor (ver `src/engine/types.ts`). Campos relevantes para esta feature:

| Campo | Uso en persistencia |
|---|---|
| `version` | Segunda capa de validación vía `deserializar`; MUST coincidir con `VERSION_PARTIDA` |
| `seed`, `personaje`, `modalidad`, `variante` | Identidad de la carrera restaurada |
| `anoActual`, `momento`, `fase`, `atributos`, `flags`, `historial`, `temporadas`, `premios`, contadores | Estado exacto que MUST reproducirse (FR-003) |
| `fase` (`FasePartida`) | `"fin"` determina que la carrera está **terminada** (FR-016) |
| `destino` | Se guarda para poder reproducir la carrera, pero MUST NOT renderizarse ni revelarse (FR-014) |

### Versiones de esquema

| Constante | Significado | Valor v1 |
|---|---|---|
| `VERSION_GUARDADO` | Versión del formato del sobre (esta feature) | `1` |
| `VERSION_PARTIDA` | Versión del formato de `Partida` (motor, `engine/types.ts`) | `1` |

Regla: para restaurar, ambas deben coincidir. Un desajuste en cualquiera ⇒ no restaurable ⇒ descartar + aviso puntual.

### Estado del guardado (`EstadoGuardado`)

Derivado de la carga inicial; determina la pantalla inicial (FR-004, FR-016):

| Valor | Cuándo | Home |
|---|---|---|
| `"ninguno"` | No hay sobre, o se descartó | "Empezar" (+ aviso si se descartó) |
| `"en-curso"` | Hay sobre y `partida.fase !== "fin"` | "Continuar donde lo dejaste" + "Empezar de cero" |
| `"terminada"` | Hay sobre y `partida.fase === "fin"` | "Ver resultado" + "Empezar de cero" (sin "Continuar") |

### Resultado de carga (`ResultadoCarga`)

| Campo | Tipo | Regla |
|---|---|---|
| `partida` | `Partida \| null` | `null` si no hay nada o si el sobre no era restaurable |
| `descartado` | `boolean` | `true` solo si existía un sobre y se eliminó por no restaurable |

### Almacén (`Almacen`)

| Operación | Contrato |
|---|---|
| `getItem(clave)` | Devuelve `string \| null`; MUST NOT lanzar |
| `setItem(clave, valor)` | Escritura síncrona; si falla (cuota/permiso) se ignora; MUST NOT lanzar |
| `removeItem(clave)` | Borrado; MUST NOT lanzar |

Implementaciones: `localStorage` (navegador, tras sonda de disponibilidad) y almacén en memoria (tests).

## State transitions

```text
                 crear partida / decidir
   (nada) ───────────────────────────────▶ en-curso
     ▲                                        │
     │ empezar de cero                        │ fase === "fin"
     │                                        ▼
     └──────────────────────────────────  terminada
     │                                        │
     │  sobre no restaurable (versión/daño)   │ empezar de cero / nueva partida
     └────────────────────────────────────────┘
```

- **en-curso → en-curso**: cada decisión reescribe el sobre (FR-001).
- **en-curso → terminada**: al resolver la última temporada; el sobre se conserva (Q1-A).
- **cualquiera → eliminado**: "empezar de cero" (FR-009), crear nueva partida (FR-010) o descarte por no restaurable (FR-006/FR-007).
- **multi-pestaña**: sin transición de conflicto; la última escritura prevalece (Q4-A).

## Validation rules (trazabilidad a la spec)

| Regla | Requisito |
|---|---|
| Guardar tras cada decisión confirmada y al crear la partida | FR-001, FR-002 |
| La partida restaurada MUST ser deep-equal a la guardada | FR-003 |
| Detectar guardado al arrancar y ofrecer continuar | FR-004 |
| Todo sobre lleva `version` | FR-005 |
| Versión de sobre distinta ⇒ eliminar sin interpretar | FR-006 |
| JSON inválido, campos ausentes o tipos inesperados ⇒ eliminar | FR-007 |
| Aviso claro y no técnico + vía para empezar de cero | FR-008 |
| "Empezar de cero" elimina el sobre | FR-009 |
| Crear partida reemplaza el sobre | FR-010 |
| Una sola ranura | FR-011 |
| Sin almacenamiento ⇒ jugar igual, sin aviso | FR-012 |
| 0 dependencias de red/backend | FR-013 |
| `destino` nunca renderizado | FR-014 |
| Solo los datos que el jugador introduce para el personaje | FR-015 |
| `fase === "fin"` ⇒ resultado final, sin continuar | FR-016 |
