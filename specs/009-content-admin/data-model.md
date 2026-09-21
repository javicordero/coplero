# Phase 1 — Data Model: Panel local de situaciones y volcado al juego

Todas las entidades reutilizan los tipos y esquemas de `src/content/schema.ts`. **No se define un
modelo paralelo.** El almacén guarda únicamente situaciones en la v1.

## Almacen

Fichero `content-admin/data/situaciones.json`. Forma raíz:

```jsonc
{
  "version": 1,                 // versión del esquema del almacén (migraciones futuras)
  "situaciones": [ /* Situacion[] */ ]
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `version` | `number` entero | Obligatorio. `1` en esta versión. |
| `situaciones` | `Situacion[]` | Puede estar vacío. Ids únicos en todo el almacén. |

**Esquema Zod** (`src/panel/esquema.ts`): `z.strictObject({ version: z.literal(1), situaciones: z.array(SituacionSchema) })` + `superRefine` que rechaza **ids de situación duplicados**. Reutiliza `SituacionSchema` importado de `src/content/schema.ts`.

**Escritura**: atómica (temporal + `rename`) y siempre precedida de copia en
`content-admin/data/backups/<ISO>.json`.

## Situacion (existente, `src/content/schema.ts`)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | sí | Único. Inmutable al editar. |
| `momento` | `"verano" \| "febrero"` | sí | Determina a qué fichero se vuelca (con `tipo`). |
| `tipo` | `"contenido" \| "personaje"` | sí | Determina a qué fichero se vuelca (con `momento`). |
| `categoria` | `Categoria` | sí | `letra`·`musica`·`puestaEnEscena`·`jurado`·`dinero`·`grupo`·`prensa`·`carrera`·`concurso`. Solo etiqueta y agrupación del panel. |
| `titulo` | string | sí | no vacío |
| `texto` | string | sí | Puede ser `""`. |
| `opciones` | `Opcion[]` | sí | **Mínimo 2**, ids únicos dentro de la situación. |
| `modalidades` | `Modalidad[]` | no | Ausente = común a ambas. |
| `variantes` | string[] | no | Deben existir en el catálogo (`variantes.ts`) y pertenecer a sus modalidades. |
| `minAno` | number | no | Año mínimo de aparición. |
| `unicaVez` | boolean | no | |
| `peso` | number | no | > 0. |

## Opcion (existente, `src/content/schema.ts`)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | sí | Único dentro de su situación. |
| `titulo` | string | sí | |
| `subtitulo` | string | sí | |
| `excepcion` | boolean | no | `true` = excepción declarada. |
| `efectos` | `Partial<Record<Atributo, number>>` | no | Solo si `excepcion === true`. Regla **bicondicional** ya vigente (008): `efectos` ⇔ `excepcion`. |
| `flags` | string[] | no | Flags que deja la opción. |
| `consume` | string[] | no | Flags que consume (las marca consumidas, no las borra). |
| `peso` | number | no | |
| `saltaCOAC` | boolean | no | Opción que implica no concursar. |
| `cambiaModalidad` | `Modalidad` | no | Solo en `momento: "verano"`. |
| `cambiaVariante` | string | no | Debe existir en el catálogo. Incompatible con `cambiaModalidad`. |

## Catálogos cerrados (solo lectura en el panel)

`MOMENTOS`, `TIPOS_DECISION`, `CATEGORIAS`, `ATRIBUTOS`, `MODALIDADES`, `FASES_COAC`
(`src/content/modalidades.ts`) y `VARIANTES` (`src/content/variantes.ts`). El panel los consume para
construir desplegables; **nunca** inventa valores (FR-014).

## Condicional y textos (fuera del almacén, v1)

`Condicional` (situación + `requiere`, `ventanaAnos`, `probabilidad`, `consumeFlag`, `prioridad`) y
los textos de tarjeta **no** se editan en el panel y **no** los toca el volcado. Se leen del
contenido actual solo para la validación cruzada del banco completo.

## Ficheros generados (salida del volcado)

| Fichero | Exportación | `momento` | `tipo` |
|---|---|---|---|
| `src/content/decisiones/verano/contenido.ts` | `situacionesVeranoContenido` | verano | contenido |
| `src/content/decisiones/verano/personaje.ts` | `situacionesVeranoPersonaje` | verano | personaje |
| `src/content/decisiones/febrero/contenido.ts` | `situacionesFebreroContenido` | febrero | contenido |
| `src/content/decisiones/febrero/personaje.ts` | `situacionesFebreroPersonaje` | febrero | personaje |

Cada fichero se escribe con una cabecera de aviso:

```ts
// GENERADO por `npm run panel:volcar` — no editar a mano.
import type { Situacion } from "../../schema"

export const situacionesVeranoContenido: Situacion[] = [ /* ...ordenado por id... */ ]
```

**Sin pérdida (FR-017)**: el volcado copia cada situación tal cual desde el almacén; la unión de los
cuatro ficheros generados es, campo a campo, el array `situaciones` del almacén.

## Reglas de validación (reutilizadas, no reimplementadas)

1. **Por situación** (al guardar en el panel): `SituacionSchema` → campos obligatorios, mínimo 2
   opciones, ids de opción únicos, regla bicondicional `efectos`⇔`excepcion`, `cambiaModalidad` solo
   en verano, variantes del catálogo.
2. **Por almacén** (al guardar): ids de situación únicos.
3. **Banco completo** (al volcar): `BancoContenidoSchema` con el almacén + los condicionales,
   variantes y textos vigentes → id único global, toda flag referenciada existe, variante/ modalidad
   coherentes, `cambiaModalidad` solo verano, y existe una situación **común** por cada
   `momento`×`tipo`.

## Máquina de estados (de un registro)

```text
        importar (banco .ts)         crear (formulario)
                 │                            │
                 ▼                            ▼
   ┌────────────────────────── almacén JSON ──────────────────────────┐
   │   [situación] ──editar──▶ [situación] ──eliminar──▶ (eliminada)   │
   └──────────────────────────────────────────────────────────────────┘
                 │
                 │ volcar (validación banco completo)
                 ▼
   src/content/decisiones/**/*.ts  ──build──▶ bancoContenido (Zod)
```

**Fallos**: si el guardado no valida, no se escribe nada (el almacén queda intacto). Si el volcado
no valida el banco, se detiene con el detalle de errores y **no** sobrescribe ningún `.ts`.
