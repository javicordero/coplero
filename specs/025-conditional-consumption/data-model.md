# Data Model: Consumo de flags por condicional

**Feature**: `025-conditional-consumption` · **Date**: 2026-10-05

Describe los cambios en el modelo del motor y en el modelo del contenido/panel. El resto de entidades
(`Personaje`, `Atributos`, `Temporada`, `Premio`, `Destino`, `TarjetaFinal`, `Trayectoria`) no cambia.

---

## 1. `Flag` (estado de partida) — CAMBIA

`src/engine/types.ts`

### Antes

```ts
interface Flag {
  ano: number
  veces: number
  consumida: boolean          // marca global
  anosConsecutivos: number
}
```

### Después

```ts
interface Flag {
  ano: number
  veces: number
  consumidaPor: string[]      // ids de condicionales que han consumido esta flag
  anosConsecutivos: number
}
```

| Campo | Tipo | Regla |
|---|---|---|
| `ano` | `number` | Año en que se ganó por última vez. |
| `veces` | `number` | Total de veces ganada. |
| `consumidaPor` | `string[]` | Ids de condicionales que la han consumido. Vacío = no consumida por ninguno. No se limpia al re-ganar la flag. |
| `anosConsecutivos` | `number` | Años seguidos ganándola. |

**Regla semántica**: una flag consumida por el condicional `c` **sigue** existiendo y sigue
cumpliendo requisitos de **otros** condicionales; solo deja de cumplir los de `c`.

---

## 2. `Partida` (estado) — CAMBIA la versión

`src/engine/types.ts`

| Campo | Antes | Después |
|---|---|---|
| `version` | `VERSION_PARTIDA = 2` | `VERSION_PARTIDA = 3` |

El resto de claves de `Partida` no cambia (sigue teniendo `flags`, `vistas`, `historial`, etc.). El
contenido de `flags` sí cambia de forma (ver §1). Una partida con `version !== 3` se rechaza con
`VERSION_INCOMPATIBLE` (`src/engine/serializar.ts`, ya existente).

**Transiciones de estado del consumo** (por condicional `c` y flag `f`):

```
f no existe ──(opción deja f)──▶ { consumidaPor: [] }
{ consumidaPor: [] } ──(se dispara c, f activa)──▶ { consumidaPor: ["c"] }
{ consumidaPor: ["c"] } ──(se vuelve a ganar f)──▶ { consumidaPor: ["c"] }   (no se limpia)
{ consumidaPor: ["c"] } ──(se evalúa c)──▶ requisito de f NO se cumple para c
{ consumidaPor: ["c"] } ──(se evalúa otro condicional d)──▶ requisito de f SÍ se cumple para d
```

---

## 3. `Opcion` (contenido) — CAMBIA

`src/content/schema.ts`

| Campo | Antes | Después |
|---|---|---|
| `consume` | `string[]?` (flags que consume) | **eliminado** |

El resto de campos (`flags`, `efectos`, `excepcion`, `saltaCOAC`, `cambiaModalidad`, `cambiaVariante`,
`peso`) no cambia.

---

## 4. `Condicional` (contenido) — CAMBIA

`src/content/schema.ts`

| Campo | Antes | Después |
|---|---|---|
| `consumeFlag` | `boolean` | **eliminado** |

`requiere`, `ventanaAnos`, `probabilidad`, `prioridad` no cambian.

---

## 5. `Almacen` (panel) — CAMBIA la versión

`src/panel/esquema.ts` y `content-admin/data/situaciones.json`

| Campo | Antes | Después |
|---|---|---|
| `version` | `VERSION_ALMACEN = 2` | `VERSION_ALMACEN = 3` |
| `situaciones` | `Situacion[]` | sin cambios de forma (las opciones pierden `consume`) |
| `condicionales` | `Condicional[]` | sin cambios de forma (pierden `consumeFlag`) |

**Migración** (`migrarAlmacen`):

```
v1 { version:1, situaciones }                     ─▶ v3 { situaciones, condicionales: [] }
v2 { version:2, situaciones, condicionales }      ─▶ v3 quitando `consume` y `consumeFlag`
v3                                                ─▶ tal cual
```

---

## 6. `DecisionRegistrada` (simulación) — CAMBIA

`src/simulacion/tipos.ts`

| Campo | Antes | Después |
|---|---|---|
| `consume` | `string[]` | **eliminado** |

---

## 7. Reglas de validación

**Contenido** (`content/schema.ts`, sin cambios salvo quitar campos): siguen vigentes el mínimo de 2
opciones, la regla bicondicional `efectos ⇔ excepcion`, la coherencia de variantes y la cobertura por
momento. Se **elimina** la comprobación de integridad que exigía que `consume` estuviera vacío (el
campo ya no existe).

**Motor** (`condicionales.ts`):

1. `requisitoCumplido(req, estado, consumidor?)`: `flag`/`flagRepetida` no se cumplen si `consumidor`
   está en `flag.consumidaPor`; los compuestos propagan `consumidor`.
2. `consumirFlagsDeRequisito(flags, req, condicionalId)`: añade `condicionalId` a `consumidaPor` de las
   flags referenciadas por `req` **que existan** en el historial; nunca borra flags.
3. `dentroDeVentana` no cambia (la ventana sigue dependiendo de `ano`, no del consumo).

**Auditoría** (`simulacion/auditoria.ts`): `flagConsumidaSinRegistro` = `flag.consumidaPor.length > 0 &&
!introducidas.has(id)`.
