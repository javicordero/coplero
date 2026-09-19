# Data Model: Banco de contenido real

Entidades y reglas del banco. Los nombres de campos coinciden con `src/engine/types.ts` para que la compatibilidad estructural (D1) sea directa.

## Enumeraciones (valores cerrados)

| Enum | Valores |
|---|---|
| `Momento` | `verano`, `febrero` |
| `TipoDecision` | `contenido`, `personaje` |
| `Categoria` | `letra`, `musica`, `puestaEnEscena`, `jurado`, `dinero`, `grupo`, `prensa`, `carrera`, `concurso` |
| `Atributo` | `letra`, `musica`, `puestaEnEscena`, `popularidad`, `cohesion`, `dinero` |
| `Modalidad` | `comparsista`, `chirigotero` |

`variantes` es un filtro opcional de ids libres; el banco documentado no lo usa (D5).

## Entidad: `Opcion`

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `string` | Único dentro de la situación; no vacío. |
| `titulo` | `string` | No vacío (obligatorio). |
| `subtitulo` | `string` | No vacío (obligatorio). |
| `efectos` | `Partial<Record<Atributo, number>>` | Solo atributos válidos; enteros (positivos o negativos). |
| `flags` | `string[]` | Opcional; ids de flag que deja la opción. |
| `consume` | `string[]` | No usado en este banco. |
| `saltaCOAC` | `boolean` | `true` solo en opciones que implican no concursar (D3). |

## Entidad: `Situacion`

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `string` | Único en todo el banco; prefijo `v_`/`f_` (D9). |
| `momento` | `Momento` | **Obligatorio**. |
| `tipo` | `TipoDecision` | **Obligatorio**. |
| `categoria` | `Categoria` | **Obligatoria**. |
| `titulo` | `string` | Nombre documentado (D4). |
| `texto` | `string` | Vacío (D4). |
| `opciones` | `Opcion[]` | `>= 2`; ids únicos dentro de la situación. |
| `modalidades` | `Modalidad[]` | Opcional; solo donde la doc lo indique (cierre de popurrí de febrero). |
| `variantes` | `string[]` | No usado. |
| `minAno` | `number` | No usado. |
| `unicaVez` | `boolean` | `true` en todo el banco (D5). |

## Entidad: `Condicional` (extiende `Situacion`)

| Campo | Tipo | Regla |
|---|---|---|
| `requiere` | `Requisito` | Mapeado desde la doc (D2). |
| `ventanaAnos` | `number` | Tomado de la columna "Ventana / prob.". |
| `probabilidad` | `number` | `0..1`, tomado de la doc. |
| `consumeFlag` | `boolean` | `false` en este banco. |
| `prioridad` | `number` | Opcional; no usado salvo que dos condicionales compitan. |

### `Requisito` (unión)

`flag` · `flagRepetida` (`veces`, `consecutivos?`) · `faseAlcanzada` (`fase`) · `todas`/`alguna`/`ninguna` (`de: Requisito[]`) · `atributo` (`atributo`, `min?`, `max?`).

## Entidad: `Flag`

Estado en partida, no en el banco: `{ ano, veces, consumida, anosConsecutivos }`. El banco solo **declara** flags (en `opciones[].flags`) y las **referencia** (en `requiere`). Regla: las flags no se borran; "consumir" solo marca `consumida` (ninguna opción del banco consume).

## Entidad: `BancoContenido`

`{ situaciones: Situacion[]; condicionales?: Condicional[]; modalidades?: Modalidad[] }`. Es el valor que `src/content/index.ts` ensambla y valida; el motor lo consume tal cual (`BancoContenido`).

## Validación (Zod, build time)

1. `id` único entre todas las situaciones **y** condicionales.
2. `momento`, `tipo` y `categoria` presentes y dentro del enum.
3. `opciones.length >= 2`; cada opción con `titulo` y `subtitulo` no vacíos.
4. `efectos` solo con atributos válidos.
5. Toda flag referenciada por un `requiere` existe en algún `opciones[].flags`.
6. `modalidades`/`variantes` solo con valores válidos.
7. Cobertura: al menos una situación común (sin filtros) por cada par `momento × tipo`.
8. El banco validado es asignable a `BancoContenido` (compatibilidad estructural).

## Ciclo de vida de una flag

`declarada por una opción` → al elegirla se registra `{ano, veces, consumida:false}` → si otra situación la referencia y se dispara, puede marcarse `consumida:true` (no se borra) → su ventana de disparo caduca con `ventanaAnos`, pero la flag permanece en el historial.

## Inventario importado (esperado)

| Momento | Tipo | Situaciones | Condicionales |
|---|---|---|---|
| Verano | contenido | 7 | — |
| Verano | personaje | 11 (una de 3 opciones) | 7 |
| Febrero | contenido | 3 (una solo `chirigotero`) | — |
| Febrero | personaje | 6 | 4 |
| **Total** | | **27 base + 11 condicionales** | |

*(Los eventos especiales de `docs/04` quedan fuera: T5, no son decisiones.)*
