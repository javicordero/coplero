# Phase 1 — Data Model: Panel local de contenido y volcado al juego

Todas las entidades reutilizan los tipos y esquemas de `src/content/schema.ts`. **No se define un
modelo paralelo.**

> Actualizado por la feature 024 (2026-10-05): el almacén pasa a **v2** y guarda el banco completo
> (situaciones **y** condicionales); el panel los edita a ambos y el volcado regenera
> `decisiones/**` y `condicionales/**`.

## Almacen

Fichero `content-admin/data/situaciones.json`. Forma raíz:

```jsonc
{
  "version": 2,                 // versión del esquema del almacén
  "situaciones": [ /* Situacion[] */ ],
  "condicionales": [ /* Condicional[] */ ]
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `version` | `number` entero | Obligatorio. `2` en esta versión. Un `1` se **migra** al leer (`condicionales: []`). |
| `situaciones` | `Situacion[]` | Puede estar vacío. |
| `condicionales` | `Condicional[]` | Puede estar vacío. |

**Esquema Zod** (`src/panel/esquema.ts`): `z.strictObject({ version: z.literal(2), situaciones:
z.array(SituacionSchema), condicionales: z.array(CondicionalSchema) })` + `superRefine` que rechaza
**ids duplicados en la unión** de situaciones y condicionales. Reutiliza los esquemas del contenido.

**Escritura**: atómica (temporal + `rename`) y siempre precedida de copia en
`content-admin/data/backups/<ISO>.json`.

## Situacion (existente, `src/content/schema.ts`)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | sí | Único global. Inmutable al editar. Derivado del título al crear (024). |
| `momento` | `"verano" \| "febrero"` | sí | Determina a qué fichero se vuelca. |
| `titulo` | string | sí | no vacío |
| `texto` | string | sí | Puede ser `""`. |
| `opciones` | `Opcion[]` | sí | **Mínimo 2**, ids únicos dentro de la situación. |
| `modalidades` | `Modalidad[]` | no | Ausente = común a ambas. |
| `variantes` | string[] | no | Deben existir en el catálogo (`variantes.ts`) y pertenecer a sus modalidades. |
| `minAno` | number | no | Año mínimo de aparición. |
| `unicaVez` | boolean | no | En la UI se presenta invertido como **"repetible"** (024). |
| `peso` | number | no | > 0. |

## Condicional (existente, `src/content/schema.ts`) — editable desde 024

`Condicional extends Situacion` y añade:

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `requiere` | `Requisito` | sí | Discriminado: `flag`, `flagRepetida`, `faseAlcanzada`, `todas`, `alguna`, `ninguna`, `atributo`. |
| `ventanaAnos` | number | sí | Entero positivo. |
| `probabilidad` | number | sí | Entre 0 y 1. |
| `prioridad` | number | no | |

## Opcion (existente, `src/content/schema.ts`)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | sí | Único dentro de su situación. Derivado del título al crear (024). |
| `titulo` | string | sí | |
| `subtitulo` | string | sí | |
| `excepcion` | boolean | no | `true` = excepción declarada. |
| `efectos` | `Partial<Record<Atributo, number>>` | no | Solo si `excepcion === true` (regla bicondicional, 008). |
| `flags` | string[] | no | Flags que deja la opción. Se eligen del catálogo; se puede crear una nueva (024). |
| `peso` | number | no | |
| `saltaCOAC` | boolean | no | Opción que implica no concursar. |
| `cambiaModalidad` | `Modalidad` | no | Solo en `momento: "verano"`. |
| `cambiaVariante` | string | no | Debe existir en el catálogo. Incompatible con `cambiaModalidad`. |

## Catálogos cerrados (solo lectura en el panel)

`MOMENTOS`, `ATRIBUTOS`, `MODALIDADES`, `FASES_COAC` (`src/content/modalidades.ts`) y `VARIANTES`
(`src/content/variantes.ts`). El panel los consume para construir desplegables; **nunca** inventa
valores (FR-014). El **catálogo de flags** no es un catálogo cerrado: se deriva de las flags
declaradas por las opciones (`src/panel/flags.ts`, reutiliza `flagsDeclaradas`).

## Textos de tarjeta

Los textos de tarjeta **no** se editan en el panel y **no** los toca el volcado. Se leen del contenido
actual solo para la validación cruzada del banco completo.

## Ficheros generados (salida del volcado)

| Fichero | Exportación | `momento` | Tipo importado |
|---|---|---|---|
| `src/content/decisiones/verano.ts` | `situacionesVerano` | verano | `Situacion` |
| `src/content/decisiones/febrero.ts` | `situacionesFebrero` | febrero | `Situacion` |
| `src/content/condicionales/verano.ts` | `condicionalesVerano` | verano | `Condicional` |
| `src/content/condicionales/febrero.ts` | `condicionalesFebrero` | febrero | `Condicional` |

Cada fichero se escribe con una cabecera de aviso:

```ts
// GENERADO por `npm run panel:volcar` — no editar a mano.
import type { Situacion } from "../schema"

export const situacionesVerano: Situacion[] = [ /* ...ordenado por id... */ ]
```

**Sin pérdida (FR-017)**: la unión de los ficheros de situaciones es, campo a campo, el array
`situaciones` del almacén; la de los de condicionales, el array `condicionales`.

## Reglas de validación (reutilizadas, no reimplementadas)

1. **Por entidad** (al guardar): `SituacionSchema` o `CondicionalSchema` → campos obligatorios, mínimo
   2 opciones, ids de opción únicos, regla bicondicional `efectos`⇔`excepcion`, `cambiaModalidad` solo
   en verano, variantes del catálogo, `probabilidad` en `[0,1]`, `ventanaAnos` positivo.
2. **Por almacén** (al guardar): ids únicos en la unión de situaciones y condicionales.
3. **Banco completo** (al volcar): `BancoContenidoSchema` con las situaciones y condicionales del
   almacén + variantes/modalidades/textos vigentes → id único global, toda flag referenciada existe,
   variante/modalidad coherentes, `cambiaModalidad` solo verano, y existe una situación **común** por
   cada `momento`.

## Máquina de estados (de un registro)

```text
        importar (banco .ts)         crear (formulario)
                 │                            │
                 ▼                            ▼
   ┌────────────────────────── almacén JSON v2 ──────────────────────────┐
   │   [situación|condicional] ──editar──▶ … ──eliminar──▶ (eliminada)    │
   └─────────────────────────────────────────────────────────────────────┘
                 │
                 │ volcar (validación banco completo)
                 ▼
   src/content/{decisiones,condicionales}/**/*.ts  ──build──▶ bancoContenido (Zod)
```

**Fallos**: si el guardado no valida, no se escribe nada (el almacén queda intacto). Si el volcado no
valida el banco, se detiene con el detalle de errores y **no** sobrescribe ningún `.ts`.
